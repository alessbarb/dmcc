import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../src/frontend/shared/api/apiClient.js";

describe("apiFetch", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses same-origin credentials and sends no client identity headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/api/me/campaigns", {
      vaultId: "vault_a",
      init: { headers: { "x-role": "dm", "x-player-id": "spoofed" } },
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("include");
    expect(init.headers.has("x-vault-id")).toBe(false);
    expect(init.headers.has("x-role")).toBe(false);
    expect(init.headers.has("x-player-id")).toBe(false);
    expect(init.headers.has("x-dm-token")).toBe(false);
    expect(init.headers.has("x-player-token")).toBe(false);
  });
});
