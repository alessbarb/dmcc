export type GuidedHelpLevel = "guided" | "normal" | "minimal";

interface GuidedStartPreferences {
  helpLevel: GuidedHelpLevel;
  hiddenStarterHubCampaignIds: string[];
  compactStarterHubCampaignIds: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const GUIDED_START_PREFS_KEY = "dmcc_guided_start_preferences_v1";
const DEFAULT_PREFS: GuidedStartPreferences = {
  helpLevel: "guided",
  hiddenStarterHubCampaignIds: [],
  compactStarterHubCampaignIds: [],
};

function safeReadPreferences(): GuidedStartPreferences {
  try {
    const raw = localStorage.getItem(GUIDED_START_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed: unknown = JSON.parse(raw);
    const record = isRecord(parsed) ? parsed : {};
    const helpLevel = record.helpLevel === "normal" || record.helpLevel === "minimal" ? record.helpLevel : "guided";
    return {
      helpLevel,
      hiddenStarterHubCampaignIds: Array.isArray(record.hiddenStarterHubCampaignIds) ? record.hiddenStarterHubCampaignIds.filter(Boolean) : [],
      compactStarterHubCampaignIds: Array.isArray(record.compactStarterHubCampaignIds) ? record.compactStarterHubCampaignIds.filter(Boolean) : [],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePreferences(prefs: GuidedStartPreferences): void {
  try {
    localStorage.setItem(GUIDED_START_PREFS_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("dmcc:guided-start-preferences-changed"));
  } catch {}
}

function updateCampaignList(list: string[], campaignId: string, enabled: boolean): string[] {
  const unique = new Set(list.filter(Boolean));
  if (enabled) unique.add(campaignId);
  else unique.delete(campaignId);
  return Array.from(unique);
}

export function readGuidedStartPreferences(): GuidedStartPreferences {
  return safeReadPreferences();
}

export function setGuidedHelpLevel(helpLevel: GuidedHelpLevel): void {
  const prefs = safeReadPreferences();
  writePreferences({ ...prefs, helpLevel });
}

export function isStarterHubHidden(campaignId: string): boolean {
  return safeReadPreferences().hiddenStarterHubCampaignIds.includes(campaignId);
}

export function setStarterHubHidden(campaignId: string, hidden: boolean): void {
  const prefs = safeReadPreferences();
  writePreferences({
    ...prefs,
    hiddenStarterHubCampaignIds: updateCampaignList(prefs.hiddenStarterHubCampaignIds, campaignId, hidden),
  });
}

export function isStarterHubCompact(campaignId: string): boolean {
  return safeReadPreferences().compactStarterHubCampaignIds.includes(campaignId);
}

export function setStarterHubCompact(campaignId: string, compact: boolean): void {
  const prefs = safeReadPreferences();
  writePreferences({
    ...prefs,
    compactStarterHubCampaignIds: updateCampaignList(prefs.compactStarterHubCampaignIds, campaignId, compact),
  });
}
