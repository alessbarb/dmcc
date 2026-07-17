import fs from "node:fs";
import { spawnSync } from "node:child_process";

const run = spawnSync(process.execPath, ["scripts/styles/auditStyles.mjs"], {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: "inherit",
});
if (run.status !== 0) process.exit(run.status ?? 1);

const current = JSON.parse(fs.readFileSync(".artifacts/style-audit.json", "utf8"));
const baseline = JSON.parse(fs.readFileSync("docs/audits/style-audit-baseline.json", "utf8"));

const debtMetrics = [
  "tsxFilesWithInlineStyles",
  "forbiddenLiteralColors",
  "staticInlineStyles",
  "unknownCssVariables",
  "legacyCssVariables",
  "orphanCssFiles",
  "mixedResponsibilityFiles",
  "crossComponentSelectors",
  "importantDeclarations",
  "unclassifiedCssFiles",
];

const regressions = [];
for (const metric of debtMetrics) {
  const before = baseline.summary?.[metric];
  const after = current.summary?.[metric];
  if (typeof before === "number" && typeof after === "number" && after > before) {
    regressions.push(`${metric}: ${before} -> ${after}`);
  }
}

function signature(finding) {
  return JSON.stringify([
    finding.category,
    finding.value ?? null,
    finding.reason,
    finding.status,
  ]);
}

function counts(findings) {
  const result = new Map();
  for (const finding of findings ?? []) {
    if (finding.status === "allowed") continue;
    const key = signature(finding);
    result.set(key, (result.get(key) ?? 0) + 1);
  }
  return result;
}

const baselineCounts = counts(baseline.findings);
const currentCounts = counts(current.findings);
for (const [key, count] of currentCounts) {
  const allowed = baselineCounts.get(key) ?? 0;
  if (count > allowed) regressions.push(`new style debt signature ${key}: ${allowed} -> ${count}`);
}

if (regressions.length > 0) {
  console.error("Style audit ratchet failed.");
  for (const regression of regressions.slice(0, 50)) console.error(`- ${regression}`);
  process.exit(1);
}

console.log("Style audit ratchet passed.");
console.log(JSON.stringify(current.summary, null, 2));
