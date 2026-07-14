import type { CampaignResourceRef } from "@core/domain/resource/resourceRef.js";
import { campaignResourceRefKey } from "@core/domain/resource/resourceRef.js";
import { resolveManyCampaignResources } from "./CampaignResourceResolver.js";
import type { ResolvedCampaignResource } from "./CampaignResourceResolver.js";

/** Convenience wrapper over resolveManyCampaignResources for a single ref. */
export async function resolveCampaignResource(
  campaignId: string,
  ref: CampaignResourceRef,
): Promise<ResolvedCampaignResource | undefined> {
  const resolved = await resolveManyCampaignResources(campaignId, [ref]);
  return resolved.get(campaignResourceRefKey(ref));
}
