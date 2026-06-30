import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const sourceIcon = join(root, "public/icons/icon.svg");
const svgBuf = readFileSync(sourceIcon);

const publicIconsDir = join(root, "public/icons");
const desktopIconsDir = join(root, "build/icons");

mkdirSync(publicIconsDir, { recursive: true });
mkdirSync(desktopIconsDir, { recursive: true });

const publicIcons = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 }
];

const linuxDesktopIcons = [
  { name: "16x16.png", size: 16 },
  { name: "24x24.png", size: 24 },
  { name: "32x32.png", size: 32 },
  { name: "48x48.png", size: 48 },
  { name: "64x64.png", size: 64 },
  { name: "96x96.png", size: 96 },
  { name: "128x128.png", size: 128 },
  { name: "256x256.png", size: 256 },
  { name: "512x512.png", size: 512 }
];

for (const { name, size } of publicIcons) {
  await sharp(svgBuf)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(join(publicIconsDir, name));

  console.log(`✓ public/icons/${name} (${size}×${size})`);
}

for (const { name, size } of linuxDesktopIcons) {
  await sharp(svgBuf)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(join(desktopIconsDir, name));

  console.log(`✓ build/icons/${name} (${size}×${size})`);
}