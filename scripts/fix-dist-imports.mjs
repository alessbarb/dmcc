import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

const root = process.cwd();
const distRoot = resolve(root, "dist");
const distSrcRoot = resolve(distRoot, "src");

const aliasRoots = {
  "@frontend/": resolve(distSrcRoot, "frontend"),
  "@backend/": resolve(distSrcRoot, "backend"),
  "@core/": resolve(distSrcRoot, "core"),
  "@shared/": resolve(distSrcRoot, "shared"),
};

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function toImportSpecifier(fromFile, targetFile) {
  let specifier = relative(dirname(fromFile), targetFile).split(sep).join("/");
  if (!specifier.startsWith(".")) specifier = `./${specifier}`;
  return specifier;
}

function rewriteAliasSpecifiers(filePath) {
  let content = readFileSync(filePath, "utf8");
  let changed = false;

  for (const [alias, targetRoot] of Object.entries(aliasRoots)) {
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(["'])${escapedAlias}([^"']+)(["'])`, "g");
    content = content.replace(pattern, (match, openQuote, subPath, closeQuote) => {
      const targetFile = resolve(targetRoot, subPath);
      const replacement = `${openQuote}${toImportSpecifier(filePath, targetFile)}${closeQuote}`;
      changed = true;
      return replacement;
    });
  }

  if (changed) writeFileSync(filePath, content, "utf8");
}

if (existsSync(distSrcRoot)) {
  for (const file of walk(distSrcRoot)) rewriteAliasSpecifiers(file);
}

const rulesSource = resolve(root, "src/core/domain/rules/data/srd_rules.json");
const rulesTarget = resolve(distSrcRoot, "core/domain/rules/data/srd_rules.json");
if (existsSync(rulesSource)) {
  mkdirSync(dirname(rulesTarget), { recursive: true });
  cpSync(rulesSource, rulesTarget);
}
