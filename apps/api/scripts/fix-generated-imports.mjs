import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const generatedDir = resolve(dirname(new URL(import.meta.url).pathname), '../src/generated');

function collectTsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectTsFiles(full);
    return full.endsWith('.ts') ? [full] : [];
  });
}

function resolveSpecifier(file, spec) {
  if (!spec.startsWith('.') || /\.[a-z]+$/.test(spec)) return null;
  const base = resolve(dirname(file), spec);
  try {
    if (statSync(`${base}.ts`).isFile()) return `${spec}.js`;
  } catch {}
  try {
    if (statSync(join(base, 'index.ts')).isFile()) return `${spec}/index.js`;
  } catch {}
  return null;
}

let touched = 0;
for (const file of collectTsFiles(generatedDir)) {
  const original = readFileSync(file, 'utf8');
  const fixed = original.replace(/(from\s*["'])(\.[^"']+)(["'])/g, (match, pre, spec, post) => {
    const resolved = resolveSpecifier(file, spec);
    if (resolved) {
      touched++;
      return `${pre}${resolved}${post}`;
    }
    return match;
  });
  if (fixed !== original) writeFileSync(file, fixed);
}
console.log(`fix-generated-imports: ${touched} specifiers ajustados`);
