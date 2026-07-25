import { useState } from "react";
import { Bell } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { paginate } from "./dmHubPagination.js";
import type { DmHubDashboard } from "./dmHubTypes.js";

const ALERTS_PAGE_SIZE = 3;

export interface DmHubAlertsPanelProps {
  alerts: DmHubDashboard["alerts"];
}

export function DmHubAlertsPanel({ alerts }: DmHubAlertsPanelProps) {
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
        <div className="dm-empty-state dm-empty-state--compact">
          <Bell size={22} className="dm-empty-state__icon dm-empty-state__icon--compact" />
          <p>{t("landing.alertsAllClearTitle")}</p>
          <span>{t("landing.alertsAllClearDesc")}</span>
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
