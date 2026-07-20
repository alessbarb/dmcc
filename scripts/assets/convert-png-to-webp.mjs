import { mkdir, readdir, stat } from "node:fs/promises";
import { dirname, extname } from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = "public/assets";
const OVERWRITE = process.argv.includes("--overwrite");
const DELETE_ORIGINALS = process.argv.includes("--delete-originals");

async function collectPngFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    if (entry.startsWith(".")) {
      continue;
    }

    const path = `${directory}/${entry}`;
    const info = await stat(path);

    if (info.isDirectory()) {
      files.push(...await collectPngFiles(path));
      continue;
    }

    if (info.isFile() && extname(entry).toLowerCase() === ".webp") {
      files.push(path);
    }
  }

  return files;
}

async function convertFile(sourcePath) {
  const targetPath = sourcePath.replace(/\.webp$/i, ".webp");

  await mkdir(dirname(targetPath), { recursive: true });

  try {
    await stat(targetPath);

    if (!OVERWRITE) {
      console.log(`SKIP   ${targetPath}`);
      return { converted: false, sourcePath, targetPath };
    }
  } catch {
    // El destino todavía no existe.
  }

  const metadata = await sharp(sourcePath).metadata();

  /*
   * Para ilustraciones grandes usamos WebP con pérdida.
   * Para imágenes pequeñas o con paleta/transparencia delicada,
   * usamos WebP sin pérdida.
   */
  const useLossless =
    (metadata.width ?? 0) <= 512 &&
    (metadata.height ?? 0) <= 512;

  const image = sharp(sourcePath)
    .rotate();

  if (useLossless) {
    await image
      .webp({
        lossless: true,
        effort: 6,
      })
      .toFile(targetPath);
  } else {
    await image
      .webp({
        quality: 82,
        alphaQuality: 90,
        smartSubsample: true,
        effort: 6,
      })
      .toFile(targetPath);
  }

  console.log(`OK     ${sourcePath} -> ${targetPath}`);

  if (DELETE_ORIGINALS) {
    const { rm } = await import("node:fs/promises");
    await rm(sourcePath);
    console.log(`DELETE ${sourcePath}`);
  }

  return { converted: true, sourcePath, targetPath };
}

async function main() {
  const files = await collectPngFiles(ROOT);

  console.log(`Encontrados ${files.length} PNG en ${ROOT}.`);

  let converted = 0;
  let skipped = 0;

  /*
   * Procesamiento secuencial para no disparar el uso de memoria con cientos
   * de ilustraciones grandes.
   */
  for (const file of files) {
    const result = await convertFile(file);

    if (result.converted) {
      converted += 1;
    } else {
      skipped += 1;
    }
  }

  console.log("");
  console.log(`Convertidos: ${converted}`);
  console.log(`Omitidos:    ${skipped}`);
  console.log(`Originales eliminados: ${DELETE_ORIGINALS ? "sí" : "no"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
