-- AlterTable
ALTER TABLE "DeliveryNote" ALTER COLUMN "status" SET DEFAULT 'to_deliver';

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" SET DEFAULT 'to_receive_and_bill',
ALTER COLUMN "receiptStatus" SET DEFAULT 'not_received',
ALTER COLUMN "billingStatus" SET DEFAULT 'not_billed';

-- AlterTable
ALTER TABLE "ReceiptNote" ALTER COLUMN "status" SET DEFAULT 'to_receive';

-- AlterTable
ALTER TABLE "SalesOrder" ALTER COLUMN "status" SET DEFAULT 'to_deliver_and_bill',
ALTER COLUMN "billingStatus" SET DEFAULT 'not_billed',
ALTER COLUMN "deliveryStatus" SET DEFAULT 'not_delivered';

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "status" SET DEFAULT 'draft';
