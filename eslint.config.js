import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "dist/**",
    "node_modules/**",
    "coverage/**",
    "playwright-report/**",
    ".remember/**",
    "release/**",
    ".claude/**",
    ".agents/**",
    ".codex/**",
    ".worktrees/**",
    ".playwright-mcp/**",
    ".tmp/**",
    "**/.tmp/**",
    ".artifacts/**",
    "scratch/**",
    "tmp/**",
    "**/git-state-*/**",
  ]),

  {
    files: ["**/*.{ts,tsx}"],

    extends: [tseslint.configs.recommended],

    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "vite.config.ts",
            "vitest.config.ts",
            "vitest.integration.config.ts",
            "vitest.benchmark.config.ts",
            "drizzle.config.ts",
            "playwright.config.ts",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },

    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-type-assertion": "warn",
    },
  },

  {
    files: ["scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
    },
  },

  {
    files: [
      "src/core/application/commands.ts",
      "src/core/application/commandBus.ts",
      "src/core/domain/state.ts",
      "src/core/domain/campaign/**/*.ts",
      "src/core/domain/entity/entity.ts",
      "src/core/domain/entity/types.ts",
      "src/core/domain/relation/relation.ts",
      "src/core/domain/session/session.ts",
      "src/core/domain/session/types.ts",
      "src/core/domain/premade/**/*.ts",
      "src/core/domain/rules/types.ts",
      "src/core/domain/entity/revelationAnchors.ts",
      "src/core/persistence/repositories/campaignRepository.ts",
      "src/core/projections/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
    },
  },

  {
    files: [
      "src/frontend/shared/api/webProductClient.ts",
      "src/frontend/SmartLanding.tsx",
      "src/frontend/dm/pages/CommandCenterPage.tsx",
      "src/frontend/dm/components/LiveTableModal.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
    },
  },

  {
    files: ["tests/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
