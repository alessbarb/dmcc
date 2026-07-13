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
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",

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
    files: ["tests/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
