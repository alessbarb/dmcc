import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export type PremadeVisibility = { kind: "dm_only" } | { kind: "party" } | { kind: "public" } | { kind: string; [key: string]: unknown };

export interface PremadeCampaignTemplateSummary {
  templateId: string;
  version: string;
  title: string;
  subtitle: string;
  description: string;
  locale: string;
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
  file: string;
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

export interface PremadeCampaignTemplate extends Omit<PremadeCampaignTemplateSummary, "file"> {
  schemaVersion?: number;
  summary: string;
  entities: PremadeEntity[];
  relations: PremadeRelation[];
  facts: PremadeFact[];
  sessions: PremadeSession[];
  canvases: PremadeCanvas[];
}

interface PremadeManifest {
  schemaVersion: number;
  templates: PremadeCampaignTemplateSummary[];
}

const moduleDir = dirname(fileURLToPath(import.meta.url));

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
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

function normalizeSummary(value: unknown): PremadeCampaignTemplateSummary | null {
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
    return { schemaVersion: 1, templates: [] };
  }

  const raw = readJsonFile(join(premadeDir, "manifest.json"));
  if (!isRecord(raw)) {
    return { schemaVersion: 1, templates: [] };
  }

  const templates = Array.isArray(raw.templates)
    ? raw.templates.map(normalizeSummary).filter((template): template is PremadeCampaignTemplateSummary => Boolean(template))
    : [];

  return {
    schemaVersion: typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1,
    templates,
  };
}

function resolveTemplateFile(premadeDir: string, file: string): string | null {
  const resolvedDir = resolve(premadeDir);
  const resolvedFile = resolve(resolvedDir, file);
  const allowedPrefix = `${resolvedDir}${sep}`;

  if (resolvedFile !== resolvedDir && resolvedFile.startsWith(allowedPrefix)) {
    return resolvedFile;
  }

  return null;
}

export function listPremadeCampaignTemplates(): PremadeCampaignTemplateSummary[] {
  return readManifest().templates;
}

export function getPremadeCampaignTemplate(templateId: string): PremadeCampaignTemplate | undefined {
  const premadeDir = getPremadeCampaignDirectory();
  if (!premadeDir) return undefined;

  const summary = readManifest().templates.find((template) => template.templateId === templateId);
  if (!summary) return undefined;

  const filePath = resolveTemplateFile(premadeDir, summary.file);
  if (!filePath || !existsSync(filePath)) return undefined;

  const raw = readJsonFile(filePath);
  if (!isRecord(raw)) return undefined;

  const template: PremadeCampaignTemplate = {
    schemaVersion: typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1,
    templateId: asString(raw.templateId, summary.templateId),
    version: asString(raw.templateVersion, asString(raw.version, summary.version)),
    title: asString(raw.title, summary.title),
    subtitle: asString(raw.subtitle, summary.subtitle),
    description: asString(raw.description, summary.description),
    summary: asString(raw.summary, summary.description),
    locale: asString(raw.locale, summary.locale),
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

  if (template.templateId !== summary.templateId) {
    return undefined;
  }

  return template;
}
