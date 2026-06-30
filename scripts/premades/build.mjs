#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const dirArgIndex = args.indexOf("--dir");
const premadeDir = resolve(dirArgIndex >= 0 && args[dirArgIndex + 1] ? args[dirArgIndex + 1] : "public/premades");

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function computeStats(template) {
  return {
    entities: Array.isArray(template.entities) ? template.entities.length : 0,
    relations: Array.isArray(template.relations) ? template.relations.length : 0,
    facts: Array.isArray(template.facts) ? template.facts.length : 0,
    preparedSessions: Array.isArray(template.sessions) ? template.sessions.length : 0,
  };
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function safePremadePath(file, label) {
  if (typeof file !== "string" || file.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }

  const resolvedDir = resolve(premadeDir);
  const resolvedFile = resolve(resolvedDir, file);
  const allowedPrefix = `${resolvedDir}${sep}`;
  if (resolvedFile === resolvedDir || !resolvedFile.startsWith(allowedPrefix)) {
    throw new Error(`${label} resolves outside premades directory: ${file}`);
  }
  return resolvedFile;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJsonIfChanged(filePath, value, touchedFiles) {
  const next = formatJson(value);
  const current = existsSync(filePath) ? await readFile(filePath, "utf8") : "";
  if (current === next) return;

  touchedFiles.push(filePath);
  if (!checkOnly) {
    await writeFile(filePath, next, "utf8");
  }
}

async function main() {
  const manifestPath = resolve(premadeDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Premade manifest not found: ${manifestPath}`);
  }

  const manifest = await readJson(manifestPath);
  if (!isRecord(manifest) || !Array.isArray(manifest.templates)) {
    throw new Error("Premade manifest must contain a templates array");
  }

  const touchedFiles = [];
  const nextManifest = {
    ...manifest,
    schemaVersion: typeof manifest.schemaVersion === "number" ? manifest.schemaVersion : 2,
    defaultLocale: typeof manifest.defaultLocale === "string" ? manifest.defaultLocale : "en",
    templates: [],
  };

  for (const entry of manifest.templates) {
    if (!isRecord(entry)) {
      throw new Error("Every manifest template entry must be an object");
    }

    const templatePath = safePremadePath(entry.templateFile ?? entry.file, `manifest entry ${entry.templateId ?? "?"} templateFile`);
    const template = await readJson(templatePath);
    if (!isRecord(template)) {
      throw new Error(`Premade template must be an object: ${entry.templateFile ?? entry.file}`);
    }

    const stats = computeStats(template);
    const nextTemplate = { ...template, stats };
    const nextEntry = {
      ...entry,
      version: typeof template.version === "string" ? template.version : entry.version,
      defaultLocale: typeof entry.defaultLocale === "string" ? entry.defaultLocale : nextManifest.defaultLocale,
      availableLocales: Array.isArray(entry.availableLocales)
        ? entry.availableLocales.filter((item) => typeof item === "string")
        : (isRecord(entry.locales) ? Object.keys(entry.locales) : [nextManifest.defaultLocale]),
      stats,
    };

    await writeJsonIfChanged(templatePath, nextTemplate, touchedFiles);
    nextManifest.templates.push(nextEntry);
  }

  await writeJsonIfChanged(manifestPath, nextManifest, touchedFiles);

  if (checkOnly && touchedFiles.length > 0) {
    console.error("❌ Premade campaign library is not normalized. Run npm run premade:build.");
    for (const filePath of touchedFiles) console.error(` - ${filePath}`);
    process.exit(1);
  }

  if (touchedFiles.length > 0) {
    console.log(`✓ Updated premade campaign metadata (${touchedFiles.length} files)`);
    for (const filePath of touchedFiles) console.log(`  - ${filePath}`);
  } else {
    console.log(`✓ Premade campaign metadata already up to date — ${premadeDir}`);
  }
}

await main().catch((err) => {
  console.error(`❌ Premade build failed: ${err?.message ?? "unknown error"}`);
  process.exit(1);
});
