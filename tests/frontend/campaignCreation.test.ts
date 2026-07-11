import { beforeEach, describe, expect, it, vi } from "vitest";

const createCampaignMock = vi.fn();
const listCampaignsMock = vi.fn();
const markCampaignGuidedTourPendingMock = vi.fn();

vi.mock("../../src/frontend/shared/api.js", () => ({
  API_CLIENT_TAB_ID: "test-tab",
  readApiError: vi.fn(),
  campaignApi: {
    createCampaign: createCampaignMock,
    listCampaigns: listCampaignsMock,
  },
  canvasApi: {},
  dmDashboardApi: {},
  playerPortalApi: {},
  getPremadeLocale: vi.fn(() => "en"),
  getPremade: vi.fn(),
  importPremade: vi.fn(),
  listPremades: vi.fn(),
}));

vi.mock("../../src/frontend/dm/onboarding/campaignGuidedTourStorage.js", () => ({
  markCampaignGuidedTourPending: markCampaignGuidedTourPendingMock,
}));

describe("campaign creation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    listCampaignsMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    const { useCampaignStore } = await import("../../src/frontend/shared/stores/campaignStore.js");
    useCampaignStore.setState({ campaigns: [], activeCampaignId: null, loading: false, error: null });
  });

  it("uses the backend campaignId and does not send a frontend-generated campaignId", async () => {
    createCampaignMock.mockResolvedValue(new Response(JSON.stringify({ campaignId: "cmp_backend_123" }), { status: 201 }));
    const { useCampaignStore } = await import("../../src/frontend/shared/stores/campaignStore.js");

    const campaignId = await useCampaignStore.getState().createCampaign("Backend ID", "dnd5e", "https://example.test/cover.png");

    expect(campaignId).toBe("cmp_backend_123");
    expect(createCampaignMock).toHaveBeenCalledWith({
      title: "Backend ID",
      system: "dnd5e",
      coverUrl: "https://example.test/cover.png",
    });
    expect(createCampaignMock.mock.calls[0][0]).not.toHaveProperty("campaignId");
    expect(markCampaignGuidedTourPendingMock).toHaveBeenCalledWith("cmp_backend_123");
  });
});
