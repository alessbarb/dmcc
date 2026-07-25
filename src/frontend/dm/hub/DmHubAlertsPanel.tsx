import { useState } from "react";
import { ArrowRight, Bell, CheckCircle2 } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { paginate } from "./dmHubPagination.js";
import type { DmHubDashboard } from "./dmHubTypes.js";

const ALERTS_PAGE_SIZE = 3;

export interface DmHubAlertsPanelProps {
  alerts: DmHubDashboard["alerts"];
  preparation: DmHubDashboard["preparation"];
  onOpenPreparation?: () => void;
}

export function DmHubAlertsPanel({ alerts, preparation, onOpenPreparation }: DmHubAlertsPanelProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const { pageItems, pageCount, clampedPage } = paginate(alerts, page, ALERTS_PAGE_SIZE);
  const hasCritical = alerts.some((alert) => alert.severity === "critical");

  return (
    <section className={`dm-panel${hasCritical ? " dm-panel--ornamented-accent" : ""}${alerts.length === 0 ? " dm-panel--empty-compact" : ""}`} data-dm-hub-panel="alerts">
      <div className="dm-panel__header">
        <div className="dm-panel__title-group">
          <Bell size={16} className="dm-hub-sidebar__heading-icon" />
          <h2 className="dm-panel__title">{t("landing.alertsTitle")}</h2>
        </div>
      </div>
      {alerts.length === 0 ? (
        <div className="dm-adaptive-state dm-preparation-state">
          <div className="dm-adaptive-state__icon"><CheckCircle2 size={18} /></div>
          <div className="dm-adaptive-state__body"><span className="dm-adaptive-state__eyebrow">{t("landing.preparationTitle")}</span><strong>{t("landing.hiddenClues", { count: String(preparation.hiddenClues) })}</strong><span className="dm-adaptive-state__detail">{t("landing.openObjectives", { count: String(preparation.openObjectives) })} · {t("landing.changedEntities", { count: String(preparation.changedEntities) })}</span></div>
          {onOpenPreparation && <button type="button" className="dm-adaptive-state__action" onClick={onOpenPreparation}>{t("landing.openCampaign")} <ArrowRight size={12} /></button>}
        </div>
      ) : (
        <div className="dm-alerts-list" data-dm-hub-scroll="alerts">
          {pageItems.map((alert) => alert.href ? (
            <a key={alert.id} href={alert.href} className="dm-alert-row">
              <span className="dm-alert-row__label">{alert.label}</span>
              <span className={`dm-alert-row__badge ${alert.severity}`}>{alert.count}</span>
            </a>
          ) : (
            <div key={alert.id} className="dm-alert-row">
              <span className="dm-alert-row__label">{alert.label}</span>
              <span className={`dm-alert-row__badge ${alert.severity}`}>{alert.count}</span>
            </div>
          ))}
        </div>
      )}
      {pageCount > 1 && (
        <div className="dm-hub-pagination">
          <button type="button" aria-label={t("landing.previousPage")} disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
          <span>{t("landing.pageIndicator", { current: String(clampedPage + 1), total: String(pageCount) })}</span>
          <button type="button" aria-label={t("landing.nextPage")} disabled={clampedPage === pageCount - 1} onClick={() => setPage((p) => p + 1)}>›</button>
        </div>
      )}
    </section>
  );
}
