import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { ACCOUNT, postJournal } from '../domain/ledger';
import { manilaDate, manilaDay } from '../domain/time';

/**
 * Benefits & Incentives matrix (SRS 4.6). Rates are percentages of gross pay.
 * They start at zero so no statutory figure is assumed: HR enters the current
 * SSS, PhilHealth, Pag-IBIG and withholding rates on the Benefits screen.
 */
export const BENEFITS_KEY = 'hr.benefits';
export const DEFAULT_BENEFITS = {
  overtimeMultiplier: 1.25,
  defaultPieceRate: 0,
  sssRate: 0,
  philhealthRate: 0,
  pagibigRate: 0,
  withholdingTaxRate: 0,
  standardHoursPerDay: 8,
};
export type Benefits = typeof DEFAULT_BENEFITS;

export async function loadBenefits(db: Prisma.TransactionClient, companyUuid: string): Promise<Benefits> {
  const row = await db.appSetting.findUnique({ where: { companyUuid_key: { companyUuid, key: BENEFITS_KEY } } });
  const stored = (row?.value ?? {}) as Partial<Benefits>;
  const merged = { ...DEFAULT_BENEFITS };
  for (const key of Object.keys(DEFAULT_BENEFITS) as (keyof Benefits)[]) {
    const value = Number(stored[key]);
    if (Number.isFinite(value) && value >= 0) merged[key] = value;
  }
  return merged;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Worked time split into regular and overtime hours. A 1-hour break comes off shifts over 5 hours. */
function splitHours(timeIn: Date | null, timeOut: Date | null, standardHours: number) {
  if (!timeIn || !timeOut || timeOut <= timeIn) return { regular: 0, overtime: 0 };
  let worked = (timeOut.getTime() - timeIn.getTime()) / 3_600_000;
  if (worked > 5) worked -= 1;
  return { regular: round2(Math.min(worked, standardHours)), overtime: round2(Math.max(worked - standardHours, 0)) };
}

const PRESENT_STATUSES = ['present', 'late'];

export const hrResolvers = {
  RootQueryType: {
    attendance: async (_: unknown, { request }: { request: { date?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const { day } = manilaDay(request?.date);
      return ctx.db.attendanceRecord.findMany({
        where: { companyUuid, workDate: new Date(`${day}T00:00:00Z`) },
        orderBy: { timeIn: 'asc' },
      });
    },
    benefits: async (_: unknown, __: unknown, ctx: Context) => loadBenefits(ctx.db, requireCompany(ctx)),
    payrollPeriods: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.payrollPeriod.findMany({ where: { companyUuid }, orderBy: { startDate: 'desc' } });
    },
    payslips: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.payrollEntry.findMany({
        where: { companyUuid, staffUuid: request.uuid ?? '' },
        orderBy: { insertedAt: 'desc' },
      });
    },
    /** Completed work order output per operator (SRS 4.3): the performance history. */
    staffPerformance: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.jobCard.findMany({
        where: { companyUuid, operatorStaffUuid: request.uuid ?? '', status: 'completed' },
        orderBy: { insertedAt: 'desc' },
        take: 200,
      });
    },
  },

  RootMutationType: {
    saveAttendance: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          staffUuid: string;
          workDate?: string;
          timeIn?: string | null;
          timeOut?: string | null;
          status?: string;
          notes?: string;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const staff = await ctx.db.staff.findFirst({ where: { uuid: request.staffUuid, companyUuid } });
      if (!staff) throw new GraphQLError('Employee not found.');

      const status = request.status ?? 'present';
      if (!['present', 'late', 'absent', 'on_leave'].includes(status))
        throw new GraphQLError(`Unknown status: ${status}`);

      const workDate = new Date(`${request.workDate ?? manilaDate()}T00:00:00Z`);
      const timeIn = request.timeIn ? new Date(request.timeIn) : null;
      const timeOut = request.timeOut ? new Date(request.timeOut) : null;
      if (timeIn && timeOut && timeOut <= timeIn) throw new GraphQLError('Time out must be after time in.');

      const benefits = await loadBenefits(ctx.db, companyUuid);
      const present = PRESENT_STATUSES.includes(status);
      const hours = present ? splitHours(timeIn, timeOut, benefits.standardHoursPerDay) : { regular: 0, overtime: 0 };
      const data = {
        timeIn: present ? timeIn : null,
        timeOut: present ? timeOut : null,
        status,
        regularHours: hours.regular,
        overtimeHours: hours.overtime,
        notes: request.notes?.trim() || null,
      };

      return ctx.db.attendanceRecord.upsert({
        where: { staffUuid_workDate: { staffUuid: staff.uuid, workDate } },
        create: { ...data, staffUuid: staff.uuid, workDate, companyUuid },
        update: data,
      });
    },

    /** Clock in if there is no time in for today yet, otherwise clock out. */
    clockAttendance: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const staff = await ctx.db.staff.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
      if (!staff) throw new GraphQLError('Employee not found.');
      if (staff.status !== 'active') throw new GraphQLError(`${staff.name ?? staff.email} is inactive.`);

      const now = new Date();
      const workDate = new Date(`${manilaDate(now)}T00:00:00Z`);
      const existing = await ctx.db.attendanceRecord.findUnique({
        where: { staffUuid_workDate: { staffUuid: staff.uuid, workDate } },
      });

      if (!existing?.timeIn) {
        return ctx.db.attendanceRecord.upsert({
          where: { staffUuid_workDate: { staffUuid: staff.uuid, workDate } },
          create: { staffUuid: staff.uuid, workDate, companyUuid, timeIn: now, status: 'present', source: 'clock' },
          update: { timeIn: now, status: 'present', source: 'clock' },
        });
      }

      const benefits = await loadBenefits(ctx.db, companyUuid);
      const hours = splitHours(existing.timeIn, now, benefits.standardHoursPerDay);
      return ctx.db.attendanceRecord.update({
        where: { uuid: existing.uuid },
        data: { timeOut: now, regularHours: hours.regular, overtimeHours: hours.overtime },
      });
    },

    updateBenefits: async (_: unknown, { request }: { request: Partial<Benefits> }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const current = await loadBenefits(ctx.db, companyUuid);
      const next = { ...current };
      for (const key of Object.keys(DEFAULT_BENEFITS) as (keyof Benefits)[]) {
        if (request[key] == null) continue;
        const value = Number(request[key]);
        if (!Number.isFinite(value) || value < 0) throw new GraphQLError(`${key} must be zero or more.`);
        next[key] = value;
      }
      if (next.standardHoursPerDay <= 0) throw new GraphQLError('Standard hours per day must be more than zero.');

      await ctx.db.appSetting.upsert({
        where: { companyUuid_key: { companyUuid, key: BENEFITS_KEY } },
        create: { companyUuid, key: BENEFITS_KEY, value: next },
        update: { value: next },
      });
      return next;
    },

    /**
     * Work Hours & WOs Recorded (SRS 5): base pay from attendance hours plus
     * piece-rate pay for every good unit an employee reported on work orders in
     * the period. Re-running a draft period recomputes it from scratch.
     */
    generatePayroll: async (
      _: unknown,
      { request }: { request: { uuid?: string; name?: string; startDate: string; endDate: string; payDate?: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      const startDate = new Date(`${request.startDate.slice(0, 10)}T00:00:00Z`);
      const endDate = new Date(`${request.endDate.slice(0, 10)}T00:00:00Z`);
      if (endDate < startDate) throw new GraphQLError('The period ends before it starts.');

      return ctx.db.$transaction(async (tx) => {
        const benefits = await loadBenefits(tx, companyUuid);

        let period = request.uuid
          ? await tx.payrollPeriod.findFirst({ where: { uuid: request.uuid, companyUuid } })
          : null;
        if (request.uuid && !period) throw new GraphQLError('Payroll period not found.');
        if (period && period.status !== 'draft') throw new GraphQLError('A finalized payroll cannot be recomputed.');

        const data = {
          name: request.name?.trim() || `Payroll ${request.startDate.slice(0, 10)} to ${request.endDate.slice(0, 10)}`,
          startDate,
          endDate,
          payDate: request.payDate ? new Date(request.payDate) : null,
        };
        period = period
          ? await tx.payrollPeriod.update({ where: { uuid: period.uuid }, data })
          : await tx.payrollPeriod.create({ data: { ...data, companyUuid } });
        await tx.payrollEntry.deleteMany({ where: { payrollPeriodUuid: period.uuid } });

        const staff = await tx.staff.findMany({ where: { companyUuid, status: 'active' } });
        const attendance = await tx.attendanceRecord.findMany({
          where: { companyUuid, workDate: { gte: startDate, lte: endDate } },
        });
        // Output counts on the Manila day the job card was reported.
        const { start } = manilaDay(request.startDate.slice(0, 10));
        const { end } = manilaDay(request.endDate.slice(0, 10));
        const jobCards = await tx.jobCard.findMany({
          where: { companyUuid, status: 'completed', insertedAt: { gte: start, lt: end } },
          include: { workOrder: { select: { pieceRate: true } } },
        });

        for (const member of staff) {
          const own = attendance.filter((a) => a.staffUuid === member.uuid);
          const regularHours = own.reduce((sum, a) => sum + Number(a.regularHours), 0);
          const overtimeHours = own.reduce((sum, a) => sum + Number(a.overtimeHours), 0);
          const daysPresent = own.filter((a) => PRESENT_STATUSES.includes(a.status)).length;

          const cards = jobCards.filter((c) => c.operatorStaffUuid === member.uuid);
          const unitsProduced = cards.reduce((sum, c) => sum + Number(c.producedQty), 0);
          const incentivePay = round2(
            cards.reduce((sum, c) => {
              const rate =
                Number(c.workOrder.pieceRate) > 0 ? Number(c.workOrder.pieceRate) : benefits.defaultPieceRate;
              return sum + Number(c.producedQty) * rate;
            }, 0),
          );

          if (!regularHours && !overtimeHours && !incentivePay) continue;

          const hourlyRate = Number(member.baseRate);
          const basePay = round2(regularHours * hourlyRate);
          const overtimePay = round2(overtimeHours * hourlyRate * benefits.overtimeMultiplier);
          const gross = basePay + overtimePay + incentivePay;

          // Contractual staff: no statutory benefits or tax deductions (SRS 4.6).
          const statutory = member.employmentType !== 'contractual';
          const sss = statutory ? round2((gross * benefits.sssRate) / 100) : 0;
          const philhealth = statutory ? round2((gross * benefits.philhealthRate) / 100) : 0;
          const pagibig = statutory ? round2((gross * benefits.pagibigRate) / 100) : 0;
          const tax = statutory
            ? round2(((gross - sss - philhealth - pagibig) * benefits.withholdingTaxRate) / 100)
            : 0;

          await tx.payrollEntry.create({
            data: {
              companyUuid,
              payrollPeriodUuid: period.uuid,
              staffUuid: member.uuid,
              employmentType: member.employmentType,
              hourlyRate,
              daysPresent,
              regularHours,
              overtimeHours,
              unitsProduced,
              basePay,
              overtimePay,
              incentivePay,
              sssDeduction: sss,
              philhealthDeduction: philhealth,
              pagibigDeduction: pagibig,
              taxDeduction: tax,
              netPay: round2(gross - sss - philhealth - pagibig - tax),
            },
          });
        }

        return period;
      });
    },

    finalizePayroll: async (_: unknown, { request }: { request: { uuid?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.$transaction(async (tx) => {
        const period = await tx.payrollPeriod.findFirst({
          where: { uuid: request.uuid ?? '', companyUuid },
          include: { entries: true },
        });
        if (!period) throw new GraphQLError('Payroll period not found.');
        if (period.status !== 'draft') throw new GraphQLError('This payroll is already finalized.');
        if (!period.entries.length) throw new GraphQLError('There is nobody to pay in this period.');

        const entries = period.entries;
        const sum = (pick: (e: (typeof entries)[number]) => Prisma.Decimal) =>
          entries.reduce((total, e) => total.add(pick(e)), new Prisma.Decimal(0));
        const gross = sum((e) => new Prisma.Decimal(e.basePay).add(e.overtimePay).add(e.incentivePay));
        const withheld = sum((e) =>
          new Prisma.Decimal(e.sssDeduction).add(e.philhealthDeduction).add(e.pagibigDeduction).add(e.taxDeduction),
        );

        await postJournal(tx, {
          companyUuid,
          description: period.name,
          sourceType: 'payroll',
          sourceUuid: period.uuid,
          lines: [
            { account: ACCOUNT.wagesExpense, debit: gross },
            { account: ACCOUNT.statutoryPayable, credit: withheld },
            { account: ACCOUNT.cash, credit: gross.sub(withheld) },
          ],
        });

        return tx.payrollPeriod.update({ where: { uuid: period.uuid }, data: { status: 'finalized' } });
      });
    },
  },

  AttendanceRecord: {
    staffName: async (parent: { staffUuid: string }, _: unknown, ctx: Context) => {
      const staff = await ctx.loaders.staff.load(parent.staffUuid);
      return staff?.name ?? staff?.email ?? null;
    },
  },

  PayrollPeriod: {
    entries: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.payrollEntry.findMany({ where: { payrollPeriodUuid: parent.uuid }, orderBy: { insertedAt: 'asc' } }),
    totalNetPay: async (parent: { uuid: string }, _: unknown, ctx: Context) =>
      (await ctx.db.payrollEntry.aggregate({ where: { payrollPeriodUuid: parent.uuid }, _sum: { netPay: true } }))._sum
        .netPay ?? 0,
  },

  PayrollEntry: {
    staffName: async (parent: { staffUuid: string }, _: unknown, ctx: Context) => {
      const staff = await ctx.loaders.staff.load(parent.staffUuid);
      return staff?.name ?? staff?.email ?? null;
    },
    periodName: async (parent: { payrollPeriodUuid: string }, _: unknown, ctx: Context) =>
      (await ctx.db.payrollPeriod.findUnique({ where: { uuid: parent.payrollPeriodUuid } }))?.name,
    grossPay: (parent: { basePay: Prisma.Decimal; overtimePay: Prisma.Decimal; incentivePay: Prisma.Decimal }) =>
      new Prisma.Decimal(parent.basePay).add(parent.overtimePay).add(parent.incentivePay),
  },
};
