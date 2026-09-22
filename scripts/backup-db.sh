#!/bin/sh
# Dump the database into ./backups, keeping the last 14 days.
#
# A single VPS has no redundancy, so this is the only thing standing between a
# disk failure and losing the company's books. Run it from cron:
#   0 2 * * * cd /srv/erp && ./scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
#
# A backup you have never restored is a guess. Test one:
#   gunzip -c backups/erp-YYYY-MM-DD.sql.gz | docker compose exec -T db psql -U erp -d erp_restore_test
set -e

STAMP=$(date +%F)
USER=${POSTGRES_USER:-erp}
DB=${POSTGRES_DB:-erp}

mkdir -p backups

docker compose exec -T db pg_dump -U "$USER" "$DB" | gzip > "backups/${DB}-${STAMP}.sql.gz"
echo "wrote backups/${DB}-${STAMP}.sql.gz"

find backups -name "${DB}-*.sql.gz" -mtime +14 -delete
