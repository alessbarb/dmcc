import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4877",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "rm -rf .tmp/e2e-data && npm run build && SESSION_SECRET=e2e-session-secret-at-least-32-characters DMCC_DATA_DIR=.tmp/e2e-data DMCC_PUBLIC_DIR=dist/public PORT=4877 node dist/src/backend/entry/index.js",
    port: 4877,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
