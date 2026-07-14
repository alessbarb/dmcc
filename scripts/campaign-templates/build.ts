import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import {
  campaignTemplateManifestSchema,
  campaignTemplateTemplateFileSchema,
  campaignTemplateLocaleSchema,
  type CampaignTemplateTemplateFile,
  type CampaignTemplateManifestEntry,
} from "../../src/core/domain/campaignTemplate/schemas.js";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const dirArgIndex = args.indexOf("--dir");
const campaignTemplateDir = resolve(dirArgIndex >= 0 && args[dirArgIndex + 1] ? args[dirArgIndex + 1] : "public/campaign-templates");

function computeStats(template: CampaignTemplateTemplateFile) {
  return {
    entities: template.entities.length,
    relations: template.relations.length,
    facts: template.facts.length,
    preparedSessions: template.sessions.length,
  };
}

function formatJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function safeCampaignTemplatePath(file: string, label: string) {
  const resolvedDir = resolve(campaignTemplateDir);
  const resolvedFile = resolve(resolvedDir, file);
  const allowedPrefix = `${resolvedDir}${sep}`;
  if (resolvedFile === resolvedDir || !resolvedFile.startsWith(allowedPrefix)) {
    throw new Error(`${label} resolves outside campaign templates directory: ${file}`);
  }
  return resolvedFile;
}

async function readJson(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJsonIfChanged(filePath: string, value: unknown, touchedFiles: string[]) {
  const next = formatJson(value);
  const current = existsSync(filePath) ? await readFile(filePath, "utf8") : "";
  if (current === next) return;

  touchedFiles.push(filePath);
  if (!checkOnly) {
    await writeFile(filePath, next, "utf8");
  }
}

async function main() {
  const manifestPath = resolve(campaignTemplateDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Campaign template manifest not found: ${manifestPath}`);
  }

  const rawManifest = await readJson(manifestPath);
  const manifestParse = campaignTemplateManifestSchema.safeParse(rawManifest);
  if (!manifestParse.success) {
    throw new Error(`Campaign template manifest validation failed: ${manifestParse.error.message}`);
  }

  const manifest = manifestParse.data;
  const touchedFiles: string[] = [];
  const nextManifest = {
    ...manifest,
    schemaVersion: 2 as const,
    defaultLocale: manifest.defaultLocale ?? "en",
    templates: [] as CampaignTemplateManifestEntry[],
  };

  for (const entry of manifest.templates) {
    const templatePath = safeCampaignTemplatePath(entry.templateFile, `manifest entry ${entry.templateId} templateFile`);
    const rawTemplate = await readJson(templatePath);
    const templateParse = campaignTemplateTemplateFileSchema.safeParse(rawTemplate);
    if (!templateParse.success) {
      throw new Error(`Campaign template validation failed for ${entry.templateFile}: ${templateParse.error.message}`);
    }

    const template = templateParse.data;
    const stats = computeStats(template);
    const nextTemplate = { ...template, stats };

    const nextEntry: CampaignTemplateManifestEntry = {
      ...entry,
      version: template.version ?? entry.version,
      defaultLocale: entry.defaultLocale ?? nextManifest.defaultLocale,
      availableLocales: entry.availableLocales
        ? entry.availableLocales
        : campaignTemplateLocaleSchema.array().parse(Object.keys(entry.locales)),
      stats,
    };

    await writeJsonIfChanged(templatePath, nextTemplate, touchedFiles);
    nextManifest.templates.push(nextEntry);
  }

  await writeJsonIfChanged(manifestPath, nextManifest, touchedFiles);

  if (checkOnly && touchedFiles.length > 0) {
    console.error("❌ Campaign template library is not normalized. Run npm run templates:build.");
    for (const filePath of touchedFiles) {
      console.error(` - ${filePath}`);
    }
    process.exit(1);
  }

  if (touchedFiles.length > 0) {
    console.log(`✓ Updated campaign template metadata (${touchedFiles.length} files)`);
    for (const filePath of touchedFiles) {
      console.log(`  - ${filePath}`);
    }
  } else {
    console.log(`✓ Campaign template metadata already up to date — ${campaignTemplateDir}`);
  }
}

await main().catch((err) => {
  console.error(`❌ Campaign template build failed: ${err?.message ?? "unknown error"}`);
  process.exit(1);
});
