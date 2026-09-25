-- A purchase request line can name the supplier it expects to buy from.
ALTER TABLE "PurchaseRequestItem" ADD COLUMN "supplierName" TEXT,
ADD COLUMN "supplierUuid" TEXT;
