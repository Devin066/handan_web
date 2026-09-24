-- AlterTable
ALTER TABLE "Bom" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "PayrollEntry" ADD COLUMN     "daysPresent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "employmentType" TEXT NOT NULL DEFAULT 'regular',
ADD COLUMN     "hourlyRate" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "pagibigDeduction" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "taxDeduction" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "unitsProduced" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseInvoice" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethodUuid" TEXT,
ADD COLUMN     "receiptNoteUuid" TEXT,
ADD COLUMN     "referenceNo" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "expectedDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PurchaseOrderItem" ADD COLUMN     "purchaseRequestItemUuid" TEXT;

-- AlterTable
ALTER TABLE "SalesInvoice" ADD COLUMN     "orNumber" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethodUuid" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "assignedStaffUuid" TEXT,
ADD COLUMN     "machineHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "pieceRate" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedBy" TEXT,
    "requiredDate" TIMESTAMP(3),
    "notes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PurchaseRequestItem" (
    "uuid" TEXT NOT NULL,
    "purchaseRequestUuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "uomName" TEXT,
    "stockUomUuid" TEXT,
    "requestedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "orderedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "estimatedUnitPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "SupplierPrice" (
    "uuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "supplierUuid" TEXT NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierPrice_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "uuid" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUuid" TEXT,
    "sourceCode" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "uuid" TEXT NOT NULL,
    "journalEntryUuid" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "debit" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "credit" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "PurchaseRequest_companyUuid_status_idx" ON "PurchaseRequest"("companyUuid", "status");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_purchaseRequestUuid_idx" ON "PurchaseRequestItem"("purchaseRequestUuid");

-- CreateIndex
CREATE INDEX "SupplierPrice_companyUuid_idx" ON "SupplierPrice"("companyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierPrice_itemUuid_supplierUuid_key" ON "SupplierPrice"("itemUuid", "supplierUuid");

-- CreateIndex
CREATE INDEX "JournalEntry_companyUuid_entryDate_idx" ON "JournalEntry"("companyUuid", "entryDate");

-- CreateIndex
CREATE INDEX "JournalLine_journalEntryUuid_idx" ON "JournalLine"("journalEntryUuid");

-- CreateIndex
CREATE INDEX "JournalLine_account_idx" ON "JournalLine"("account");

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseRequestItemUuid_fkey" FOREIGN KEY ("purchaseRequestItemUuid") REFERENCES "PurchaseRequestItem"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_purchaseRequestUuid_fkey" FOREIGN KEY ("purchaseRequestUuid") REFERENCES "PurchaseRequest"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPrice" ADD CONSTRAINT "SupplierPrice_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_journalEntryUuid_fkey" FOREIGN KEY ("journalEntryUuid") REFERENCES "JournalEntry"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Material Master classes are RM / MP / FG (SRS 4.4); consumables are raw stock.
UPDATE "Item" SET "itemType" = 'raw_material' WHERE "itemType" NOT IN ('raw_material', 'manufactured_part', 'finished_good');

-- Existing BOMs get a code in creation order.
UPDATE "Bom" b SET "code" = 'BOM-' || LPAD(n.rn::text, 6, '0')
FROM (SELECT "uuid", ROW_NUMBER() OVER (PARTITION BY "companyUuid" ORDER BY "insertedAt") AS rn FROM "Bom") n
WHERE b."uuid" = n."uuid";
INSERT INTO "Counter" ("companyUuid", "name", "value")
SELECT "companyUuid", 'bom', COUNT(*) FROM "Bom" GROUP BY "companyUuid"
ON CONFLICT ("companyUuid", "name") DO UPDATE SET "value" = EXCLUDED."value";
