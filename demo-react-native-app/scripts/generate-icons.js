/**
 * Icon Generation Script for SaborSpin
 *
 * Usage: node scripts/generate-icons.js
 *
 * Takes the source icon and generates all required sizes for iOS, Android, and Web.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration
const SOURCE_ICON = path.join(
  __dirname,
  '..',
  '..',
  'product_info',
  'icon',
  'Gemini_Generated_Image_el2wq5el2wq5el2w.png'
);
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images');

// Icon sizes to generate
const ICONS = [
  { name: 'icon.png', size: 1024 }, // iOS app icon
  { name: 'adaptive-icon.png', size: 1024 }, // Android adaptive icon foreground
  { name: 'favicon.png', size: 48 }, // Web favicon
  { name: 'splash-icon.png', size: 512 }, // Splash screen icon
];

async function generateIcons() {
  console.log('🎨 SaborSpin Icon Generator\n');

  // Check source exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }

  console.log(`📷 Source: ${SOURCE_ICON}`);
  console.log(`📂 Output: ${OUTPUT_DIR}\n`);

  // Generate each icon size
  for (const icon of ICONS) {
    const outputPath = path.join(OUTPUT_DIR, icon.name);

    try {
      await sharp(SOURCE_ICON)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 26, g: 26, b: 46, alpha: 1 }, // #1A1A2E
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}: ${error.message}`);
    }
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('\nNext steps:');
  console.log('1. Check the generated icons in assets/images/');
  console.log('2. Update app.json with the new icon paths');
}

generateIcons();
