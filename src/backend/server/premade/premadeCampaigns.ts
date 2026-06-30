import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export type PremadeVisibility = { kind: "dm_only" } | { kind: "party" } | { kind: "public" } | { kind: string; [key: string]: unknown };

export type PremadeLocale = "en" | "es" | "fr" | "de" | "it" | "pt";

export interface PremadeCampaignTemplateSummary {
  templateId: string;
  version: string;
  title: string;
  subtitle: string;
  description: string;
  locale: string;
  defaultLocale?: string;
  availableLocales?: string[];
  system: "generic_fantasy_d20" | "dnd_srd_5_2_1" | "custom";
  difficulty: "starter" | "medium" | "advanced";
  recommendedFor: string;
  tags: string[];
  pitch?: string;
  learningGoals?: string[];
  includedMaterial?: string[];
  quickStart?: { title: string; steps: string[] };
  highlightEntityIds?: string[];
  featuredFactIds?: string[];
  featuredRelationIds?: string[];
  file?: string;
  templateFile?: string;
  locales?: Record<string, string>;
  stats: {
    entities: number;
    relations: number;
    facts: number;
    preparedSessions: number;
  };
}

export interface PremadeEntity {
  entityId: string;
  entityType:
    | "player_character"
    | "npc"
    | "location"
    | "faction"
    | "quest"
    | "clue"
    | "secret"
    | "item"
    | "creature"
    | "encounter"
    | "scene"
    | "front"
    | "clock"
    | "decision"
    | "consequence"
    | "rumor"
    | "rule_reference"
    | "handout"
    | "note";
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: "low" | "normal" | "high" | "critical";
  visibility?: PremadeVisibility;
  metadata?: Record<string, unknown>;
}

export interface PremadeRelation {
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  description?: string;
  visibility?: PremadeVisibility;
}

export interface PremadeFact {
  factId: string;
  statement: string;
  kind: "canon" | "dm_secret" | "rumor" | "lie" | "player_theory" | "mistake" | "retcon" | "unknown";
  confidence: "unconfirmed" | "suspected" | "likely" | "confirmed" | "false";
  visibility?: PremadeVisibility;
  relatedEntityIds?: string[];
}

export interface PremadeSession {
  sessionId: string;
  title: string;
  scheduledAt?: string;
  prep?: {
    state?: "draft" | "ready";
    summary?: string;
    openingPrompt?: string;
    goals?: string[];
    sceneIds?: string[];
    involvedEntityIds?: string[];
    availableClueIds?: string[];
    secretsAtRiskIds?: string[];
    expectedConsequenceIds?: string[];
    checklist?: Array<{ id: string; label: string; done?: boolean; priority?: "low" | "medium" | "high" }>;
    notes?: string;
  };
}

export interface PremadeCanvas {
  canvasId: string;
  title: string;
  kind: "world" | "session" | "mystery" | "location" | "characters" | "custom";
  description?: string;
  nodes?: Array<{
    id: string;
    kind: "entity" | "note" | "group" | "image" | "fact";
    entityId?: string;
    factId?: string;
    title?: string;
    text?: string;
    color?: "yellow" | "blue" | "green" | "pink" | "purple";
    x: number;
    y: number;
    width?: number;
    height?: number;
    status?: "draft" | "ready" | "revealed" | "resolved";
    visibility?: "dm" | "public";
  }>;
  edges?: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationshipId?: string;
    label?: string;
    status: "draft" | "domain";
    visibility?: "dm" | "public";
    style?: "solid" | "dashed" | "secret" | "weak" | "strong";
  }>;
}

export interface PremadeCampaignTemplate extends Omit<PremadeCampaignTemplateSummary, "file" | "templateFile" | "locales"> {
  schemaVersion?: number;
  summary: string;
  entities: PremadeEntity[];
  relations: PremadeRelation[];
  facts: PremadeFact[];
  sessions: PremadeSession[];
  canvases: PremadeCanvas[];
}

