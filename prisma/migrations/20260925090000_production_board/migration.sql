-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "goodQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "rejectedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "reportedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'queued',
ADD COLUMN     "stageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "WorkOrderStageLog" (
    "uuid" TEXT NOT NULL,
    "workOrderUuid" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "staffUuid" TEXT,
    "userUuid" TEXT,
    "reportedQty" DECIMAL(18,4),
    "goodQty" DECIMAL(18,4),
    "rejectedQty" DECIMAL(18,4),
    "note" TEXT,
    "companyUuid" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderStageLog_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "WorkOrderStageLog_workOrderUuid_idx" ON "WorkOrderStageLog"("workOrderUuid");

-- CreateIndex
CREATE INDEX "WorkOrder_companyUuid_stage_idx" ON "WorkOrder"("companyUuid", "stage");

-- AddForeignKey
ALTER TABLE "WorkOrderStageLog" ADD CONSTRAINT "WorkOrderStageLog_workOrderUuid_fkey" FOREIGN KEY ("workOrderUuid") REFERENCES "WorkOrder"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Place existing work orders on the board where they already are.
UPDATE "WorkOrder" SET "stage" = CASE
  WHEN "status" = 'completed' THEN 'completed'
  WHEN "status" = 'in_process' THEN 'in_progress'
  WHEN "assignedStaffUuid" IS NOT NULL THEN 'assigned'
  ELSE 'queued'
END,
"reportedQty" = "producedQty",
"goodQty" = CASE WHEN "status" = 'completed' THEN "storedQty" ELSE 0 END;
