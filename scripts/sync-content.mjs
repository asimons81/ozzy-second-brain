import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'content');
const targetDir = path.join(root, 'public', 'content');

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
      continue;
    }
    fs.copyFileSync(srcPath, destPath);
  }
}

function collectIndex(dir, baseDir = dir, out = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectIndex(full, baseDir, out);
      continue;
    }
    if (!entry.name.endsWith('.md')) continue;

    const relative = path.relative(baseDir, full).replace(/\\/g, '/');
    const [category, ...rest] = relative.split('/');
    if (!category || rest.length === 0) continue;

    const file = rest.join('/');
    const slug = file.replace(/\.md$/, '');
    out[category] ??= [];
    out[category].push(slug);
  }

  return out;
}

if (!fs.existsSync(sourceDir)) {
  console.warn('[content-sync] source directory missing, skipping.');
  process.exit(0);
}

copyRecursive(sourceDir, targetDir);

const index = collectIndex(targetDir);
for (const category of Object.keys(index)) {
  index[category].sort((a, b) => a.localeCompare(b));
}

const indexPath = path.join(targetDir, 'index.json');
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf-8');
console.info(`[content-sync] copied content to ${targetDir} and wrote index.json`);
