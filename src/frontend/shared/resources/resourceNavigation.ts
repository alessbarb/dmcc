import type { CampaignResourceType, ShortcutTargetType } from "@core/domain/resource/resourceType.js";
import type { CampaignResourceRef } from "@core/domain/resource/resourceRef.js";

export interface CampaignResourceLocation {
  pathname: string;
  search?: Record<string, string>;
}

interface ResourceNavigationDefinition {
  type: ShortcutTargetType;
  location: (campaignId: string, resourceId: string) => CampaignResourceLocation;
}

const RESOURCE_NAVIGATION: Partial<Record<CampaignResourceType, ResourceNavigationDefinition>> = {
  entity: {
    type: "entity",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/library/list`,
      search: { entityId: resourceId },
    }),
  },
  session: {
    type: "session",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/sessions/${resourceId}`,
    }),
  },
  canvas: {
    type: "canvas",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/map/canvas`,
      search: { canvasId: resourceId },
    }),
  },
  notebook: {
    type: "notebook",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/library/notebooks`,
      search: { notebookId: resourceId },
    }),
  },
  story_thread: {
    type: "story_thread",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/story/plan`,
      search: { threadId: resourceId },
    }),
  },
  story_step: {
    type: "story_step",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/story/plan`,
      search: { stepId: resourceId },
    }),
  },
};

/**
 * Canonical navigation target for a campaign resource ref — never a generic
 * section with nothing selected. Only defined for ShortcutTargetType members;
 * other CampaignResourceType members gain an entry here when they get their
 * own ResourceNavigationDefinition in a later PR.
 */
export function campaignResourceLocation(
  campaignId: string,
  ref: CampaignResourceRef,
): CampaignResourceLocation | undefined {
  const definition = RESOURCE_NAVIGATION[ref.type];
  if (!definition) return undefined;
  return definition.location(campaignId, ref.resourceId);
}
