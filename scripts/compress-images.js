#!/usr/bin/env node
/**
 * Image compression script for FogSift.
 * Compresses oversized images in src/ to improve Lighthouse performance.
 *
 * Usage: node scripts/compress-images.js [--dry-run]
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const SIZE_THRESHOLD = 200 * 1024; // 200KB target max
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80; // for lossy PNG via palette reduction
const MAX_DIMENSION = 1200; // max width/height in pixels

const DRY_RUN = process.argv.includes('--dry-run');

async function findImages(dir) {
  const images = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      images.push(...await findImages(fullPath));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      const stat = fs.statSync(fullPath);
      if (stat.size > SIZE_THRESHOLD) {
        images.push({ path: fullPath, size: stat.size });
      }
    }
  }
  return images;
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

async function compressImage(imgPath, originalSize) {
  const ext = path.extname(imgPath).toLowerCase();
  const relPath = path.relative(path.join(__dirname, '..'), imgPath);

  try {
    const image = sharp(imgPath);
    const metadata = await image.metadata();

    // Resize if any dimension exceeds max
    let pipeline = sharp(imgPath);
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    let buffer;
    if (ext === '.jpg' || ext === '.jpeg') {
      buffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    } else if (ext === '.png') {
      buffer = await pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer();
    }

    if (buffer.length >= originalSize) {
      console.log(`  ⊘ ${relPath}: ${formatSize(originalSize)} — already optimal`);
      return { saved: 0 };
    }

    if (!DRY_RUN) {
      fs.writeFileSync(imgPath, buffer);
    }

    const savings = ((1 - buffer.length / originalSize) * 100).toFixed(0);
    console.log(`  ✓ ${relPath}: ${formatSize(originalSize)} → ${formatSize(buffer.length)} (-${savings}%)`);
    return { saved: originalSize - buffer.length };
  } catch (err) {
    console.log(`  ✗ ${relPath}: ${err.message}`);
    return { saved: 0 };
  }
}

async function main() {
  console.log(DRY_RUN ? '\n🔍 DRY RUN — no files will be modified\n' : '\n🗜️  Compressing oversized images...\n');

  const images = await findImages(SRC_DIR);
  images.sort((a, b) => b.size - a.size);

  if (images.length === 0) {
    console.log('  All images are already under ' + formatSize(SIZE_THRESHOLD));
    return;
  }

  console.log(`  Found ${images.length} images over ${formatSize(SIZE_THRESHOLD)}:\n`);

  let totalSaved = 0;
  for (const img of images) {
    const result = await compressImage(img.path, img.size);
    totalSaved += result.saved;
  }

  console.log(`\n  Total saved: ${formatSize(totalSaved)}`);
  if (DRY_RUN) console.log('  (dry run — run without --dry-run to apply)\n');
  else console.log('  Run "node scripts/build.js" to rebuild dist/\n');
}

main().catch(console.error);
