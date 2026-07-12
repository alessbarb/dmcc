import React, { useEffect } from "react";

const REFRESH_EVENTS = [
  "player.portal.updated",
  "campaign.updated",
  "projection.updated",
  "invitation.accepted",
] as const;

export function PlayerPortalRealtimeSync() {
  useEffect(() => {
    if (window.location.pathname !== "/portal") return;
    const campaignId = new URLSearchParams(window.location.search).get("campaignId");
    if (!campaignId) return;

    const source = new EventSource(`/api/campaigns/${encodeURIComponent(campaignId)}/events/stream`);
    let refreshTimer: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer !== null) return;
      refreshTimer = window.setTimeout(() => window.location.reload(), 180);
    };

    for (const eventName of REFRESH_EVENTS) {
      source.addEventListener(eventName, scheduleRefresh);
    }

    return () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      for (const eventName of REFRESH_EVENTS) {
        source.removeEventListener(eventName, scheduleRefresh);
      }
      source.close();
    };
  }, []);

  return null;
}
