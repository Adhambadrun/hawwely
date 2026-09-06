/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Generates the Expo app assets referenced from app.json:
 *   assets/icon.png               1024×1024 app icon (rounded square, brand gradient)
 *   assets/adaptive-icon.png      1024×1024 Android adaptive foreground (transparent, safe-zone mark)
 *   assets/splash.png             1284×2778 splash (green background + mark + wordmark)
 *   assets/splash-icon.png        512×512 mark used by expo-splash-screen plugin
 *   assets/notification-icon.png  96×96 monochrome white mark (Android status bar)
 *   assets/favicon.png            48×48 (web)
 *   assets/images/og.png          1200×630 share image
 *
 * Run: npm run assets   (needs the `sharp` dev dependency)
 * The mark mirrors ../scripts/generate-assets.ts on the website so both surfaces match.
 */
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  // Fall back to the website's copy when running from the monorepo without a local install.
  sharp = require(join(__dirname, '..', '..', 'node_modules', 'sharp'));
}

const OUT = join(__dirname, '..', 'assets');
mkdirSync(join(OUT, 'images'), { recursive: true });

/** Arrow-into-coin mark, identical geometry to the website logo. */
function markPaths(size, color = '#fff', coin = '#FFD700') {
  const k = size / 64;
  return `
  <path d="M${46 * k} ${32 * k}H${20 * k}" stroke="${color}" stroke-width="${6 * k}" stroke-linecap="round"/>
  <path d="M${30 * k} ${20 * k}L${18 * k} ${32 * k}L${30 * k} ${44 * k}" stroke="${color}" stroke-width="${6 * k}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="${47 * k}" cy="${32 * k}" r="${4 * k}" fill="${coin}"/>`;
}

function gradientDefs(size) {
  return `<defs>
    <linearGradient id="g" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00C853"/><stop offset="1" stop-color="#00E676"/>
    </linearGradient>
  </defs>`;
}

function iconSvg(size, { rounded = true, transparent = false, scale = 1 } = {}) {
  const r = rounded ? Math.round(size * 0.22) : 0;
  const inner = size * scale;
  const off = (size - inner) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${gradientDefs(size)}
  ${transparent ? '' : `<rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>`}
  <g transform="translate(${off} ${off})">${markPaths(inner)}</g>
</svg>`;
}

function monoSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${markPaths(size, '#fff', '#fff')}
</svg>`;
}

function splashSvg(w, h) {
  const mark = Math.round(Math.min(w, h) * 0.28);
  const x = (w - mark) / 2;
  const y = h / 2 - mark * 0.85;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#00C853"/>
  <circle cx="${w * 0.15}" cy="${h * 0.12}" r="${w * 0.35}" fill="#00E676" opacity="0.35"/>
  <circle cx="${w * 0.9}" cy="${h * 0.9}" r="${w * 0.4}" fill="#00B04A" opacity="0.45"/>
  <g transform="translate(${x} ${y})">
    <rect width="${mark}" height="${mark}" rx="${mark * 0.22}" fill="rgba(255,255,255,0.14)"/>
    ${markPaths(mark)}
  </g>
  <text x="${w / 2}" y="${y + mark + mark * 0.55}" text-anchor="middle" font-family="Cairo, 'Noto Sans Arabic', Arial, sans-serif" font-size="${mark * 0.42}" font-weight="900" fill="#fff">حوّلي</text>
  <text x="${w / 2}" y="${y + mark + mark * 0.85}" text-anchor="middle" font-family="Cairo, 'Noto Sans Arabic', Arial, sans-serif" font-size="${mark * 0.15}" font-weight="600" fill="rgba(255,255,255,0.9)" direction="rtl" unicode-bidi="embed">‏قارن. وفّر. حوّل.‏</text>
</svg>`;
}

function ogSvg() {
  const w = 1200, h = 630;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${gradientDefs(200)}
  <rect width="${w}" height="${h}" fill="#1B2A4A"/>
  <circle cx="1050" cy="120" r="320" fill="#00C853" opacity="0.18"/>
  <g transform="translate(100 120)">
    <rect width="200" height="200" rx="44" fill="url(#g)"/>
    ${markPaths(200)}
  </g>
  <text x="1110" y="230" text-anchor="start" direction="rtl" unicode-bidi="embed" font-family="Cairo, 'Noto Sans Arabic', Arial, sans-serif" font-size="120" font-weight="900" fill="#fff">\u200fحوّلي\u200f</text>
  <text x="1110" y="400" text-anchor="start" direction="rtl" unicode-bidi="embed" font-family="Cairo, 'Noto Sans Arabic', Arial, sans-serif" font-size="46" font-weight="700" fill="#FFD700">\u200fقارن أسعار تحويل الفلوس لمصر في ثانية\u200f</text>
  <text x="1110" y="470" text-anchor="start" direction="rtl" unicode-bidi="embed" font-family="Cairo, 'Noto Sans Arabic', Arial, sans-serif" font-size="30" fill="#CBD5E1">\u200f١٢ خدمة تحويل · ١٠ عملات · تحديث كل ٣٠ دقيقة\u200f</text>
  <text x="1110" y="560" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="30" fill="#94A3B8">hawwely.com</text>
</svg>`;
}

async function png(svg, file) {
  // Rasterise at exactly the SVG's declared width/height (sharp's default 72 dpi keeps 1 user unit = 1 px).
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(OUT, file));
  console.log('✓', file);
}

(async () => {
  await png(iconSvg(1024), 'icon.png');
  await png(iconSvg(1024, { transparent: true, scale: 0.62 }), 'adaptive-icon.png');
  await png(iconSvg(512, { transparent: true, scale: 0.9 }), 'splash-icon.png');
  await png(splashSvg(1284, 2778), 'splash.png');
  await png(monoSvg(96), 'notification-icon.png');
  await png(iconSvg(48), 'favicon.png');
  await png(ogSvg(), 'images/og.png');
  writeFileSync(join(OUT, 'images', 'logo.svg'), iconSvg(64) + '\n');
  console.log('✓ images/logo.svg');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
