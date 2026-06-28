import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const svgBuf = readFileSync(join(root, "public/icons/icon.svg"));

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(join(root, "public/icons", name));
  console.log(`✓ public/icons/${name} (${size}×${size})`);
}
