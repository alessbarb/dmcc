import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  premadeLocaleSchema,
  premadeTemplateFileSchema,
  premadeLocaleOverlaySchema,
  premadeManifestSchema,
  type PremadeLocale,
  type PremadeManifest,
  type PremadeManifestEntry,
} from "@core/domain/premade/schemas.js";
import {
  resolvePremadeCampaign,
  type ResolvedPremadeCampaign,
  type ResolvedPremadeEntity,
  type ResolvedPremadeRelation,
  type ResolvedPremadeFact,
  type ResolvedPremadeSession,
  type ResolvedPremadeCanvas,
} from "@core/domain/premade/resolvePremadeCampaign.js";

export type PremadeCampaignTemplate = ResolvedPremadeCampaign;
export type PremadeEntity = ResolvedPremadeEntity;
export type PremadeRelation = ResolvedPremadeRelation;
export type PremadeFact = ResolvedPremadeFact;
export type PremadeSession = ResolvedPremadeSession;
export type PremadeCanvas = ResolvedPremadeCanvas;

export interface PremadeCampaignTemplateSummary extends Omit<ResolvedPremadeCampaign, "entities" | "relations" | "facts" | "sessions" | "canvases" | "summary" | "schemaVersion"> {
  templateFile?: string;
  locales?: Record<string, string | undefined>;
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const SUPPORTED_LOCALES: ReadonlySet<string> = new Set(premadeLocaleSchema.options);
const DEFAULT_PREMADE_LOCALE: PremadeLocale = "en";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPremadeLocale(value: string): value is PremadeLocale {
  return SUPPORTED_LOCALES.has(value);
}

function deepMergeRecords(fallback: Record<string, unknown>, overlay: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...fallback };

