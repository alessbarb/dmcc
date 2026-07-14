import { PostgresCampaignRepository } from "../web/postgresCampaignRepository.js";
import type { CampaignResourceRef } from "@core/domain/resource/resourceRef.js";
import { campaignResourceRefKey } from "@core/domain/resource/resourceRef.js";

export interface ResolvedCampaignResource {
  ref: CampaignResourceRef;
  campaignId: string;
  title: string;
  subtitle?: string;
  archived: boolean;
  mimeType?: string;
  capabilities: {
    navigable: boolean;
    canvasPlaceable: boolean;
  };
}

/**
 * Resolves campaign resource refs (entity/session/canvas — the subset with a
 * ShortcutTargetType today) to display metadata, in batch. Entities, sessions
 * and canvases are all only reconstructible from the event-sourced campaign
 * aggregate (there's no standalone read-model table for any of them with the
 * live title/archived fields), so this loads the aggregate at most once per
 * call regardless of how many refs or types are requested — never once per ref.
 */
export async function resolveManyCampaignResources(
  campaignId: string,
  refs: CampaignResourceRef[],
): Promise<Map<string, ResolvedCampaignResource>> {
  const resolved = new Map<string, ResolvedCampaignResource>();
  if (refs.length === 0) return resolved;

  const repository = new PostgresCampaignRepository();
  const projection = await repository.getCampaignState(campaignId);

  for (const ref of refs) {
    const key = campaignResourceRefKey(ref);
    if (ref.type === "entity") {
      const entity = projection.entities.get(ref.resourceId);
      if (!entity) continue;
      resolved.set(key, {
        ref,
        campaignId,
        title: entity.title,
        subtitle: entity.subtitle,
        archived: entity.archived,
        capabilities: { navigable: true, canvasPlaceable: true },
      });
    } else if (ref.type === "session") {
      const session = projection.sessions.get(ref.resourceId);
      if (!session) continue;
      resolved.set(key, {
        ref,
        campaignId,
        title: session.title,
        archived: session.status === "archived",
        capabilities: { navigable: true, canvasPlaceable: false },
      });
    } else if (ref.type === "canvas") {
      const canvas = projection.canvases.get(ref.resourceId);
      if (!canvas) continue;
      resolved.set(key, {
        ref,
        campaignId,
        title: canvas.title,
        archived: canvas.archived,
        capabilities: { navigable: true, canvasPlaceable: false },
      });
    }
    // fact/relation/session_event/attachment/notebook/story_* resolution is
    // out of scope here — they gain ShortcutTargetType support (and thus a
    // resolver case) in the PR that introduces their navigation definition.
  }

  return resolved;
}
