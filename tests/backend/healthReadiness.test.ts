import { describe, expect, it } from "vitest";
import { checkDatabaseReadiness } from "../../src/backend/server/web/routes/healthWebRoutes.js";

describe("database readiness", () => {
  it("reports ready when PostgreSQL responds", async () => {
    await expect(checkDatabaseReadiness(async () => ({ rows: [{ ok: 1 }] }))).resolves.toEqual({
      ready: true,
    });
  });

  it("reports an unavailable database without exposing the internal error", async () => {
    await expect(checkDatabaseReadiness(async () => {
      throw new Error("connection details must stay private");
    })).resolves.toEqual({
      ready: false,
      reason: "database_unavailable",
    });
  });
});
