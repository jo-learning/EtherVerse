#!/usr/bin/env bash
set -euo pipefail

# Wait for Postgres to be ready
echo "Waiting for postgres..."
MAX_RETRIES=30
COUNT=0
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; do
  COUNT=$((COUNT+1))
  if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Postgres did not become ready in time"
    exit 1
  fi
  sleep 2
done
echo "Postgres is ready."

# Run prisma migrations
echo "Running prisma migrate deploy..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Optional: generate prisma client if needed
echo "Generating prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

# wallet SQL if file exists
if [ -f /data/wallet.sql ]; then
  echo "walleting /data/wallet.sql into database..."
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /data/wallet.sql
  echo "wallet finished."
else
  echo "No wallet.sql found at /data/wallet.sql — skipping wallet."
fi

echo "Migrate and seed completed."
