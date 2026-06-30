#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";

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

function resolveTemplateFile(file) {
  if (typeof file !== "string" || file.trim().length === 0) {
    throw new Error("Template file must be a non-empty string");
  }
  if (file !== basename(file)) {
    throw new Error(`Template file must stay inside premades directory: ${file}`);
  }

  const resolvedDir = resolve(premadeDir);
  const resolvedFile = resolve(resolvedDir, file);
  const allowedPrefix = `${resolvedDir}${sep}`;
  if (resolvedFile === resolvedDir || !resolvedFile.startsWith(allowedPrefix)) {
    throw new Error(`Template file resolves outside premades directory: ${file}`);
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
    templates: [],
  };

  for (const summary of manifest.templates) {
    if (!isRecord(summary)) {
      throw new Error("Every manifest template entry must be an object");
    }

    const templatePath = resolveTemplateFile(summary.file);
    const template = await readJson(templatePath);
    if (!isRecord(template)) {
      throw new Error(`Premade template must be an object: ${summary.file}`);
    }

    const stats = computeStats(template);
    const nextTemplate = {
      ...template,
      stats,
    };
    const nextSummary = {
      ...summary,
      version: typeof template.templateVersion === "string" ? template.templateVersion : (typeof template.version === "string" ? template.version : summary.version),
      title: typeof template.title === "string" ? template.title : summary.title,
      subtitle: typeof template.subtitle === "string" ? template.subtitle : summary.subtitle,
      description: typeof template.description === "string" ? template.description : summary.description,
      locale: typeof template.locale === "string" ? template.locale : summary.locale,
      system: typeof template.system === "string" ? template.system : summary.system,
      difficulty: typeof template.difficulty === "string" ? template.difficulty : summary.difficulty,
      recommendedFor: typeof template.recommendedFor === "string" ? template.recommendedFor : summary.recommendedFor,
      tags: Array.isArray(template.tags) ? template.tags.filter((tag) => typeof tag === "string") : summary.tags,
      pitch: typeof template.pitch === "string" ? template.pitch : summary.pitch,
      learningGoals: Array.isArray(template.learningGoals) ? template.learningGoals.filter((item) => typeof item === "string") : summary.learningGoals,
      includedMaterial: Array.isArray(template.includedMaterial) ? template.includedMaterial.filter((item) => typeof item === "string") : summary.includedMaterial,
      quickStart: isRecord(template.quickStart) ? template.quickStart : summary.quickStart,
      highlightEntityIds: Array.isArray(template.highlightEntityIds) ? template.highlightEntityIds.filter((item) => typeof item === "string") : summary.highlightEntityIds,
      featuredFactIds: Array.isArray(template.featuredFactIds) ? template.featuredFactIds.filter((item) => typeof item === "string") : summary.featuredFactIds,
      featuredRelationIds: Array.isArray(template.featuredRelationIds) ? template.featuredRelationIds.filter((item) => typeof item === "string") : summary.featuredRelationIds,
      stats,
    };

    await writeJsonIfChanged(templatePath, nextTemplate, touchedFiles);
    nextManifest.templates.push(nextSummary);
  }

  await writeJsonIfChanged(manifestPath, nextManifest, touchedFiles);

  if (checkOnly && touchedFiles.length > 0) {
    console.error("❌ Premade campaign library is not normalized. Run npm run premade:build.");
    for (const filePath of touchedFiles) {
      console.error(` - ${filePath}`);
    }
    process.exit(1);
  }

  if (touchedFiles.length > 0) {
    console.log(`✓ Updated premade campaign metadata (${touchedFiles.length} files)`);
    for (const filePath of touchedFiles) {
      console.log(`  - ${filePath}`);
    }
  } else {
    console.log(`✓ Premade campaign metadata already up to date — ${premadeDir}`);
  }
}

await main().catch((err) => {
  console.error(`❌ Premade build failed: ${err?.message ?? "unknown error"}`);
  process.exit(1);
});
