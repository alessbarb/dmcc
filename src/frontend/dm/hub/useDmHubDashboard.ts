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

const DEFAULT_CAMPAIGN_COVER = "/assets/campaigns/default-campaign-cover.jpg";

function getPremadeLocale(): string {
  try {
    const saved = localStorage.getItem("dmcc_language");
    return detectBrowserLocale(saved);
  } catch {}
  return "en";
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
  const metadata = campaign.metadata ?? {};
  const raw =
    getNumber((campaign.stats as any)?.progressPercent) ||
    getNumber((campaign.stats as any)?.progress) ||
    getNumber((metadata as any).progressPercent) ||
    getNumber((metadata as any).progress) ||
    getNumber((campaign as any).progressPercent);

  if (raw <= 0) return null;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function normalizeStats(rawStats: any): DmHubCampaignStats {
  const activeSession = getString(rawStats?.activeSession) ?? null;

  return {
    playersCount: getNumber(rawStats?.playersCount),
    npcsCount: getNumber(rawStats?.npcsCount),
    locationsCount: getNumber(rawStats?.locationsCount),
    questsCount: getNumber(rawStats?.questsCount),
    secretsCount: getNumber(rawStats?.secretsCount),
    cluesCount: getNumber(rawStats?.cluesCount),
    sessionsCount: getNumber(rawStats?.sessionsCount),
    activeSession,
  };
}

function normalizeCampaign(campaign: Campaign): DmHubCampaign {
  const metadata = campaign.metadata ?? {};
  const system =
    getString(campaign.system) ??
    getString((metadata as any).system) ??
    getString((metadata as any).ruleset) ??
    getString((metadata as any).ruleSystem) ??
    "custom";

  const coverUrl =
    getString(campaign.coverUrl) ??
    getString((metadata as any).coverUrl) ??
    getString((metadata as any).coverImage) ??
    getString((metadata as any).coverImagePath) ??
    DEFAULT_CAMPAIGN_COVER;

  return {
    ...campaign,
    system,
    coverUrl,
    stats: normalizeStats(campaign.stats),
    progressPercent: getProgressPercent(campaign),
  };
}

function normalizeTotals(raw: any, campaigns: DmHubCampaign[], activeTables: DmHubActiveTable[]) {
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
    campaigns: getOptionalNumber(raw?.campaigns) ?? fallback.campaigns,
    activeTables: getOptionalNumber(raw?.activeTables) ?? fallback.activeTables,
    players: getOptionalNumber(raw?.players) ?? fallback.players,
    sessions: getOptionalNumber(raw?.sessions) ?? fallback.sessions,
    npcs: getOptionalNumber(raw?.npcs) ?? fallback.npcs,
    entities: getOptionalNumber(raw?.entities) ?? fallback.entities,
    completedCampaigns: getOptionalNumber(raw?.completedCampaigns) ?? fallback.completedCampaigns,
    playtimeLast30DaysLabel: getString(raw?.playtimeLast30DaysLabel) ?? fallback.playtimeLast30DaysLabel,
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
      const metadata = campaign.metadata ?? {};
      const playersTotal = campaign.stats.playersCount;

      return {
        id: campaign.campaignId,
        campaignId: campaign.campaignId,
        tableName: getString((metadata as any).tableName) ?? campaign.title,
        campaignTitle: campaign.title,
        sessionTitle: campaign.stats.activeSession ?? t("landing.activeSessionLabel"),
        status: "running",
        elapsed: formatElapsedFromStart((metadata as any).activeSessionStartedAt),
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

function normalizeActiveTable(raw: any, t: (key: string) => string): DmHubActiveTable | null {
  const id = getString(raw?.id);
  const campaignId = getString(raw?.campaignId);
  if (!id || !campaignId) return null;
  const status = raw?.status === "paused" || raw?.status === "pnetworkned" ? raw.status : "running";
  return {
    id,
    campaignId,
    tableName: getString(raw?.tableName) ?? getString(raw?.campaignTitle) ?? t("landing.activeTableLabel"),
    campaignTitle: getString(raw?.campaignTitle) ?? t("landing.campaignSingleLabel"),
    sessionTitle: getString(raw?.sessionTitle) ?? t("landing.activeSessionLabel"),
    status,
    elapsed: getString(raw?.elapsed) ?? "",
    playersPresent: getNumber(raw?.playersPresent),
    playersTotal: getNumber(raw?.playersTotal),
    href: getString(raw?.href),
  };
}

function normalizeAlert(raw: any): DmHubAlert | null {
  const id = getString(raw?.id);
  if (!id) return null;
  const severity = raw?.severity === "critical" || raw?.severity === "warning" ? raw.severity : "info";
  return {
    id,
    label: getString(raw?.label) ?? id,
    count: getNumber(raw?.count),
    severity,
    href: getString(raw?.href),
  };
}

function normalizeActivityItem(raw: any): DmHubActivityItem | null {
  const id = getString(raw?.id);
  if (!id) return null;
  const icon = ["session", "npc", "note", "entity", "campaign"].includes(raw?.icon) ? raw.icon : "campaign";
  return {
    id,
    icon,
    text: getString(raw?.text) ?? "Actividad reciente",
    time: getString(raw?.time) ?? "Ahora",
    href: getString(raw?.href),
  };
}

function normalizeRemoteDashboard(
  data: any,
  fallbackPremadeTemplates: PremadeCampaignTemplateSummary[],
  t: (key: string) => string
): DmHubDashboard | null {
  if (!data || typeof data !== "object") return null;
  const campaigns = Array.isArray(data.campaigns) ? data.campaigns.map(normalizeCampaign) : [];
  const activeTables = Array.isArray(data.activeTables)
    ? (data.activeTables.map((x: any) => normalizeActiveTable(x, t)).filter(Boolean) as DmHubActiveTable[])
    : buildActiveTables(campaigns, t);
  const premadeTemplates = Array.isArray(data.premadeTemplates)
    ? data.premadeTemplates
    : Array.isArray(data.premades)
      ? data.premades
      : fallbackPremadeTemplates;

  return {
    campaigns,
    premadeTemplates,
    activeTables,
    alerts: Array.isArray(data.alerts) ? data.alerts.map(normalizeAlert).filter(Boolean) as DmHubAlert[] : [],
    recentActivity: Array.isArray(data.recentActivity)
      ? data.recentActivity.map(normalizeActivityItem).filter(Boolean) as DmHubActivityItem[]
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
        const data = await res.json();
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
