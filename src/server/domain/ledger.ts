import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';

/** The chart of accounts the automatic postings use (SRS 4.5). */
export const ACCOUNT = {
  cash: 'Cash',
  accountsReceivable: 'Accounts Receivable',
  inventory: 'Inventory',
  accountsPayable: 'Accounts Payable',
  salesRevenue: 'Sales Revenue',
  outputVat: 'Output VAT',
  wagesExpense: 'Wages Expense',
  statutoryPayable: 'Statutory Contributions Payable',
} as const;

type Line = { account: string; debit?: Prisma.Decimal | number; credit?: Prisma.Decimal | number };

/**
 * Writes one balanced journal entry. Zero lines are dropped; an entry whose
 * debits and credits differ is refused rather than stored half-right.
 */
export async function postJournal(
  tx: Prisma.TransactionClient,
  entry: {
    companyUuid: string;
    description: string;
    sourceType: string;
    sourceUuid?: string;
    sourceCode?: string;
    entryDate?: Date;
    lines: Line[];
  },
) {
  const lines = entry.lines
    .map((line) => ({
      account: line.account,
      debit: new Prisma.Decimal(line.debit ?? 0).toDecimalPlaces(2),
      credit: new Prisma.Decimal(line.credit ?? 0).toDecimalPlaces(2),
    }))
    .filter((line) => !line.debit.isZero() || !line.credit.isZero());

  if (!lines.length) return null;

  const debits = lines.reduce((sum, l) => sum.add(l.debit), new Prisma.Decimal(0));
  const credits = lines.reduce((sum, l) => sum.add(l.credit), new Prisma.Decimal(0));
  if (!debits.equals(credits)) {
    throw new GraphQLError(`journal for ${entry.sourceCode ?? entry.sourceType} does not balance`);
  }

  return tx.journalEntry.create({
    data: {
      companyUuid: entry.companyUuid,
      description: entry.description,
      sourceType: entry.sourceType,
      sourceUuid: entry.sourceUuid,
      sourceCode: entry.sourceCode,
      entryDate: entry.entryDate ?? new Date(),
      lines: { create: lines },
    },
  });
}
