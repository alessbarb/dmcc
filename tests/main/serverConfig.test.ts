import { describe, expect, it } from "vitest";
import { resolveListenHost } from "../../src/main/serverConfig.js";

describe("server listen configuration", () => {
  it("listens on localhost by default (LAN mode must be explicitly enabled)", () => {
    expect(resolveListenHost({})).toBe("127.0.0.1");
  });

  it("honors an explicit DMCC_HOST override", () => {
    expect(resolveListenHost({ DMCC_HOST: "0.0.0.0" })).toBe("0.0.0.0");
  });
});
