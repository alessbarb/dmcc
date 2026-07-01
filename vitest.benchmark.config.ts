import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@frontend": resolve(__dirname, "src/frontend"),
      "@backend": resolve(__dirname, "src/backend"),
      "@core": resolve(__dirname, "src/core"),
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  test: {
    disableConsoleIntercept: true,
    globals: true,
    include: ["scripts/benchmark-event-store.ts"],
  },
});
