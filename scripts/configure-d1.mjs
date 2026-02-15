#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const [, , databaseIdArg] = process.argv;

if (!databaseIdArg || !/^[0-9a-fA-F-]{36}$/.test(databaseIdArg)) {
  console.error('Usage: node scripts/configure-d1.mjs <database-id-uuid>');
  process.exit(1);
}

const wranglerPath = path.join(process.cwd(), 'wrangler.jsonc');
const current = fs.readFileSync(wranglerPath, 'utf-8');

if (!current.includes('__SET_WITH_WRANGLER_D1_CREATE_OUTPUT__')) {
  console.error('No D1 placeholder found in wrangler.jsonc.');
  process.exit(1);
}

const next = current.replace('__SET_WITH_WRANGLER_D1_CREATE_OUTPUT__', databaseIdArg);
fs.writeFileSync(wranglerPath, next, 'utf-8');

console.log(`Updated wrangler.jsonc SECOND_BRAIN_DB database_id: ${databaseIdArg}`);
