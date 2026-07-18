import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { RULE_CATEGORY_IDS } from "@shared/rules/categories.js";

type RuleEntry = {
  id: string;
  title: string;
  category: string;
  subtitle?: string;
  content: string;
};

const RULES_DATA_URL = new URL("../../../../core/domain/rules/data/srd_rules.json", import.meta.url);
let cachedRules: RuleEntry[] | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRuleEntry(value: unknown): value is RuleEntry {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.category === "string"
    && typeof value.content === "string";
}

async function loadRules(): Promise<RuleEntry[]> {
  if (cachedRules) return cachedRules;

  try {
    const source = (await readFile(RULES_DATA_URL, "utf8")).trim();
    if (!source) {
      cachedRules = [];
      return cachedRules;
    }

    const parsed = JSON.parse(source);
    cachedRules = Array.isArray(parsed) ? parsed.filter(isRuleEntry) : [];
  } catch {
    cachedRules = [];
  }

  return cachedRules;
}

export async function registerRulesWebRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/rules/categories", async () => ({
    categories: Object.values(RULE_CATEGORY_IDS),
  }));

  server.get<{ Querystring: { category?: string; q?: string } }>("/api/rules/search", async (request) => {
    const rules = await loadRules();
    const category = request.query.category?.trim();
    const query = request.query.q?.trim().toLocaleLowerCase() ?? "";

    const results = rules.filter((rule) => {
      if (category && rule.category !== category) return false;
      if (!query) return true;
      return [rule.title, rule.subtitle ?? "", rule.content]
        .some((value) => value.toLocaleLowerCase().includes(query));
    });

    return { results, total: results.length };
  });
}
