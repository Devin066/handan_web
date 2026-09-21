#!/bin/sh
# Dump the database into ./backups, keeping the last 14 days.
#
# A single VPS has no redundancy, so this is the only thing standing between a
# disk failure and losing the company's books. Run it from cron:
#   0 2 * * * cd /srv/handan && ./scripts/backup-db.sh >> /var/log/handan-backup.log 2>&1
#
# A backup you have never restored is a guess. Test one:
#   gunzip -c backups/handan-YYYY-MM-DD.sql.gz | docker compose exec -T db psql -U handan -d handan_restore_test
set -e

STAMP=$(date +%F)
USER=${POSTGRES_USER:-handan}
DB=${POSTGRES_DB:-handan}

mkdir -p backups

docker compose exec -T db pg_dump -U "$USER" "$DB" | gzip > "backups/${DB}-${STAMP}.sql.gz"
echo "wrote backups/${DB}-${STAMP}.sql.gz"

find backups -name "${DB}-*.sql.gz" -mtime +14 -delete
