import type { ThemePackage, ThemeVariant } from "./themeContract.js";

export type ThemeContrastIssue = {
  path: string;
  ratio: number;
  minimum: number;
};

type Rgb = readonly [number, number, number];

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  if (s === 0) return [l, l, l];

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (offset: number): number => {
    let t = h + offset;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return [channel(1 / 3), channel(0), channel(-1 / 3)];
}

function parseColor(value: string): Rgb | null {
  const hsl = value.match(
    /^hsl\(\s*(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%(?:\s*\/\s*[\d.]+%?)?\s*\)$/i,
  );
  if (hsl) {
    const [, hue, saturation, lightness] = hsl;
    if (hue === undefined || saturation === undefined || lightness === undefined) {
      return null;
    }
    return hslToRgb(Number(hue), Number(saturation), Number(lightness));
  }

  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  const source = hex?.[1];
  if (!source) return null;

  const normalized = source.length === 3
    ? [...source].map((character) => character + character).join("")
    : source;
  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  return [red, green, blue];
}

function linearize(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([red, green, blue]: Rgb): number {
  return (
    0.2126 * linearize(red)
    + 0.7152 * linearize(green)
    + 0.0722 * linearize(blue)
  );
}

export function getContrastRatio(foreground: string, background: string): number | null {
  const foregroundRgb = parseColor(foreground);
  const backgroundRgb = parseColor(background);
  if (!foregroundRgb || !backgroundRgb) return null;

  const foregroundLuminance = relativeLuminance(foregroundRgb);
  const backgroundLuminance = relativeLuminance(backgroundRgb);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

type ContrastPair = {
  path: string;
  foreground: string;
  background: string;
  minimum: number;
};

function criticalPairs(variant: ThemeVariant): ContrastPair[] {
  return [
    { path: "text.primary/surfaces.canvas", foreground: variant.text.primary, background: variant.surfaces.canvas, minimum: 4.5 },
    { path: "text.primary/surfaces.base", foreground: variant.text.primary, background: variant.surfaces.base, minimum: 4.5 },
    { path: "text.primary/surfaces.raised", foreground: variant.text.primary, background: variant.surfaces.raised, minimum: 4.5 },
    { path: "text.secondary/surfaces.base", foreground: variant.text.secondary, background: variant.surfaces.base, minimum: 4.5 },
    { path: "text.link/surfaces.canvas", foreground: variant.text.link, background: variant.surfaces.canvas, minimum: 4.5 },
    { path: "accents.primary.onAccent/backgroundStrong", foreground: variant.accents.primary.onAccent, background: variant.accents.primary.backgroundStrong, minimum: 4.5 },
    { path: "accents.secondary.onAccent/backgroundStrong", foreground: variant.accents.secondary.onAccent, background: variant.accents.secondary.backgroundStrong, minimum: 4.5 },
    { path: "feedback.success.onStrong/strong", foreground: variant.feedback.success.onStrong, background: variant.feedback.success.strong, minimum: 4.5 },
    { path: "feedback.warning.onStrong/strong", foreground: variant.feedback.warning.onStrong, background: variant.feedback.warning.strong, minimum: 4.5 },
    { path: "feedback.danger.onStrong/strong", foreground: variant.feedback.danger.onStrong, background: variant.feedback.danger.strong, minimum: 4.5 },
    { path: "feedback.info.onStrong/strong", foreground: variant.feedback.info.onStrong, background: variant.feedback.info.strong, minimum: 4.5 },
    { path: "graph.edgeLabelText/edgeLabelBackground", foreground: variant.graph.edgeLabelText, background: variant.graph.edgeLabelBackground, minimum: 4.5 },
  ];
}

export function validateThemeContrast(theme: ThemePackage): ThemeContrastIssue[] {
  const issues: ThemeContrastIssue[] = [];

  for (const mode of ["light", "dark"] as const) {
    for (const pair of criticalPairs(theme.variants[mode])) {
      const ratio = getContrastRatio(pair.foreground, pair.background);
      if (ratio !== null && ratio < pair.minimum) {
        issues.push({
          path: `variants.${mode}.${pair.path}`,
          ratio,
          minimum: pair.minimum,
        });
      }
    }
  }

  return issues;
}

export function assertThemeContrast(theme: ThemePackage): void {
  const issues = validateThemeContrast(theme);
  if (issues.length === 0) return;

  const details = issues
    .map((issue) => `${issue.path}: ${issue.ratio.toFixed(2)} < ${issue.minimum.toFixed(1)}`)
    .join("\n");
  throw new Error(`Theme contrast requirements failed:\n${details}`);
}
