import { t } from "../../../shared/i18n/translate.js";
import type { SupportedLocale } from "../../../shared/i18n/localeTypes.js";

export function formatSystemName(systemName: string | undefined | null, locale?: SupportedLocale): string {
  if (!systemName) return "";
  const name = systemName.trim().toLowerCase();
  if (name === "dnd_5e" || name === "dnd5e") return "D&D 5e";
  if (name === "pathfinder_2e" || name === "pathfinder2e") return "Pathfinder 2e";
  if (name === "shadowdark") return "Shadowdark";
  
  const translationKey = `systems.${systemName}`;
  const translated = t(translationKey, {}, locale);
  if (translated !== translationKey) {
    return translated;
  }
  
  return systemName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
