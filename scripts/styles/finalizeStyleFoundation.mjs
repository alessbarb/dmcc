import fs from "node:fs";

const indexPath = "src/frontend/shared/styles/index.css";
const mainPath = "src/frontend/shared/styles/main.css";
const tokensPath = "src/frontend/shared/styles/tokens.css";
const testPath = "tests/frontend/styleFoundationContracts.test.ts";

const index = fs.readFileSync(indexPath, "utf8");
const marker = ".watermark";
const markerIndex = index.indexOf(marker);
if (markerIndex < 0) throw new Error("Could not find the legacy stylesheet boundary");
fs.writeFileSync(indexPath, `${index.slice(markerIndex).trimStart()}\n`);

fs.writeFileSync(mainPath, `@import "./foundation/fonts.css";\n@import "./foundation/structural-tokens.css";\n@import "./foundation/color-scheme.css";\n@import "./foundation/reset.css";\n@import "./foundation/accessibility.css";\n@import "./foundation/motion.css";\n\n@import "./primitives.css";\n@import "./landing.css";\n@import "../../account/account.css";\n\n/* Legacy global rules are atomized by the approved domain sprints. */\n@import "./index.css";\n`);

if (fs.existsSync(tokensPath)) fs.rmSync(tokensPath);

const test = fs.readFileSync(testPath, "utf8")
  .replace(
    /const tokens = read\("src\/frontend\/shared\/styles\/tokens\.css"\);[\s\S]*?\n  \}\);/,
    `const entrypoint = read("src/frontend/shared/styles/main.css");\n    for (const file of [\n      "fonts.css",\n      "structural-tokens.css",\n      "color-scheme.css",\n      "reset.css",\n      "accessibility.css",\n      "motion.css",\n    ]) {\n      expect(entrypoint).toContain(\`./foundation/\${file}\`);\n    }\n  });`,
  )
  .replace(
    `expect(read("src/frontend/shared/styles/main.css").trim()).toBe('@import "./index.css";');`,
    `const entrypoint = read("src/frontend/shared/styles/main.css");\n    expect(entrypoint).toContain('@import "./foundation/reset.css";');\n    expect(entrypoint).toContain('@import "./index.css";');`,
  );
fs.writeFileSync(testPath, test);

console.log("Style foundation extraction finalized.");
