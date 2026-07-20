import type { VisibilityRule } from "@core/domain/visibility/visibility.js";

export type TranslateFn = (key: string, vars?: Record<string, string>) => string;

export const ENTITY_TYPE_LABEL_KEYS: Record<string, string> = {
  player_character: "campaignTemplatePreview.entityType.playerCharacter",
  npc: "campaignTemplatePreview.entityType.npc",
  location: "campaignTemplatePreview.entityType.location",
  faction: "campaignTemplatePreview.entityType.faction",
  quest: "campaignTemplatePreview.entityType.quest",
  clue: "campaignTemplatePreview.entityType.clue",
  secret: "campaignTemplatePreview.entityType.secret",
  item: "campaignTemplatePreview.entityType.item",
  creature: "campaignTemplatePreview.entityType.creature",
  encounter: "campaignTemplatePreview.entityType.encounter",
  scene: "campaignTemplatePreview.entityType.scene",
  front: "campaignTemplatePreview.entityType.front",
  clock: "campaignTemplatePreview.entityType.clock",
  decision: "campaignTemplatePreview.entityType.decision",
  consequence: "campaignTemplatePreview.entityType.consequence",
  rumor: "campaignTemplatePreview.entityType.rumor",
  rule_reference: "campaignTemplatePreview.entityType.ruleReference",
  handout: "campaignTemplatePreview.entityType.handout",
  note: "campaignTemplatePreview.entityType.note",
};

export const RELATION_LABEL_KEYS: Record<string, string> = {
  ally_of: "campaignTemplatePreview.relationType.allyOf",
  blocks: "campaignTemplatePreview.relationType.blocks",
  causes: "campaignTemplatePreview.relationType.causes",
  contains: "campaignTemplatePreview.relationType.contains",
  depends_on: "campaignTemplatePreview.relationType.dependsOn",
  enemy_of: "campaignTemplatePreview.relationType.enemyOf",
  hides: "campaignTemplatePreview.relationType.hides",
  knows: "campaignTemplatePreview.relationType.knows",
  leader_of: "campaignTemplatePreview.relationType.leaderOf",
  located_in: "campaignTemplatePreview.relationType.locatedIn",
  points_to: "campaignTemplatePreview.relationType.pointsTo",
  protects: "campaignTemplatePreview.relationType.protects",
  reveals: "campaignTemplatePreview.relationType.reveals",
  threatens: "campaignTemplatePreview.relationType.threatens",
  unlocks: "campaignTemplatePreview.relationType.unlocks",
};

export const FACT_KIND_LABEL_KEYS: Record<string, string> = {
  canon: "campaignTemplatePreview.factKind.canon",
  dm_secret: "campaignTemplatePreview.factKind.dmSecret",
  rumor: "campaignTemplatePreview.factKind.rumor",
  lie: "campaignTemplatePreview.factKind.lie",
  player_theory: "campaignTemplatePreview.factKind.playerTheory",
  mistake: "campaignTemplatePreview.factKind.mistake",
  retcon: "campaignTemplatePreview.factKind.retcon",
  unknown: "campaignTemplatePreview.factKind.unknown",
};

export const CONFIDENCE_LABEL_KEYS: Record<string, string> = {
  unconfirmed: "campaignTemplatePreview.confidence.unconfirmed",
  suspected: "campaignTemplatePreview.confidence.suspected",
  likely: "campaignTemplatePreview.confidence.likely",
  confirmed: "campaignTemplatePreview.confidence.confirmed",
  false: "campaignTemplatePreview.confidence.false",
};

export const SYSTEM_LABEL_KEYS: Record<string, string> = {
  dnd_5e: "campaignTemplatePreview.system.dndSrd521",
  pathfinder_2e: "campaignTemplatePreview.system.custom",
  shadowdark: "campaignTemplatePreview.system.custom",
  custom: "campaignTemplatePreview.system.custom",
};

export const DIFFICULTY_LABEL_KEYS: Record<string, string> = {
  starter: "campaignTemplatePreview.difficulty.starter",
  medium: "campaignTemplatePreview.difficulty.medium",
  advanced: "campaignTemplatePreview.difficulty.advanced",
};

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function tokenFallback(value: string): string {
  return value
    .split(/[_.-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function labelFor(value: string | undefined, labels: Record<string, string>, t: TranslateFn): string {
  if (!value) return "";
  const key = labels[value];
  return key ? t(key) : tokenFallback(value);
}

export function visibilityLabel(visibility: VisibilityRule | undefined, t: TranslateFn): string {
  const kind = visibility?.kind ?? "dm_only";
  switch (kind) {
    case "public":
      return t("campaignTemplatePreview.visibilityPublic");
    case "party":
      return t("campaignTemplatePreview.visibilityParty");
    case "dm_only":
      return t("campaignTemplatePreview.visibilityDmOnly");
    default:
      return tokenFallback(kind);
  }
}

export function isGuideEntity(entity: { entityType: string; metadata?: Record<string, unknown> }): boolean {
  return entity.entityType === "note" || entity.metadata?.previewRole === "guide";
}
