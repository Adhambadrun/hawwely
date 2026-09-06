/**
 * Generates the static brand assets that live in /public:
 *   - /logo.svg                        app logo (mark + wordmark)
 *   - /icons/icon-{192,512}.png        PWA icons (+ maskable + apple-touch + favicon)
 *   - /images/og-image.png             default Open Graph image (1200×630)
 *   - /images/services/<slug>.svg      placeholder service logos (monogram on brand colour)
 *
 * Run: npm run assets
 * Service SVGs are intentionally simple placeholders — replace them with the
 * official brand logos (respecting each provider's brand guidelines) before launch.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(__dirname, '..', 'public');

const SERVICES: { slug: string; name: string; color: string; text?: string }[] = [
  { slug: 'wise', name: 'Wise', color: '#9FE870', text: '#163300' },
  { slug: 'remitly', name: 'Remitly', color: '#2E5BFF' },
  { slug: 'western-union', name: 'Western Union', color: '#FFDD00', text: '#000000' },
  { slug: 'moneygram', name: 'MoneyGram', color: '#DA291C' },
  { slug: 'tahweel-al-rajhi', name: 'Tahweel Al Rajhi', color: '#0F5FA6' },
  { slug: 'paysend', name: 'Paysend', color: '#7B3FE4' },
  { slug: 'worldremit', name: 'WorldRemit', color: '#6E2CF2' },
  { slug: 'sendwave', name: 'Sendwave', color: '#00B4D8' },
  { slug: 'al-ansari', name: 'Al Ansari Exchange', color: '#0E7C3A' },
  { slug: 'nbe-direct', name: 'NBE Direct', color: '#0B6E4F' },
  { slug: 'cib', name: 'CIB', color: '#003B71' },
  { slug: 'instapay', name: 'InstaPay', color: '#5B21B6' },
];

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function serviceSvg(s: (typeof SERVICES)[number]) {
  const fg = s.text ?? '#FFFFFF';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="${s.name}">
  <rect width="128" height="128" rx="28" fill="${s.color}"/>
  <text x="64" y="76" text-anchor="middle" font-family="Inter, Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="${fg}" letter-spacing="-2">${initials(s.name)}</text>
</svg>
`;
}

function markSvg(size = 512, radius = 0.25) {
  const r = Math.round(size * radius);
  const k = size / 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00C853"/><stop offset="1" stop-color="#00E676"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
  <path d="M${46 * k} ${32 * k}H${20 * k}" stroke="#fff" stroke-width="${6 * k}" stroke-linecap="round"/>
  <path d="M${30 * k} ${20 * k}L${18 * k} ${32 * k}L${30 * k} ${44 * k}" stroke="#fff" stroke-width="${6 * k}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="${47 * k}" cy="${32 * k}" r="${4 * k}" fill="#FFD700"/>
</svg>`;
}

/** Maskable icon: same mark, but with safe-zone padding (mark occupies the inner 80%). */
function maskableSvg(size = 512) {
  const inner = Math.round(size * 0.8);
  const off = Math.round((size - inner) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#00C853"/>
  <g transform="translate(${off} ${off})">${markSvg(inner, 0).replace(/<\?xml[^>]*>/, '').replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>
</svg>`;
}

function logoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64" viewBox="0 0 220 64" role="img" aria-label="Hawwely">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00C853"/><stop offset="1" stop-color="#00E676"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <path d="M46 32H20" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
  <path d="M30 20L18 32L30 44" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="47" cy="32" r="4" fill="#FFD700"/>
  <text x="78" y="44" font-family="Cairo, Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="#1B2A4A">Hawwely</text>
</svg>
`;
}

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1B2A4A"/><stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00C853"/><stop offset="1" stop-color="#00E676"/>
    </linearGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.10)"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <circle cx="1040" cy="120" r="220" fill="#00C853" opacity="0.12"/>
  <circle cx="140" cy="560" r="180" fill="#FFD700" opacity="0.08"/>
  <g transform="translate(80 90)">
    <rect width="160" height="160" rx="40" fill="url(#g)"/>
    <path d="M115 80H50" stroke="#fff" stroke-width="15" stroke-linecap="round"/>
    <path d="M75 50L45 80L75 110" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="117" cy="80" r="10" fill="#FFD700"/>
  </g>
  <text x="270" y="200" font-family="Inter, Arial, sans-serif" font-size="92" font-weight="800" fill="#FFFFFF">Hawwely</text>
  <text x="80" y="360" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="700" fill="#FFFFFF">Send More. Pay Less.</text>
  <text x="80" y="430" font-family="Inter, Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.78)">Compare 12 money-transfer services to Egypt in seconds</text>
  <rect x="80" y="500" width="300" height="56" rx="28" fill="#00C853"/>
  <text x="230" y="537" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">hawwely.com</text>
  <g transform="translate(900 480)">
    <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.6)">SAR · AED · KWD · USD</text>
    <text x="0" y="36" font-family="Inter, Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.6)">EUR · GBP · QAR · JOD</text>
  </g>
</svg>`;
}

async function main() {
  mkdirSync(join(ROOT, 'images', 'services'), { recursive: true });
  mkdirSync(join(ROOT, 'icons'), { recursive: true });
  mkdirSync(join(ROOT, 'images'), { recursive: true });

  for (const s of SERVICES) writeFileSync(join(ROOT, 'images', 'services', `${s.slug}.svg`), serviceSvg(s));
  writeFileSync(join(ROOT, 'logo.svg'), logoSvg());
  writeFileSync(join(ROOT, 'icons', 'icon.svg'), markSvg(512));

  const mark = Buffer.from(markSvg(1024));
  await sharp(mark).resize(192, 192).png().toFile(join(ROOT, 'icons', 'icon-192.png'));
  await sharp(mark).resize(512, 512).png().toFile(join(ROOT, 'icons', 'icon-512.png'));
  await sharp(mark).resize(180, 180).png().toFile(join(ROOT, 'icons', 'apple-touch-icon.png'));
  await sharp(mark).resize(32, 32).png().toFile(join(ROOT, 'icons', 'favicon-32.png'));
  await sharp(mark).resize(16, 16).png().toFile(join(ROOT, 'icons', 'favicon-16.png'));
  await sharp(Buffer.from(maskableSvg(1024))).resize(512, 512).png().toFile(join(ROOT, 'icons', 'icon-maskable-512.png'));
  await sharp(Buffer.from(ogSvg())).png().toFile(join(ROOT, 'images', 'og-image.png'));

  // favicon.ico — a PNG-in-ICO container (supported by all modern browsers).
  const png32 = await sharp(mark).resize(32, 32).png().toBuffer();
  writeFileSync(join(ROOT, 'icons', 'favicon.ico'), pngToIco(png32, 32));
  writeFileSync(join(ROOT, 'favicon.ico'), pngToIco(png32, 32));

  console.log('assets generated in /public');
}

function pngToIco(png: Buffer, size: number) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, png]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
