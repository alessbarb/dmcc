export function getValidatedCampaignId(campaignId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(campaignId)) {
    const err = new Error("Invalid campaign ID format");
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }
  return campaignId;
}
