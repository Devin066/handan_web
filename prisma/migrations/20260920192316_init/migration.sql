-- CreateTable
CREATE TABLE "Company" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nickname" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "companyUuid" TEXT,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Staff" (
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userUuid" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Uom" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Uom_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Item" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "description" TEXT,
    "sellingPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "StockUom" (
    "uuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "uomUuid" TEXT NOT NULL,
    "conversionFactor" INTEGER NOT NULL DEFAULT 1,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StockUom_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "area" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "uuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "warehouseUuid" TEXT NOT NULL,
    "stockUomUuid" TEXT NOT NULL,
    "totalOnHand" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "InventoryEntry" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actualQty" DECIMAL(18,4) NOT NULL,
    "qtyAfterTransaction" DECIMAL(18,4) NOT NULL,
    "threadType" TEXT,
    "threadUuid" TEXT,
    "itemUuid" TEXT NOT NULL,
    "warehouseUuid" TEXT NOT NULL,
    "stockUomUuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryEntry_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Customer" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Process" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Workstation" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adminUuid" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workstation_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Bom" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bom_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "BomItem" (
    "uuid" TEXT NOT NULL,
    "bomUuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "stockUomUuid" TEXT,
    "qty" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BomItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "BomProcess" (
    "uuid" TEXT NOT NULL,
    "bomUuid" TEXT NOT NULL,
    "processUuid" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "toolRequired" TEXT,

    CONSTRAINT "BomProcess_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "billingStatus" TEXT NOT NULL DEFAULT 'pending',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
    "customerUuid" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT,
    "warehouseUuid" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "deliveredQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "uuid" TEXT NOT NULL,
    "salesOrderUuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "uomName" TEXT,
    "stockUomUuid" TEXT,
    "unitPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "orderedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "deliveredQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "DeliveryNote" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerUuid" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "salesOrderUuid" TEXT NOT NULL,
    "warehouseUuid" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryNote_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "DeliveryNoteItem" (
    "uuid" TEXT NOT NULL,
    "deliveryNoteUuid" TEXT NOT NULL,
    "salesOrderItemUuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "uomName" TEXT,
    "stockUomUuid" TEXT,
    "actualQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryNoteItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "SalesInvoice" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "customerUuid" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "salesOrderUuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesInvoice_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receiptStatus" TEXT NOT NULL DEFAULT 'pending',
    "billingStatus" TEXT NOT NULL DEFAULT 'pending',
    "supplierUuid" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierAddress" TEXT,
    "warehouseUuid" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "receivedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "uuid" TEXT NOT NULL,
    "purchaseOrderUuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "uomName" TEXT,
    "stockUomUuid" TEXT,
    "unitPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "orderedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "receivedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "ReceiptNote" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "supplierUuid" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "purchaseOrderUuid" TEXT NOT NULL,
    "warehouseUuid" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptNote_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "ReceiptNoteItem" (
    "uuid" TEXT NOT NULL,
    "receiptNoteUuid" TEXT NOT NULL,
    "purchaseOrderItemUuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "uomName" TEXT,
    "stockUomUuid" TEXT,
    "actualQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptNoteItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PurchaseInvoice" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "supplierUuid" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "purchaseOrderUuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseInvoice_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT,
    "type" TEXT NOT NULL DEFAULT 'production',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "plannedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "storedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "producedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "scrapedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "uomName" TEXT,
    "stockUomUuid" TEXT,
    "bomUuid" TEXT,
    "supplierUuid" TEXT,
    "supplierName" TEXT,
    "salesOrderUuid" TEXT,
    "warehouseUuid" TEXT NOT NULL,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "WorkOrderItem" (
    "uuid" TEXT NOT NULL,
    "workOrderUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "processName" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "requiredQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "defectiveQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "producedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "WorkOrderMaterialRequest" (
    "uuid" TEXT NOT NULL,
    "workOrderUuid" TEXT NOT NULL,
    "itemUuid" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "uomName" TEXT,
    "stockUomUuid" TEXT,
    "bomUuid" TEXT,
    "warehouseUuid" TEXT NOT NULL,
    "actualQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "receivedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderMaterialRequest_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "JobCard" (
    "uuid" TEXT NOT NULL,
    "workOrderUuid" TEXT NOT NULL,
    "workOrderItemUuid" TEXT NOT NULL,
    "operatorStaffUuid" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "producedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "defectiveQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCard_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PaymentEntry" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "partyType" TEXT NOT NULL,
    "partyUuid" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "paymentMethodUuid" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "memo" TEXT,
    "attachments" TEXT[],
    "salesInvoiceIds" TEXT[],
    "purchaseInvoiceIds" TEXT[],
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentEntry_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Counter" (
    "companyUuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("companyUuid","name")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Staff_companyUuid_idx" ON "Staff"("companyUuid");

-- CreateIndex
CREATE INDEX "Uom_companyUuid_idx" ON "Uom"("companyUuid");

-- CreateIndex
CREATE INDEX "Item_companyUuid_idx" ON "Item"("companyUuid");

-- CreateIndex
CREATE INDEX "StockUom_itemUuid_idx" ON "StockUom"("itemUuid");

-- CreateIndex
CREATE INDEX "Warehouse_companyUuid_idx" ON "Warehouse"("companyUuid");

-- CreateIndex
CREATE INDEX "StockItem_companyUuid_idx" ON "StockItem"("companyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_itemUuid_warehouseUuid_stockUomUuid_key" ON "StockItem"("itemUuid", "warehouseUuid", "stockUomUuid");

-- CreateIndex
CREATE INDEX "InventoryEntry_companyUuid_idx" ON "InventoryEntry"("companyUuid");

-- CreateIndex
CREATE INDEX "InventoryEntry_itemUuid_idx" ON "InventoryEntry"("itemUuid");

-- CreateIndex
CREATE INDEX "Customer_companyUuid_idx" ON "Customer"("companyUuid");

-- CreateIndex
CREATE INDEX "Supplier_companyUuid_idx" ON "Supplier"("companyUuid");

-- CreateIndex
CREATE INDEX "Process_companyUuid_idx" ON "Process"("companyUuid");

-- CreateIndex
CREATE INDEX "Workstation_companyUuid_idx" ON "Workstation"("companyUuid");

-- CreateIndex
CREATE INDEX "PaymentMethod_companyUuid_idx" ON "PaymentMethod"("companyUuid");

-- CreateIndex
CREATE INDEX "Bom_companyUuid_idx" ON "Bom"("companyUuid");

-- CreateIndex
CREATE INDEX "BomItem_bomUuid_idx" ON "BomItem"("bomUuid");

-- CreateIndex
CREATE INDEX "BomProcess_bomUuid_idx" ON "BomProcess"("bomUuid");

-- CreateIndex
CREATE INDEX "SalesOrder_companyUuid_idx" ON "SalesOrder"("companyUuid");

-- CreateIndex
CREATE INDEX "SalesOrderItem_salesOrderUuid_idx" ON "SalesOrderItem"("salesOrderUuid");

-- CreateIndex
CREATE INDEX "DeliveryNote_companyUuid_idx" ON "DeliveryNote"("companyUuid");

-- CreateIndex
CREATE INDEX "DeliveryNoteItem_deliveryNoteUuid_idx" ON "DeliveryNoteItem"("deliveryNoteUuid");

-- CreateIndex
CREATE INDEX "SalesInvoice_companyUuid_idx" ON "SalesInvoice"("companyUuid");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyUuid_idx" ON "PurchaseOrder"("companyUuid");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_purchaseOrderUuid_idx" ON "PurchaseOrderItem"("purchaseOrderUuid");

-- CreateIndex
CREATE INDEX "ReceiptNote_companyUuid_idx" ON "ReceiptNote"("companyUuid");

-- CreateIndex
CREATE INDEX "ReceiptNoteItem_receiptNoteUuid_idx" ON "ReceiptNoteItem"("receiptNoteUuid");

-- CreateIndex
CREATE INDEX "PurchaseInvoice_companyUuid_idx" ON "PurchaseInvoice"("companyUuid");

-- CreateIndex
CREATE INDEX "WorkOrder_companyUuid_idx" ON "WorkOrder"("companyUuid");

-- CreateIndex
CREATE INDEX "WorkOrderItem_workOrderUuid_idx" ON "WorkOrderItem"("workOrderUuid");

-- CreateIndex
CREATE INDEX "WorkOrderMaterialRequest_workOrderUuid_idx" ON "WorkOrderMaterialRequest"("workOrderUuid");

-- CreateIndex
CREATE INDEX "JobCard_workOrderItemUuid_idx" ON "JobCard"("workOrderItemUuid");

-- CreateIndex
CREATE INDEX "PaymentEntry_companyUuid_idx" ON "PaymentEntry"("companyUuid");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyUuid_fkey" FOREIGN KEY ("companyUuid") REFERENCES "Company"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_companyUuid_fkey" FOREIGN KEY ("companyUuid") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockUom" ADD CONSTRAINT "StockUom_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockUom" ADD CONSTRAINT "StockUom_uomUuid_fkey" FOREIGN KEY ("uomUuid") REFERENCES "Uom"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_stockUomUuid_fkey" FOREIGN KEY ("stockUomUuid") REFERENCES "StockUom"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_stockUomUuid_fkey" FOREIGN KEY ("stockUomUuid") REFERENCES "StockUom"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bom" ADD CONSTRAINT "Bom_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomItem" ADD CONSTRAINT "BomItem_bomUuid_fkey" FOREIGN KEY ("bomUuid") REFERENCES "Bom"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomItem" ADD CONSTRAINT "BomItem_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomItem" ADD CONSTRAINT "BomItem_stockUomUuid_fkey" FOREIGN KEY ("stockUomUuid") REFERENCES "StockUom"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomProcess" ADD CONSTRAINT "BomProcess_bomUuid_fkey" FOREIGN KEY ("bomUuid") REFERENCES "Bom"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BomProcess" ADD CONSTRAINT "BomProcess_processUuid_fkey" FOREIGN KEY ("processUuid") REFERENCES "Process"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Customer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderUuid_fkey" FOREIGN KEY ("salesOrderUuid") REFERENCES "SalesOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNote" ADD CONSTRAINT "DeliveryNote_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Customer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNote" ADD CONSTRAINT "DeliveryNote_salesOrderUuid_fkey" FOREIGN KEY ("salesOrderUuid") REFERENCES "SalesOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNote" ADD CONSTRAINT "DeliveryNote_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNoteItem" ADD CONSTRAINT "DeliveryNoteItem_deliveryNoteUuid_fkey" FOREIGN KEY ("deliveryNoteUuid") REFERENCES "DeliveryNote"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNoteItem" ADD CONSTRAINT "DeliveryNoteItem_salesOrderItemUuid_fkey" FOREIGN KEY ("salesOrderItemUuid") REFERENCES "SalesOrderItem"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNoteItem" ADD CONSTRAINT "DeliveryNoteItem_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Customer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_salesOrderUuid_fkey" FOREIGN KEY ("salesOrderUuid") REFERENCES "SalesOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierUuid_fkey" FOREIGN KEY ("supplierUuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderUuid_fkey" FOREIGN KEY ("purchaseOrderUuid") REFERENCES "PurchaseOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptNote" ADD CONSTRAINT "ReceiptNote_supplierUuid_fkey" FOREIGN KEY ("supplierUuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptNote" ADD CONSTRAINT "ReceiptNote_purchaseOrderUuid_fkey" FOREIGN KEY ("purchaseOrderUuid") REFERENCES "PurchaseOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptNote" ADD CONSTRAINT "ReceiptNote_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptNoteItem" ADD CONSTRAINT "ReceiptNoteItem_receiptNoteUuid_fkey" FOREIGN KEY ("receiptNoteUuid") REFERENCES "ReceiptNote"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptNoteItem" ADD CONSTRAINT "ReceiptNoteItem_purchaseOrderItemUuid_fkey" FOREIGN KEY ("purchaseOrderItemUuid") REFERENCES "PurchaseOrderItem"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptNoteItem" ADD CONSTRAINT "ReceiptNoteItem_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInvoice" ADD CONSTRAINT "PurchaseInvoice_supplierUuid_fkey" FOREIGN KEY ("supplierUuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInvoice" ADD CONSTRAINT "PurchaseInvoice_purchaseOrderUuid_fkey" FOREIGN KEY ("purchaseOrderUuid") REFERENCES "PurchaseOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_bomUuid_fkey" FOREIGN KEY ("bomUuid") REFERENCES "Bom"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_workOrderUuid_fkey" FOREIGN KEY ("workOrderUuid") REFERENCES "WorkOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderMaterialRequest" ADD CONSTRAINT "WorkOrderMaterialRequest_workOrderUuid_fkey" FOREIGN KEY ("workOrderUuid") REFERENCES "WorkOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderMaterialRequest" ADD CONSTRAINT "WorkOrderMaterialRequest_itemUuid_fkey" FOREIGN KEY ("itemUuid") REFERENCES "Item"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderMaterialRequest" ADD CONSTRAINT "WorkOrderMaterialRequest_warehouseUuid_fkey" FOREIGN KEY ("warehouseUuid") REFERENCES "Warehouse"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderMaterialRequest" ADD CONSTRAINT "WorkOrderMaterialRequest_stockUomUuid_fkey" FOREIGN KEY ("stockUomUuid") REFERENCES "StockUom"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_workOrderUuid_fkey" FOREIGN KEY ("workOrderUuid") REFERENCES "WorkOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_workOrderItemUuid_fkey" FOREIGN KEY ("workOrderItemUuid") REFERENCES "WorkOrderItem"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_operatorStaffUuid_fkey" FOREIGN KEY ("operatorStaffUuid") REFERENCES "Staff"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEntry" ADD CONSTRAINT "PaymentEntry_paymentMethodUuid_fkey" FOREIGN KEY ("paymentMethodUuid") REFERENCES "PaymentMethod"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
