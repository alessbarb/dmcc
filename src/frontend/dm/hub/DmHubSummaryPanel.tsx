import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { computeActiveVsPaused, computeAverageSessionsPerCampaign } from "./dmHubSummaryMetrics.js";
import type { DmHubCampaign } from "./dmHubTypes.js";

export interface DmHubSummaryPanelProps {
  campaigns: DmHubCampaign[];
  sessionsCount: number;
  completedCampaigns: number;
}

export function DmHubSummaryPanel({ campaigns, sessionsCount, completedCampaigns }: DmHubSummaryPanelProps) {
  const { t } = useTranslation();
  const { active } = computeActiveVsPaused(campaigns);
  const avgSessions = computeAverageSessionsPerCampaign(campaigns);
  const primary = { value: sessionsCount, label: t("landing.sessionsLabel") };
  const items = [
    { value: completedCampaigns, label: t("landing.completedCampaigns") },
    { value: active, label: t("landing.activeCampaignsLabel") },
    { value: avgSessions, label: t("landing.avgSessionsPerCampaignLabel") },
  ];

  return (
    <section className="dm-panel dm-panel--ornamented-standard" data-dm-hub-panel="summary">
      <div className="dm-panel__header"><h2 className="dm-panel__title">{t("landing.summaryGeneralTitle")}</h2></div>
      <div className="dm-summary-primary"><span className="dm-summary-primary__value">{primary.value}</span><span className="dm-summary-primary__label">{primary.label}</span></div>
      <div className="dm-summary-grid">
        {items.map((item, index) => <div key={index} className="dm-summary-item"><span className="dm-summary-item__value">{item.value}</span><span className="dm-summary-item__label">{item.label}</span></div>)}
      </div>
    </section>
  );
}
