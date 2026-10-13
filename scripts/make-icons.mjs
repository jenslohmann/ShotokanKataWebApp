// Generates the PWA icons in public/ from icon-source/app-icon.jpg (run: npm run icons).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'icon-source', 'app-icon.jpg');
const out = (f) => path.join(root, 'public', f);

if (!fs.existsSync(src)) {
  console.error('icon-source/app-icon.jpg is missing – run `npm run sync-data` first.');
  process.exit(1);
}
fs.mkdirSync(path.join(root, 'public'), { recursive: true });

const plain = [
  ['pwa-512x512.png', 512],
  ['pwa-192x192.png', 192],
  ['apple-touch-icon.png', 180],
  ['favicon-64x64.png', 64],
];
for (const [file, size] of plain) {
  await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(out(file));
}

// Maskable: icon scaled to 80 % and centred on a 512×512 white square (safe zone for Android masks).
const inner = await sharp(src).resize(410, 410, { fit: 'cover' }).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#FFFFFF' } })
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(out('maskable-512x512.png'));

console.log('Icons written to public/');
