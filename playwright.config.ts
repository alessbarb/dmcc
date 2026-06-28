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
    command: "rm -rf .tmp/e2e-data && npm run build && DMCC_DATA_DIR=.tmp/e2e-data DMCC_PORT=4877 node dist/src/backend/entry/index.js",
    port: 4877,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
