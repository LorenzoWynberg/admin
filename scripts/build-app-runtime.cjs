// scripts/build-app-runtime.js
const fs = require('fs');
const path = require('path');

// adjust if your d.ts path differs
const DT_FILE = path.resolve(__dirname, '..', 'types', 'generated.d.ts');
// put output under data so `@/data/app-enums` resolves
const OUT_FILE = path.resolve(__dirname, '..', 'data', 'app-enums.ts');

function sliceNamespaceBlock(src, nsHeader) {
  const start = src.indexOf(nsHeader);
  if (start === -1) {
    return null;
  }

  // position at first '{' after header
  const braceStart = src.indexOf('{', start);
  if (braceStart === -1) {
    return null;
  }

  // balance braces to find the matching '}'
  let i = braceStart + 1;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const ch = src[i++];
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
    }
  }
  if (depth !== 0) {
    return null;
  }

  const end = i; // position *after* the closing brace
  return src.slice(braceStart + 1, end - 1); // inner body, no outer braces
}

function parseEnums(nsBody) {
  const enums = {};
  if (!nsBody) {
    return enums;
  }

  // find every `export enum Name { ... }` (balanced by a simple pass)
  const enumHeader = /export\s+enum\s+([A-Za-z0-9_]+)\s*\{/g;
  let m;
  while ((m = enumHeader.exec(nsBody))) {
    const name = m[1];
    const start = m.index + m[0].length - 1; // at '{'
    // balance braces for this enum body
    let i = start + 1;
    let depth = 1;
    while (i < nsBody.length && depth > 0) {
      const ch = nsBody[i++];
      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
      }
    }
    const body = nsBody.slice(start + 1, i - 1);

    // Parse lines of form  KEY = value,
    const map = {};
    // allow optional trailing commas, spaces, comments
    const kv = /([A-Za-z0-9_]+)\s*=\s*([^,}\n]+)\s*,?/g;
    let km;
    while ((km = kv.exec(body))) {
      const key = km[1].trim();
      let raw = km[2].trim();
      if (
        (raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith("'") && raw.endsWith("'"))
      ) {
        map[key] = raw.slice(1, -1);
      } else {
        const n = Number(raw);
        map[key] = Number.isNaN(n) ? raw : n;
      }
    }
    enums[name] = map;
  }
  return enums;
}

function generateModule(enums) {
  const lines = [];
  lines.push('// AUTO-GENERATED. Do not edit.');
  lines.push('// Source: /types/generated.d.ts -> App.Enums');
  lines.push('export const Enums = {');
  for (const [name, map] of Object.entries(enums)) {
    lines.push(`  ${name}: {`);
    for (const [k, v] of Object.entries(map)) {
      lines.push(`    ${k}: ${typeof v === 'string' ? JSON.stringify(v) : v},`);
    }
    lines.push('  },');
  }
  lines.push('} as const;');
  lines.push('export type Enums = typeof Enums;');
  return lines.join('\n');
}

(function main() {
  if (!fs.existsSync(DT_FILE)) {
    console.error('Missing types file:', DT_FILE);
    process.exit(1);
  }
  const dts = fs.readFileSync(DT_FILE, 'utf8');

  const nsBody = sliceNamespaceBlock(dts, 'declare namespace App.Enums');
  if (!nsBody) {
    console.warn('Could not locate `declare namespace App.Enums` in the d.ts.');
  }

  const enums = parseEnums(nsBody);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, generateModule(enums), 'utf8');
  console.log('Wrote', OUT_FILE, 'with', Object.keys(enums).length, 'enums.');
})();
