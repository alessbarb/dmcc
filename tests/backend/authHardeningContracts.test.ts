import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const authRoutesPath = join(ROOT, "src/backend/server/web/routes/authWebRoutes.ts");

describe("authentication hardening", () => {
  it("bounds and prunes in-memory authentication state", () => {
    const source = readFileSync(authRoutesPath, "utf8");

    expect(source).toContain("AUTH_STATE_MAX_ENTRIES");
    expect(source).toContain("pruneExpiringMap");
    expect(source).toContain("while (entries.size >= AUTH_STATE_MAX_ENTRIES)");
  });

  it("performs an Argon2 verification for nonexistent accounts", () => {
    const source = readFileSync(authRoutesPath, "utf8");

    expect(source).toContain("fallbackPasswordHashPromise");
    expect(source).toContain("const fallbackPasswordHash = await fallbackPasswordHashPromise");
    expect(source).toContain("await argon2.verify(fallbackPasswordHash, password)");
    expect(source).toContain("recordFailedLogin(loginLockouts, email)");
  });

  it("registers Fastify routes synchronously", () => {
    const source = readFileSync(authRoutesPath, "utf8");
    const firstRoute = source.indexOf("server.post<");
    const setup = source.slice(source.indexOf("export function registerAuthWebRoutes"), firstRoute);

    expect(setup).toContain("fallbackPasswordHashPromise = argon2.hash");
    expect(setup).not.toContain("await argon2.hash");
  });
});
