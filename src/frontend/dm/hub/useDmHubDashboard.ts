import { useEffect, useMemo, useState } from "react";
import type { Campaign, PremadeCampaignTemplateSummary } from "../../shared/stores/campaignStore.js";
import { apiFetch } from "../../shared/api/apiClient.js";
import type {
  DmHubActiveTable,
  DmHubActivityItem,
  DmHubAlert,
  DmHubCampaign,
  DmHubCampaignStats,
  DmHubDashboard,
} from "./dmHubTypes.js";
import { detectBrowserLocale } from "@shared/i18n/index.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { readStoredLocale } from "../../shared/i18n/localeStorage.js";

const DEFAULT_CAMPAIGN_COVER = "/assets/campaigns/default-campaign-cover.jpg";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getPremadeLocale(): string {
  return detectBrowserLocale(readStoredLocale());
}

function withPremadeLocale(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}locale=${encodeURIComponent(getPremadeLocale())}`;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function getNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getProgressPercent(campaign: Campaign): number | null {
  const metadata = asRecord(campaign.metadata);
  const stats = asRecord(campaign.stats);
  const raw =
    getNumber(stats.progressPercent) ||
    getNumber(stats.progress) ||
    getNumber(metadata.progressPercent) ||
    getNumber(metadata.progress) ||
    getNumber((campaign as unknown as Record<string, unknown>).progressPercent);

  if (raw <= 0) return null;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function normalizeStats(rawStats: unknown): DmHubCampaignStats {
  const stats = isRecord(rawStats) ? rawStats : {};
  const activeSession = getString(stats.activeSession) ?? null;

  return {
    playersCount: getNumber(stats.playersCount),
    npcsCount: getNumber(stats.npcsCount),
    locationsCount: getNumber(stats.locationsCount),
    questsCount: getNumber(stats.questsCount),
    secretsCount: getNumber(stats.secretsCount),
    cluesCount: getNumber(stats.cluesCount),
    sessionsCount: getNumber(stats.sessionsCount),
    activeSession,
  };
}

function normalizeCampaign(campaign: Campaign): DmHubCampaign {
  const metadata = isRecord(campaign.metadata) ? campaign.metadata : {};
  const system =
    getString(campaign.system) ??
    getString(metadata.system) ??
    getString(metadata.ruleset) ??
    getString(metadata.ruleSystem) ??
    "custom";

  const coverUrl =
    getString(campaign.coverUrl) ??
    getString(metadata.coverUrl) ??
    getString(metadata.coverImage) ??
    getString(metadata.coverImagePath) ??
    DEFAULT_CAMPAIGN_COVER;

  return {
    ...campaign,
    system,
    coverUrl,
    stats: normalizeStats(campaign.stats),
    progressPercent: getProgressPercent(campaign),
  };
}

function normalizeTotals(raw: unknown, campaigns: DmHubCampaign[], activeTables: DmHubActiveTable[]): DmHubDashboard["totals"] {
  const totals = isRecord(raw) ? raw : {};
  const fallback = campaigns.reduce(
    (acc, campaign) => {
      acc.players += campaign.stats.playersCount;
      acc.sessions += campaign.stats.sessionsCount;
      acc.npcs += campaign.stats.npcsCount;
      acc.entities +=
        campaign.stats.npcsCount +
        campaign.stats.locationsCount +
        campaign.stats.questsCount +
        campaign.stats.secretsCount +
        campaign.stats.cluesCount;
      if (campaign.status === "completed") acc.completedCampaigns += 1;
      return acc;
    },
    {
      campaigns: campaigns.length,
      activeTables: activeTables.length,
      players: 0,
      sessions: 0,
      npcs: 0,
      entities: 0,
      completedCampaigns: 0,
      playtimeLast30DaysLabel: "0h",
    }
  );

  return {
    campaigns: getOptionalNumber(totals.campaigns) ?? fallback.campaigns,
    activeTables: getOptionalNumber(totals.activeTables) ?? fallback.activeTables,
    players: getOptionalNumber(totals.players) ?? fallback.players,
    sessions: getOptionalNumber(totals.sessions) ?? fallback.sessions,
    npcs: getOptionalNumber(totals.npcs) ?? fallback.npcs,
    entities: getOptionalNumber(totals.entities) ?? fallback.entities,
    completedCampaigns: getOptionalNumber(totals.completedCampaigns) ?? fallback.completedCampaigns,
    playtimeLast30DaysLabel: getString(totals.playtimeLast30DaysLabel) ?? fallback.playtimeLast30DaysLabel,
  };
}

function formatElapsedFromStart(startedAt: unknown): string {
  const raw = getString(startedAt);
  if (!raw) return "";

  const started = new Date(raw).getTime();
  if (!Number.isFinite(started)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - started) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) return `${rest}m`;
  return `${hours}h ${rest}m`;
}

function buildActiveTables(campaigns: DmHubCampaign[], t: (key: string) => string): DmHubActiveTable[] {
  return campaigns
    .filter((campaign) => Boolean(campaign.stats.activeSession))
    .map((campaign) => {
      const metadata = isRecord(campaign.metadata) ? campaign.metadata : {};
      const playersTotal = campaign.stats.playersCount;

      return {
        id: campaign.campaignId,
        campaignId: campaign.campaignId,
        tableName: getString(metadata.tableName) ?? campaign.title,
        campaignTitle: campaign.title,
        sessionTitle: campaign.stats.activeSession ?? t("landing.activeSessionLabel"),
        status: "running" as const,
        elapsed: formatElapsedFromStart(metadata.activeSessionStartedAt),
        playersPresent: playersTotal,
        playersTotal,
      };
    });
}

function buildFallbackDashboard(
  rawCampaigns: Campaign[],
  premadeTemplates: PremadeCampaignTemplateSummary[],
  t: (key: string) => string
): DmHubDashboard {
  const campaigns = rawCampaigns.map(normalizeCampaign);
  const activeTables = buildActiveTables(campaigns, t);
  const totals = normalizeTotals(null, campaigns, activeTables);

  return {
    campaigns,
    premadeTemplates,
    activeTables,
    alerts: [],
    recentActivity: [],
    totals,
  };
}

function normalizeActiveTable(raw: unknown, t: (key: string) => string): DmHubActiveTable | null {
  const record = isRecord(raw) ? raw : {};
  const id = getString(record.id);
  const campaignId = getString(record.campaignId);
  if (!id || !campaignId) return null;
  const status = record.status === "paused" || record.status === "planned" ? record.status : "running";
  return {
    id,
    campaignId,
    tableName: getString(record.tableName) ?? getString(record.campaignTitle) ?? t("landing.activeTableLabel"),
    campaignTitle: getString(record.campaignTitle) ?? t("landing.campaignSingleLabel"),
    sessionTitle: getString(record.sessionTitle) ?? t("landing.activeSessionLabel"),
    status,
    elapsed: getString(record.elapsed) ?? "",
    playersPresent: getNumber(record.playersPresent),
    playersTotal: getNumber(record.playersTotal),
    href: getString(record.href),
  };
}

function normalizeAlert(raw: unknown): DmHubAlert | null {
  const record = isRecord(raw) ? raw : {};
  const id = getString(record.id);
  if (!id) return null;
  const severity = record.severity === "critical" || record.severity === "warning" ? record.severity : "info";
  return {
    id,
    label: getString(record.label) ?? id,
    count: getNumber(record.count),
    severity,
    href: getString(record.href),
  };
}

function normalizeActivityItem(raw: unknown): DmHubActivityItem | null {
  const record = isRecord(raw) ? raw : {};
  const id = getString(record.id);
  if (!id) return null;
  const icon =
    typeof record.icon === "string" && ["session", "npc", "note", "entity", "campaign"].includes(record.icon)
      ? (record.icon as DmHubActivityItem["icon"])
      : "campaign";
  return {
    id,
    icon,
    text: getString(record.text) ?? "Actividad reciente",
    time: getString(record.time) ?? "Ahora",
    href: getString(record.href),
  };
}

function normalizeRemoteDashboard(
  data: unknown,
  fallbackPremadeTemplates: PremadeCampaignTemplateSummary[],
  t: (key: string) => string
): DmHubDashboard | null {
  if (!isRecord(data)) return null;
  const campaigns = Array.isArray(data.campaigns) ? (data.campaigns as Campaign[]).map(normalizeCampaign) : [];
  const activeTables = Array.isArray(data.activeTables)
    ? (data.activeTables.map((x: unknown) => normalizeActiveTable(x, t)).filter((x): x is DmHubActiveTable => x !== null))
    : buildActiveTables(campaigns, t);
  const premadeTemplates = Array.isArray(data.premadeTemplates)
    ? (data.premadeTemplates as PremadeCampaignTemplateSummary[])
    : Array.isArray(data.premades)
      ? (data.premades as PremadeCampaignTemplateSummary[])
      : fallbackPremadeTemplates;

  return {
    campaigns,
    premadeTemplates,
    activeTables,
    alerts: Array.isArray(data.alerts)
      ? data.alerts.map(normalizeAlert).filter((x): x is DmHubAlert => x !== null)
      : [],
    recentActivity: Array.isArray(data.recentActivity)
      ? data.recentActivity.map(normalizeActivityItem).filter((x): x is DmHubActivityItem => x !== null)
      : [],
    totals: normalizeTotals(data.totals, campaigns, activeTables),
  };
}

function campaignRefreshKey(campaigns: Campaign[]): string {
  return campaigns.map((campaign) => `${campaign.campaignId}:${campaign.updatedAt ?? ""}:${campaign.status ?? ""}`).join("|");
}

export function useDmHubDashboard(
  rawCampaigns: Campaign[],
  premadeTemplates: PremadeCampaignTemplateSummary[]
): DmHubDashboard {
  const { t } = useTranslation();
  const [remoteDashboard, setRemoteDashboard] = useState<DmHubDashboard | null>(null);
  const refreshKey = campaignRefreshKey(rawCampaigns);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const res = await apiFetch(withPremadeLocale("/api/dm/dashboard"));
        if (!res.ok) throw new Error(`DM dashboard unavailable (${res.status})`);
        const data: unknown = await res.json();
        const normalized = normalizeRemoteDashboard(data, premadeTemplates, t);
        if (!cancelled) setRemoteDashboard(normalized);
      } catch {
        if (!cancelled) setRemoteDashboard(null);
      }
    };

    void loadDashboard();
    return () => { cancelled = true; };
  }, [refreshKey, premadeTemplates.length, t]);

  const fallbackDashboard = useMemo(
    () => buildFallbackDashboard(rawCampaigns, premadeTemplates, t),
    [rawCampaigns, premadeTemplates, t]
  );

  return remoteDashboard ?? fallbackDashboard;
}
