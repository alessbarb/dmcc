import { t } from "../../../shared/i18n/translate.js";
import type { SupportedLocale } from "../../../shared/i18n/localeTypes.js";

export interface ActivityRecord {
  type: string;
  occurredAt: string;
  target?: string;
  data?: Record<string, unknown>;
}

export function formatActivity(activity: ActivityRecord, locale?: SupportedLocale): string {
  const type = activity.type;
  const target = activity.target || "";
  const data = activity.data || {};

  const translationKey = `activity.${type}`;
  const translated = t(translationKey, { target, ...data }, locale);
  if (translated !== translationKey) {
    return translated;
  }

  switch (type) {
    case "story_step_created":
    case "storyStepCreated":
      return t("activity.fallback.storyStepCreated", {}, locale);
    case "story_thread_archived":
    case "storyThreadArchived":
      return t("activity.fallback.storyThreadArchived", {}, locale);
    case "campaign_entity_updated":
    case "entityUpdated":
      return target 
        ? t("activity.fallback.entityUpdatedWithTarget", { target }, locale)
        : t("activity.fallback.entityUpdated", {}, locale);
    case "session_prepared":
    case "sessionPrepared":
      return target
        ? t("activity.fallback.sessionPreparedWithTarget", { target }, locale)
        : t("activity.fallback.sessionPrepared", {}, locale);
    case "npc_modified":
    case "npcModified":
      return t("activity.fallback.npcModified", {}, locale);
    case "clue_linked":
    case "clueLinked":
      return t("activity.fallback.clueLinked", {}, locale);
    default:
      return t("activity.fallback.default", {}, locale);
  }
}
