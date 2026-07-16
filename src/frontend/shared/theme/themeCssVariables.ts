import {
  THEME_ENTITY_TYPES,
  type ThemeEntityType,
} from "../../account/themeContract.js";

export const themeCss = {
  text: {
    primary: "var(--theme-text-primary)",
    secondary: "var(--theme-text-secondary)",
    subtle: "var(--theme-text-subtle)",
    onAccent: "var(--theme-text-on-accent)",
    onMedia: "var(--theme-text-on-media)",
    link: "var(--theme-text-link)",
  },
  feedback: {
    danger: {
      foreground: "var(--theme-feedback-danger-foreground)",
      background: "var(--theme-feedback-danger-background)",
      border: "var(--theme-feedback-danger-border)",
    },
  },
} as const;

export const THEME_ACTIVITY_TYPES = [
  "campaign",
  "entity",
  "relation",
  "fact",
  "session",
  "player",
  "attachment",
  "system",
  "visibility",
  "tag",
  "settings",
  "other",
] as const;

export type ThemeActivityType = (typeof THEME_ACTIVITY_TYPES)[number];

const activityTypeSet = new Set<string>(THEME_ACTIVITY_TYPES);
const entityTypeSet = new Set<string>(THEME_ENTITY_TYPES);

export function isThemeActivityType(value: string): value is ThemeActivityType {
  return activityTypeSet.has(value);
}

export function isThemeEntityType(value: string): value is ThemeEntityType {
  return entityTypeSet.has(value);
}

export function activityThemeColor(type: ThemeActivityType) {
  return {
    foreground: `var(--theme-activity-${type}-foreground)`,
    background: `var(--theme-activity-${type}-background)`,
    border: `var(--theme-activity-${type}-border)`,
  } as const;
}

export function entityThemeColor(type: ThemeEntityType) {
  return {
    foreground: `var(--theme-entities-${type}-foreground)`,
    background: `var(--theme-entities-${type}-background)`,
    border: `var(--theme-entities-${type}-border)`,
  } as const;
}

export function identityThemeColor(index: number): string {
  const normalized = ((index % 8) + 8) % 8;
  return `var(--theme-identity-palette-${normalized + 1})`;
}
