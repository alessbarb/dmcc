import { useState } from "react";
import { Activity, ArrowRight, CalendarDays, Clock, FolderOpen, Play, Users } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { paginate } from "./dmHubPagination.js";
import type { DmHubDashboard } from "./dmHubTypes.js";

const TABLES_PAGE_SIZE = 3;

export interface DmHubActiveTablesPanelProps {
  activeTables: DmHubDashboard["activeTables"];
  triggerMysticalTransition: (campaignId: string) => void;
  navigateToActiveSession: (campaignId: string) => void;
  nextSession: DmHubDashboard["nextSession"];
}

export function DmHubActiveTablesPanel({ activeTables, triggerMysticalTransition, navigateToActiveSession, nextSession }: DmHubActiveTablesPanelProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const { pageItems, pageCount, clampedPage } = paginate(activeTables, page, TABLES_PAGE_SIZE);

  return (
    <section className={`dm-panel dm-panel--ornamented-primary${activeTables.length === 0 ? " dm-panel--empty-compact" : ""}`} data-dm-hub-panel="tables">
      <div className="dm-panel__header">
        <div className="dm-panel__title-group">
          <Activity size={16} className="dm-hub-sidebar__heading-icon" />
          <h2 className="dm-panel__title">{t("landing.activeTablesNowTitle")}</h2>
        </div>
      </div>
      {activeTables.length === 0 ? (
        nextSession ? <div className="dm-adaptive-state dm-next-session">
          <div className="dm-adaptive-state__icon"><CalendarDays size={18} /></div>
          <div className="dm-adaptive-state__body"><span className="dm-adaptive-state__eyebrow">{t("landing.nextSessionTitle")}</span><strong>{nextSession.campaignTitle}</strong><span className="dm-adaptive-state__detail">{nextSession.title}{nextSession.plannedDate ? ` · ${new Date(nextSession.plannedDate).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })}` : ""}</span></div>
          <button type="button" className="dm-adaptive-state__action" onClick={() => navigateToActiveSession(nextSession.campaignId)}>{t("landing.prepareNextSession")} <ArrowRight size={12} /></button>
        </div> : <div className="dm-empty-state dm-empty-state--compact">
          <Activity size={22} className="dm-empty-state__icon dm-empty-state__icon--compact" />
          <p>{t("landing.noActiveTablesTitle")}</p>
          <span>{t("landing.noActiveTablesDesc")}</span>
        </div>
      ) : (
        <div className="dm-tables-list" data-dm-hub-scroll="tables">
          {pageItems.map((table) => (
            <div
              key={table.id}
              className="dm-table-row"
            >
              <div className="dm-table-row__cover" />
              <div className="dm-table-row__info">
                <div className="dm-table-row__title-line">
                  <span className="dm-table-row__name">{table.tableName}</span>
                  <span className={`dm-badge dm-badge--${table.status === "running" ? "active" : "paused"}`}>
                    {table.status === "running" ? t("landing.statusRunning") : t("landing.statusPaused")}
                  </span>
                </div>
                <span className="dm-table-row__campaign">{table.campaignTitle}</span>
                <span className="dm-table-row__session">{table.sessionTitle}</span>
              </div>
              <div className="dm-table-row__stats">
                {table.elapsed && <span className="dm-table-row__time"><Clock size={10} /> {table.elapsed}</span>}
                <span className="dm-table-row__players"><Users size={10} /> {table.playersPresent}/{table.playersTotal}</span>
              </div>
              <div className="dm-table-row__actions">
                <button type="button" className="dm-table-row__action dm-table-row__action--primary" onClick={() => navigateToActiveSession(table.campaignId)}>
                  <Play size={11} /> {t("landing.continueSession")}
                </button>
                <button type="button" className="dm-table-row__action" onClick={() => triggerMysticalTransition(table.campaignId)}>
                  <FolderOpen size={11} /> {t("landing.openCampaign")}
                </button>
              </div>
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
