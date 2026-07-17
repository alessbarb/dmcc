export const STYLE_AUDIT_CONFIG = {
  roots: ["src/frontend"],
  extensions: [".css", ".ts", ".tsx", ".svg"],
  artifactJson: ".artifacts/style-audit.json",
  artifactMarkdown: ".artifacts/style-audit.md",
  baselineJson: "docs/audits/style-audit-baseline.json",
  baselineMarkdown: "docs/audits/style-audit-baseline.md",
  colorLiteralAllow: [
    /^src\/frontend\/account\/(defaultTheme|fantasyTheme|sciFiTheme)\.ts$/,
  ],
  cssVariablePrefixes: [
    "--theme-",
    "--font-",
    "--space-",
    "--transition-",
    "--touch-target-",
    "--app-footer-",
    "--typography-",
    "--entity-detail-",
    "--campaign-progress",
    "--drift",
    "--timeline-event-",
    "--xy-",
    "--rf-",
  ],
  legacyVariablePrefixes: [
    "--bg-",
    "--surface-",
    "--text-",
    "--border-",
    "--accent-",
    "--semantic-",
    "--entity-",
    "--radius-",
    "--shadow-",
    "--color-primary",
    "--primary",
  ],
  genericSelectors: [
    ".card",
    ".panel",
    ".grid",
    ".header",
    ".content",
    ".actions",
    ".modal-header",
    ".modal-body",
    ".modal-footer",
  ],
  monolith: {
    warningLines: 400,
    criticalLines: 500,
    warningSelectors: 30,
    criticalSelectors: 45,
  },
  layerRules: [
    { match: /shared\/styles\/tokens\.css$/, layer: "foundation", domain: "shared" },
    { match: /shared\/styles\/primitives\.css$/, layer: "primitive", domain: "shared" },
    { match: /shared\/styles\//, layer: "legacy", domain: "shared" },
    { match: /account\/account\.css$/, layer: "legacy", domain: "account" },
    { match: /workspaces?\//, layer: "layout", domain: "workspace" },
    { match: /layouts?\//, layer: "layout", domain: "layout" },
    { match: /institutional\//, layer: "feature", domain: "institutional" },
    { match: /admin\//, layer: "feature", domain: "admin" },
    { match: /player\//, layer: "feature", domain: "player" },
    { match: /dm\/([^/]+)\//, layer: "feature", domainFromMatch: 1 },
    { match: /shared\/components\//, layer: "component", domain: "shared-components" },
  ],
};

export function classifyStylePath(path) {
  for (const rule of STYLE_AUDIT_CONFIG.layerRules) {
    const match = path.match(rule.match);
    if (!match) continue;
    return {
      layer: rule.layer,
      domain: rule.domainFromMatch ? match[rule.domainFromMatch] : rule.domain,
    };
  }
  return { layer: "unclassified", domain: "unknown" };
}
