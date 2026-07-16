import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

function update(path, transform) {
  const absolute = resolve(root, path);
  const before = readFileSync(absolute, "utf8");
  const after = transform(before);
  if (after === before) throw new Error(`No changes produced for ${path}`);
  writeFileSync(absolute, after);
}

update("src/frontend/account/fantasyTheme.ts", (source) => source
  .replaceAll('hsl(35 68% 36%)', 'hsl(35 72% 32%)')
  .replaceAll('hsl(35 76% 28%)', 'hsl(35 79% 25%)')
  .replaceAll('hsl(34 79% 23%)', 'hsl(34 82% 20%)'));

update("src/frontend/account/sciFiTheme.ts", (source) => source
  .replaceAll('hsl(190 76% 34%)', 'hsl(190 82% 28%)')
  .replaceAll('hsl(191 84% 26%)', 'hsl(191 88% 22%)')
  .replaceAll('hsl(191 88% 21%)', 'hsl(191 91% 18%)'));

update("src/frontend/account/themeRegistry.ts", () => `import { defaultTheme } from "./defaultTheme.js";
import { fantasyTheme } from "./fantasyTheme.js";
import { sciFiTheme } from "./sciFiTheme.js";
import type { ThemePackageV1 } from "./themeContract.js";
import { assertThemeContrast } from "./themeContrast.js";
import { validateThemePackage } from "./themeValidation.js";

export type ThemePackage = ThemePackageV1;

function assertThemePackage(value: unknown): ThemePackageV1 {
  const result = validateThemePackage(value);
  if (!result.valid) {
    const details = result.issues
      .map((issue) => \`${'${issue.path}: ${issue.message}'}\`)
      .join("\\n");
    throw new Error(\`Invalid theme package:\\n${'${details}'}\`);
  }

  assertThemeContrast(result.value);
  return result.value;
}

export const themes = new Map<string, ThemePackage>();

export function registerTheme(value: unknown): ThemePackageV1 {
  const theme = assertThemePackage(value);
  if (themes.has(theme.id)) {
    throw new Error(\`Theme "${'${theme.id}'}" is already registered\`);
  }
  themes.set(theme.id, theme);
  return theme;
}

registerTheme(defaultTheme);
registerTheme(fantasyTheme);
registerTheme(sciFiTheme);

export function getTheme(id: string): ThemePackage {
  return themes.get(id) ?? defaultTheme;
}
`);

const labels = {
  en: ["Default", "Fantasy", "Science fiction", "Cinzel + Outfit"],
  es: ["Predeterminado", "Fantasía", "Ciencia ficción", "Cinzel + Outfit"],
  fr: ["Par défaut", "Fantaisie", "Science-fiction", "Cinzel + Outfit"],
  de: ["Standard", "Fantasy", "Science-Fiction", "Cinzel + Outfit"],
  it: ["Predefinito", "Fantasy", "Fantascienza", "Cinzel + Outfit"],
  pt: ["Predefinido", "Fantasia", "Ficção científica", "Cinzel + Outfit"],
};

for (const [locale, [themeDefault, themeFantasy, themeSciFi, typographyDefault]] of Object.entries(labels)) {
  update(`src/shared/i18n/dictionaries/${locale}.ts`, (source) => {
    if (source.includes("themeFantasy:")) return source;
    const match = source.match(/^(\s*)deviceOverride:\s*[^\n]+,\s*$/m);
    if (!match || match.index === undefined) {
      throw new Error(`Could not find appearance.deviceOverride in ${locale}`);
    }
    const lineEnd = source.indexOf("\n", match.index);
    const insertion = `\n${match[1]}themeDefault: ${JSON.stringify(themeDefault)},\n${match[1]}themeFantasy: ${JSON.stringify(themeFantasy)},\n${match[1]}themeSciFi: ${JSON.stringify(themeSciFi)},\n${match[1]}typographyDefault: ${JSON.stringify(typographyDefault)},`;
    return source.slice(0, lineEnd) + insertion + source.slice(lineEnd);
  });
}

rmSync(resolve(root, ".github/workflows/finalize-theme-packages.yml"), { force: true });
rmSync(resolve(root, "scripts/theme/finalize-theme-packages.mjs"), { force: true });
