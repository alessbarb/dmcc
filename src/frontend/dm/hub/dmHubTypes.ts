import type { Campaign, CampaignTemplateSummary } from "../../shared/stores/campaignStore.js";

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

export type DmHubCampaign = Omit<Campaign, "stats"> & {
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

export type DmHubNextSession = {
  campaignId: string;
  campaignTitle: string;
  title: string;
  plannedDate: string | null;
  href: string;
};

export type DmHubPreparationSummary = {
  plannedSessions: number;
  hiddenClues: number;
  openObjectives: number;
  changedEntities: number;
};

export type DmHubCampaignPreparation = {
  campaignId: string;
  nextSession: {
    sessionId: string;
    title: string;
    scheduledAt?: string;
    status: "planned" | "ready" | "active";
  } | null;
  preparedScenes?: number;
  availableClues?: number;
  priorityClues?: number;
  openObjectives?: number;
  secretsAtRisk?: number;
  pendingConsequences?: number;
  involvedEntities?: number;
};

export type DmHubStoryThreadSummary = {
  threadId: string;
  campaignId: string;
  title: string;
  status: "active" | "planned" | "blocked";
  pendingSteps: number;
  plannedSessionId?: string;
  href: string;
};

export type DmHubContinuation = {
  campaignId: string;
  campaignTitle: string;
  destinationLabel: string;
  href: string;
  lastVisitedAt?: string;
};

export type DmHubDashboard = {
  campaigns: DmHubCampaign[];
  campaignTemplates: CampaignTemplateSummary[];
  activeTables: DmHubActiveTable[];
  alerts: DmHubAlert[];
  recentActivity: DmHubActivityItem[];
  nextSession: DmHubNextSession | null;
  preparation: DmHubPreparationSummary;
  featuredPreparation: DmHubCampaignPreparation | null;
  storyThreads: DmHubStoryThreadSummary[];
  continuation: DmHubContinuation | null;
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
