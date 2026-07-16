import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  campaignTemplateLocaleSchema,
  campaignTemplateTemplateFileSchema,
  campaignTemplateLocaleOverlaySchema,
  campaignTemplateManifestSchema,
  type CampaignTemplateLocale,
  type CampaignTemplateManifest,
  type CampaignTemplateManifestEntry,
} from "@core/domain/campaignTemplate/schemas.js";
import {
  resolveCampaignTemplateCampaign,
  type ResolvedCampaignTemplateCampaign,
  type ResolvedCampaignTemplateEntity,
  type ResolvedCampaignTemplateRelation,
  type ResolvedCampaignTemplateFact,
  type ResolvedCampaignTemplateSession,
  type ResolvedCampaignTemplateCanvas,
} from "@core/domain/campaignTemplate/resolveCampaignTemplate.js";

export type CampaignTemplateResolved = ResolvedCampaignTemplateCampaign;
export type CampaignTemplateEntity = ResolvedCampaignTemplateEntity;
export type CampaignTemplateRelation = ResolvedCampaignTemplateRelation;
export type CampaignTemplateFact = ResolvedCampaignTemplateFact;
export type CampaignTemplateSession = ResolvedCampaignTemplateSession;
export type CampaignTemplateCanvas = ResolvedCampaignTemplateCanvas;

