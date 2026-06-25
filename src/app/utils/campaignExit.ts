export type CampaignExitDecision = "exit-now" | "confirm-close-session";

export function getCampaignExitDecision(sessions: Array<{ status?: string }> | null | undefined): CampaignExitDecision {
  return sessions?.some(session => session.status === "active") ? "confirm-close-session" : "exit-now";
}
