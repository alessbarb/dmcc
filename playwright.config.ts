import { defineConfig } from "@playwright/test";
import { assertLocalTestDatabase } from "./tests/assertLocalTestDatabase.js";

assertLocalTestDatabase("Playwright end-to-end tests");

const PLAYWRIGHT_PORT = 4887;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PLAYWRIGHT_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command:
      "rm -rf .tmp/e2e-data" +
      " && npm run build" +
      " && NODE_ENV=test" + 
      " DMCC_DATA_DIR=.tmp/e2e-data" +
      " DMCC_PUBLIC_DIR=dist/public" + 
      ` PORT=${PLAYWRIGHT_PORT}` +
      ` DMCC_PORT=${PLAYWRIGHT_PORT}` +
      ` DMCC_PUBLIC_ORIGIN=http://127.0.0.1:${PLAYWRIGHT_PORT}` +
      ` PUBLIC_APP_URL=http://127.0.0.1:${PLAYWRIGHT_PORT}` +
      " node dist/src/backend/entry/index.js",
    port: PLAYWRIGHT_PORT,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
