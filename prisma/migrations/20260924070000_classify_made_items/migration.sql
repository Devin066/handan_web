-- Items that are built from a BOM are made in-house, not bought: finished goods,
-- or manufactured parts when they also feed another assembly (SRS 4.4).
UPDATE "Item" i SET "itemType" = CASE
    WHEN EXISTS (SELECT 1 FROM "BomItem" bi WHERE bi."itemUuid" = i."uuid") THEN 'manufactured_part'
    ELSE 'finished_good'
  END
WHERE i."itemType" = 'raw_material'
  AND EXISTS (SELECT 1 FROM "Bom" b WHERE b."itemUuid" = i."uuid");
