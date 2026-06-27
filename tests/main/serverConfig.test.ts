import { describe, expect, it } from "vitest";
import { resolveListenHost } from "../../src/main/serverConfig.js";

describe("server listen configuration", () => {
  it("listens on all interfaces by default so advertised LAN URLs can connect", () => {
    expect(resolveListenHost({})).toBe("0.0.0.0");
  });

  it("honors an explicit DMCC_HOST override", () => {
    expect(resolveListenHost({ DMCC_HOST: "127.0.0.1" })).toBe("127.0.0.1");
  });
});
