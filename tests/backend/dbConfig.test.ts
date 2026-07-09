import { describe, expect, it } from "vitest";
import { LOCAL_DEV_DATABASE_URL, resolveDatabaseConnectionString } from "../../src/backend/db/config.js";

describe("database connection configuration", () => {
  it("uses the local development database URL only outside production", () => {
    expect(resolveDatabaseConnectionString({ NODE_ENV: "development" })).toBe(LOCAL_DEV_DATABASE_URL);
  });

  it("requires DATABASE_URL in production", () => {
    expect(() => resolveDatabaseConnectionString({ NODE_ENV: "production" })).toThrow(/DATABASE_URL must be set/);
  });

  it("uses an explicit DATABASE_URL in production", () => {
    const databaseUrl = "postgresql://dmcc_app:unique-secret@example.com:5432/dmcc";

    expect(resolveDatabaseConnectionString({ NODE_ENV: "production", DATABASE_URL: databaseUrl })).toBe(databaseUrl);
  });
});
