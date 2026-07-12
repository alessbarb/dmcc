export type CampaignRealtimeEvent = {
  campaignId: string;
  type:
    | "campaign.updated"
    | "projection.updated"
    | "player.portal.updated"
    | "invitation.accepted"
    | "campaign.message.created"
    | "campaign.message.read";
  sequence?: number;
  playerId?: string;
  messageId?: string;
};

type Listener = (event: CampaignRealtimeEvent) => void;

class CampaignEventBus {
  private readonly listeners = new Map<string, Map<string, Listener>>();

  subscribe(campaignId: string, listenerId: string, listener: Listener): void {
    let campaignListeners = this.listeners.get(campaignId);
    if (!campaignListeners) {
      campaignListeners = new Map();
      this.listeners.set(campaignId, campaignListeners);
    }
    campaignListeners.set(listenerId, listener);
  }

  unsubscribe(campaignId: string, listenerId: string): void {
    const campaignListeners = this.listeners.get(campaignId);
    if (!campaignListeners) return;
    campaignListeners.delete(listenerId);
    if (campaignListeners.size === 0) this.listeners.delete(campaignId);
  }

  publish(campaignId: string, event: Omit<CampaignRealtimeEvent, "campaignId">): void {
    const campaignListeners = this.listeners.get(campaignId);
    if (!campaignListeners) return;
    const payload = { campaignId, ...event };
    for (const listener of campaignListeners.values()) {
      listener(payload);
    }
  }
}

export const campaignEventBus = new CampaignEventBus();
