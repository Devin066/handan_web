/**
 * Checks that .env.example documents exactly the environment variables the code
 * actually reads — no undocumented variables, no stale ones.
 *
 * Usage: pnpm check:env
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Set by the platform or the Dockerfile, not something a user configures.
const IGNORED = new Set(['NODE_ENV', 'PORT', 'HOSTNAME', 'NEXT_TELEMETRY_DISABLED', 'SMOKE_ENDPOINT']);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', 'generated', 'backups'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|mjs|js|yml)$/.test(entry.name) || entry.name === 'Dockerfile') acc.push(full);
  }
  return acc;
}

const used = new Set();
for (const file of [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'scripts')),
                    ...walk(path.join(ROOT, 'prisma')), path.join(ROOT, 'prisma.config.ts'),
                    path.join(ROOT, 'next.config.ts'), path.join(ROOT, 'docker-compose.yml'),
                    path.join(ROOT, 'Dockerfile')]) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/process\.env\.(\w+)/g)) used.add(m[1]);
  if (file.endsWith('.yml')) for (const m of text.matchAll(/\$\{(\w+)/g)) used.add(m[1]);
}

const example = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
const documented = new Set([...example.matchAll(/^#?\s*(\w+)=/gm)].map((m) => m[1]));

const missing = [...used].filter((v) => !documented.has(v) && !IGNORED.has(v)).sort();
const stale = [...documented].filter((v) => !used.has(v) && !IGNORED.has(v)).sort();

if (missing.length) console.log('  Used in code but NOT in .env.example:\n    ' + missing.join('\n    '));
if (stale.length) console.log('  In .env.example but unused in code:\n    ' + stale.join('\n    '));

if (!missing.length && !stale.length) {
  console.log(`\n.env.example is in sync — ${documented.size} variables documented.\n`);
  process.exit(0);
}

console.log('');
process.exit(1);
