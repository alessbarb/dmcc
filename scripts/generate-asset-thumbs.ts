import { mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, parse, relative } from "node:path";
import sharp from "sharp";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const THUMB_DIR = ".thumbs";
const ASSETS_ROOT = process.env.DMCC_ASSETS_ROOT
  ? join(process.cwd(), process.env.DMCC_ASSETS_ROOT)
  : join(process.cwd(), "public", "assets");
const THUMBS_ROOT = join(ASSETS_ROOT, THUMB_DIR);

interface ThumbPreset {
  width: number;
  height: number;
  quality: number;
}

function isImageFile(fileName: string): boolean {
  return IMAGE_EXTS.has(extname(fileName).toLowerCase());
}

function getPreset(relativeSourcePath: string): ThumbPreset {
  const [catalogName] = relativeSourcePath.split(/[\\/]/);

  if (catalogName === "campaigns") {
    return { width: 480, height: 270, quality: 78 };
  }

  return { width: 360, height: 360, quality: 78 };
}

function getThumbPath(sourcePath: string): string {
  const relativeSourcePath = relative(ASSETS_ROOT, sourcePath);
  const parsed = parse(relativeSourcePath);
  return join(THUMBS_ROOT, parsed.dir, `${parsed.name}.webp`);
}

async function shouldGenerate(sourcePath: string, thumbPath: string): Promise<boolean> {
  if (!existsSync(thumbPath)) return true;

  const [sourceStat, thumbStat] = await Promise.all([stat(sourcePath), stat(thumbPath)]);
  return sourceStat.mtimeMs > thumbStat.mtimeMs;
}

async function collectImages(dir: string): Promise<string[]> {
  let entries: string[];

  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const images: string[] = [];

  for (const entry of entries) {
    if (entry === THUMB_DIR || entry.startsWith(".")) continue;

    const fullPath = join(dir, entry);
    const entryStat = await stat(fullPath);

    if (entryStat.isDirectory()) {
      images.push(...await collectImages(fullPath));
      continue;
    }

    if (entryStat.isFile() && isImageFile(entry)) {
      images.push(fullPath);
    }
  }

  return images;
}

async function generateThumb(sourcePath: string): Promise<boolean> {
  const thumbPath = getThumbPath(sourcePath);
  if (!await shouldGenerate(sourcePath, thumbPath)) return false;

  const relativeSourcePath = relative(ASSETS_ROOT, sourcePath);
  const preset = getPreset(relativeSourcePath);

  await mkdir(dirname(thumbPath), { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize({ width: preset.width, height: preset.height, fit: "cover", position: "attention" })
    .webp({ quality: preset.quality })
    .toFile(thumbPath);

  return true;
}

function isUnsupportedImageError(error: unknown): boolean {
  return error instanceof Error && /unsupported image format/i.test(error.message);
}

async function main() {
  if (!existsSync(ASSETS_ROOT)) {
    console.log(`No assets directory found at ${ASSETS_ROOT}. Skipping thumbnail generation.`);
    return;
  }

  const images = await collectImages(ASSETS_ROOT);
  let generated = 0;
  let skipped = 0;

  for (const image of images) {
    try {
      if (await generateThumb(image)) {
        generated += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      if (isUnsupportedImageError(error)) {
        skipped += 1;
        continue;
      }
      const relativePath = relative(ASSETS_ROOT, image);
      console.warn(`Failed to generate thumbnail for ${relativePath}:`, error);
    }
  }

  console.log(`Asset thumbnails ready in ${ASSETS_ROOT}. generated=${generated} skipped=${skipped} total=${images.length}`);
}

await main();