  for (const [key, value] of Object.entries(overlay)) {
    const existing = merged[key];
    if (isRecord(value) && isRecord(existing)) {
      merged[key] = deepMergeRecords(existing, value);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

function normalizeLocale(locale?: string | null): PremadeLocale {
  const normalized = (locale ?? "").trim().toLowerCase().split(/[._-]/)[0];
  return isPremadeLocale(normalized) ? normalized : DEFAULT_PREMADE_LOCALE;
}

function getPremadeDirectoryCandidates(): string[] {
  const explicitDir = process.env.DMCC_PREMADE_DIR?.trim();

  return [
    explicitDir ? resolve(explicitDir) : null,
    resolve(process.cwd(), "public", "premades"),
    resolve(process.cwd(), "dist", "public", "premades"),
    resolve(moduleDir, "../../../../public/premades"),
  ].filter((candidate): candidate is string => Boolean(candidate));
}

export function getPremadeCampaignDirectory(): string | null {
  return getPremadeDirectoryCandidates().find((candidate) => existsSync(join(candidate, "manifest.json"))) ?? null;
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readManifest(premadeDir: string): PremadeManifest {
  const manifestPath = join(premadeDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${manifestPath}`);
  }

  let raw: unknown;
  try {
    raw = readJsonFile(manifestPath);
  } catch (err) {
    throw new Error(`Failed to parse manifest JSON: ${manifestPath}`, { cause: err });
  }

  const parseResult = premadeManifestSchema.safeParse(raw);
  if (!parseResult.success) {
    throw new Error(`Manifest validation failed: ${manifestPath}`, { cause: parseResult.error });
  }

  return parseResult.data;
}

function resolvePremadeFile(premadeDir: string, file: string): string | null {
  const resolvedDir = resolve(premadeDir);
  const resolvedFile = resolve(resolvedDir, file);
  const allowedPrefix = `${resolvedDir}${sep}`;

  if (resolvedFile !== resolvedDir && resolvedFile.startsWith(allowedPrefix)) {
    return resolvedFile;
  }

  return null;
}

function pickLocaleFile(
  entry: PremadeManifestEntry,
  requestedLocale: string | null | undefined,
  manifestDefaultLocale: PremadeLocale
): { locale: PremadeLocale; file: string } | null {
  const requested = normalizeLocale(requestedLocale);
  const entryDefault = normalizeLocale(entry.defaultLocale ?? manifestDefaultLocale);
  const locales = entry.locales;

  const candidates = [
    requested,
    entryDefault,
    DEFAULT_PREMADE_LOCALE,
    ...Object.keys(locales).filter(isPremadeLocale),
  ];

  for (const locale of candidates) {
    const file = locales[locale];
    if (file) return { locale, file };
  }

  return null;
}

function resolveV2Template(
  entry: PremadeManifestEntry,
  locale: string | null | undefined,
  premadeDir: string,
  manifestDefaultLocale: PremadeLocale
): ResolvedPremadeCampaign | undefined {
  const templatePath = resolvePremadeFile(premadeDir, entry.templateFile);
  if (!templatePath || !existsSync(templatePath)) {
    throw new Error(`Base template file not found: ${entry.templateFile}`);
  }

  let rawTemplate: unknown;
  try {
    rawTemplate = readJsonFile(templatePath);
  } catch (err) {
    throw new Error(`Failed to parse base template JSON: ${templatePath}`, { cause: err });
  }

  const baseTemplateParse = premadeTemplateFileSchema.safeParse(rawTemplate);
  if (!baseTemplateParse.success) {
    throw new Error(`Base template file validation failed: ${templatePath}`, { cause: baseTemplateParse.error });
  }
  const base = baseTemplateParse.data;

  const localeSelection = pickLocaleFile(entry, locale, manifestDefaultLocale);
  if (!localeSelection) {
    throw new Error(`No suitable locale overlay found for template ${entry.templateId} and requested locale ${locale}`);
  }

  const localeOverlayPath = resolvePremadeFile(premadeDir, localeSelection.file);
  if (!localeOverlayPath || !existsSync(localeOverlayPath)) {
    throw new Error(`Locale overlay file not found: ${localeSelection.file}`);
  }

  let rawLocaleOverlay: unknown;
  try {
    rawLocaleOverlay = readJsonFile(localeOverlayPath);
  } catch (err) {
    throw new Error(`Failed to parse locale overlay JSON: ${localeOverlayPath}`, { cause: err });
  }

  const localeOverlayParse = premadeLocaleOverlaySchema.safeParse(rawLocaleOverlay);
  if (!localeOverlayParse.success) {
    throw new Error(`Locale overlay file validation failed: ${localeOverlayPath}`, { cause: localeOverlayParse.error });
  }
  const localeOverlay = localeOverlayParse.data;

  const entryDefaultLocale = entry.defaultLocale ?? manifestDefaultLocale;
  let overlay = localeOverlay;

  if (localeSelection.locale !== entryDefaultLocale) {
    const defaultSelection = pickLocaleFile(entry, entryDefaultLocale, manifestDefaultLocale);
    if (defaultSelection) {
      const defaultOverlayPath = resolvePremadeFile(premadeDir, defaultSelection.file);
      if (defaultOverlayPath && existsSync(defaultOverlayPath)) {
        let rawDefaultOverlay: unknown;
        try {
          rawDefaultOverlay = readJsonFile(defaultOverlayPath);
        } catch (err) {
          throw new Error(`Failed to parse default locale overlay JSON: ${defaultOverlayPath}`, { cause: err });
        }
        const defaultOverlayParse = premadeLocaleOverlaySchema.safeParse(rawDefaultOverlay);
        if (defaultOverlayParse.success) {
          const merged = deepMergeRecords(defaultOverlayParse.data, localeOverlay);
          const mergedParse = premadeLocaleOverlaySchema.safeParse(merged);
          if (!mergedParse.success) {
            throw new Error(`Merged locale overlay validation failed`, { cause: mergedParse.error });
          }
          overlay = mergedParse.data;
        }
      }
    }
  }

  const templateId = base.templateId;
  if (templateId !== entry.templateId) {
    throw new Error(`Template ID mismatch: manifest expects ${entry.templateId}, but base template has ${templateId}`);
  }

  const availableLocales = entry.availableLocales ?? Object.keys(entry.locales).filter(isPremadeLocale);

  return resolvePremadeCampaign(base, overlay, localeSelection.locale, entryDefaultLocale, availableLocales);
}

function toSummary(template: ResolvedPremadeCampaign, entry?: PremadeManifestEntry): PremadeCampaignTemplateSummary {
  return {
    templateId: template.templateId,
    version: template.version,
    title: template.title,
    subtitle: template.subtitle,
    description: template.description,
    locale: template.locale,
    defaultLocale: template.defaultLocale,
    availableLocales: template.availableLocales,
    system: template.system,
    difficulty: template.difficulty,
    recommendedFor: template.recommendedFor,
    tags: template.tags,
    pitch: template.pitch,
    learningGoals: template.learningGoals,
    includedMaterial: template.includedMaterial,
    quickStart: template.quickStart,
    highlightEntityIds: template.highlightEntityIds,
    featuredFactIds: template.featuredFactIds,
    featuredRelationIds: template.featuredRelationIds,
    stats: template.stats,
    templateFile: entry?.templateFile,
    locales: entry?.locales,
  };
}

export function listPremadeCampaignTemplates(locale?: string | null): PremadeCampaignTemplateSummary[] {
  const premadeDir = getPremadeCampaignDirectory();
  if (!premadeDir) return [];

  const manifest = readManifest(premadeDir);
  const manifestDefaultLocale = manifest.defaultLocale ?? DEFAULT_PREMADE_LOCALE;

  return manifest.templates
    .map((entry) => {
      try {
        const template = resolveV2Template(entry, locale, premadeDir, manifestDefaultLocale);
        return template ? toSummary(template, entry) : null;
      } catch (err) {
        console.error(`[Premade] Error resolving template ${entry.templateId}:`, err);
        return null;
      }
    })
    .filter((template): template is PremadeCampaignTemplateSummary => Boolean(template));
}

export function getPremadeCampaignTemplate(templateId: string, locale?: string | null): PremadeCampaignTemplate | undefined {
  const premadeDir = getPremadeCampaignDirectory();
  if (!premadeDir) return undefined;

  const manifest = readManifest(premadeDir);
  const manifestDefaultLocale = manifest.defaultLocale ?? DEFAULT_PREMADE_LOCALE;

  const entry = manifest.templates.find((template) => template.templateId === templateId);
  if (!entry) return undefined;

  return resolveV2Template(entry, locale, premadeDir, manifestDefaultLocale);
}
