import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCommandCenter,
  getLiveTable,
  getPlayerConstellation,
  searchRules,
} from "../../src/frontend/shared/api/webProductClient.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("webProductClient contracts", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("getCommandCenter returns the parsed response shape on success", async () => {
    const payload = {
      campaign: { campaignId: "cmp_1", title: "Test Campaign", status: "active" },
      recap: "Last time...",
      lastSession: null,
      nextSession: null,
      attention: [],
      counts: {
        entities: 1,
        facts: 0,
        relations: 0,
        sessions: 0,
        clues: 0,
        objectives: 0,
        proposals: 0,
        hiddenSecrets: 0,
      },
      openObjectives: [],
      unresolvedClues: [],
      pendingProposals: [],
      recentActivity: [],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));

    const result = await getCommandCenter("cmp_1");

    expect(result.campaign?.campaignId).toBe("cmp_1");
    expect(result.counts.entities).toBe(1);
  });

  it("getCommandCenter throws a descriptive error when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "Campaign not found" }, 404)),
    );

    await expect(getCommandCenter("cmp_missing")).rejects.toThrow("Campaign not found");
  });

  it("getCommandCenter falls back to a generic message when the error body has no message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(getCommandCenter("cmp_1")).rejects.toThrow(/500/);
  });

  it("getLiveTable resolves to null when no live table is open", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ liveTable: null })));

    const result = await getLiveTable("cmp_1");

    expect(result.liveTable).toBeNull();
  });

  it("getPlayerConstellation surfaces the sanitized entities/relations/canvases", async () => {
    const payload = {
      campaign: { campaignId: "cmp_1" },
      entities: [{ entityId: "ent_1", entityType: "npc", title: "Oráculo", status: "active", importance: "normal" }],
      facts: [],
      relations: [],
      objectives: [],
      clues: [],
      canvases: [{ canvasId: "cvs_1", title: "Mundo", nodes: [], edges: [] }],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));

    const result = await getPlayerConstellation("cmp_1");

    expect(result.entities).toHaveLength(1);
    expect(result.canvases[0]?.canvasId).toBe("cvs_1");
  });

  it("searchRules maps raw rule records into CampaignSearchResult items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          results: [{ id: 42, title: "Grapple", content: "Rules text", category: "combat" }],
        }),
      ),
    );

    const { results } = await searchRules("grapple");

    expect(results).toEqual([
      {
        type: "rule",
        item: {
          id: "42",
          title: "Grapple",
          subtitle: undefined,
          summary: "Rules text",
          content: "Rules text",
          category: "combat",
        },
      },
    ]);
  });

  it("searchRules returns no results for a blank query without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { results } = await searchRules("   ");

    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
