import { afterEach, describe, expect, it } from "vitest";
import type { FastifyReply } from "fastify";
import { setWebSessionCookie, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";

type SetCookieOptions = NonNullable<Parameters<FastifyReply["setCookie"]>[2]>;

type CapturedCookie = {
  name: string;
  value: string;
  options: SetCookieOptions;
};

const originalEnv = {
  DMCC_COOKIE_SAMESITE: process.env.DMCC_COOKIE_SAMESITE,
  COOKIE_SAMESITE: process.env.COOKIE_SAMESITE,
  DMCC_COOKIE_SECURE: process.env.DMCC_COOKIE_SECURE,
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  NODE_ENV: process.env.NODE_ENV,
};

function restoreEnv(): void {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function createCookieCaptureReply(): { reply: FastifyReply; cookies: CapturedCookie[] } {
  const cookies: CapturedCookie[] = [];
  const reply = {
    setCookie(name: string, value: string, options: SetCookieOptions) {
      cookies.push({ name, value, options });
      return this;
    },
  } as Partial<FastifyReply> as FastifyReply;

  return { reply, cookies };
}

describe("setWebSessionCookie", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("sets a secure cookie whenever SameSite=None is configured", () => {
    process.env.DMCC_COOKIE_SAMESITE = "none";
    delete process.env.DMCC_COOKIE_SECURE;
    delete process.env.COOKIE_SECURE;
    process.env.NODE_ENV = "test";
    const { reply, cookies } = createCookieCaptureReply();

    setWebSessionCookie(reply, "session-token", new Date("2030-01-01T00:00:00.000Z"));

    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toMatchObject({
      name: WEB_SESSION_COOKIE,
      value: "session-token",
      options: {
        sameSite: "none",
        secure: true,
      },
    });
  });

  it("rejects an explicit insecure SameSite=None configuration", () => {
    process.env.DMCC_COOKIE_SAMESITE = "none";
    process.env.DMCC_COOKIE_SECURE = "false";
    const { reply } = createCookieCaptureReply();

    expect(() => setWebSessionCookie(reply, "session-token", new Date("2030-01-01T00:00:00.000Z"))).toThrow(
      /SameSite=None requires Secure/,
    );
  });

  it("defaults to SameSite=Lax with non-secure cookies outside production", () => {
    delete process.env.DMCC_COOKIE_SAMESITE;
    delete process.env.COOKIE_SAMESITE;
    delete process.env.DMCC_COOKIE_SECURE;
    delete process.env.COOKIE_SECURE;
    process.env.NODE_ENV = "test";
    const { reply, cookies } = createCookieCaptureReply();

    setWebSessionCookie(reply, "session-token", new Date("2030-01-01T00:00:00.000Z"));

    expect(cookies[0]?.options).toMatchObject({
      sameSite: "lax",
      secure: false,
    });
  });
});
