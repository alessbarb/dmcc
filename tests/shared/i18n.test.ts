import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { createTranslator, resolveLocale, formatEntityType, formatVisibility, dictionaries, SUPPORTED_LOCALES } from "../../src/shared/i18n/index.js";
import { extractPlaceholders } from "../../src/shared/i18n/interpolation.js";

function getAllKeysAndValues(obj: Record<string, any>, prefix = ""): Array<{ key: string; val: string }> {
  let results: Array<{ key: string; val: string }> = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === "string") {
      results.push({ key: fullKey, val: obj[k] });
    } else if (typeof obj[k] === "object" && obj[k] !== null) {
      results = results.concat(getAllKeysAndValues(obj[k], fullKey));
    }
  }
  return results;
}

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      results.push(filePath);
    }
  }
  return results;
}

const FRONTEND_SPANISH_LITERAL_ALLOWLIST = [
  "src/frontend/shared/i18n/",
  "src/frontend/App.tsx", // Migrated but still contains Spanish seed/demo content and route constants.
  "src/frontend/shared/components/RpgPortalBackground.tsx", // Brand/style component without user-facing copy.
  "src/frontend/player/components/PlayerPortalView.tsx", // Dense character-sheet/domain labels; migrate as a dedicated player-portal i18n pass.
  "src/frontend/dm/pages/CommandCenterPage.tsx",
  "src/frontend/dm/pages/SearchPage.tsx",
  "src/frontend/player/pages/PlayerJoinPage.tsx",
  "src/frontend/player/pages/WebPlayerPortalPage.tsx",
  "src/frontend/shared/api/webProductClient.ts",
  "src/frontend/dm/components/LiveTableModal.tsx",
];

const SPANISH_UI_PATTERN = /[ÁÉÍÓÚÜÑáéíóúüñ¿¡]|\b(Guardar|Cancelar|Crear|Editar|Eliminar|Buscar|Cargando|Jugadores|Personajes|Entidades|Sesión|Campaña|Relación|Relaciones|Notas|Objetivos|Estado|Visibilidad|Secreto|Público|Privado|Tablero|Portal|Ajustes|Reglas|Exportar|Importar|Actualizar|Rechazar|Aprobar|Asignar|Vinculado|Disponible|Resumen|Descripción|Título)\b/;

const PROJECT_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const FRONTEND_ROOT = join(PROJECT_ROOT, "src", "frontend");
const SHARED_ROOT = join(PROJECT_ROOT, "src", "shared");
const CORE_ROOT = join(PROJECT_ROOT, "src", "core");

function toProjectRelativePath(filePath: string): string {
  return relative(PROJECT_ROOT, filePath).split(sep).join("/");
}

function stripComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function extractStringLiterals(content: string, fileName = "source.tsx"): string[] {
  const literals: string[] = [];
  const sourceFile = ts.createSourceFile(fileName, stripComments(content), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function visit(node: ts.Node): void {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      literals.push(node.text);
    } else if (ts.isTemplateExpression(node)) {
      let templateText = node.head.text;
      for (const span of node.templateSpans) {
        templateText += span.literal.text;
      }
      literals.push(templateText);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return literals;
}

describe("i18n system & dictionary parity", () => {
  const enEntries = getAllKeysAndValues(dictionaries.en);
  const enKeys = enEntries.map((e) => e.key).sort();
  const dictionaryEntries = SUPPORTED_LOCALES.map((locale) => ({
    locale: locale.code,
    entries: getAllKeysAndValues(dictionaries[locale.code]),
  }));

  it("has exact 1:1 key parity across all registered dictionaries", () => {
    for (const { locale, entries } of dictionaryEntries) {
      const keys = entries.map((e) => e.key).sort();
      expect(keys, `Key parity mismatch for locale '${locale}'`).toEqual(enKeys);
    }
  });

  it("contains no empty translation strings", () => {
    for (const { locale, entries } of dictionaryEntries) {
      for (const entry of entries) {
        expect(entry.val.trim().length, `Empty value for ${locale.toUpperCase()} key '${entry.key}'`).toBeGreaterThan(0);
      }
    }
  });

  it("matches exact interpolation placeholders between languages", () => {
    const enMap = new Map(enEntries.map((e) => [e.key, e.val]));

    for (const { locale, entries } of dictionaryEntries) {
      const localeMap = new Map(entries.map((e) => [e.key, e.val]));

      for (const key of enKeys) {
        const enVal = enMap.get(key)!;
        const localeVal = localeMap.get(key)!;
        const enPlaceholders = extractPlaceholders(enVal);
        const localePlaceholders = extractPlaceholders(localeVal);
        expect(localePlaceholders, `Placeholder mismatch for locale '${locale}', key '${key}'`).toEqual(enPlaceholders);
      }
    }
  });

  it("resolves locales accurately with resolveLocale helper", () => {
    expect(resolveLocale("en-US")).toBe("en");
    expect(resolveLocale("EN")).toBe("en");
    expect(resolveLocale("es-ES")).toBe("es");
    expect(resolveLocale("fr-FR")).toBe("fr");
    expect(resolveLocale("de_DE")).toBe("de");
    expect(resolveLocale("it-IT")).toBe("it");
    expect(resolveLocale(undefined)).toBe("en");
  });

  it("resolves translations accurately with createTranslator", () => {
    const trEn = createTranslator("en-US");
    const trEs = createTranslator("es-ES");
    const trFr = createTranslator("fr-FR");
    const trDe = createTranslator("de-DE");
    const trIt = createTranslator("it-IT");
    const trPt = createTranslator("pt-PT");

    expect(trEn.t("common.save")).toBe("Save");
    expect(trEs.t("common.save")).toBe("Guardar");
    expect(trFr.t("common.save")).toBe("Enregistrer");
    expect(trDe.t("common.save")).toBe("Speichern");
    expect(trIt.t("common.save")).toBe("Salva");
    expect(trPt.t("common.save")).toBe("Salvar");

    expect(trEn.t("landing.errorTitle")).toBe("Could not load your campaigns");
    expect(trEs.t("landing.errorTitle")).toBe("No se pudieron cargar tus campañas");
    expect(trFr.t("landing.errorTitle")).toBe("Impossible de charger vos campagnes");
    expect(trDe.t("landing.errorTitle")).toBe("Deine Kampagnen konnten nicht geladen werden");
    expect(trIt.t("landing.errorTitle")).toBe("Impossibile caricare le tue campagne");
    expect(trPt.t("landing.errorTitle")).toBe("Não foi possível carregar as tuas campanhas");
  });

  it("formats domain entity types and visibility appropriately", () => {
    expect(formatEntityType("npc", "en")).toBe("Non-Player Character (NPC)");
    expect(formatEntityType("npc", "es")).toBe("Personaje No Jugador (PNJ)");
    expect(formatVisibility("dm_only", "en")).toBe("DM Only");
    expect(formatVisibility("dm_only", "es")).toBe("Solo DM");
  });

  it("does not leave hardcoded Spanish UI string literals in migrated frontend files", () => {
    const frontendFiles = getFilesRecursively(FRONTEND_ROOT)
      .filter((file) => {
        const relativeFile = toProjectRelativePath(file);
        return !FRONTEND_SPANISH_LITERAL_ALLOWLIST.some((allowed) => relativeFile.startsWith(allowed));
      });
    const offenders: string[] = [];

    for (const file of frontendFiles) {
      const relativeFile = toProjectRelativePath(file);
      const literals = extractStringLiterals(readFileSync(file, "utf8"), relativeFile);
      const matches = literals.filter((literal) => SPANISH_UI_PATTERN.test(literal));
      if (matches.length > 0) {
        offenders.push(`${relativeFile}: ${matches.slice(0, 8).join(" | ")}`);
      }
    }

    expect(offenders, `Hardcoded Spanish UI strings remain:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("enforces architectural cleanliness: src/shared and src/core never import React", () => {
    const sharedFiles = getFilesRecursively(SHARED_ROOT);
    const coreFiles = getFilesRecursively(CORE_ROOT);
    const allFiles = [...sharedFiles, ...coreFiles];

    for (const file of allFiles) {
      const content = readFileSync(file, "utf8");
      expect(content, `File ${file} must not import React`).not.toMatch(/from\s+["']react(-dom)?["']/);
    }
  });
});
