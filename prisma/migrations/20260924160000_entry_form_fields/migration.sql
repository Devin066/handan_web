-- AlterTable
ALTER TABLE "PaymentEntry" ADD COLUMN     "paidOn" TIMESTAMP(3),
ADD COLUMN     "referenceNo" TEXT;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'PHP',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'cash',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "requiresReference" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workstation" ADD COLUMN     "capacityHours" DECIMAL(6,2),
ADD COLUMN     "code" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT;

-- Classify existing methods by name so they get a sensible type and
-- reference rule instead of all defaulting to cash.
UPDATE "PaymentMethod" SET "kind" = 'bank_transfer', "requiresReference" = true WHERE "name" ILIKE '%bank%' OR "name" ILIKE '%transfer%';
UPDATE "PaymentMethod" SET "kind" = 'check', "requiresReference" = true WHERE "name" ILIKE '%cheque%' OR "name" ILIKE '%check%';
UPDATE "PaymentMethod" SET "kind" = 'e_wallet', "requiresReference" = true WHERE "name" ILIKE '%gcash%' OR "name" ILIKE '%maya%' OR "name" ILIKE '%wallet%';
UPDATE "PaymentMethod" SET "kind" = 'card', "requiresReference" = true WHERE "name" ILIKE '%card%';
