-- AlterTable
ALTER TABLE "SalesInvoice" ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerReference" TEXT,
ADD COLUMN     "customerTin" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vatAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vatMode" TEXT NOT NULL DEFAULT 'vat_exclusive',
ADD COLUMN     "vatableAmount" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SalesInvoiceItem" (
    "uuid" TEXT NOT NULL,
    "salesInvoiceUuid" TEXT NOT NULL,
    "salesOrderItemUuid" TEXT,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "uomName" TEXT,
    "qty" DECIMAL(18,4) NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "SalesInvoiceItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "SalesInvoiceItem_salesInvoiceUuid_idx" ON "SalesInvoiceItem"("salesInvoiceUuid");

-- CreateIndex
CREATE INDEX "SalesInvoiceItem_salesOrderItemUuid_idx" ON "SalesInvoiceItem"("salesOrderItemUuid");

-- AddForeignKey
ALTER TABLE "SalesInvoiceItem" ADD CONSTRAINT "SalesInvoiceItem_salesInvoiceUuid_fkey" FOREIGN KEY ("salesInvoiceUuid") REFERENCES "SalesInvoice"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoiceItem" ADD CONSTRAINT "SalesInvoiceItem_salesOrderItemUuid_fkey" FOREIGN KEY ("salesOrderItemUuid") REFERENCES "SalesOrderItem"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill invoices raised before these fields existed. Their VAT treatment was
-- never recorded, so it is marked as such rather than guessed.
UPDATE "SalesInvoice"
SET "invoiceDate" = "insertedAt",
    "subtotal" = "amount",
    "vatableAmount" = "amount",
    "vatMode" = 'not_recorded';
