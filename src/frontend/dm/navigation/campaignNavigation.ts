import { CAMPAIGN_SECTIONS } from "./campaignSections.js";

export type CampaignNavigationItemLike = {
  path: string;
};

export const CAMPAIGN_MOBILE_DOCK_PRIORITY = [
  "overview",
  "session",
  "library",
  "map",
] as const;

export function orderCampaignMobileDockItems<T extends CampaignNavigationItemLike>(
  items: readonly T[],
  priority: readonly string[] = CAMPAIGN_MOBILE_DOCK_PRIORITY,
): T[] {
  const prioritized = priority
    .map((path) => items.find((item) => item.path === path))
    .filter((item): item is T => Boolean(item));

  const prioritySet = new Set(priority);
  return [
    ...prioritized,
    ...items.filter((item) => !prioritySet.has(item.path)),
  ];
}
