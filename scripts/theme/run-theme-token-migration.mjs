import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const sourceRoot = join(root, "src/frontend");
const allowedExtensions = new Set([".css", ".ts", ".tsx"]);
const skippedThemeSources = new Set([
  "src/frontend/account/defaultTheme.ts",
  "src/frontend/account/fantasyTheme.ts",
  "src/frontend/account/sciFiTheme.ts",
  "src/frontend/account/themeContract.ts",
  "src/frontend/account/themeContrast.ts",
  "src/frontend/account/themeRegistry.ts",
  "src/frontend/account/themeRuntime.ts",
  "src/frontend/account/themeValidation.ts",
]);

const replacements = {
  "--semantic-consequence-soft": "--theme-narrative-consequence-background",
  "--semantic-consequence": "--theme-narrative-consequence-foreground",
  "--semantic-secret-soft": "--theme-narrative-secret-background",
  "--semantic-rumor-soft": "--theme-narrative-rumor-background",
  "--semantic-canon-soft": "--theme-narrative-canon-background",
  "--semantic-theory-soft": "--theme-narrative-theory-background",
  "--semantic-success-soft": "--theme-feedback-success-background",
  "--semantic-warning-soft": "--theme-feedback-warning-background",
  "--semantic-danger-soft": "--theme-feedback-danger-background",
  "--semantic-info-soft": "--theme-feedback-info-background",
  "--semantic-secret": "--theme-narrative-secret-foreground",
  "--semantic-rumor": "--theme-narrative-rumor-foreground",
  "--semantic-canon": "--theme-narrative-canon-foreground",
  "--semantic-theory": "--theme-narrative-theory-foreground",
  "--semantic-success": "--theme-feedback-success-foreground",
  "--semantic-warning": "--theme-feedback-warning-foreground",
  "--semantic-danger": "--theme-feedback-danger-foreground",
  "--semantic-info": "--theme-feedback-info-foreground",
  "--accent-amethyst-soft": "--theme-accents-secondary-background",
  "--accent-amethyst": "--theme-accents-secondary-foreground",
  "--accent-fire-hover": "--theme-accents-primary-hover",
  "--accent-fire-soft": "--theme-accents-primary-background",
  "--accent-fire": "--theme-accents-primary-foreground",
  "--surface-raised": "--theme-surfaces-raised",
  "--surface-hover": "--theme-surfaces-interactive-hover",
  "--surface-glass": "--theme-surfaces-overlay",
  "--text-secondary": "--theme-text-secondary",
  "--text-primary": "--theme-text-primary",
  "--text-subtle": "--theme-text-subtle",
  "--text-inverse": "--theme-text-inverse",
  "--bg-card-hover": "--theme-surfaces-interactive-hover",
  "--bg-abyss": "--theme-surfaces-canvas",
  "--bg-mist": "--theme-surfaces-base",
  "--bg-tomb": "--theme-surfaces-interactive",
  "--bg-main": "--theme-surfaces-canvas",
  "--bg-card": "--theme-surfaces-base",
  "--bg-input": "--theme-surfaces-interactive",
  "--border-hover": "--theme-borders-interactive-hover",
  "--border-color": "--theme-borders-default",
  "--primary-hover": "--theme-accents-primary-hover",
  "--primary-light": "--theme-accents-primary-background",
  "--secondary-hover": "--theme-accents-secondary-hover",
  "--primary": "--theme-accents-primary-foreground",
  "--secondary": "--theme-accents-secondary-foreground",
  "--text-main": "--theme-text-primary",
  "--text-muted": "--theme-text-secondary",
  "--color-critical-bg": "--theme-feedback-danger-background",
  "--color-critical": "--theme-feedback-danger-foreground",
  "--color-warning-bg": "--theme-feedback-warning-background",
  "--color-warning": "--theme-feedback-warning-foreground",
  "--color-success-bg": "--theme-feedback-success-background",
  "--color-success": "--theme-feedback-success-foreground",
  "--color-info-bg": "--theme-feedback-info-background",
  "--color-info": "--theme-feedback-info-foreground",
  "--radius-narrative": "--theme-shapes-radius-panel",
  "--radius-full": "--theme-shapes-radius-pill",
  "--radius-lg": "--theme-shapes-radius-large",
  "--radius-md": "--theme-shapes-radius-medium",
  "--radius-sm": "--theme-shapes-radius-small",
  "--shadow-primary": "--theme-shadows-accent",
  "--shadow-lg": "--theme-shadows-large",
  "--shadow-md": "--theme-shadows-medium",
  "--shadow-sm": "--theme-shadows-small",
  "--focus-ring": "--theme-focus-ring",
};

for (const type of [
  "player", "npc", "location", "faction", "quest", "clue", "secret", "item",
  "creature", "encounter", "scene", "front", "clock", "decision", "consequence",
  "rumor", "reference", "handout", "note",
]) {
  replacements[`--entity-${type}-soft`] = `--theme-entities-${type}-background`;
  replacements[`--entity-${type}`] = `--theme-entities-${type}-foreground`;
}

const orderedReplacements = Object.entries(replacements)
  .sort(([left], [right]) => right.length - left.length);

function filesUnder(directory) {
  const result = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) result.push(...filesUnder(path));
    else result.push(path);
  }
  return result;
}

let changedFiles = 0;
for (const path of filesUnder(sourceRoot)) {
  const relativePath = relative(root, path).replaceAll("\\", "/");
  if (!allowedExtensions.has(extname(path))) continue;
  if (relativePath === "src/frontend/shared/styles/tokens.css") continue;
  if (skippedThemeSources.has(relativePath)) continue;

  const original = readFileSync(path, "utf8");
  let migrated = original;
  for (const [from, to] of orderedReplacements) {
    migrated = migrated.replaceAll(from, to);
  }
  if (migrated !== original) {
    writeFileSync(path, migrated);
    changedFiles += 1;
  }
}

const tokensPath = join(sourceRoot, "shared/styles/tokens.css");
writeFileSync(tokensPath, `@font-face {
  font-family: "Cinzel";
  src: url("/fonts/cinzel-latin.woff2") format("woff2");
  font-style: normal;
  font-weight: 400 900;
  font-display: swap;
}

@font-face {
  font-family: "Outfit";
  src: url("/fonts/outfit-latin.woff2") format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}

:root {
  color-scheme: light dark;

  --font-display: "Cinzel", Georgia, "Times New Roman", serif;
  --font-sans: "Outfit", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  --transition-fast: 140ms ease;
  --transition-normal: 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
  --touch-target-min: 44px;
  --app-footer-height: 64px;
}

:root[data-color-mode="dark"] {
  color-scheme: dark;
}

:root[data-color-mode="light"] {
  color-scheme: light;
}
`);

rmSync(join(root, ".github/workflows/theme-token-migration.yml"), { force: true });
rmSync(join(root, "scripts/theme/run-theme-token-migration.mjs"), { force: true });
console.log(`Migrated ${changedFiles} frontend files and removed the temporary migration runner.`);
