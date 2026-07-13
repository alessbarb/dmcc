import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { z } from "zod";
import {
  premadeLocaleSchema,
  premadeManifestSchema,
  premadeTemplateFileSchema,
  premadeLocaleOverlaySchema,
  type PremadeManifest,
  type PremadeTemplateFile,
  type PremadeLocaleOverlay,
} from "../../src/core/domain/premade/schemas.js";
import { validatePremadeReferences } from "../../src/core/domain/premade/validatePremadeReferences.js";

const args = process.argv.slice(2);
const dirArgIndex = args.indexOf("--dir");
const premadeDir = resolve(dirArgIndex >= 0 && args[dirArgIndex + 1] ? args[dirArgIndex + 1] : "public/premades");

function safePremadePath(file: string, label: string, errors: string[]): string | null {
  const resolvedDir = resolve(premadeDir);
  const resolvedFile = resolve(resolvedDir, file);
  const allowedPrefix = `${resolvedDir}${sep}`;
  if (resolvedFile === resolvedDir || !resolvedFile.startsWith(allowedPrefix)) {
    errors.push(`${label} resolves outside premades directory: ${file}`);
    return null;
  }
  return resolvedFile;
}

async function readJson(filePath: string, errors: string[], label: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (err: any) {
    errors.push(`${label} cannot be read as JSON: ${err?.message ?? "unknown error"}`);
    return null;
  }
}

function computeStats(template: PremadeTemplateFile) {
  return {
    entities: template.entities.length,
    relations: template.relations.length,
    facts: template.facts.length,
    preparedSessions: template.sessions.length,
  };
}

function compareStats(
  actual: { entities: number; relations: number; facts: number; preparedSessions: number } | undefined,
  expected: { entities: number; relations: number; facts: number; preparedSessions: number },
  label: string,
  errors: string[]
) {
  if (!actual) {
    errors.push(`${label}.stats is missing`);
    return;
  }
  const keys = ["entities", "relations", "facts", "preparedSessions"] as const;
  for (const key of keys) {
    if (actual[key] !== expected[key]) {
      errors.push(`${label}.stats.${key} is ${actual[key]}, expected ${expected[key]}`);
    }
  }
}

function validateLocaleSessionChecklist(
  overlaySession: any,
  templateChecklistIds: Set<string>,
  label: string,
  errors: string[]
) {
  if (overlaySession.checklist !== undefined) {
    errors.push(`${label}.checklist must be nested under prep.checklist`);
  }

  const overlayPrep = overlaySession.prep;
  if (overlayPrep === undefined) return;

  if (typeof overlayPrep !== "object" || overlayPrep === null || Array.isArray(overlayPrep)) {
    errors.push(`${label}.prep must be an object`);
    return;
  }

  if (templateChecklistIds.size === 0) {
    return;
  }

  const checklist = overlayPrep.checklist;
  if (checklist === undefined) return;

  if (typeof checklist !== "object" || checklist === null || Array.isArray(checklist)) {
    errors.push(`${label}.prep.checklist must be an object keyed by template checklist item id`);
    return;
  }

  for (const checklistId of Object.keys(checklist)) {
    if (!templateChecklistIds.has(checklistId)) {
      errors.push(`${label}.prep.checklist references missing checklist item ${checklistId}`);
      continue;
    }

    const checklistItem = checklist[checklistId];
    if (typeof checklistItem !== "object" || checklistItem === null || Array.isArray(checklistItem)) {
      errors.push(`${label}.prep.checklist.${checklistId} must be an object`);
      continue;
    }
    const labelVal = checklistItem.label;
    if (typeof labelVal !== "string" || labelVal.trim().length === 0) {
      errors.push(`${label}.prep.checklist.${checklistId}.label must be a non-empty string`);
    }
  }

  for (const checklistId of templateChecklistIds) {
    if (!Object.prototype.hasOwnProperty.call(checklist, checklistId)) {
      errors.push(`${label}.prep.checklist is missing template checklist item ${checklistId}`);
    }
  }
}

