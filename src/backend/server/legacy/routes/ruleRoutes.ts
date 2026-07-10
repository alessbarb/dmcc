import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface RuleEntry {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  content: string;
}

function resolveRulesPath(): string | null {
  const candidates = [
    // Production build: dist/src/backend/server/legacy/routes -> dist/src/core/domain/rules/data
    path.resolve(__dirname, "../../../../../core/domain/rules/data/srd_rules.json"),
    // Source/dev execution: src/backend/server/legacy/routes -> src/core/domain/rules/data
    path.resolve(__dirname, "../../../../core/domain/rules/data/srd_rules.json"),
    // Fallbacks from project root for tests and unusual launch directories.
    path.resolve(process.cwd(), "src/core/domain/rules/data/srd_rules.json"),
    path.resolve(process.cwd(), "dist/src/core/domain/rules/data/srd_rules.json"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

export async function registerRuleRoutes(server: FastifyInstance, _opts: { dataDir: string }) {
  const rulesPath = resolveRulesPath();
  let srdRules: RuleEntry[] = [];

  try {
    if (rulesPath) {
      srdRules = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));
      server.log.info(`Loaded ${srdRules.length} D&D 5.2.1 rules entries from ${rulesPath}`);
    } else {
      server.log.warn("Rules file not found in source or production build paths");
    }
  } catch (err) {
    server.log.error(err, "Failed to load rules JSON");
  }

  // GET /api/rules/categories
  server.get("/api/rules/categories", async () => {
    const categories = Array.from(new Set(srdRules.map((r) => r.category)));
    return { categories };
  });

  // GET /api/rules/search?q=...&category=...
  server.get<{ Querystring: { q?: string; category?: string } }>(
    "/api/rules/search",
    async (request, _reply) => {
      const { q, category } = request.query;
      let filtered = srdRules;

      if (category) {
        filtered = filtered.filter((r) => r.category.toLowerCase() === category.toLowerCase());
      }

      if (q && q.trim() !== "") {
        const queryNorm = q.trim().toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(queryNorm) ||
            r.subtitle.toLowerCase().includes(queryNorm) ||
            r.content.toLowerCase().includes(queryNorm)
        );
      }

      // Limit results to prevent huge payloads
      return {
        results: filtered.slice(0, 50),
        total: filtered.length,
      };
    }
  );

  // GET /api/rules/:ruleId
  server.get<{ Params: { ruleId: string } }>("/api/rules/:ruleId", async (request, reply) => {
    const { ruleId } = request.params;
    const rule = srdRules.find((r) => r.id === ruleId);
    if (!rule) {
      reply.code(404);
      return { error: `Rule with ID '${ruleId}' not found` };
    }
    return rule;
  });
}