interface PremadeManifestV1 {
  schemaVersion: 1;
  templates: PremadeCampaignTemplateSummary[];
}

interface PremadeManifestEntryV2 {
  templateId: string;
  version?: string;
  defaultLocale?: string;
  availableLocales?: string[];
  templateFile: string;
  locales: Record<string, string>;
}

interface PremadeManifestV2 {
  schemaVersion: 2;
  defaultLocale?: string;
  templates: PremadeManifestEntryV2[];
}

type PremadeManifest = PremadeManifestV1 | PremadeManifestV2;

const moduleDir = dirname(fileURLToPath(import.meta.url));
const SUPPORTED_LOCALES = new Set(["en", "es", "fr", "de", "it", "pt"]);
const DEFAULT_PREMADE_LOCALE: PremadeLocale = "en";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function deepMergeRecords(fallback: unknown, overlay: unknown): Record<string, unknown> {
  const fallbackRecord = isRecord(fallback) ? fallback : {};
  const overlayRecord = isRecord(overlay) ? overlay : {};
  const merged: Record<string, unknown> = { ...fallbackRecord };

  for (const [key, value] of Object.entries(overlayRecord)) {
    if (isRecord(value) && isRecord(merged[key])) {
      merged[key] = deepMergeRecords(merged[key], value);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

function normalizeLocale(locale?: string | null): PremadeLocale {
  const normalized = (locale ?? "").trim().toLowerCase().split(/[._-]/)[0];
  return SUPPORTED_LOCALES.has(normalized) ? normalized as PremadeLocale : DEFAULT_PREMADE_LOCALE;
}

function asStats(value: unknown): PremadeCampaignTemplateSummary["stats"] {
  if (!isRecord(value)) {
    return { entities: 0, relations: 0, facts: 0, preparedSessions: 0 };
  }

  return {
    entities: typeof value.entities === "number" ? value.entities : 0,
    relations: typeof value.relations === "number" ? value.relations : 0,
    facts: typeof value.facts === "number" ? value.facts : 0,
    preparedSessions: typeof value.preparedSessions === "number" ? value.preparedSessions : 0,
  };
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

function readManifest(): PremadeManifest {
  const premadeDir = getPremadeCampaignDirectory();
  if (!premadeDir) {
    return { schemaVersion: 2, defaultLocale: DEFAULT_PREMADE_LOCALE, templates: [] };
  }

  const raw = readJsonFile(join(premadeDir, "manifest.json"));
  if (!isRecord(raw)) {
    return { schemaVersion: 2, defaultLocale: DEFAULT_PREMADE_LOCALE, templates: [] };
  }

  if (raw.schemaVersion === 2) {
    const templates = Array.isArray(raw.templates)
      ? raw.templates.filter((template): template is PremadeManifestEntryV2 => (
        isRecord(template)
        && typeof template.templateId === "string"
        && typeof template.templateFile === "string"
        && isRecord(template.locales)
      ))
      : [];

    return {
      schemaVersion: 2,
      defaultLocale: normalizeLocale(asString(raw.defaultLocale, DEFAULT_PREMADE_LOCALE)),
      templates,
    };
  }

  const templates = Array.isArray(raw.templates)
    ? raw.templates.map(normalizeLegacySummary).filter((template): template is PremadeCampaignTemplateSummary => Boolean(template))
    : [];

  return {
    schemaVersion: 1,
    templates,
  };
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

function readPremadeFile(premadeDir: string, file: string): Record<string, unknown> | null {
  const filePath = resolvePremadeFile(premadeDir, file);
  if (!filePath || !existsSync(filePath)) return null;
  const raw = readJsonFile(filePath);
  return isRecord(raw) ? raw : null;
}

function normalizeLegacySummary(value: unknown): PremadeCampaignTemplateSummary | null {
  if (!isRecord(value)) return null;

  const templateId = asString(value.templateId).trim();
  const file = asString(value.file).trim();
  const title = asString(value.title).trim();

  if (!templateId || !file || !title) {
    return null;
  }

  return {
    templateId,
    version: asString(value.version, "1.0.0"),
    title,
    subtitle: asString(value.subtitle),
    description: asString(value.description),
    locale: asString(value.locale, "es"),
    defaultLocale: asString(value.locale, "es"),
    availableLocales: [asString(value.locale, "es")],
    system: (["generic_fantasy_d20", "dnd_srd_5_2_1", "custom"].includes(asString(value.system))
      ? value.system
      : "custom") as PremadeCampaignTemplateSummary["system"],
    difficulty: (["starter", "medium", "advanced"].includes(asString(value.difficulty))
      ? value.difficulty
      : "medium") as PremadeCampaignTemplateSummary["difficulty"],
    recommendedFor: asString(value.recommendedFor),
    tags: asStringArray(value.tags),
    pitch: asString(value.pitch) || undefined,
    learningGoals: asStringArray(value.learningGoals),
    includedMaterial: asStringArray(value.includedMaterial),
    quickStart: isRecord(value.quickStart) ? {
      title: asString(value.quickStart.title),
      steps: asStringArray(value.quickStart.steps),
    } : undefined,
    highlightEntityIds: asStringArray(value.highlightEntityIds),
    featuredFactIds: asStringArray(value.featuredFactIds),
    featuredRelationIds: asStringArray(value.featuredRelationIds),
    stats: asStats(value.stats),
    file,
  };
}

function normalizeSystem(value: unknown): PremadeCampaignTemplateSummary["system"] {
  return (["generic_fantasy_d20", "dnd_srd_5_2_1", "custom"].includes(asString(value))
    ? value
    : "custom") as PremadeCampaignTemplateSummary["system"];
}

function normalizeDifficulty(value: unknown): PremadeCampaignTemplateSummary["difficulty"] {
  return (["starter", "medium", "advanced"].includes(asString(value))
    ? value
    : "medium") as PremadeCampaignTemplateSummary["difficulty"];
}

function pickLocaleFile(entry: PremadeManifestEntryV2, requestedLocale: string | null | undefined, manifestDefaultLocale: string): { locale: PremadeLocale; file: string } | null {
  const requested = normalizeLocale(requestedLocale);
  const entryDefault = normalizeLocale(entry.defaultLocale ?? manifestDefaultLocale);
  const locales = entry.locales ?? {};

  const candidates = [requested, entryDefault, DEFAULT_PREMADE_LOCALE, ...Object.keys(locales).map(normalizeLocale)];
  for (const locale of candidates) {
    const file = locales[locale];
    if (file) return { locale, file };
  }

  return null;
}

function mergeRecords(base: unknown, overlay: unknown): Record<string, unknown> | undefined {
  const baseRecord = isRecord(base) ? base : {};
  const overlayRecord = isRecord(overlay) ? overlay : {};
  const merged = { ...baseRecord, ...overlayRecord };
  return Object.keys(merged).length ? merged : undefined;
}

function applyText<T extends Record<string, unknown>>(base: T, overlay: unknown, keys: string[]): T {
  if (!isRecord(overlay)) return { ...base };
  const next: Record<string, unknown> = { ...base };
  for (const key of keys) {
    if (overlay[key] !== undefined) next[key] = overlay[key];
  }
  return next as T;
}

function mergeEntities(baseEntities: unknown, localeEntities: unknown): PremadeEntity[] {
  const texts = isRecord(localeEntities) ? localeEntities : {};
  return Array.isArray(baseEntities) ? baseEntities.map((entity) => {
    const base = isRecord(entity) ? entity : {};
    const id = asString(base.entityId);
    const overlay = isRecord(texts[id]) ? texts[id] : {};
    const merged = applyText(base, overlay, ["title", "subtitle", "summary", "content", "status"]);
    const metadata = mergeRecords(base.metadata, overlay.metadata);
    if (metadata) merged.metadata = metadata;
    return merged as unknown as PremadeEntity;
  }) : [];
}

function mergeRelations(baseRelations: unknown, localeRelations: unknown): PremadeRelation[] {
  const texts = isRecord(localeRelations) ? localeRelations : {};
  return Array.isArray(baseRelations) ? baseRelations.map((relation) => {
    const base = isRecord(relation) ? relation : {};
    const id = asString(base.relationId);
    return applyText(base, isRecord(texts[id]) ? texts[id] : {}, ["description"]) as unknown as PremadeRelation;
  }) : [];
}

function mergeFacts(baseFacts: unknown, localeFacts: unknown): PremadeFact[] {
  const texts = isRecord(localeFacts) ? localeFacts : {};
  return Array.isArray(baseFacts) ? baseFacts.map((fact) => {
    const base = isRecord(fact) ? fact : {};
    const id = asString(base.factId);
    return applyText(base, isRecord(texts[id]) ? texts[id] : {}, ["statement"]) as unknown as PremadeFact;
  }) : [];
}

function mergeSessionPrep(basePrep: unknown, localePrep: unknown): Record<string, unknown> | undefined {
  if (!isRecord(basePrep) && !isRecord(localePrep)) return undefined;
  const merged = applyText(isRecord(basePrep) ? basePrep : {}, localePrep, ["summary", "openingPrompt", "goals", "notes"]);

  if (isRecord(localePrep) && isRecord(localePrep.checklist)) {
    const checklistTexts = localePrep.checklist;
    const baseChecklist = Array.isArray(merged.checklist) ? merged.checklist : [];
    merged.checklist = baseChecklist.map((item) => {
      if (!isRecord(item)) return item;
      const id = asString(item.id);
      return applyText(item, isRecord(checklistTexts[id]) ? checklistTexts[id] : {}, ["label"]);
    });
  }

  return merged;
}

function getSessionPrepOverlay(overlay: Record<string, unknown>): Record<string, unknown> | undefined {
  const directPrepKeys = ["summary", "openingPrompt", "goals", "notes", "checklist"];
  const directPrep: Record<string, unknown> = {};

  for (const key of directPrepKeys) {
    if (overlay[key] !== undefined) directPrep[key] = overlay[key];
  }

  if (isRecord(overlay.prep)) {
    return deepMergeRecords(directPrep, overlay.prep);
  }

  return Object.keys(directPrep).length ? directPrep : undefined;
}

function mergeSessions(baseSessions: unknown, localeSessions: unknown): PremadeSession[] {
  const texts = isRecord(localeSessions) ? localeSessions : {};
  return Array.isArray(baseSessions) ? baseSessions.map((session) => {
    const base = isRecord(session) ? session : {};
    const id = asString(base.sessionId);
    const overlay = isRecord(texts[id]) ? texts[id] : {};
    const merged = applyText(base, overlay, ["title"]);
    const prep = mergeSessionPrep(base.prep, getSessionPrepOverlay(overlay));
    if (prep) merged.prep = prep;
    return merged as unknown as PremadeSession;
  }) : [];
}

function mergeCanvases(baseCanvases: unknown, localeCanvases: unknown): PremadeCanvas[] {
  const texts = isRecord(localeCanvases) ? localeCanvases : {};
  return Array.isArray(baseCanvases) ? baseCanvases.map((canvas) => {
    const base = isRecord(canvas) ? canvas : {};
    const id = asString(base.canvasId);
    const overlay = isRecord(texts[id]) ? texts[id] : {};
    const merged = applyText(base, overlay, ["title", "description"]);

    const nodeTexts = isRecord(overlay.nodes) ? overlay.nodes : {};
    if (Array.isArray(base.nodes)) {
      merged.nodes = base.nodes.map((node) => {
        if (!isRecord(node)) return node;
        const nodeId = asString(node.id);
        return applyText(node, isRecord(nodeTexts[nodeId]) ? nodeTexts[nodeId] : {}, ["title", "text"]);
      });
    }

    const edgeTexts = isRecord(overlay.edges) ? overlay.edges : {};
    if (Array.isArray(base.edges)) {
      merged.edges = base.edges.map((edge) => {
        if (!isRecord(edge)) return edge;
        const edgeId = asString(edge.id);
        return applyText(edge, isRecord(edgeTexts[edgeId]) ? edgeTexts[edgeId] : {}, ["label"]);
      });
    }

    return merged as unknown as PremadeCanvas;
  }) : [];
}

function resolveV2Template(entry: PremadeManifestEntryV2, locale: string | null | undefined, premadeDir: string, manifestDefaultLocale: string): PremadeCampaignTemplate | undefined {
  const base = readPremadeFile(premadeDir, entry.templateFile);
  if (!base) return undefined;

  const localeSelection = pickLocaleFile(entry, locale, manifestDefaultLocale);
  if (!localeSelection) return undefined;
  const localeOverlay = readPremadeFile(premadeDir, localeSelection.file) ?? {};
  const defaultSelection = pickLocaleFile(entry, entry.defaultLocale ?? manifestDefaultLocale, manifestDefaultLocale);
  const defaultOverlay = defaultSelection ? readPremadeFile(premadeDir, defaultSelection.file) ?? {} : {};
  const overlay = deepMergeRecords(defaultOverlay, localeOverlay);

  const templateId = asString(base.templateId, entry.templateId);
  if (templateId !== entry.templateId) return undefined;

  const template: PremadeCampaignTemplate = {
    schemaVersion: typeof base.schemaVersion === "number" ? base.schemaVersion : 1,
    templateId,
    version: asString(base.version, entry.version ?? "1.0.0"),
    title: asString(overlay.title, templateId),
    subtitle: asString(overlay.subtitle),
    description: asString(overlay.description),
    summary: asString(overlay.summary, asString(overlay.description)),
    locale: localeSelection.locale,
    defaultLocale: normalizeLocale(entry.defaultLocale ?? manifestDefaultLocale),
    availableLocales: asStringArray(entry.availableLocales).length ? asStringArray(entry.availableLocales) : Object.keys(entry.locales),
    system: normalizeSystem(base.system),
    difficulty: normalizeDifficulty(base.difficulty),
    recommendedFor: asString(overlay.recommendedFor),
    tags: asStringArray(overlay.tags).length ? asStringArray(overlay.tags) : asStringArray(base.tags),
    pitch: asString(overlay.pitch) || undefined,
    learningGoals: asStringArray(overlay.learningGoals),
    includedMaterial: asStringArray(overlay.includedMaterial),
    quickStart: isRecord(overlay.quickStart) ? {
      title: asString(overlay.quickStart.title),
      steps: asStringArray(overlay.quickStart.steps),
    } : undefined,
    highlightEntityIds: asStringArray(base.highlightEntityIds),
    featuredFactIds: asStringArray(base.featuredFactIds),
    featuredRelationIds: asStringArray(base.featuredRelationIds),
    stats: asStats(base.stats),
    entities: mergeEntities(base.entities, overlay.entities),
    relations: mergeRelations(base.relations, overlay.relations),
    facts: mergeFacts(base.facts, overlay.facts),
    sessions: mergeSessions(base.sessions, overlay.sessions),
    canvases: mergeCanvases(base.canvases, overlay.canvases),
  };

  return template;
}

function toSummary(template: PremadeCampaignTemplate, entry?: PremadeManifestEntryV2): PremadeCampaignTemplateSummary {
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

function getLegacyTemplate(summary: PremadeCampaignTemplateSummary, premadeDir: string): PremadeCampaignTemplate | undefined {
  if (!summary.file) return undefined;
  const raw = readPremadeFile(premadeDir, summary.file);
  if (!raw) return undefined;

  const template: PremadeCampaignTemplate = {
    schemaVersion: typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1,
    templateId: asString(raw.templateId, summary.templateId),
    version: asString(raw.templateVersion, asString(raw.version, summary.version)),
    title: asString(raw.title, summary.title),
    subtitle: asString(raw.subtitle, summary.subtitle),
    description: asString(raw.description, summary.description),
    summary: asString(raw.summary, summary.description),
    locale: asString(raw.locale, summary.locale),
    defaultLocale: summary.defaultLocale,
    availableLocales: summary.availableLocales,
    system: summary.system,
    difficulty: summary.difficulty,
    recommendedFor: asString(raw.recommendedFor, summary.recommendedFor),
    tags: asStringArray(raw.tags).length ? asStringArray(raw.tags) : summary.tags,
    pitch: asString(raw.pitch, summary.pitch),
    learningGoals: asStringArray(raw.learningGoals).length ? asStringArray(raw.learningGoals) : (summary.learningGoals ?? []),
    includedMaterial: asStringArray(raw.includedMaterial).length ? asStringArray(raw.includedMaterial) : (summary.includedMaterial ?? []),
    quickStart: isRecord(raw.quickStart) ? {
      title: asString(raw.quickStart.title),
      steps: asStringArray(raw.quickStart.steps),
    } : summary.quickStart,
    highlightEntityIds: asStringArray(raw.highlightEntityIds).length ? asStringArray(raw.highlightEntityIds) : (summary.highlightEntityIds ?? []),
    featuredFactIds: asStringArray(raw.featuredFactIds).length ? asStringArray(raw.featuredFactIds) : (summary.featuredFactIds ?? []),
    featuredRelationIds: asStringArray(raw.featuredRelationIds).length ? asStringArray(raw.featuredRelationIds) : (summary.featuredRelationIds ?? []),
    stats: asStats(raw.stats),
    entities: Array.isArray(raw.entities) ? raw.entities as PremadeEntity[] : [],
    relations: Array.isArray(raw.relations) ? raw.relations as PremadeRelation[] : [],
    facts: Array.isArray(raw.facts) ? raw.facts as PremadeFact[] : [],
    sessions: Array.isArray(raw.sessions) ? raw.sessions as PremadeSession[] : [],
    canvases: Array.isArray(raw.canvases) ? raw.canvases as PremadeCanvas[] : [],
  };

  return template.templateId === summary.templateId ? template : undefined;
}

export function listPremadeCampaignTemplates(locale?: string | null): PremadeCampaignTemplateSummary[] {
  const premadeDir = getPremadeCampaignDirectory();
  if (!premadeDir) return [];

  const manifest = readManifest();
  if (manifest.schemaVersion === 2) {
    return manifest.templates
      .map((entry) => {
        const template = resolveV2Template(entry, locale, premadeDir, manifest.defaultLocale ?? DEFAULT_PREMADE_LOCALE);
        return template ? toSummary(template, entry) : null;
      })
      .filter((template): template is PremadeCampaignTemplateSummary => Boolean(template));
  }

  return manifest.templates;
}

export function getPremadeCampaignTemplate(templateId: string, locale?: string | null): PremadeCampaignTemplate | undefined {
  const premadeDir = getPremadeCampaignDirectory();
  if (!premadeDir) return undefined;

  const manifest = readManifest();
  if (manifest.schemaVersion === 2) {
    const entry = manifest.templates.find((template) => template.templateId === templateId);
    return entry ? resolveV2Template(entry, locale, premadeDir, manifest.defaultLocale ?? DEFAULT_PREMADE_LOCALE) : undefined;
  }

  const summary = manifest.templates.find((template) => template.templateId === templateId);
  return summary ? getLegacyTemplate(summary, premadeDir) : undefined;
}
