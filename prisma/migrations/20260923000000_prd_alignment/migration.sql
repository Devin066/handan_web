-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'employee';

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "baseRate" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "employmentType" TEXT NOT NULL DEFAULT 'regular',
ADD COLUMN     "hiredAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "shift" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "Uom" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'count',
ADD COLUMN     "symbol" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "category" TEXT,
ADD COLUMN     "defaultSupplierUuid" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "itemType" TEXT NOT NULL DEFAULT 'raw_material',
ADD COLUMN     "marketplaceRef" TEXT,
ADD COLUMN     "minStockThreshold" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "standardCost" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "storageLocation" TEXT;

-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "inProductionQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "reservedQty" DECIMAL(18,4) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "InventoryEntry" ADD COLUMN     "createdByUserUuid" TEXT,
ADD COLUMN     "qtyBeforeTransaction" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "followUpStatus" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "lastInteractionAt" TIMESTAMP(3),
ADD COLUMN     "marketplaceAccount" TEXT,
ADD COLUMN     "messengerId" TEXT,
ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "primaryChannel" TEXT NOT NULL DEFAULT 'direct';

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "BomItem" ALTER COLUMN "qty" SET DEFAULT 1,
ALTER COLUMN "qty" SET DATA TYPE DECIMAL(18,4);

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'direct',
ADD COLUMN     "externalRef" TEXT,
ADD COLUMN     "fulfillmentModel" TEXT NOT NULL DEFAULT 'make_to_order',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "productionStatus" TEXT NOT NULL DEFAULT 'not_started',
ADD COLUMN     "requiredDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SalesOrderItem" ADD COLUMN     "customSpec" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedByUserUuid" TEXT,
ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "pausedSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectReason" TEXT,
ADD COLUMN     "rejectedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "targetQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedByUserUuid" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "AuditLog" (
    "uuid" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityUuid" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "summary" TEXT,
    "userUuid" TEXT,
    "userEmail" TEXT,
    "ipAddress" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Notification" (
    "uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "channel" TEXT NOT NULL DEFAULT 'in_app',
    "entityType" TEXT,
    "entityUuid" TEXT,
    "userUuid" TEXT,
    "role" TEXT,
    "readAt" TIMESTAMP(3),
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "CustomerInteraction" (
    "uuid" TEXT NOT NULL,
    "customerUuid" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'messenger',
    "direction" TEXT NOT NULL DEFAULT 'inbound',
    "subject" TEXT,
    "body" TEXT,
    "outcome" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userUuid" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInteraction_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "FollowUpRule" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'messenger',
    "trigger" TEXT NOT NULL DEFAULT 'no_response',
    "noResponseHours" INTEGER NOT NULL DEFAULT 72,
    "messageTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpRule_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'operating',
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Expense" (
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "categoryUuid" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "incurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethodUuid" TEXT,
    "supplierUuid" TEXT,
    "attachments" TEXT[],
    "recordedByUserUuid" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "uuid" TEXT NOT NULL,
    "staffUuid" TEXT NOT NULL,
    "workDate" DATE NOT NULL,
    "timeIn" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "shift" TEXT,
    "status" TEXT NOT NULL DEFAULT 'present',
    "regularHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "payDate" DATE,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PayrollEntry" (
    "uuid" TEXT NOT NULL,
    "payrollPeriodUuid" TEXT NOT NULL,
    "staffUuid" TEXT NOT NULL,
    "regularHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "basePay" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "overtimePay" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "incentivePay" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "sssDeduction" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "philhealthDeduction" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "netPay" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollEntry_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "companyUuid" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("companyUuid","key")
);

-- CreateIndex
CREATE INDEX "AuditLog_companyUuid_insertedAt_idx" ON "AuditLog"("companyUuid", "insertedAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyUuid_entityType_entityUuid_idx" ON "AuditLog"("companyUuid", "entityType", "entityUuid");

-- CreateIndex
CREATE INDEX "Notification_companyUuid_userUuid_readAt_idx" ON "Notification"("companyUuid", "userUuid", "readAt");

-- CreateIndex
CREATE INDEX "Notification_companyUuid_type_idx" ON "Notification"("companyUuid", "type");

-- CreateIndex
CREATE INDEX "CustomerInteraction_customerUuid_occurredAt_idx" ON "CustomerInteraction"("customerUuid", "occurredAt");

-- CreateIndex
CREATE INDEX "CustomerInteraction_companyUuid_idx" ON "CustomerInteraction"("companyUuid");

-- CreateIndex
CREATE INDEX "FollowUpRule_companyUuid_idx" ON "FollowUpRule"("companyUuid");

-- CreateIndex
CREATE INDEX "ExpenseCategory_companyUuid_idx" ON "ExpenseCategory"("companyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_companyUuid_name_key" ON "ExpenseCategory"("companyUuid", "name");

-- CreateIndex
CREATE INDEX "Expense_companyUuid_incurredAt_idx" ON "Expense"("companyUuid", "incurredAt");

-- CreateIndex
CREATE INDEX "AttendanceRecord_companyUuid_workDate_idx" ON "AttendanceRecord"("companyUuid", "workDate");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_staffUuid_workDate_key" ON "AttendanceRecord"("staffUuid", "workDate");

-- CreateIndex
CREATE INDEX "PayrollPeriod_companyUuid_startDate_idx" ON "PayrollPeriod"("companyUuid", "startDate");

-- CreateIndex
CREATE INDEX "PayrollEntry_companyUuid_idx" ON "PayrollEntry"("companyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollEntry_payrollPeriodUuid_staffUuid_key" ON "PayrollEntry"("payrollPeriodUuid", "staffUuid");

-- CreateIndex
CREATE INDEX "Item_companyUuid_itemType_idx" ON "Item"("companyUuid", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "Item_companyUuid_sku_key" ON "Item"("companyUuid", "sku");

-- CreateIndex
CREATE INDEX "Customer_companyUuid_nextFollowUpAt_idx" ON "Customer"("companyUuid", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "SalesOrder_companyUuid_channel_idx" ON "SalesOrder"("companyUuid", "channel");

-- CreateIndex
CREATE INDEX "WorkOrder_companyUuid_status_priority_idx" ON "WorkOrder"("companyUuid", "status", "priority");

-- CreateIndex
CREATE INDEX "JobCard_companyUuid_status_idx" ON "JobCard"("companyUuid", "status");

-- CreateIndex
CREATE INDEX "JobCard_companyUuid_operatorStaffUuid_status_idx" ON "JobCard"("companyUuid", "operatorStaffUuid", "status");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_defaultSupplierUuid_fkey" FOREIGN KEY ("defaultSupplierUuid") REFERENCES "Supplier"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_createdByUserUuid_fkey" FOREIGN KEY ("createdByUserUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_salesOrderUuid_fkey" FOREIGN KEY ("salesOrderUuid") REFERENCES "SalesOrder"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_assignedByUserUuid_fkey" FOREIGN KEY ("assignedByUserUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_validatedByUserUuid_fkey" FOREIGN KEY ("validatedByUserUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInteraction" ADD CONSTRAINT "CustomerInteraction_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Customer"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInteraction" ADD CONSTRAINT "CustomerInteraction_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryUuid_fkey" FOREIGN KEY ("categoryUuid") REFERENCES "ExpenseCategory"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_staffUuid_fkey" FOREIGN KEY ("staffUuid") REFERENCES "Staff"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_payrollPeriodUuid_fkey" FOREIGN KEY ("payrollPeriodUuid") REFERENCES "PayrollPeriod"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_staffUuid_fkey" FOREIGN KEY ("staffUuid") REFERENCES "Staff"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

