import type { EntityType } from "@core/domain/entity/types.js";
import type { LucideIcon } from "lucide-react";
import {
  Activity, AlertTriangle, Award, BookOpen, Box, Clock, FileText, Film,
  GitPullRequest, HelpCircle, KeyRound, MapPin, MessageSquare, RefreshCcw,
  Shield, Skull, StickyNote, User, UserCheck,
} from "lucide-react";
import { entityThemeColor } from "@frontend/shared/theme/themeCssVariables.js";
import type { ThemeEntityType } from "@frontend/account/themeContract.js";

export type EntityVisualShape = "portrait" | "hex-header" | "compact" | "veiled";
export type EntityBorderPattern = "solid" | "dashed" | "double";

export interface EntityVisual {
  labelKey: `domain.entityTypes.${EntityType}`;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  heroStyle: "portrait" | "panorama" | "compact";
  shape: EntityVisualShape;
  borderPattern: EntityBorderPattern;
  privacy?: "private" | "uncertain";
}

function visual(
  type: EntityType,
  icon: LucideIcon,
  tone: ThemeEntityType,
  heroStyle: EntityVisual["heroStyle"] = "compact",
  shape: EntityVisualShape = "compact",
  borderPattern: EntityBorderPattern = "solid",
  privacy?: EntityVisual["privacy"],
): EntityVisual {
  const colors = entityThemeColor(tone);
  return {
    labelKey: `domain.entityTypes.${type}`,
    icon,
    accent: colors.foreground,
    accentSoft: colors.background,
    accentBorder: colors.border,
    heroStyle,
    shape,
    borderPattern,
    privacy,
  };
}

export const ENTITY_VISUALS: Record<EntityType, EntityVisual> = {
  player_character: visual("player_character", User, "player", "portrait", "portrait"),
  npc: visual("npc", UserCheck, "npc", "portrait", "portrait"),
  location: visual("location", MapPin, "location", "panorama", "hex-header"),
  faction: visual("faction", Shield, "faction", "portrait", "portrait"),
  quest: visual("quest", Award, "quest"),
  clue: visual("clue", HelpCircle, "clue"),
  secret: visual("secret", KeyRound, "secret", "compact", "veiled", "double", "private"),
  item: visual("item", Box, "item"),
  creature: visual("creature", Skull, "creature", "portrait", "portrait"),
  encounter: visual("encounter", Activity, "encounter"),
  scene: visual("scene", Film, "scene", "panorama"),
  front: visual("front", AlertTriangle, "front"),
  clock: visual("clock", Clock, "clock"),
  decision: visual("decision", GitPullRequest, "decision"),
  consequence: visual("consequence", RefreshCcw, "consequence"),
  rumor: visual("rumor", MessageSquare, "rumor", "compact", "compact", "dashed", "uncertain"),
  rule_reference: visual("rule_reference", BookOpen, "reference"),
  handout: visual("handout", FileText, "handout"),
  note: visual("note", StickyNote, "note"),
};

const ENTITY_VISUALS_BY_STRING: Record<string, EntityVisual> = ENTITY_VISUALS;

export function getEntityVisual(type: string): EntityVisual {
  return ENTITY_VISUALS_BY_STRING[type] ?? ENTITY_VISUALS.note;
}

export interface RelationVisual {
  semantic: "canon" | "rumor" | "distrust" | "hostility" | "neutral";
  color: string;
  line: "solid" | "dashed" | "double";
  label: string;
}

const RELATION_VISUALS: Record<RelationVisual["semantic"], RelationVisual> = {
  canon: { semantic: "canon", color: "var(--theme-narrative-canon-foreground)", line: "solid", label: "Canon" },
  rumor: { semantic: "rumor", color: "var(--theme-narrative-rumor-foreground)", line: "dashed", label: "Rumor" },
  distrust: { semantic: "distrust", color: "var(--theme-narrative-theory-foreground)", line: "dashed", label: "Desconfianza" },
  hostility: { semantic: "hostility", color: "var(--theme-feedback-danger-foreground)", line: "double", label: "Hostilidad" },
  neutral: { semantic: "neutral", color: "var(--theme-text-subtle)", line: "solid", label: "Relation" },
};

export function getRelationVisual(relationType: string, edgeStyle = ""): RelationVisual {
  const value = `${relationType} ${edgeStyle}`.toLowerCase();
  if (/hostil|hostile|enemy|enem|attack|rival/.test(value)) return RELATION_VISUALS.hostility;
  if (/distrust|desconf|suspect|doubt|theory/.test(value)) return RELATION_VISUALS.distrust;
  if (/rumor|rumour|hearsay/.test(value)) return RELATION_VISUALS.rumor;
  if (/canon|confirm|official|truth|fact/.test(value)) return RELATION_VISUALS.canon;
  return RELATION_VISUALS.neutral;
}

export function getEntityDefaultImage(type: string): string {
  switch (type) {
    case "location":
      return "/assets/entities/default_location.webp";
    case "scene":
      return "/assets/entities/default_scene.webp";
    case "npc":
      return "/assets/entities/default_npc.webp";
    case "player":
      return "/assets/entities/default_player.webp";
    case "player_character":
      return "/assets/entities/default_player_character.webp";
    case "creature":
      return "/assets/entities/default_creature.webp";
    case "quest":
      return "/assets/entities/default_quest.webp";
    case "objective":
      return "/assets/entities/default_objective.webp";
    case "clue":
      return "/assets/entities/default_clue.webp";
    case "rumor":
      return "/assets/entities/default_rumor.webp";
    case "secret":
      return "/assets/entities/default_secret.webp";
    case "consequence":
      return "/assets/entities/default_consequence.webp";
    case "clock":
      return "/assets/entities/default_clock.webp";
    case "fact":
      return "/assets/entities/default_fact.webp";
    case "item":
      return "/assets/entities/default_item.webp";
    default:
      return "/assets/entities/default_other.webp";
  }
}
