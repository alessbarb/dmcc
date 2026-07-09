import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

const TEST_SESSION_SECRET = "0123456789abcdef0123456789abcdef";

async function createPublicDir(): Promise<string> {
  const publicDir = await mkdtemp(join(tmpdir(), "dmcc-public-"));
  await writeFile(
    join(publicDir, "index.html"),
    "<!doctype html><html><head><style>body{margin:0}</style></head><body><script>window.__dmcc=1</script></body></html>",
    "utf8",
  );
  return publicDir;
}

describe("security headers", () => {
  const previousPublicDir = process.env.DMCC_PUBLIC_DIR;
  const previousSessionSecret = process.env.SESSION_SECRET;
  const previousNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (previousPublicDir === undefined) delete process.env.DMCC_PUBLIC_DIR;
    else process.env.DMCC_PUBLIC_DIR = previousPublicDir;

    if (previousSessionSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previousSessionSecret;

    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  });

  it("applies Helmet and a nonce-based CSP in legacy mode", async () => {
    process.env.DMCC_PUBLIC_DIR = await createPublicDir();
    process.env.NODE_ENV = "test";
    const server = createServer({ storageMode: "legacy" });

    const response = await server.inject({ method: "GET", url: "/" });
    await server.close();

    const csp = response.headers["content-security-policy"];
    expect(csp).toBeTypeOf("string");
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.body).toContain("<script nonce=");
    expect(response.body).toContain("<style nonce=");
  });

  it("keeps unsafe-eval out of the postgres CSP", async () => {
    process.env.DMCC_PUBLIC_DIR = await createPublicDir();
    process.env.SESSION_SECRET = TEST_SESSION_SECRET;
    process.env.NODE_ENV = "test";
    const server = createServer({ storageMode: "postgres" });

    const response = await server.inject({ method: "GET", url: "/" });
    await server.close();

    const csp = response.headers["content-security-policy"];
    expect(csp).toBeTypeOf("string");
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("adds explicit HSTS in production", async () => {
    process.env.DMCC_PUBLIC_DIR = await createPublicDir();
    process.env.NODE_ENV = "production";
    const server = createServer({ storageMode: "legacy" });

    const response = await server.inject({ method: "GET", url: "/" });
    await server.close();

    expect(response.headers["strict-transport-security"]).toBe("max-age=31536000; includeSubDomains; preload");
  });
});
