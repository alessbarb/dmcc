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
  "# Shared Style System Inventory",
  "",
  "> Inventory generated from `src/frontend/shared/styles`. Does not contain numbered CSS, `-parts` folders or `-styles` folders.",
  "> To regenerate: `npm run styles:inventory`. To verify up-to-date status: `npm run styles:inventory:check`.",
  "",
  "## Scope",
  "",
  `- **${records.size} CSS stylesheets** inventoried in current checkout.`,
  "- Graph distinguishes three relationships: `Imports` (CSS → CSS), `Consumed by` (TS/TSX → CSS) and `Grouped by` (CSS → wrapper CSS).",
  "- `main.css` is the global entrypoint. Feature stylesheets are loaded by their consumers; `account.css` remains a documented architecture exception.",
  "- Selector metric is mechanical to help locate changes; it does not replace visual review.",
  "- Intermediate audit reports live in `.artifacts/`, regenerated on script execution and not version controlled.",
  "",
  "## Application Direct Consumers",
  "",
  directConsumers.length ? directConsumers.map((consumer) => `- \`${consumer}\``).join("\n") : "- None detected.",
  "",
  "## Reading Conventions",
  "",
  "- **Responsibility**: role of the stylesheet in the architecture.",
  "- **Summary**: existing functional comment or summary derived from selectors when stylesheet lacks comment.",
  "- **Metrics**: lines, selectors, defined CSS variables, and import count.",
  "- **Consumed by**: direct imports from TS/TSX. If empty, the sheet is either reached transitively or needs orphan auditor review.",
  "",
  "## Application Global Audit",
  "",
  "> This section integrates the latest `npm run styles:audit:report` output.",
  "",
  "| Metric | Value |",
  "| --- | ---: |",
  ...Object.entries(auditReport.summary).map(([key, value]) => `| \`${key}\` | ${value} |`),
  "",
  "The auditor covers CSS and configured frontend files, checking literal colors, inline styles, CSS variables, orphan sheets, cross-component selectors, `!important` rules, and sheets needing atomization.",
  "",
  "## Auditor Findings",
  "",
  "Findings are preserved here to keep the inventory actionable.",
  "",
  "| Severity | Category | Location | Reason |",
  "| --- | --- | --- | --- |",
  ...(auditReport.findings.length
    ? auditReport.findings
      .slice()
      .sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.category.localeCompare(b.category))
      .map((finding) => `| ${finding.severity} | ${finding.category} | \`${finding.path}:${finding.line}\` | ${escapeCell(String(finding.reason ?? ""))} |`)
    : ["| — | — | — | No findings recorded. |"]),
  "",
];

for (const [group, groupRecords] of groups) {
  lines.push(`## ${group === "root" ? "Entries" : humanize(group)}`, "", groupDescriptions[group] ?? "Shared sheets without additional subgroup.", "");
  lines.push("| File | Responsibility | Summary | Imports | Consumed by | Audit | Metrics |", "| --- | --- | --- | --- | --- | --- | --- |");
  for (const record of groupRecords.sort((a, b) => a.pathname.localeCompare(b.pathname))) {
    const imports = record.imports.length ? record.imports.map((file) => `\`${file}\``).join(", ") : "—";
    const importedBy = record.importedByCss.length ? record.importedByCss.map((file) => `\`${file}\``).join(", ") : "—";
    const consumers = record.importedBySource.length ? record.importedBySource.map((file) => `\`${file}\``).join(", ") : "—";
    const audit = record.audit
      ? `${record.audit.layer} / ${record.audit.domain}<br>**Findings:** ${record.auditFindings.length}`
      : "Not audited";
    const metrics = `${record.lines} lines · ${record.selectors.length} selectors · ${record.variables.length} variables · ${record.imports.length} imports`;
    lines.push(`| \`${escapeCell(record.pathname)}\` | ${record.role}<br>**Grouped by:** ${importedBy} | ${escapeCell(record.summary)} | ${imports} | ${consumers} | ${audit} | ${metrics} |`);
  }
  lines.push("");
}

lines.push(
  "## Maintenance",
  "",
  "This file is a derived artifact from the CSS tree and frontend import graph. When adding, renaming or deleting a sheet, run `npm run styles:inventory` and include the inventory diff alongside code changes.",
  "",
  "Absence of a direct consumer does not mean a sheet is dead: it may be a transitive CSS dependency. Deletion decisions should be backed by `npm run styles:audit:check` and consumer searches.",
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
