-- Invoices raised before invoice lines existed billed their whole order (the
-- old flow defaulted to the order total). Give them lines so the order isn't
-- treated as unbilled and invoiced a second time. Invoices whose amount differs
-- from the order total are left alone: which lines they covered is unknown.
INSERT INTO "SalesInvoiceItem" ("uuid", "salesInvoiceUuid", "salesOrderItemUuid", "itemUuid", "itemName", "uomName", "qty", "unitPrice", "discount", "lineTotal")
SELECT gen_random_uuid()::text, si."uuid", soi."uuid", soi."itemUuid", soi."itemName", soi."uomName",
       soi."orderedQty", soi."unitPrice", 0, soi."orderedQty" * soi."unitPrice"
FROM "SalesInvoice" si
JOIN "SalesOrder" so ON so."uuid" = si."salesOrderUuid"
JOIN "SalesOrderItem" soi ON soi."salesOrderUuid" = so."uuid"
WHERE NOT EXISTS (SELECT 1 FROM "SalesInvoiceItem" x WHERE x."salesInvoiceUuid" = si."uuid")
  AND si."amount" = so."totalAmount";
