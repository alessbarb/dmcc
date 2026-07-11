import { readFileSync, writeFileSync } from "node:fs";

for (const path of [
  "src/frontend/dm/hub/DmHubPage.tsx",
  "src/frontend/dm/pages/OnboardingPage.tsx",
  "src/frontend/dm/pages/PremadeCampaignPreviewPage.tsx",
]) {
  const source = readFileSync(path, "utf8").replaceAll(
    "/dashboard",
    "/command-center",
  );
  writeFileSync(path, source);
}

const testPath = "tests/frontend/imagePicker.test.ts";
let testSource = readFileSync(testPath, "utf8");
testSource = testSource
  .replace('describe("App campaign cover wiring"', 'describe("DM hub campaign cover wiring"')
  .replace('read("src/frontend/App.tsx")', 'read("src/frontend/dm/hub/DmHubPage.tsx")');
writeFileSync(testPath, testSource);