function validateLocaleOverlay(
  locale: string,
  overlay: PremadeLocaleOverlay,
  template: PremadeTemplateFile,
  templateLabel: string,
  errors: string[]
) {
  const label = `${templateLabel}.locales.${locale}`;
  if (overlay.locale !== locale) {
    errors.push(`${label}.locale must be ${locale}`);
  }

  const entityIds = new Set(template.entities.map((e) => e.entityId));
  const relationIds = new Set(template.relations.map((r) => r.relationId));
  const factIds = new Set(template.facts.map((f) => f.factId));
  const sessionIds = new Set(template.sessions.map((s) => s.sessionId));
  const canvasIds = new Set(template.canvases.map((c) => c.canvasId));

  const sessionChecklistIds = new Map<string, Set<string>>();
  for (const session of template.sessions) {
    const checklist = session.prep?.checklist ?? [];
    sessionChecklistIds.set(session.sessionId, new Set(checklist.map((item) => item.id)));
  }

  if (overlay.entities) {
    for (const id of Object.keys(overlay.entities)) {
      if (!entityIds.has(id)) {
        errors.push(`${label}.entities references missing entity ${id}`);
      }
    }
  }
  if (overlay.relations) {
    for (const id of Object.keys(overlay.relations)) {
      if (!relationIds.has(id)) {
        errors.push(`${label}.relations references missing relation ${id}`);
      }
    }
  }
  if (overlay.facts) {
    for (const id of Object.keys(overlay.facts)) {
      if (!factIds.has(id)) {
        errors.push(`${label}.facts references missing fact ${id}`);
      }
    }
  }
  if (overlay.sessions) {
    for (const [id, session] of Object.entries(overlay.sessions)) {
      if (!sessionIds.has(id)) {
        errors.push(`${label}.sessions references missing session ${id}`);
        continue;
      }
      validateLocaleSessionChecklist(session, sessionChecklistIds.get(id) ?? new Set(), `${label}.sessions[${id}]`, errors);
    }
  }
  if (overlay.canvases) {
    for (const id of Object.keys(overlay.canvases)) {
      if (!canvasIds.has(id)) {
        errors.push(`${label}.canvases references missing canvas ${id}`);
      }
    }
  }

  // Comprobar paridad de locale: cada entidad de la plantilla debe estar traducida
  for (const entityId of entityIds) {
    const entry = overlay.entities?.[entityId];
    if (!entry || typeof entry.title !== "string" || entry.title.trim().length === 0) {
      errors.push(`${label}.entities is missing required title for entity ${entityId}`);
    }
  }

  // Comprobar hechos traducidos
  for (const factId of factIds) {
    const entry = overlay.facts?.[factId];
    if (!entry || typeof entry.statement !== "string" || entry.statement.trim().length === 0) {
      errors.push(`${label}.facts is missing required statement for fact ${factId}`);
    }
  }

  // Comprobar sesiones traducidas
  for (const sessionId of sessionIds) {
    const entry = overlay.sessions?.[sessionId];
    if (!entry || typeof entry.title !== "string" || entry.title.trim().length === 0) {
      errors.push(`${label}.sessions is missing required title for session ${sessionId}`);
    }
    if (!entry?.prep || typeof entry.prep.summary !== "string" || entry.prep.summary.trim().length === 0) {
      errors.push(`${label}.sessions[${sessionId}] is missing required prep.summary`);
    }
  }

  // Comprobar lienzos traducidos
  for (const canvasId of canvasIds) {
    const entry = overlay.canvases?.[canvasId];
    if (!entry || typeof entry.title !== "string" || entry.title.trim().length === 0) {
      errors.push(`${label}.canvases is missing required title for canvas ${canvasId}`);
    }
  }
}

async function main() {
  const errors: string[] = [];
  const manifestPath = resolve(premadeDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    errors.push(`manifest not found: ${manifestPath}`);
  }

  const rawManifest = existsSync(manifestPath) ? await readJson(manifestPath, errors, "manifest") : null;
  if (!rawManifest) {
    console.error("❌ Manifest could not be read");
    process.exit(1);
  }

  const manifestParse = premadeManifestSchema.safeParse(rawManifest);
  if (!manifestParse.success) {
    errors.push(`manifest validation failed: ${manifestParse.error.message}`);
    console.error("❌ Manifest format invalid:");
    console.error(manifestParse.error.issues);
    process.exit(1);
  }

  const manifest = manifestParse.data;
  const manifestDefaultLocale = manifest.defaultLocale ?? "en";
  const seenTemplateIds = new Set<string>();

  for (const entry of manifest.templates) {
    const templateId = entry.templateId;
    if (seenTemplateIds.has(templateId)) {
      errors.push(`manifest contains duplicated templateId ${templateId}`);
    }
    seenTemplateIds.add(templateId);

    const templatePath = safePremadePath(entry.templateFile, `${templateId}.templateFile`, errors);
    if (!templatePath) continue;

    const rawTemplate = await readJson(templatePath, errors, `${templateId}.template`);
    if (!rawTemplate) continue;

    const templateParse = premadeTemplateFileSchema.safeParse(rawTemplate);
    if (!templateParse.success) {
      errors.push(`${templateId}.template validation failed: ${templateParse.error.message}`);
      continue;
    }

    const template = templateParse.data;
    if (template.templateId !== templateId) {
      errors.push(`${templateId}.template.templateId does not match manifest entry`);
    }

    const stats = computeStats(template);
    compareStats(template.stats, stats, `${templateId}.template`, errors);
    compareStats(entry.stats, stats, `${templateId}.manifest`, errors);

    const refErrors = validatePremadeReferences(template, `${templateId}.template`);
    errors.push(...refErrors);

    const entryDefaultLocale = entry.defaultLocale ?? manifestDefaultLocale;
    if (!entry.locales[entryDefaultLocale]) {
      errors.push(`${templateId}.locales is missing default locale ${entryDefaultLocale}`);
    }

    for (const [locale, file] of Object.entries(entry.locales)) {
      if (!file) continue;
      const localePath = safePremadePath(file, `${templateId}.locales.${locale}`, errors);
      if (!localePath) continue;

      const rawOverlay = await readJson(localePath, errors, `${templateId}.locales.${locale}`);
      if (!rawOverlay) continue;

      const overlayParse = premadeLocaleOverlaySchema.safeParse(rawOverlay);
      if (!overlayParse.success) {
        errors.push(`${templateId}.locales.${locale} validation failed: ${overlayParse.error.message}`);
        continue;
      }

      const overlay = overlayParse.data;
      validateLocaleOverlay(locale, overlay, template, templateId, errors);
    }
  }

  if (errors.length > 0) {
    console.error("❌ Premade campaign library invalid:");
    for (const error of errors) {
      console.error(` - ${error}`);
    }
    process.exit(1);
  }

  console.log(`✓ Premade campaign library valid (${manifest.templates.length} templates) — ${premadeDir}`);
}

await main().catch((err) => {
  console.error(`❌ Premade validation failed: ${err?.message ?? "unknown error"}`);
  process.exit(1);
});
