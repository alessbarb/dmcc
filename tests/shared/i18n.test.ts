import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { es } from "../../src/shared/i18n/dictionaries/es.js";
import { en } from "../../src/shared/i18n/dictionaries/en.js";
import { createTranslator, resolveLocale, formatEntityType, formatVisibility } from "../../src/shared/i18n/index.js";
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
];

const SPANISH_UI_PATTERN = /[ÁÉÍÓÚÜÑáéíóúüñ¿¡]|\b(Guardar|Cancelar|Crear|Editar|Eliminar|Buscar|Cargando|Jugadores|Personajes|Entidades|Sesión|Campaña|Relación|Relaciones|Notas|Objetivos|Estado|Visibilidad|Secreto|Público|Privado|Tablero|Portal|Ajustes|Reglas|Exportar|Importar|Actualizar|Rechazar|Aprobar|Asignar|Vinculado|Disponible|Resumen|Descripción|Título)\b/;

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
  const esEntries = getAllKeysAndValues(es);
  const enEntries = getAllKeysAndValues(en);
  const esKeys = esEntries.map((e) => e.key).sort();
  const enKeys = enEntries.map((e) => e.key).sort();

  it("has exact 1:1 key parity between Spanish and English dictionaries", () => {
    expect(enKeys).toEqual(esKeys);
  });

  it("contains no empty translation strings", () => {
    for (const entry of esEntries) {
      expect(entry.val.trim().length, `Empty value for ES key '${entry.key}'`).toBeGreaterThan(0);
    }
    for (const entry of enEntries) {
      expect(entry.val.trim().length, `Empty value for EN key '${entry.key}'`).toBeGreaterThan(0);
    }
  });

  it("matches exact interpolation placeholders between languages", () => {
    const esMap = new Map(esEntries.map((e) => [e.key, e.val]));
    const enMap = new Map(enEntries.map((e) => [e.key, e.val]));

    for (const key of esKeys) {
      const esVal = esMap.get(key)!;
      const enVal = enMap.get(key)!;
      const esPlaceholders = extractPlaceholders(esVal);
      const enPlaceholders = extractPlaceholders(enVal);
      expect(enPlaceholders, `Placeholder mismatch for key '${key}'`).toEqual(esPlaceholders);
    }
  });

  it("resolves locales accurately with resolveLocale helper", () => {
    expect(resolveLocale("en-US")).toBe("en");
    expect(resolveLocale("EN")).toBe("en");
    expect(resolveLocale("es-ES")).toBe("es");
    expect(resolveLocale("fr-FR")).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
  });

  it("resolves translations accurately with createTranslator", () => {
    const trEs = createTranslator("es-ES");
    const trEn = createTranslator("en-US");

    expect(trEs.t("common.save")).toBe("Guardar");
    expect(trEn.t("common.save")).toBe("Save");
  });

  it("formats domain entity types and visibility appropriately", () => {
    expect(formatEntityType("npc", "es")).toBe("Personaje No Jugador (PNJ)");
    expect(formatEntityType("npc", "en")).toBe("Non-Player Character (NPC)");
    expect(formatVisibility("dm_only", "es")).toBe("Solo DM");
    expect(formatVisibility("dm_only", "en")).toBe("DM Only");
  });


  it("does not leave hardcoded Spanish UI string literals in migrated frontend files", () => {
    const frontendFiles = getFilesRecursively(new URL("../../src/frontend", import.meta.url).pathname)
      .filter((file) => !FRONTEND_SPANISH_LITERAL_ALLOWLIST.some((allowed) => file.includes(allowed)));
    const offenders: string[] = [];

    for (const file of frontendFiles) {
      const relativeFile = file.replace(process.cwd() + "/", "");
      const literals = extractStringLiterals(readFileSync(file, "utf8"), relativeFile);
      const matches = literals.filter((literal) => SPANISH_UI_PATTERN.test(literal));
      if (matches.length > 0) {
        offenders.push(`${relativeFile}: ${matches.slice(0, 8).join(" | ")}`);
      }
    }

    expect(offenders, `Hardcoded Spanish UI strings remain:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("enforces architectural cleanliness: src/shared and src/core never import React", () => {
    const sharedFiles = getFilesRecursively(new URL("../../src/shared", import.meta.url).pathname);
    const coreFiles = getFilesRecursively(new URL("../../src/core", import.meta.url).pathname);
    const allFiles = [...sharedFiles, ...coreFiles];

    for (const file of allFiles) {
      const content = readFileSync(file, "utf8");
      expect(content, `File ${file} must not import React`).not.toMatch(/from\s+["']react(-dom)?["']/);
    }
  });
});
