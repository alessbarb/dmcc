import type { Campaign, PremadeCampaignTemplateSummary } from "../../shared/stores/campaignStore.js";

export type DmHubCampaignStats = {
  playersCount: number;
  npcsCount: number;
  locationsCount: number;
  questsCount: number;
  secretsCount: number;
  cluesCount: number;
  sessionsCount: number;
  activeSession: string | null;
};

export type DmHubCampaign = Campaign & {
  system: string;
  coverUrl: string;
  stats: DmHubCampaignStats;
  progressPercent: number | null;
};

export type DmHubActiveTable = {
  id: string;
  campaignId: string;
  tableName: string;
  campaignTitle: string;
  sessionTitle: string;
  status: "running" | "paused" | "planned";
  elapsed: string;
  playersPresent: number;
  playersTotal: number;
  href?: string;
};

export type DmHubAlert = {
  id: string;
  label: string;
  count: number;
  severity: "info" | "warning" | "critical";
  href?: string;
};

export type DmHubActivityItem = {
  id: string;
  icon: "session" | "npc" | "note" | "entity" | "campaign";
  text: string;
  time: string;
  href?: string;
};

export type DmHubDashboard = {
  campaigns: DmHubCampaign[];
  premadeTemplates: PremadeCampaignTemplateSummary[];
  activeTables: DmHubActiveTable[];
  alerts: DmHubAlert[];
  recentActivity: DmHubActivityItem[];
  totals: {
    campaigns: number;
    activeTables: number;
    players: number;
    sessions: number;
    npcs: number;
    entities: number;
    completedCampaigns: number;
    playtimeLast30DaysLabel: string;
  };
};
