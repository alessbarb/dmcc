import { describe, expect, it } from "vitest";
import { resolveListenHost } from "../../src/backend/entry/serverConfig.js";

describe("server listen configuration", () => {
  it("listens on localhost by default (remote exposure requires explicit host config)", () => {
    expect(resolveListenHost({})).toBe("127.0.0.1");
  });

  it("honors an explicit DMCC_HOST override", () => {
    expect(resolveListenHost({ DMCC_HOST: "0.0.0.0" })).toBe("0.0.0.0");
  });
});
