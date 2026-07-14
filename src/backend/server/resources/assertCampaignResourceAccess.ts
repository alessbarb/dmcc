import { HttpError } from "../errors.js";
import type { CampaignResourceRef } from "@core/domain/resource/resourceRef.js";
import { resolveCampaignResource } from "./resolveCampaignResource.js";
import type { ResolvedCampaignResource } from "./CampaignResourceResolver.js";

/**
 * Confirms a resource ref exists and belongs to the given campaign before a
 * shortcut (or similar personal reference) is created against it. An archived
 * target is allowed through — callers surface it as archived, they don't
 * silently drop it — only a missing/foreign target is rejected.
 */
export async function assertCampaignResourceAccess(
  campaignId: string,
  ref: CampaignResourceRef,
): Promise<ResolvedCampaignResource> {
  const resource = await resolveCampaignResource(campaignId, ref);
  if (!resource) {
    throw new HttpError(`Resource ${ref.type}:${ref.resourceId} not found in campaign ${campaignId}`, 404);
  }
  return resource;
}
