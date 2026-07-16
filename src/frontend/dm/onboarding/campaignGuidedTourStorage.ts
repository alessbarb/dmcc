export interface StoredCampaignGuidedTourState {
  completedAt?: string;
  dismissedAt?: string;
}

const CAMPAIGN_GUIDED_TOUR_VERSION = "v1";
const PENDING_CAMPAIGN_GUIDED_TOUR_KEY = "dmcc_pending_campaign_tour_id";

function getCampaignGuidedTourStorageKey(campaignId: string): string {
  return `dmcc_campaign_guided_tour_${CAMPAIGN_GUIDED_TOUR_VERSION}:${campaignId}`;
}

export function readCampaignGuidedTourState(campaignId: string): StoredCampaignGuidedTourState {
  try {
    const raw = localStorage.getItem(getCampaignGuidedTourStorageKey(campaignId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredCampaignGuidedTourState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeCampaignGuidedTourState(campaignId: string, state: StoredCampaignGuidedTourState): void {
  try {
    localStorage.setItem(getCampaignGuidedTourStorageKey(campaignId), JSON.stringify(state));
  } catch {}
}

export function markCampaignGuidedTourPending(campaignId: string): void {
  try {
    sessionStorage.setItem(PENDING_CAMPAIGN_GUIDED_TOUR_KEY, campaignId);
  } catch {}
}

export function getPendingCampaignGuidedTourId(): string | null {
  try {
    return sessionStorage.getItem(PENDING_CAMPAIGN_GUIDED_TOUR_KEY);
  } catch {
    return null;
  }
}

export function clearPendingCampaignGuidedTour(campaignId: string): void {
  try {
    if (sessionStorage.getItem(PENDING_CAMPAIGN_GUIDED_TOUR_KEY) === campaignId) {
      sessionStorage.removeItem(PENDING_CAMPAIGN_GUIDED_TOUR_KEY);
    }
  } catch {}
}
