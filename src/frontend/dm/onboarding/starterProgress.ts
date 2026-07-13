import type { Campaign, Entity, PlayerProfile, Relation, Session } from "../../shared/stores/campaignStore.js";

export type StarterStepId =
  | "premise"
  | "place"
  | "cast"
  | "tension"
  | "session"
  | "relations"
  | "visibility";

export interface StarterStepProgress {
  id: StarterStepId;
  completed: boolean;
  count?: number;
}

export interface StarterProgress {
  steps: StarterStepProgress[];
  completedCount: number;
  totalCount: number;
  isReadyForFirstSession: boolean;
  recommendedStep: StarterStepProgress | null;
}

export interface StarterProgressCampaignState {
  campaign?: Campaign | null;
  entities?: Entity[];
  relations?: Relation[];
  sessions?: Session[];
  players?: PlayerProfile[];
}

const CHARACTER_TYPES = new Set(["npc", "player_character", "faction"]);
const TENSION_TYPES = new Set(["quest", "front", "consequence", "clock", "secret", "creature", "encounter", "rumor"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asArray<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof Map) return Array.from(value.values());
  // Object.values narrows to unknown[] here; converting to T[] is inherently
  // unsafe since T is caller-chosen and not runtime-checkable, but this
  // mirrors the (also unsafe) Array.isArray/Map branches above and is the
  // established fallback for record-shaped collections keyed by id.
  if (isRecord(value)) return Object.values(value) as T[];
  return [];
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Reads a free-text field from the campaign's metadata bag. `Campaign` itself
 * only has `summary` as a canonical premise field; `description`/`pitch`/`notes`
 * are optional author-supplied metadata keys some premade templates use.
 * (Previously this read `campaign.description`/`.pitch`/`.notes` directly,
 * which are not fields on `Campaign` and were therefore always `undefined` —
 * dead checks. Reading them from `metadata` makes them actually functional.)
 */
function metadataText(metadata: Record<string, unknown> | undefined, key: string): string {
  if (!isRecord(metadata)) return "";
  return normalizeText(metadata[key]);
}

export function getActiveEntities(campaignState: StarterProgressCampaignState | null | undefined): Entity[] {
  return asArray<Entity>(campaignState?.entities).filter((entity) => !entity?.archived);
}

export function getActiveRelations(campaignState: StarterProgressCampaignState | null | undefined): Relation[] {
  return asArray<Relation>(campaignState?.relations).filter((relation) => !relation?.archived);
}

export function getActiveSessions(campaignState: StarterProgressCampaignState | null | undefined): Session[] {
  return asArray<Session>(campaignState?.sessions).filter(
    (session) => !(session as { archived?: boolean })?.archived && session?.status !== "cancelled",
  );
}

export function computeStarterProgress(campaignState: StarterProgressCampaignState | null | undefined): StarterProgress {
  const campaign = campaignState?.campaign ?? undefined;
  const entities = getActiveEntities(campaignState);
  const relations = getActiveRelations(campaignState);
  const sessions = getActiveSessions(campaignState);
  const players = asArray<PlayerProfile>(campaignState?.players).filter((player) => !player?.archived);

  const hasPremise = Boolean(
    normalizeText(campaign?.summary) ||
    metadataText(campaign?.metadata, "description") ||
    metadataText(campaign?.metadata, "pitch") ||
    metadataText(campaign?.metadata, "notes")
  );
  const locationCount = entities.filter((entity) => entity.entityType === "location").length;
  const characterCount = entities.filter((entity) => CHARACTER_TYPES.has(entity.entityType)).length;
  const tensionCount = entities.filter((entity) => TENSION_TYPES.has(entity.entityType)).length;
  const relationCount = relations.length;
  const sessionCount = sessions.length;
  const visibleEntityCount = entities.filter((entity) => entity.visibility?.kind && entity.visibility.kind !== "dm_only").length;
  const hasPlayerVisibility = players.length > 0 || visibleEntityCount > 0;

  const steps: StarterStepProgress[] = [
    { id: "premise", completed: hasPremise },
    { id: "place", completed: locationCount > 0, count: locationCount },
    { id: "cast", completed: characterCount >= 2, count: characterCount },
    { id: "tension", completed: tensionCount > 0, count: tensionCount },
    { id: "session", completed: sessionCount > 0, count: sessionCount },
    { id: "relations", completed: relationCount > 0, count: relationCount },
    { id: "visibility", completed: hasPlayerVisibility, count: players.length + visibleEntityCount },
  ];

  const completedCount = steps.filter((step) => step.completed).length;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    isReadyForFirstSession: hasPremise && locationCount > 0 && characterCount >= 2 && tensionCount > 0 && sessionCount > 0,
    recommendedStep: steps.find((step) => !step.completed) ?? null,
  };
}
