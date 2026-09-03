import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('client/src/assets');
const publicDir = path.resolve('client/public/backgrounds');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8', 'bg9'];

async function processImages() {
  console.log('🚀 Starting high-fidelity image optimization...\n');
  let totalOrigBytes = 0;
  let totalOptDesktopBytes = 0;
  let totalOptMobileBytes = 0;

  for (const bg of backgrounds) {
    const inputPath = path.join(assetsDir, `${bg}.png`);
    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️ Warning: ${inputPath} not found. Skipping.`);
      continue;
    }

    const origStats = fs.statSync(inputPath);
    totalOrigBytes += origStats.size;

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // 1. Desktop AVIF (1920px max width, q=82)
    const desktopAvifPath = path.join(publicDir, `${bg}-desktop.avif`);
    await sharp(inputPath)
      .resize({ width: 1920, withoutEnlargement: true })
      .avif({ quality: 82, effort: 4 })
      .toFile(desktopAvifPath);

    // 2. Mobile AVIF (1080px max width, q=80)
    const mobileAvifPath = path.join(publicDir, `${bg}-mobile.avif`);
    await sharp(inputPath)
      .resize({ width: 1080, withoutEnlargement: true })
      .avif({ quality: 80, effort: 4 })
      .toFile(mobileAvifPath);

    // 3. Desktop WebP (1920px max width, q=88)
    const desktopWebpPath = path.join(publicDir, `${bg}-desktop.webp`);
    await sharp(inputPath)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toFile(desktopWebpPath);

    // 4. Mobile WebP (1080px max width, q=85)
    const mobileWebpPath = path.join(publicDir, `${bg}-mobile.webp`);
    await sharp(inputPath)
      .resize({ width: 1080, withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(mobileWebpPath);

    const avifDesktopStats = fs.statSync(desktopAvifPath);
    const avifMobileStats = fs.statSync(mobileAvifPath);
    totalOptDesktopBytes += avifDesktopStats.size;
    totalOptMobileBytes += avifMobileStats.size;

    console.log(`✅ ${bg}.png (${(origStats.size / (1024 * 1024)).toFixed(2)} MB, ${metadata.width}x${metadata.height}) ->`);
    console.log(`   Desktop AVIF: ${(avifDesktopStats.size / 1024).toFixed(1)} KB | Mobile AVIF: ${(avifMobileStats.size / 1024).toFixed(1)} KB`);
  }

  console.log('\n📊 Optimization Summary:');
  console.log(`- Original Total Assets: ${(totalOrigBytes / (1024 * 1024)).toFixed(2)} MB (9 PNGs)`);
  console.log(`- Average Desktop Initial Image (1 background): ~${(totalOptDesktopBytes / 9 / 1024).toFixed(1)} KB`);
  console.log(`- Average Mobile Initial Image (1 background): ~${(totalOptMobileBytes / 9 / 1024).toFixed(1)} KB`);
  console.log(`- Payload Reduction on Initial Page Load: ~${(((totalOrigBytes - (totalOptDesktopBytes / 9)) / totalOrigBytes) * 100).toFixed(1)}% reduction!\n`);
}

processImages().catch(err => {
  console.error('❌ Error processing images:', err);
  process.exit(1);
});
