-- Items created before the RM / MP / FG numbering rule (SRS 2) have no code.
-- Number them per company and class, continuing any existing counter, then
-- move the counter past what was used so new items don't collide.
WITH missing AS (
  SELECT
    i.uuid,
    i."companyUuid",
    CASE i."itemType"
      WHEN 'manufactured_part' THEN 'manufacturedPart'
      WHEN 'finished_good' THEN 'finishedGood'
      ELSE 'rawMaterial'
    END AS counter,
    CASE i."itemType"
      WHEN 'manufactured_part' THEN 'MP'
      WHEN 'finished_good' THEN 'FG'
      ELSE 'RM'
    END AS prefix,
    ROW_NUMBER() OVER (PARTITION BY i."companyUuid", i."itemType" ORDER BY i."insertedAt", i.uuid) AS n
  FROM "Item" i
  WHERE i.sku IS NULL OR btrim(i.sku) = ''
),
numbered AS (
  SELECT m.*, COALESCE(c.value, 0) + m.n AS seq
  FROM missing m
  LEFT JOIN "Counter" c ON c."companyUuid" = m."companyUuid" AND c.name = m.counter
),
updated AS (
  UPDATE "Item" i
  SET sku = numbered.prefix || '-' || lpad(numbered.seq::text, 6, '0')
  FROM numbered
  WHERE i.uuid = numbered.uuid
  RETURNING numbered."companyUuid", numbered.counter, numbered.seq
)
INSERT INTO "Counter" ("companyUuid", name, value)
SELECT "companyUuid", counter, MAX(seq) FROM updated GROUP BY "companyUuid", counter
ON CONFLICT ("companyUuid", name) DO UPDATE SET value = GREATEST("Counter".value, EXCLUDED.value);