export interface CampaignTemplateResolvedSummary extends Omit<ResolvedCampaignTemplateCampaign, "entities" | "relations" | "facts" | "sessions" | "canvases" | "summary" | "schemaVersion"> {
  templateFile?: string;
  locales?: Record<string, string | undefined>;
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const SUPPORTED_LOCALES: ReadonlySet<string> = new Set(campaignTemplateLocaleSchema.options);
const DEFAULT_CAMPAIGN_TEMPLATE_LOCALE: CampaignTemplateLocale = "en";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isCampaignTemplateLocale(value: string): value is CampaignTemplateLocale {
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

function normalizeLocale(locale?: string | null): CampaignTemplateLocale {
  const normalized = (locale ?? "").trim().toLowerCase().split(/[._-]/)[0];
  return isCampaignTemplateLocale(normalized) ? normalized : DEFAULT_CAMPAIGN_TEMPLATE_LOCALE;
}

function getCampaignTemplateDirectoryCandidates(): string[] {
  const explicitDir = process.env.DMCC_PREMADE_DIR?.trim();

  return [
    explicitDir ? resolve(explicitDir) : null,
    resolve(process.cwd(), "public", "campaign-templates"),
    resolve(process.cwd(), "dist", "public", "campaign-templates"),
    resolve(moduleDir, "../../../../public/campaign-templates"),
  ].filter((candidate): candidate is string => Boolean(candidate));
}

function getCampaignTemplateDirectory(): string | null {
  return getCampaignTemplateDirectoryCandidates().find((candidate) => existsSync(join(candidate, "manifest.json"))) ?? null;
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readManifest(campaignTemplateDir: string): CampaignTemplateManifest {
  const manifestPath = join(campaignTemplateDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${manifestPath}`);
  }

  let raw: unknown;
  try {
    raw = readJsonFile(manifestPath);
  } catch (err) {
    throw new Error(`Failed to parse manifest JSON: ${manifestPath}`, { cause: err });
  }

  const parseResult = campaignTemplateManifestSchema.safeParse(raw);
  if (!parseResult.success) {
    throw new Error(`Manifest validation failed: ${manifestPath}`, { cause: parseResult.error });
  }

  return parseResult.data;
}

function resolveCampaignTemplateFile(campaignTemplateDir: string, file: string): string | null {
  const resolvedDir = resolve(campaignTemplateDir);
  const resolvedFile = resolve(resolvedDir, file);
  const allowedPrefix = `${resolvedDir}${sep}`;

  if (resolvedFile !== resolvedDir && resolvedFile.startsWith(allowedPrefix)) {
    return resolvedFile;
  }

  return null;
}

function pickLocaleFile(
  entry: CampaignTemplateManifestEntry,
  requestedLocale: string | null | undefined,
  manifestDefaultLocale: CampaignTemplateLocale
): { locale: CampaignTemplateLocale; file: string } | null {
  const requested = normalizeLocale(requestedLocale);
  const entryDefault = normalizeLocale(entry.defaultLocale ?? manifestDefaultLocale);
  const locales = entry.locales;

  const candidates = [
    requested,
    entryDefault,
    DEFAULT_CAMPAIGN_TEMPLATE_LOCALE,
    ...Object.keys(locales).filter(isCampaignTemplateLocale),
  ];

  for (const locale of candidates) {
    const file = locales[locale];
    if (file) return { locale, file };
  }

  return null;
}

function resolveV2Template(
  entry: CampaignTemplateManifestEntry,
  locale: string | null | undefined,
  campaignTemplateDir: string,
  manifestDefaultLocale: CampaignTemplateLocale
): ResolvedCampaignTemplateCampaign | undefined {
  const templatePath = resolveCampaignTemplateFile(campaignTemplateDir, entry.templateFile);
  if (!templatePath || !existsSync(templatePath)) {
    throw new Error(`Base template file not found: ${entry.templateFile}`);
  }

  let rawTemplate: unknown;
  try {
    rawTemplate = readJsonFile(templatePath);
  } catch (err) {
    throw new Error(`Failed to parse base template JSON: ${templatePath}`, { cause: err });
  }

  const baseTemplateParse = campaignTemplateTemplateFileSchema.safeParse(rawTemplate);
  if (!baseTemplateParse.success) {
    throw new Error(`Base template file validation failed: ${templatePath}`, { cause: baseTemplateParse.error });
  }
  const base = baseTemplateParse.data;

  const localeSelection = pickLocaleFile(entry, locale, manifestDefaultLocale);
  if (!localeSelection) {
    throw new Error(`No suitable locale overlay found for template ${entry.templateId} and requested locale ${locale}`);
  }

  const localeOverlayPath = resolveCampaignTemplateFile(campaignTemplateDir, localeSelection.file);
  if (!localeOverlayPath || !existsSync(localeOverlayPath)) {
    throw new Error(`Locale overlay file not found: ${localeSelection.file}`);
  }

  let rawLocaleOverlay: unknown;
  try {
    rawLocaleOverlay = readJsonFile(localeOverlayPath);
  } catch (err) {
    throw new Error(`Failed to parse locale overlay JSON: ${localeOverlayPath}`, { cause: err });
  }

  const localeOverlayParse = campaignTemplateLocaleOverlaySchema.safeParse(rawLocaleOverlay);
  if (!localeOverlayParse.success) {
    throw new Error(`Locale overlay file validation failed: ${localeOverlayPath}`, { cause: localeOverlayParse.error });
  }
  const localeOverlay = localeOverlayParse.data;

  const entryDefaultLocale = entry.defaultLocale ?? manifestDefaultLocale;
  let overlay = localeOverlay;

  if (localeSelection.locale !== entryDefaultLocale) {
    const defaultSelection = pickLocaleFile(entry, entryDefaultLocale, manifestDefaultLocale);
    if (defaultSelection) {
      const defaultOverlayPath = resolveCampaignTemplateFile(campaignTemplateDir, defaultSelection.file);
      if (defaultOverlayPath && existsSync(defaultOverlayPath)) {
        let rawDefaultOverlay: unknown;
        try {
          rawDefaultOverlay = readJsonFile(defaultOverlayPath);
        } catch (err) {
          throw new Error(`Failed to parse default locale overlay JSON: ${defaultOverlayPath}`, { cause: err });
        }
        const defaultOverlayParse = campaignTemplateLocaleOverlaySchema.safeParse(rawDefaultOverlay);
        if (defaultOverlayParse.success) {
          const merged = deepMergeRecords(defaultOverlayParse.data, localeOverlay);
          const mergedParse = campaignTemplateLocaleOverlaySchema.safeParse(merged);
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

  const availableLocales = entry.availableLocales ?? Object.keys(entry.locales).filter(isCampaignTemplateLocale);

  return resolveCampaignTemplateCampaign(base, overlay, localeSelection.locale, entryDefaultLocale, availableLocales);
}

function toSummary(template: ResolvedCampaignTemplateCampaign, entry?: CampaignTemplateManifestEntry): CampaignTemplateResolvedSummary {
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

export function listCampaignTemplates(locale?: string | null): CampaignTemplateResolvedSummary[] {
  const campaignTemplateDir = getCampaignTemplateDirectory();
  if (!campaignTemplateDir) return [];

  const manifest = readManifest(campaignTemplateDir);
  const manifestDefaultLocale = manifest.defaultLocale ?? DEFAULT_CAMPAIGN_TEMPLATE_LOCALE;

  return manifest.templates
    .map((entry) => {
      try {
        const template = resolveV2Template(entry, locale, campaignTemplateDir, manifestDefaultLocale);
        return template ? toSummary(template, entry) : null;
      } catch (err) {
        console.error(`[CampaignTemplate] Error resolving template ${entry.templateId}:`, err);
        return null;
      }
    })
    .filter((template): template is CampaignTemplateResolvedSummary => Boolean(template));
}

export function getCampaignTemplateById(templateId: string, locale?: string | null): CampaignTemplateResolved | undefined {
  const campaignTemplateDir = getCampaignTemplateDirectory();
  if (!campaignTemplateDir) return undefined;

  const manifest = readManifest(campaignTemplateDir);
  const manifestDefaultLocale = manifest.defaultLocale ?? DEFAULT_CAMPAIGN_TEMPLATE_LOCALE;

  const entry = manifest.templates.find((template) => template.templateId === templateId);
  if (!entry) return undefined;

  return resolveV2Template(entry, locale, campaignTemplateDir, manifestDefaultLocale);
}
