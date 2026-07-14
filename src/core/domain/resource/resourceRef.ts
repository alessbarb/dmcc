import type { CampaignResourceType } from "./resourceType.js";

export interface CampaignResourceRef {
  type: CampaignResourceType;
  resourceId: string;
}

/** Stable key for a resource ref, used as a Map key in batch resolution. */
export function campaignResourceRefKey(ref: CampaignResourceRef): string {
  return `${ref.type}:${ref.resourceId}`;
}
