import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const stylesRoot = path.join(root, "src/frontend/shared/styles");
const output = path.join(stylesRoot, "README.md");
const auditReportPath = path.join(root, ".artifacts/style-audit.json");
const check = process.argv.includes("--check");

function walk(directory, extensions) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute, extensions);
    return extensions.some((extension) => absolute.endsWith(extension)) ? [absolute] : [];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function resolveImport(from, specifier) {
  if (!specifier.startsWith(".")) return null;
  const candidate = path.resolve(path.dirname(from), specifier);
  if (fs.existsSync(candidate) && candidate.endsWith(".css")) return candidate;
  if (fs.existsSync(`${candidate}.css`)) return `${candidate}.css`;
  return null;
}

function humanize(value) {
  return value
    .replace(/\.css$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function cleanComment(comment) {
  return comment
    .replace(/^\/\*+|\*\/$/g, "")
    .split("\n")
    .map((line) => line.replace(/^\s*[*-]?\s*/, "").trim())
    .filter((line) => line && !/^[-─_ ]+$/.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstUsefulComment(source) {
  for (const match of source.matchAll(/\/\*[\s\S]*?\*\//g)) {
    const comment = cleanComment(match[0]);
    if (comment.length >= 12) return comment;
  }
  return null;
}

function selectorsFrom(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((selector) => selector && !selector.startsWith("@"))
    .flatMap((selector) => selector.split(",").map((part) => part.trim()))
    .filter(Boolean);
}

function roleFor(pathname) {
  const parts = pathname.split("/");
  if (parts.length === 1) return "Entry point / aggregator";
  if (parts[0] === "foundation") return "Foundation global";
  if (parts[0] === "primitives") return "Shared primitive";
  if (parts[0] === "layout") return "Shared layout";
  if (parts[0] === "vendor") return "Vendor adapter";
  if (parts[0] === "landing") return "Landing surface";
  if (parts[0] === "features") return parts.length === 2 ? "Feature aggregator" : "Feature slice";
  return "Shared style";
}

const groupDescriptions = {
  foundation: "Tokens, reset, typography, accessibility, motion y esquema de color global.",
  primitives: "Controles visuales reutilizables: botones, formularios, cards, dialogs, estados y overlays.",
  layout: "Shell de aplicación, navegación, workspace, footer, grid y responsive global.",
  vendor: "Adaptaciones mínimas para librerías externas; no contiene reglas de dominio.",
  landing: "Landing pública y superficies de cuenta relacionadas; conserva su paleta oscura propia.",
  features: "Estilos de dominio cargados por el consumidor de cada feature, no por la entrada global.",
};

function summaryFor(pathname, source, imports, selectors) {
  const filename = path.basename(pathname);
  const comment = firstUsefulComment(source);
  if (comment) return comment;
  if (imports.length > 0) return `Agregador de ${humanize(filename)} y sus hojas atomizadas.`;
  const preview = selectors.slice(0, 3).join(", ");
  if (preview) return `Reglas de ${humanize(filename)} para ${preview}.`;
  return `Reglas específicas de ${humanize(filename)}.`;
}

function escapeCell(value) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function loadAuditReport() {
  if (!fs.existsSync(auditReportPath)) {
    throw new Error("Missing .artifacts/style-audit.json. Run npm run styles:audit:report first.");
  }
  return JSON.parse(fs.readFileSync(auditReportPath, "utf8"));
}

const cssFiles = walk(stylesRoot, [".css"]).sort();
const auditReport = loadAuditReport();
const sourceFiles = walk(path.join(root, "src/frontend"), [".ts", ".tsx", ".css"]);
const records = new Map();
for (const file of cssFiles) {
  const pathname = relative(file).replace("src/frontend/shared/styles/", "");
  records.set(file, {
    file,
    pathname,
    source: fs.readFileSync(file, "utf8"),
    imports: [],
    importedByCss: [],
    importedBySource: [],
  });
}

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  const importPattern = file.endsWith(".css")
    ? /@import\s+["']([^"']+)["']/g
    : /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+\.css)["']/g;
  for (const match of source.matchAll(importPattern)) {
    const imported = resolveImport(file, match[1]);
    const record = imported && records.get(imported);
    if (!record) continue;
    if (file.endsWith(".css")) {
      record.importedByCss.push(relative(file));
      records.get(file)?.imports.push(relative(imported));
    } else {
      record.importedBySource.push(relative(file));
    }
  }
}

for (const record of records.values()) {
  record.imports = [...new Set(record.imports)].sort();
  record.importedByCss = [...new Set(record.importedByCss)].sort();
  record.importedBySource = [...new Set(record.importedBySource)].sort();
  record.selectors = selectorsFrom(record.source);
  record.variables = [...record.source.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)]
    .map((match) => match[1])
    .filter((variable, index, all) => all.indexOf(variable) === index)
    .sort();
  record.lines = record.source.split("\n").length;
  record.summary = summaryFor(record.pathname, record.source, record.imports, record.selectors);
  record.role = roleFor(record.pathname);
  record.audit = auditReport.files.find((auditFile) => auditFile.path === relative(record.file)) ?? null;
}

const findingsByPath = new Map();
for (const finding of auditReport.findings) {
  if (!findingsByPath.has(finding.path)) findingsByPath.set(finding.path, []);
  findingsByPath.get(finding.path).push(finding);
}

for (const record of records.values()) {
  record.auditFindings = findingsByPath.get(relative(record.file)) ?? [];
}

const groups = new Map();
for (const record of records.values()) {
  const group = record.pathname.split("/")[0] || "root";
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(record);
}

const directConsumers = [...records.values()]
  .flatMap((record) => record.importedBySource)
  .filter((file, index, all) => all.indexOf(file) === index)
  .sort();

const lines = [
  "# Inventario del sistema de estilos compartido",
  "",
  "> Inventario generado desde `src/frontend/shared/styles`. No contiene CSS numerado, carpetas `-parts` ni carpetas `-styles`.",
  "> Para regenerarlo: `npm run styles:inventory`. Para comprobar que no está obsoleto: `npm run styles:inventory:check`.",
  "",
  "## Alcance",
  "",
  `- **${records.size} hojas CSS** inventariadas en el checkout actual.`,
  "- El grafo distingue tres relaciones: `Importa` (CSS → CSS), `Consumido por` (TS/TSX → CSS) y `Agrupado por` (CSS → wrapper CSS).",
  "- `main.css` es la entrada global. Las hojas de feature se cargan desde sus consumidores; `account.css` sigue siendo una excepción global documentada en la arquitectura.",
  "- La métrica de selectores es mecánica y sirve para localizar cambios; no sustituye la revisión visual.",
  "- Los informes intermedios de auditoría viven en `.artifacts/`, se regeneran al ejecutar los scripts y no forman parte del código versionado.",
  "",
  "## Consumidores directos de la aplicación",
  "",
  directConsumers.length ? directConsumers.map((consumer) => `- \`${consumer}\``).join("\n") : "- Ninguno detectado.",
  "",
  "## Convenciones de lectura",
  "",
  "- **Responsabilidad**: papel de la hoja dentro de la arquitectura.",
  "- **Resumen**: comentario funcional existente o descripción derivada de sus selectores cuando la hoja no tiene comentario.",
  "- **Métricas**: líneas, selectores, variables CSS definidas y número de imports.",
  "- **Consumido por**: imports directos desde TS/TSX. Si aparece vacío, la hoja solo puede estar alcanzada desde otra hoja CSS o necesita revisión del auditor de huérfanos.",
  "",
  "## Auditoría global de la aplicación",
  "",
  "> Esta sección integra el último informe de `npm run styles:audit:report`. El comando de inventario lo ejecuta antes de regenerar este README para que la documentación y los controles compartan la misma fotografía.",
  "",
  "| Métrica | Valor |",
  "| --- | ---: |",
  ...Object.entries(auditReport.summary).map(([key, value]) => `| \`${key}\` | ${value} |`),
  "",
  "El auditor cubre los CSS y los ficheros de frontend configurados, y además comprueba colores literales, estilos inline, variables CSS, hojas huérfanas, selectores entre componentes, reglas `!important` y hojas que requieren más atomización.",
  "",
  "## Hallazgos del auditor",
  "",
  "Los hallazgos se conservan aquí para que el inventario sea accionable y no solo descriptivo.",
  "",
  "| Severidad | Categoría | Ubicación | Motivo |",
  "| --- | --- | --- | --- |",
  ...(auditReport.findings.length
    ? auditReport.findings
      .slice()
      .sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.category.localeCompare(b.category))
      .map((finding) => `| ${finding.severity} | ${finding.category} | \`${finding.path}:${finding.line}\` | ${escapeCell(String(finding.reason ?? ""))} |`)
    : ["| — | — | — | No hay hallazgos registrados. |"]),
  "",
];

for (const [group, groupRecords] of groups) {
  lines.push(`## ${group === "root" ? "Entradas" : humanize(group)}`, "", groupDescriptions[group] ?? "Hojas compartidas sin subgrupo adicional.", "");
  lines.push("| Fichero | Responsabilidad | Resumen | Importa | Consumido por | Auditoría | Métricas |", "| --- | --- | --- | --- | --- | --- | --- |");
  for (const record of groupRecords.sort((a, b) => a.pathname.localeCompare(b.pathname))) {
    const imports = record.imports.length ? record.imports.map((file) => `\`${file}\``).join(", ") : "—";
    const importedBy = record.importedByCss.length ? record.importedByCss.map((file) => `\`${file}\``).join(", ") : "—";
    const consumers = record.importedBySource.length ? record.importedBySource.map((file) => `\`${file}\``).join(", ") : "—";
    const audit = record.audit
      ? `${record.audit.layer} / ${record.audit.domain}<br>**Hallazgos:** ${record.auditFindings.length}`
      : "No auditado";
    const metrics = `${record.lines} líneas · ${record.selectors.length} selectores · ${record.variables.length} variables · ${record.imports.length} imports`;
    lines.push(`| \`${escapeCell(record.pathname)}\` | ${record.role}<br>**Agrupado por:** ${importedBy} | ${escapeCell(record.summary)} | ${imports} | ${consumers} | ${audit} | ${metrics} |`);
  }
  lines.push("");
}

lines.push(
  "## Mantenimiento",
  "",
  "Este fichero es un artefacto derivado del árbol CSS y del grafo de imports del frontend. Si se añade, renombra o elimina una hoja, se debe ejecutar `npm run styles:inventory` y revisar el diff del inventario junto con el diff de código.",
  "",
  "La ausencia de un consumidor directo no implica por sí sola que una hoja esté muerta: puede ser una dependencia CSS transitiva. La decisión de eliminarla debe apoyarse en `npm run styles:audit:check` y en la búsqueda de consumidores.",
  "",
);

const generated = `${lines.join("\n").trimEnd()}\n`;
if (check) {
  const current = fs.existsSync(output) ? fs.readFileSync(output, "utf8") : "";
  if (current !== generated) {
    console.error(`Style inventory is stale: ${relative(output)}`);
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(output, generated);
  console.log(`Generated ${relative(output)} for ${records.size} CSS files.`);
}
