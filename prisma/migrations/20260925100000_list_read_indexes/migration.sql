-- Every list screen reads one company's rows newest first. The old
-- single-column companyUuid index got the right rows but left Postgres to sort
-- them; the composite serves both the filter and the ordering, and still covers
-- lookups by companyUuid alone because that column leads.

-- CreateIndex
CREATE INDEX "Staff_companyUuid_insertedAt_idx" ON "Staff"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "Item_companyUuid_insertedAt_idx" ON "Item"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "StockItem_companyUuid_insertedAt_idx" ON "StockItem"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "InventoryEntry_companyUuid_insertedAt_idx" ON "InventoryEntry"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "Customer_companyUuid_insertedAt_idx" ON "Customer"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "Supplier_companyUuid_insertedAt_idx" ON "Supplier"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "Process_companyUuid_insertedAt_idx" ON "Process"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "Workstation_companyUuid_insertedAt_idx" ON "Workstation"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "Bom_companyUuid_insertedAt_idx" ON "Bom"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "SalesOrder_companyUuid_insertedAt_idx" ON "SalesOrder"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "DeliveryNote_companyUuid_insertedAt_idx" ON "DeliveryNote"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "SalesInvoice_companyUuid_insertedAt_idx" ON "SalesInvoice"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyUuid_insertedAt_idx" ON "PurchaseOrder"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "ReceiptNote_companyUuid_insertedAt_idx" ON "ReceiptNote"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "PurchaseInvoice_companyUuid_insertedAt_idx" ON "PurchaseInvoice"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "WorkOrder_companyUuid_insertedAt_idx" ON "WorkOrder"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "PaymentEntry_companyUuid_insertedAt_idx" ON "PaymentEntry"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "PayrollEntry_companyUuid_insertedAt_idx" ON "PayrollEntry"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "JobCard_companyUuid_insertedAt_idx" ON "JobCard"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "PurchaseRequest_companyUuid_insertedAt_idx" ON "PurchaseRequest"("companyUuid", "insertedAt");

-- DropIndex: now redundant, and a second index to maintain on every write.
DROP INDEX IF EXISTS "Staff_companyUuid_idx";
DROP INDEX IF EXISTS "Item_companyUuid_idx";
DROP INDEX IF EXISTS "StockItem_companyUuid_idx";
DROP INDEX IF EXISTS "InventoryEntry_companyUuid_idx";
DROP INDEX IF EXISTS "Customer_companyUuid_idx";
DROP INDEX IF EXISTS "Supplier_companyUuid_idx";
DROP INDEX IF EXISTS "Process_companyUuid_idx";
DROP INDEX IF EXISTS "Workstation_companyUuid_idx";
DROP INDEX IF EXISTS "Bom_companyUuid_idx";
DROP INDEX IF EXISTS "SalesOrder_companyUuid_idx";
DROP INDEX IF EXISTS "DeliveryNote_companyUuid_idx";
DROP INDEX IF EXISTS "SalesInvoice_companyUuid_idx";
DROP INDEX IF EXISTS "PurchaseOrder_companyUuid_idx";
DROP INDEX IF EXISTS "ReceiptNote_companyUuid_idx";
DROP INDEX IF EXISTS "PurchaseInvoice_companyUuid_idx";
DROP INDEX IF EXISTS "WorkOrder_companyUuid_idx";
DROP INDEX IF EXISTS "PaymentEntry_companyUuid_idx";
DROP INDEX IF EXISTS "PayrollEntry_companyUuid_idx";
