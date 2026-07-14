import type { ShortcutTargetType } from "@core/domain/resource/resourceType.js";
import type { CampaignResourceRef } from "@core/domain/resource/resourceRef.js";

export interface CampaignResourceLocation {
  pathname: string;
  search?: Record<string, string>;
}

interface ResourceNavigationDefinition {
  type: ShortcutTargetType;
  location: (campaignId: string, resourceId: string) => CampaignResourceLocation;
}

const RESOURCE_NAVIGATION: Record<ShortcutTargetType, ResourceNavigationDefinition> = {
  entity: {
    type: "entity",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/library/list`,
      search: { entityId: resourceId },
    }),
  },
  session: {
    type: "session",
    location: (campaignId) => ({
      pathname: `/campaigns/${campaignId}/session`,
    }),
  },
  canvas: {
    type: "canvas",
    location: (campaignId, resourceId) => ({
      pathname: `/campaigns/${campaignId}/map/canvas`,
      search: { canvasId: resourceId },
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
  const definition = RESOURCE_NAVIGATION[ref.type as ShortcutTargetType];
  if (!definition) return undefined;
  return definition.location(campaignId, ref.resourceId);
}
