import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Migrations connect directly; the running app connects through DATABASE_URL,
 * which on a managed host (Supabase, Neon, PgBouncer) is a *pooled* URL. Pooled
 * connections can't run DDL reliably, so when DIRECT_DATABASE_URL is set the CLI
 * uses it and falls back to DATABASE_URL for ordinary local setups.
 */
const migrationUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: migrationUrl,
  },
});
