import { GraphQLError } from 'graphql';
import { Prisma } from '@/generated/prisma/client';
import { nextCode } from '../domain/codes';
import type { Context } from '../context';
import { requireCompany } from '../context';
import { ITEM_TYPE, ITEM_TYPE_PREFIX, UNSETTLED_INVOICE_STATUSES } from '../domain/status';
import { applyStockMove } from '../domain/stock';
import { assertCustomerValid, customerDisplayName, normalizeCustomerInput } from '../domain/customer';
import { normaliseSupplier, type SupplierInput } from '../domain/supplier';

type Id = { request: { uuid?: string } };

/**
 * Every field is optional on the way in; `customerDisplayName` is what insists
 * on enough to identify the customer.
 */
type CustomerInput = {
  name?: string;
  customerType?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  alternatePhone?: string;
  landline?: string;
  email?: string;
  messengerId?: string;
  facebook?: string;
  viber?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  marketplaceAccount?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  postalCode?: string;
  sourcePlatform?: string;
  primaryChannel?: string;
  notes?: string;
};

export const setupResolvers = {
  RootQueryType: {
    items: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.item.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    item: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.item.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    uoms: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.uom.findMany({ where: { companyUuid }, orderBy: { name: 'asc' } });
    },
    warehouses: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.warehouse.findMany({ where: { companyUuid }, orderBy: { name: 'asc' } });
    },
    stockItems: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.stockItem.findMany({ where: { companyUuid } });
    },
    customers: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.customer.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    customer: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.customer.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    suppliers: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.supplier.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    supplier: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.supplier.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    processes: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.process.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    process: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.process.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    workstations: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.workstation.findMany({ where: { companyUuid }, orderBy: { insertedAt: 'desc' } });
    },
    workstation: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.workstation.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    paymentMethods: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.paymentMethod.findMany({ where: { companyUuid }, orderBy: { name: 'asc' } });
    },
    paymentMethod: async (_: unknown, { request }: Id, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.paymentMethod.findFirst({ where: { uuid: request.uuid ?? '', companyUuid } });
    },
    inventoryEntries: async (_: unknown, __: unknown, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.inventoryEntry.findMany({
        where: { companyUuid },
        orderBy: { insertedAt: 'desc' },
        take: 500,
      });
    },
  },

  RootMutationType: {
    createItem: async (
      _: unknown,
      {
        request,
      }: {
        request: {
          name: string;
          itemType?: string;
          sku?: string;
          category?: string;
          standardCost?: number;
          minStockThreshold?: number;
          spec?: string;
          description?: string;
          sellingPrice: number;
          stockUoms: Array<{ uomUuid?: string; conversionFactor?: number; sequence?: number }>;
          openingStocks?: Array<{ warehouseUuid?: string; qty?: number }>;
        };
      },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);

      const itemType = request.itemType ?? ITEM_TYPE.rawMaterial;
      if (!ITEM_TYPE_PREFIX[itemType]) throw new GraphQLError(`Unknown material class: ${itemType}`);

      return ctx.db.$transaction(async (tx) => {
        // Codes follow the class prefix (RM-, MP-, FG-) unless one is given.
        const sku = request.sku?.trim() || (await nextCode(tx, companyUuid, ITEM_TYPE_PREFIX[itemType]));

        const item = await tx.item.create({
          data: {
            companyUuid,
            name: request.name,
            itemType,
            sku,
            category: request.category?.trim() || null,
            standardCost: new Prisma.Decimal(request.standardCost ?? 0),
            minStockThreshold: new Prisma.Decimal(request.minStockThreshold ?? 0),
            spec: request.spec,
            description: request.description,
            sellingPrice: new Prisma.Decimal(request.sellingPrice ?? 0),
            stockUoms: {
              create: (request.stockUoms ?? [])
                .filter((u) => u?.uomUuid)
                .map((u, index) => ({
                  uomUuid: u.uomUuid as string,
                  conversionFactor: u.conversionFactor ?? 1,
                  sequence: u.sequence ?? index,
                })),
            },
          },
          include: { stockUoms: { orderBy: { sequence: 'asc' } } },
        });

        // Opening stock is a real stock movement so it shows up in the ledger
        // alongside every later receipt and issue.
        const defaultUom = item.stockUoms[0];

        if (defaultUom) {
          for (const opening of request.openingStocks ?? []) {
            if (!opening?.warehouseUuid || !opening.qty) continue;

            await applyStockMove(tx, {
              companyUuid,
              itemUuid: item.uuid,
              warehouseUuid: opening.warehouseUuid,
              stockUomUuid: defaultUom.uuid,
              qty: opening.qty,
              type: 'opening_stock',
              threadType: 'item',
              threadUuid: item.uuid,
            });
          }
        }

        return item;
      });
    },

    createCustomer: async (_: unknown, { request }: { request: CustomerInput }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);

      // Normalise first: the checks below treat an untouched "" the same as a
      // field that was never sent, which is only true once the blanks are gone.
      const input = normalizeCustomerInput(request);
      assertCustomerValid(input);

      return ctx.db.customer.create({
        data: { ...input, name: customerDisplayName(input), companyUuid },
      });
    },

    createSupplier: async (_: unknown, { request }: { request: SupplierInput }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      const input = normaliseSupplier(request);
      return ctx.db.supplier.create({ data: { ...input, companyUuid } });
    },

    createProcess: async (
      _: unknown,
      { request }: { request: { name?: string; code?: string; description?: string } },
      ctx: Context,
    ) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.process.create({
        data: {
          companyUuid,
          name: request.name ?? 'Untitled process',
          code: request.code,
          description: request.description,
        },
      });
    },

    createWorkstation: async (_: unknown, { request }: { request: { name?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.workstation.create({
        data: { companyUuid, name: request.name ?? 'Untitled workstation' },
      });
    },

    createPaymentMethod: async (_: unknown, { request }: { request: { name?: string } }, ctx: Context) => {
      const companyUuid = requireCompany(ctx);
      return ctx.db.paymentMethod.create({
        data: { companyUuid, name: request.name ?? 'Untitled method' },
      });
    },
  },

  Item: {
    supplierPrices: async (parent: { uuid: string }, _: unknown, ctx: Context) => {
      const prices = await ctx.db.supplierPrice.findMany({
        where: { itemUuid: parent.uuid },
        orderBy: { unitPrice: 'asc' },
      });
      const suppliers = await ctx.db.supplier.findMany({ where: { uuid: { in: prices.map((p) => p.supplierUuid) } } });
      const names = new Map(suppliers.map((s) => [s.uuid, s.name]));
      return prices.map((p) => ({ ...p, supplierName: names.get(p.supplierUuid) ?? '' }));
    },
    /** On-hand valued at standard cost, in the default stock UOM. */
    stockValue: async (parent: { uuid: string; standardCost: Prisma.Decimal }, _: unknown, ctx: Context) =>
      (await ctx.loaders.stockLevelByItem.load(parent.uuid)).onHand * Number(parent.standardCost),
    // All three UOM fields share one batched lookup per request.
    stockUoms: (parent: { uuid: string }, _: unknown, ctx: Context) => ctx.loaders.stockUomsByItem.load(parent.uuid),
    stockItems: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.stockItem.findMany({ where: { itemUuid: parent.uuid } }),
    bom: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.bom.findFirst({ where: { itemUuid: parent.uuid }, orderBy: { insertedAt: 'desc' } }),
    defaultStockUomUuid: async (parent: { uuid: string }, _: unknown, ctx: Context) => {
      const [first] = await ctx.loaders.stockUomsByItem.load(parent.uuid);
      return first?.uuid ?? null;
    },
    defaultStockUomName: async (parent: { uuid: string }, _: unknown, ctx: Context) => {
      const [first] = await ctx.loaders.stockUomsByItem.load(parent.uuid);
      return first?.uom.name ?? null;
    },
    onHandQty: async (parent: { uuid: string }, _: unknown, ctx: Context) =>
      (await ctx.loaders.stockLevelByItem.load(parent.uuid)).onHand,
    reservedQty: async (parent: { uuid: string }, _: unknown, ctx: Context) =>
      (await ctx.loaders.stockLevelByItem.load(parent.uuid)).reserved,
    availableQty: async (parent: { uuid: string }, _: unknown, ctx: Context) => {
      const { onHand, reserved } = await ctx.loaders.stockLevelByItem.load(parent.uuid);
      return onHand - reserved;
    },
  },

  StockUom: {
    // The loader includes `uom`, but this type is also reached directly from
    // Item.stockUoms rows, which carry it too.
    uomName: async (parent: { uomUuid: string; uom?: { name: string } }, _: unknown, ctx: Context) => {
      if (parent.uom) return parent.uom.name;
      const stockUom = await ctx.loaders.stockUom.load((parent as unknown as { uuid: string }).uuid);
      return stockUom?.uom.name ?? null;
    },
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
  },

  StockItem: {
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
    stockUom: (parent: { stockUomUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.stockUom.load(parent.stockUomUuid),
  },

  InventoryEntry: {
    item: (parent: { itemUuid: string }, _: unknown, ctx: Context) => ctx.loaders.item.load(parent.itemUuid),
    warehouse: (parent: { warehouseUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.warehouse.load(parent.warehouseUuid),
    stockUom: (parent: { stockUomUuid: string }, _: unknown, ctx: Context) =>
      ctx.loaders.stockUom.load(parent.stockUomUuid),
  },

  Workstation: {
    // Staff explicitly assigned to this workstation. Returning every member of
    // the company here would be wrong, not merely imprecise.
    members: (parent: { uuid: string }, _: unknown, ctx: Context) =>
      ctx.db.staff.findMany({ where: { workstations: { some: { uuid: parent.uuid } } } }),
  },

  Customer: {
    /**
     * Outstanding receivable: what this customer has been invoiced but not yet
     * paid. Derived rather than stored, so it cannot drift from the invoices.
     */
    balance: async (parent: { uuid: string }, _: unknown, ctx: Context) => {
      const invoices = await ctx.db.salesInvoice.findMany({
        where: { customerUuid: parent.uuid, status: { in: [...UNSETTLED_INVOICE_STATUSES] } },
        select: { amount: true, paidAmount: true },
      });

      return invoices.reduce(
        (total, invoice) => total.add(new Prisma.Decimal(invoice.amount).sub(invoice.paidAmount)),
        new Prisma.Decimal(0),
      );
    },
  },
};
