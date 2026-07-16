import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

function update(path, transform) {
  const absolutePath = resolve(root, path);
  const before = readFileSync(absolutePath, "utf8");
  const after = transform(before);
  if (after === before) {
    throw new Error(`No changes produced for ${path}`);
  }
  writeFileSync(absolutePath, after);
}

function replaceRequired(source, search, replacement, path) {
  if (!source.includes(search)) {
    throw new Error(`Expected text not found in ${path}: ${search}`);
  }
  return source.replaceAll(search, replacement);
}

const themeFiles = [
  ["src/frontend/account/defaultTheme.ts", "accountCenter.appearance.themeDefault", "account.appearance.themeDefault"],
  ["src/frontend/account/fantasyTheme.ts", "accountCenter.appearance.themeFantasy", "account.appearance.themeFantasy"],
  ["src/frontend/account/sciFiTheme.ts", "accountCenter.appearance.themeSciFi", "account.appearance.themeSciFi"],
];

for (const [path, oldKey, newKey] of themeFiles) {
  update(path, (source) => replaceRequired(source, oldKey, newKey, path));
}

update("src/frontend/account/typographyRegistry.ts", (source) =>
  replaceRequired(
    source,
    "accountCenter.appearance.typographyDefault",
    "account.appearance.typographyDefault",
    "src/frontend/account/typographyRegistry.ts",
  ),
);

update("src/frontend/account/fantasyTheme.ts", (source) => {
  let result = source;
  result = replaceRequired(result, "hsl(35 68% 36%)", "hsl(35 72% 32%)", "fantasyTheme.ts");
  result = replaceRequired(result, "hsl(35 76% 28%)", "hsl(35 79% 25%)", "fantasyTheme.ts");
  result = replaceRequired(result, "hsl(34 79% 23%)", "hsl(34 82% 20%)", "fantasyTheme.ts");
  return result;
});

update("src/frontend/account/sciFiTheme.ts", (source) => {
  let result = source;
  result = replaceRequired(result, "hsl(190 76% 34%)", "hsl(190 82% 28%)", "sciFiTheme.ts");
  result = replaceRequired(result, "hsl(191 84% 26%)", "hsl(191 88% 22%)", "sciFiTheme.ts");
  result = replaceRequired(result, "hsl(191 88% 21%)", "hsl(191 91% 18%)", "sciFiTheme.ts");
  return result;
});

update("src/frontend/account/themeRegistry.ts", (source) => {
  const helperStart = source.indexOf("function strengthenLightPrimary");
  const registryStart = source.indexOf("export const themes");
  if (helperStart < 0 || registryStart < 0 || registryStart <= helperStart) {
    throw new Error("Could not locate temporary theme normalization block");
  }
  let result = `${source.slice(0, helperStart)}${source.slice(registryStart)}`;
  result = replaceRequired(result, "registerTheme(accessibleFantasyTheme);", "registerTheme(fantasyTheme);", "themeRegistry.ts");
  result = replaceRequired(result, "registerTheme(accessibleSciFiTheme);", "registerTheme(sciFiTheme);", "themeRegistry.ts");
  return result;
});

const translations = {
  en: ["Default", "Fantasy", "Sci-fi", "Cinzel + Outfit"],
  es: ["Predeterminado", "Fantasía", "Ciencia ficción", "Cinzel + Outfit"],
  fr: ["Par défaut", "Fantasy", "Science-fiction", "Cinzel + Outfit"],
  de: ["Standard", "Fantasy", "Science-Fiction", "Cinzel + Outfit"],
  it: ["Predefinito", "Fantasy", "Fantascienza", "Cinzel + Outfit"],
  pt: ["Padrão", "Fantasia", "Ficção científica", "Cinzel + Outfit"],
};

for (const [locale, [themeDefault, themeFantasy, themeSciFi, typographyDefault]] of Object.entries(translations)) {
  const path = `src/shared/i18n/dictionaries/${locale}.ts`;
  update(path, (source) => {
    const pattern = /(\n\s+fontSet:\s*"[^"]+",\n)(\s+modeOptions:\s*\{)/;
    const match = source.match(pattern);
    if (!match) throw new Error(`Appearance insertion point not found in ${path}`);
    const indent = match[2].match(/^\s*/)?.[0] ?? "      ";
    const additions = [
      `${indent}themeDefault: ${JSON.stringify(themeDefault)},`,
      `${indent}themeFantasy: ${JSON.stringify(themeFantasy)},`,
      `${indent}themeSciFi: ${JSON.stringify(themeSciFi)},`,
      `${indent}typographyDefault: ${JSON.stringify(typographyDefault)},`,
    ].join("\n");
    return source.replace(pattern, `$1${additions}\n$2`);
  });
}

rmSync(resolve(root, "scripts/theme/finalize-theme-foundation.mjs"));
