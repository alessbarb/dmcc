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

const CHARACTER_TYPES = new Set(["npc", "player_character", "faction"]);
const TENSION_TYPES = new Set(["quest", "front", "consequence", "clock", "secret", "creature", "encounter", "rumor"]);

function asArray<T = any>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (value instanceof Map) return Array.from(value.values()) as T[];
  if (typeof value === "object") return Object.values(value as Record<string, T>);
  return [];
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getActiveEntities(campaignState: any): any[] {
  return asArray(campaignState?.entities).filter((entity: any) => !entity?.archived);
}

export function getActiveRelations(campaignState: any): any[] {
  return asArray(campaignState?.relations).filter((relation: any) => !relation?.archived);
}

export function getActiveSessions(campaignState: any): any[] {
  return asArray(campaignState?.sessions).filter((session: any) => !session?.archived && session?.status !== "cancelled");
}

export function computeStarterProgress(campaignState: any): StarterProgress {
  const campaign = campaignState?.campaign ?? {};
  const entities = getActiveEntities(campaignState);
  const relations = getActiveRelations(campaignState);
  const sessions = getActiveSessions(campaignState);
  const players = asArray(campaignState?.players).filter((player: any) => !player?.archived);

  const hasPremise = Boolean(
    normalizeText(campaign.summary) ||
    normalizeText(campaign.description) ||
    normalizeText(campaign.pitch) ||
    normalizeText(campaign.notes)
  );
  const locationCount = entities.filter((entity: any) => entity.entityType === "location").length;
  const characterCount = entities.filter((entity: any) => CHARACTER_TYPES.has(entity.entityType)).length;
  const tensionCount = entities.filter((entity: any) => TENSION_TYPES.has(entity.entityType)).length;
  const relationCount = relations.length;
  const sessionCount = sessions.length;
  const visibleEntityCount = entities.filter((entity: any) => entity.visibility?.kind && entity.visibility.kind !== "dm_only").length;
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
