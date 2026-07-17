import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const write = (file, content) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.endsWith("\n") ? content : `${content}\n`);
};

const tokensPath = "src/frontend/shared/styles/tokens.css";
const indexPath = "src/frontend/shared/styles/index.css";
const p1Path = "src/frontend/shared/styles/p1.css";
const mainTsxPath = "src/frontend/main.tsx";
const playerShellPath = "src/frontend/player/pages/PlayerCampaignShell.tsx";

const tokens = read(tokensPath);
const index = read(indexPath);
const p1 = read(p1Path);
const mainTsx = read(mainTsxPath);
const playerShell = read(playerShellPath);

const fontFaces = [...tokens.matchAll(/@font-face\s*\{[\s\S]*?\}\s*/g)].map((match) => match[0].trim()).join("\n\n");
const rootBlock = tokens.match(/:root\s*\{([\s\S]*?)\}/)?.[1];
if (!fontFaces || !rootBlock) throw new Error("Could not parse tokens.css");

const structuralLines = rootBlock
  .split("\n")
  .filter((line) => !line.includes("color-scheme:"))
  .join("\n")
  .trim();

write("src/frontend/shared/styles/foundation/fonts.css", `${fontFaces}\n`);
write("src/frontend/shared/styles/foundation/structural-tokens.css", `:root {\n${structuralLines}\n}\n`);
write("src/frontend/shared/styles/foundation/color-scheme.css", `:root {\n  color-scheme: light dark;\n}\n\n:root[data-color-mode="dark"] {\n  color-scheme: dark;\n}\n\n:root[data-color-mode="light"] {\n  color-scheme: light;\n}\n`);

const withoutImports = index.replace(/^(?:@import[^\n]+\n){4}\n?/, "");
const watermarkIndex = withoutImports.indexOf(".watermark");
if (watermarkIndex < 0) throw new Error("Could not locate legacy boundary in index.css");
const foundationReset = withoutImports.slice(0, watermarkIndex).trim();
const legacy = withoutImports.slice(watermarkIndex).trim();

write("src/frontend/shared/styles/foundation/reset.css", `${foundationReset}\n`);
write("src/frontend/shared/styles/foundation/accessibility.css", `/* Global accessibility rules belong here. Component-specific accessibility remains local. */\n\n:where([hidden]) {\n  display: none !important;\n}\n`);
write("src/frontend/shared/styles/foundation/motion.css", `/* The runtime exposes reduced-motion preferences through the theme contract. */\n\n@media (prefers-reduced-motion: reduce) {\n  :root {\n    scroll-behavior: auto;\n  }\n}\n`);
write("src/frontend/shared/styles/legacy.css", `${legacy}\n`);
write("src/frontend/player/pages/playerCampaignShell.css", p1);

write("src/frontend/shared/styles/main.css", `@import "./foundation/fonts.css";\n@import "./foundation/structural-tokens.css";\n@import "./foundation/color-scheme.css";\n@import "./foundation/reset.css";\n@import "./foundation/accessibility.css";\n@import "./foundation/motion.css";\n\n@import "./primitives.css";\n@import "./landing.css";\n@import "../../account/account.css";\n\n/* Temporary feature/layout debt. Removed progressively by the approved sprint sequence. */\n@import "./legacy.css";\n`);

const nextMain = mainTsx
  .replace('import "./shared/styles/index.css";\nimport "./shared/styles/p1.css";', 'import "./shared/styles/main.css";');
if (nextMain === mainTsx) throw new Error("main.tsx style imports did not match expected source");
write(mainTsxPath, nextMain);

const nextPlayerShell = playerShell.includes('import "./playerCampaignShell.css";')
  ? playerShell
  : playerShell.replace(
      'import { usePlayerCampaignHome, type PlayerCampaignTab } from "./PlayerCampaignTabContent.js";',
      'import { usePlayerCampaignHome, type PlayerCampaignTab } from "./PlayerCampaignTabContent.js";\nimport "./playerCampaignShell.css";',
    );
write(playerShellPath, nextPlayerShell);

for (const obsolete of [tokensPath, indexPath, p1Path]) {
  fs.rmSync(path.join(root, obsolete));
}

console.log("Global style foundation migrated.");
