import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { STYLE_AUDIT_CONFIG, classifyStylePath } from "./styleAuditConfig.mjs";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const updateBaseline = args.has("--update-baseline");
const check = args.has("--check");

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return [absolute];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function positionFor(source, index) {
  const before = source.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function finding(pathname, source, index, data) {
  const position = positionFor(source, index);
  const fingerprint = String(
    data.value ?? data.selectorOrComponent ?? data.property ?? data.reason ?? "finding",
  ).replace(/\s+/g, " ").trim();
  return {
    // Keep the ratchet stable when a stylesheet is atomized and line numbers move.
    // Counts still catch additional occurrences; the fingerprint prevents a pure
    // line shift from being reported as a new violation.
    id: `${data.category}:${pathname}:${fingerprint}`,
    path: pathname,
    line: position.line,
    column: position.column,
    severity: data.severity,
    status: data.status ?? "temporary",
    ...data,
  };
}

function collectRegex(source, regex) {
  const matches = [];
  for (const match of source.matchAll(regex)) matches.push(match);
  return matches;
}

function isColorAllowed(pathname) {
  return STYLE_AUDIT_CONFIG.colorLiteralAllow.some((rule) => rule.test(pathname));
}

// A declaration can be marked as a justified !important exception per
// docs/architecture/style-system.md §8.6, via a comment anywhere between the
// previous rule and the declaration itself:
//   /* style-audit-allow important: <reason> */
// e.g. overriding arbitrary/unknown descendant styles for a
// prefers-reduced-motion accessibility toggle, where no other CSS mechanism
// can guarantee the override wins. This is an explicit, reviewed exception,
// not a way to silence the ratchet.
function isImportantAllowed(source, index) {
  const previousRuleEnd = source.lastIndexOf("}", index);
  const window = source.slice(previousRuleEnd + 1, index);
  return /style-audit-allow\s+important\s*:/.test(window);
}

function classifyInlineStyle(body) {
  if (/^\s*["']?--[a-zA-Z0-9_-]+["']?\s*:/.test(body)) {
    return "dynamic";
  }
  const containsDynamic = /\$\{|--[a-zA-Z0-9_-]+|\b(?:props|state|value|index|progress|width|height|top|left|right|bottom|x|y|focus|position|transform)\b/.test(body);
  const containsStaticProperty = /\b(?:background|backgroundColor|color|border|borderRadius|boxShadow|fontSize|fontFamily|fontWeight|padding|margin|display|grid|flex|gap|alignItems|justifyContent|position|overflow)\s*:/.test(body);
  if (containsDynamic && containsStaticProperty) return "mixed";
  if (containsDynamic) return "dynamic";
  return "static";
}

function auditCss(pathname, source) {
  const findings = [];
  const imports = collectRegex(source, /@import\s+["']([^"']+)["']/g).map((match) => match[1]);
  const selectors = collectRegex(source, /(^|})\s*([^@}{][^{]+)\s*\{/gm)
    .map((match) => match[2].trim())
    .filter(Boolean);
  const variableDefinitions = collectRegex(source, /(--[a-zA-Z0-9_-]+)\s*:/g).map((match) => match[1]);
  const variableReferences = collectRegex(source, /var\(\s*(--[a-zA-Z0-9_-]+)/g).map((match) => match[1]);

  if (!isColorAllowed(pathname)) {
    const colorPattern = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|lab|lch)\([^)]*\)|\b(?:white|black|red|green|blue)\b(?!-space)/g;
    const sourceWithoutComments = source.replace(/\/\*[\s\S]*?\*\//g, (comment) => " ".repeat(comment.length));
    for (const block of collectRegex(sourceWithoutComments, /\{([^{}]*)\}/g)) {
      for (const match of collectRegex(block[1], colorPattern)) {
        findings.push(finding(pathname, source, block.index + 1 + match.index, {
          sourceType: "css",
          category: "literal-color",
          severity: "high",
          status: "temporary",
          value: match[0],
          reason: "Literal visual color outside a registered theme package.",
        }));
      }
    }
  }

  for (const match of collectRegex(source, /!important\b/g)) {
    if (isImportantAllowed(source, match.index)) continue;
    findings.push(finding(pathname, source, match.index, {
      sourceType: "css",
      category: "important",
      severity: "high",
      status: "temporary",
      value: match[0],
      reason: "Important declarations bypass the intended cascade.",
    }));
  }

  for (const selector of selectors) {
    const index = source.indexOf(selector);
    const crossComponent = />\s*(?:div|img|button|section|header|footer|main|article)(?::|\[|\.|#|\s|$)|:first-child|:nth-child|:has\(/.test(selector);
    if (crossComponent) {
      findings.push(finding(pathname, source, index, {
        sourceType: "css",
        category: "cross-component-selector",
        severity: "high",
        status: "temporary",
        selectorOrComponent: selector,
        reason: "Selector depends on another component's DOM structure.",
      }));
    }
    if (STYLE_AUDIT_CONFIG.genericSelectors.some((generic) => selector.split(",").map((part) => part.trim()).includes(generic))) {
      findings.push(finding(pathname, source, index, {
        sourceType: "css",
        category: "global-selector",
        severity: "medium",
        status: "temporary",
        selectorOrComponent: selector,
        reason: "Generic selector has global collision risk.",
      }));
    }
  }

  const lines = source.split("\n").length;
  if (lines > STYLE_AUDIT_CONFIG.monolith.warningLines || selectors.length > STYLE_AUDIT_CONFIG.monolith.warningSelectors) {
    const critical = lines > STYLE_AUDIT_CONFIG.monolith.criticalLines || selectors.length > STYLE_AUDIT_CONFIG.monolith.criticalSelectors;
    findings.push({
      id: `mixed-responsibility:${pathname}`,
      path: pathname,
      line: 1,
      column: 1,
      sourceType: "css",
      category: "mixed-responsibility",
      severity: critical ? "critical" : "high",
      status: "temporary",
      reason: `Large stylesheet requires atomization (${lines} lines, ${selectors.length} selectors).`,
    });
  }

  return { findings, imports, selectors, variableDefinitions, variableReferences };
}

function auditCode(pathname, source) {
  const findings = [];
  const cssImports = collectRegex(source, /import\s+["']([^"']+\.css)["']/g).map((match) => match[1]);

  if (!isColorAllowed(pathname)) {
    const colorPattern = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|lab|lch)\([^)]*\)|["'`](?:white|black|red|green|blue)["'`]/g;
    for (const match of collectRegex(source, colorPattern)) {
      const isNamedColor = /^["'`](?:white|black|red|green|blue)["'`]$/.test(match[0]);
      if (isNamedColor) {
        const lineStart = source.lastIndexOf("\n", match.index) + 1;
        const lineEnd = source.indexOf("\n", match.index);
        const line = source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd);
        if (!/style\s*[=:]|(?:background|border|text|fill|stroke|shadow|accent)Color\s*:/.test(line)) {
          continue;
        }
      }
      findings.push(finding(pathname, source, match.index, {
        sourceType: pathname.endsWith(".svg") ? "svg" : "tsx-style-object",
        category: "literal-color",
        severity: "high",
        status: "temporary",
        value: match[0],
        reason: "Literal visual color outside a registered theme package.",
      }));
    }
  }

  const inlinePatterns = [
    /style\s*=\s*\{\{([\s\S]*?)\}\}/g,
    /\b(?:const|let)\s+[A-Za-z0-9_]*(?:style|Style|styles|Styles)\s*(?::\s*(?:React\.)?CSSProperties)?\s*=\s*\{([\s\S]*?)\n\s*\}/g,
  ];
  for (const pattern of inlinePatterns) {
    for (const match of collectRegex(source, pattern)) {
      const classification = classifyInlineStyle(match[1]);
      findings.push(finding(pathname, source, match.index, {
        sourceType: "tsx-inline",
        category: classification === "dynamic" ? "dynamic-style" : "static-inline",
        severity: classification === "static" ? "high" : classification === "mixed" ? "high" : "info",
        status: classification === "dynamic" ? "allowed" : "temporary",
        value: match[0].slice(0, 240),
        classification,
        reason: classification === "dynamic"
          ? "Runtime style requires review and CSS custom-property preference."
          : "Static or mixed inline style must move to an atomized stylesheet.",
      }));
    }
  }

  const variableReferences = collectRegex(source, /var\(\s*(--[a-zA-Z0-9_-]+)/g).map((match) => match[1]);
  return { findings, imports: cssImports, variableDefinitions: [], variableReferences, selectors: [] };
}

function resolveImport(importer, specifier) {
  if (!specifier.startsWith(".")) return specifier;
  return path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier));
}

function renderMarkdown(report) {
  const rows = report.findings
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line)
    .map((item) => `| ${item.severity} | ${item.category} | \`${item.path}:${item.line}\` | ${String(item.reason).replaceAll("|", "\\|")} |`)
    .join("\n");
  const cssRows = report.files
    .filter((file) => file.path.endsWith(".css"))
    .map((file) => `| \`${file.path}\` | ${file.layer} | ${file.domain} | ${file.lineCount} | ${file.selectorCount} | ${file.importedBy.length} |`)
    .join("\n");
  return `# Style audit baseline\n\nGenerated mechanically by \`npm run styles:audit:report\`.\n\n## Summary\n\n\`\`\`json\n${JSON.stringify(report.summary, null, 2)}\n\`\`\`\n\n## Stylesheets\n\n| File | Layer | Domain | Lines | Selectors | Importers |\n|---|---:|---:|---:|---:|---:|\n${cssRows}\n\n## Findings\n\n| Severity | Category | Location | Reason |\n|---|---|---|---|\n${rows}\n`;
}

function summaryFrom(findings, files) {
  const count = (category, predicate = () => true) => findings.filter((item) => item.category === category && predicate(item)).length;
  return {
    cssFiles: files.filter((file) => file.path.endsWith(".css")).length,
    tsxFilesWithInlineStyles: new Set(findings.filter((item) => item.sourceType === "tsx-inline").map((item) => item.path)).size,
    forbiddenLiteralColors: count("literal-color"),
    staticInlineStyles: count("static-inline"),
    dynamicInlineStyles: count("dynamic-style"),
    unknownCssVariables: count("unknown-token"),
    legacyCssVariables: count("legacy-token"),
    orphanCssFiles: count("orphan-css"),
    mixedResponsibilityFiles: count("mixed-responsibility"),
    crossComponentSelectors: count("cross-component-selector"),
    importantDeclarations: count("important"),
    unclassifiedCssFiles: files.filter((file) => file.path.endsWith(".css") && file.layer === "unclassified").length,
  };
}

const absoluteFiles = STYLE_AUDIT_CONFIG.roots
  .flatMap((directory) => walk(path.join(root, directory)))
  .filter((file) => STYLE_AUDIT_CONFIG.extensions.includes(path.extname(file)));

const records = [];
const allFindings = [];
const allDefinitions = new Set();
for (const absolute of absoluteFiles) {
  const pathname = relative(absolute);
  const source = fs.readFileSync(absolute, "utf8");
  const audited = pathname.endsWith(".css") ? auditCss(pathname, source) : auditCode(pathname, source);
  const classification = pathname.endsWith(".css") ? classifyStylePath(pathname) : { layer: null, domain: null };
  for (const name of audited.variableDefinitions) allDefinitions.add(name);
  records.push({
    path: pathname,
    ...classification,
    lineCount: source.split("\n").length,
    selectorCount: audited.selectors.length,
    imports: audited.imports.map((specifier) => resolveImport(pathname, specifier)),
    importedBy: [],
    variableDefinitions: audited.variableDefinitions,
    variableReferences: audited.variableReferences,
  });
  allFindings.push(...audited.findings);
}

const byPath = new Map(records.map((record) => [record.path, record]));
for (const record of records) {
  for (const imported of record.imports) {
    const target = byPath.get(imported);
    if (target) target.importedBy.push(record.path);
  }
}

for (const record of records) {
  if (record.path.endsWith(".css") && record.importedBy.length === 0 && record.path !== "src/frontend/shared/styles/index.css" && record.path !== "src/frontend/shared/styles/p1.css") {
    allFindings.push({
      id: `orphan-css:${record.path}`,
      path: record.path,
      line: 1,
      column: 1,
      sourceType: "css-import",
      category: "orphan-css",
      severity: "medium",
      status: "temporary",
      reason: "Stylesheet has no detected importer.",
    });
  }
  for (const variable of record.variableReferences) {
    const knownPrefix = STYLE_AUDIT_CONFIG.cssVariablePrefixes.some((prefix) => variable.startsWith(prefix));
    const legacyPrefix = STYLE_AUDIT_CONFIG.legacyVariablePrefixes.some((prefix) => variable.startsWith(prefix));
    if (legacyPrefix) {
      allFindings.push({
        id: `legacy-token:${record.path}:${variable}`,
        path: record.path,
        line: 1,
        column: 1,
        sourceType: record.path.endsWith(".css") ? "css" : "tsx-style-object",
        category: "legacy-token",
        severity: "high",
        status: "temporary",
        value: variable,
        reason: "Legacy CSS variable remains in use.",
      });
    } else if (!knownPrefix && !allDefinitions.has(variable)) {
      allFindings.push({
        id: `unknown-token:${record.path}:${variable}`,
        path: record.path,
        line: 1,
        column: 1,
        sourceType: record.path.endsWith(".css") ? "css" : "tsx-style-object",
        category: "unknown-token",
        severity: "high",
        status: "temporary",
        value: variable,
        reason: "CSS variable is not declared or allowlisted.",
      });
    }
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  summary: summaryFrom(allFindings, records),
  files: records,
  findings: allFindings,
  importGraph: Object.fromEntries(records.filter((record) => record.imports.length > 0).map((record) => [record.path, record.imports])),
};

function writeReport(jsonPath, markdownPath) {
  fs.mkdirSync(path.dirname(path.join(root, jsonPath)), { recursive: true });
  fs.writeFileSync(path.join(root, jsonPath), `${JSON.stringify(report, null, 2)}\n`);
  fs.mkdirSync(path.dirname(path.join(root, markdownPath)), { recursive: true });
  fs.writeFileSync(path.join(root, markdownPath), renderMarkdown(report));
}

writeReport(STYLE_AUDIT_CONFIG.artifactJson, STYLE_AUDIT_CONFIG.artifactMarkdown);
if (updateBaseline) writeReport(STYLE_AUDIT_CONFIG.baselineJson, STYLE_AUDIT_CONFIG.baselineMarkdown);

if (check) {
  if (!fs.existsSync(path.join(root, STYLE_AUDIT_CONFIG.baselineJson))) {
    console.error("Style audit baseline is missing. Run npm run styles:audit:update-baseline.");
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(path.join(root, STYLE_AUDIT_CONFIG.baselineJson), "utf8"));
  const regressions = [];
  for (const [key, value] of Object.entries(report.summary)) {
    const baselineValue = baseline.summary?.[key];
    if (typeof value === "number" && typeof baselineValue === "number" && value > baselineValue) {
      regressions.push(`${key}: ${baselineValue} -> ${value}`);
    }
  }
  const baselineIds = new Set((baseline.findings ?? []).map((item) => item.id));
  const newForbidden = report.findings.filter((item) => item.status !== "allowed" && !baselineIds.has(item.id));
  if (regressions.length || newForbidden.length) {
    console.error("Style audit ratchet failed.");
    for (const regression of regressions) console.error(`- ${regression}`);
    for (const item of newForbidden.slice(0, 25)) console.error(`- new ${item.category}: ${item.path}:${item.line}`);
    process.exit(1);
  }
}

console.log(JSON.stringify(report.summary, null, 2));
