#!/usr/bin/env node
/**
 * Copies the framework-agnostic domain code from the website (../lib) into
 * mobile/lib/shared so both apps use ONE comparison engine, ONE type system and
 * ONE seed catalogue. Run after changing anything in the website's lib/:
 *
 *   npm run sync:shared
 *
 * Files are rewritten to use relative imports and stripped of web-only helpers.
 */
const fs = require('node:fs');
const path = require('node:path');

const WEB_LIB = path.join(__dirname, '..', '..', 'lib');
const OUT = path.join(__dirname, '..', 'lib', 'shared');

const FILES = [
  ['types.ts', 'types.ts'],
  ['exchange/calculator.ts', 'calculator.ts'],
  ['utils/constants.ts', 'constants.ts'],
  ['utils/formatters.ts', 'formatters.ts'],
  ['utils/helpers.ts', 'helpers.ts'],
  ['utils/affiliate.ts', 'affiliate.ts'],
  ['data/ids.ts', 'data/ids.ts'],
  ['data/services.ts', 'data/services.ts'],
  ['data/corridors.ts', 'data/corridors.ts'],
  ['data/rates.ts', 'data/rates.ts'],
  ['data/history.ts', 'data/history.ts'],
  ['data/faqs.ts', 'data/faqs.ts'],
  ['data/blog.ts', 'data/blog.ts'],
  ['data/reviews.ts', 'data/reviews.ts'],
  ['data/stats.ts', 'data/stats.ts'],
];

const ALIAS = {
  '@/lib/types': 'types',
  '@/lib/exchange/calculator': 'calculator',
  '@/lib/utils/constants': 'constants',
  '@/lib/utils/formatters': 'formatters',
  '@/lib/utils/helpers': 'helpers',
  '@/lib/utils/affiliate': 'affiliate',
  '@/lib/data/ids': 'data/ids',
  '@/lib/data/services': 'data/services',
  '@/lib/data/corridors': 'data/corridors',
  '@/lib/data/rates': 'data/rates',
  '@/lib/data/history': 'data/history',
  '@/lib/data/faqs': 'data/faqs',
  '@/lib/data/blog': 'data/blog',
  '@/lib/data/reviews': 'data/reviews',
  '@/lib/data/stats': 'data/stats',
};

function rel(fromFile, toFile) {
  let r = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/').replace(/\.ts$/, '');
  if (!r.startsWith('.')) r = './' + r;
  return r;
}

function transform(src, outFile) {
  let s = src;
  // alias imports → relative
  s = s.replace(/from '(@\/lib\/[\w/.-]+)'/g, (m, alias) => {
    const target = ALIAS[alias];
    if (!target) throw new Error(`no alias mapping for ${alias} in ${outFile}`);
    return `from '${rel(outFile, path.join(OUT, target + '.ts'))}'`;
  });
  // web-only bits
  s = s.replace(/import \{ clsx, type ClassValue \} from 'clsx';\n/, '');
  s = s.replace(/import \{ twMerge \} from 'tailwind-merge';\n/, '');
  s = s.replace(/export function cn\([^)]*\): string \{\n[\s\S]*?\n\}\n\n?/, '');
  s = s.replace(/process\.env\.NEXT_PUBLIC_APP_URL/g, 'process.env.EXPO_PUBLIC_API_URL');
  s = s.replace(/process\.env\.NEXT_PUBLIC_WHATSAPP_NUMBER/g, 'process.env.EXPO_PUBLIC_WHATSAPP_NUMBER');
  s = s.replace(/process\.env\.(WISE|REMITLY|PAYSEND|WORLDREMIT)_AFFILIATE_ID/g, 'undefined');
  return `/* AUTO-GENERATED from website lib/ by scripts/sync-shared.js — do not edit. */\n${s}`;
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const [from, to] of FILES) {
  const srcPath = path.join(WEB_LIB, from);
  const outPath = path.join(OUT, to);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, transform(fs.readFileSync(srcPath, 'utf8'), outPath));
}
console.log(`synced ${FILES.length} files into lib/shared`);
