-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "buildSpecs" TEXT;

-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "machineHours" DECIMAL(10,2) NOT NULL DEFAULT 0;
