import type { ThemeEntityType } from "../../account/themeContract.js";

export type ThemeCssColor = {
  foreground: string;
  background: string;
  border: string;
};

export type ThemeCssFeedbackColor = ThemeCssColor & {
  strong: string;
  onStrong: string;
};

function feedbackThemeColor(
  type: "success" | "warning" | "danger" | "info",
): ThemeCssFeedbackColor {
  return {
    foreground: `var(--theme-feedback-${type}-foreground)`,
    background: `var(--theme-feedback-${type}-background)`,
    border: `var(--theme-feedback-${type}-border)`,
    strong: `var(--theme-feedback-${type}-strong)`,
    onStrong: `var(--theme-feedback-${type}-on-strong)`,
  };
}

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
    success: feedbackThemeColor("success"),
    warning: feedbackThemeColor("warning"),
    danger: feedbackThemeColor("danger"),
    info: feedbackThemeColor("info"),
  },
} as const;

export function entityThemeColor(type: ThemeEntityType): ThemeCssColor {
  return {
    foreground: `var(--theme-entities-${type}-foreground)`,
    background: `var(--theme-entities-${type}-background)`,
    border: `var(--theme-entities-${type}-border)`,
  };
}
