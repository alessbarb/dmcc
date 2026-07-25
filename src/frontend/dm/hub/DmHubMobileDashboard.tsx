import { Activity, Bell, FolderOpen, Layers, MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export type DmHubMobileTile = "campaigns" | "tables" | "alerts" | "summary" | "activity" | "templates";
export interface DmHubMobileDashboardProps {
  dmDisplayName: string; campaignsCount: number; activeTablesCount: number; alertsCount: number;
  featuredCampaignTitle: string | null; activeTableStatus: string | null; recentActivitySummary: string | null;
  playtimeLast30DaysLabel: string; templatesCount: number; onSelectTile: (tile: DmHubMobileTile) => void;
  onCreateCampaign: () => void; onOpenActiveSession: () => void; onCanvas: () => void; onEntities: () => void; onMore: () => void;
}

export function DmHubMobileDashboard({ dmDisplayName, campaignsCount, activeTablesCount, alertsCount, featuredCampaignTitle, activeTableStatus, recentActivitySummary, playtimeLast30DaysLabel, templatesCount, onSelectTile, onCreateCampaign, onOpenActiveSession, onCanvas, onEntities, onMore }: DmHubMobileDashboardProps) {
  const { t } = useTranslation();
  const tiles = [
    { id: "campaigns" as const, icon: <FolderOpen size={18} />, title: t("landing.campaignsSectionTitle"), value: t("landing.campaignCount", { count: String(campaignsCount) }), context: featuredCampaignTitle },
    { id: "tables" as const, icon: <Activity size={18} />, title: t("landing.activeTablesNowTitle"), value: activeTablesCount > 0 ? t("landing.activeTablesNowCount", { count: String(activeTablesCount) }) : t("landing.noActiveTablesNow"), context: activeTableStatus },
    { id: "alerts" as const, icon: <Bell size={18} />, title: t("landing.alertsTitle"), value: alertsCount > 0 ? t("landing.alertCount", { count: String(alertsCount) }) : t("landing.noAlertsCompact"), context: null },
    { id: "activity" as const, icon: <Layers size={18} />, title: t("landing.recentActivityTitle"), value: recentActivitySummary ?? t("landing.noActivityCompact"), context: null },
    { id: "summary" as const, icon: <Activity size={18} />, title: t("landing.summaryGeneralTitle"), value: playtimeLast30DaysLabel, context: null },
    { id: "templates" as const, icon: <Sparkles size={18} />, title: t("landing.templateStripTitle"), value: t("landing.templateCount", { count: String(templatesCount) }), context: null },
  ];
  return <div className="dm-hub-mobile-dashboard dm-panel--ornamented-compact" role="region" aria-label={t("landing.mobileDashboardLabel")} data-dm-hub-panel="mobile-dashboard">
    <header className="dm-hub-mobile-dashboard__header"><span>{t("landing.dmWelcome", { name: dmDisplayName })}</span></header>
    <div className="dm-hub-mobile-dashboard__grid">{tiles.map((tile) => <button key={tile.id} type="button" className="dm-hub-mobile-tile" onClick={() => onSelectTile(tile.id)}>{tile.icon}<span className="dm-hub-mobile-tile__title">{tile.title}</span><span className="dm-hub-mobile-tile__value">{tile.value}</span>{tile.context && <span className="dm-hub-mobile-tile__context">{tile.context}</span>}</button>)}</div>
    <nav className="dm-hub-mobile-dashboard__bar" aria-label={t("landing.quickActionsTitle")}><button type="button" onClick={onCreateCampaign}><Plus size={18} /><span>{t("landing.createCampaignLabel")}</span></button><button type="button" onClick={onOpenActiveSession}><Activity size={18} /><span>{t("landing.mobileActionSession")}</span></button><button type="button" onClick={onCanvas}><FolderOpen size={18} /><span>{t("landing.quickActionCanvas")}</span></button><button type="button" onClick={onEntities}><Layers size={18} /><span>{t("landing.entitiesLabel")}</span></button><button type="button" onClick={onMore}><MoreHorizontal size={18} /><span>{t("landing.moreActions")}</span></button></nav>
  </div>;
}
