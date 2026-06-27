import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4877",
    trace: "on-first-retry",
    video: "off",
  },
  webServer: {
    command: "rm -rf .tmp/e2e-data && DMCC_DATA_DIR=.tmp/e2e-data DMCC_PORT=4877 npx tsx src/backend/entry/index.ts",
    port: 4877,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
