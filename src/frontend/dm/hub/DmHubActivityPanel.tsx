import { useState } from "react";
import { Activity, FileText, Layers, UserPlus } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { paginate } from "./dmHubPagination.js";
import type { DmHubDashboard } from "./dmHubTypes.js";

const ACTIVITY_PAGE_SIZE = 3;

function formatRelativeActivityTime(value: string, t: (key: string, vars?: Record<string, string>) => string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return t("landing.noActivityRecorded");
  const days = Math.max(1, Math.floor((Date.now() - timestamp) / 86_400_000));
  return t("landing.daysAgo", { count: String(days) });
}

function activityIcon(type: string) {
  switch (type) {
    case "session": return <Activity size={14} className="dm-activity-row__icon-glyph" />;
    case "npc": return <UserPlus size={14} className="dm-activity-row__icon-glyph" />;
    case "note": return <FileText size={14} className="dm-activity-row__icon-glyph" />;
    case "entity": return <Layers size={14} className="dm-activity-row__icon-glyph" />;
    default: return <span className="dm-activity-row__icon-glyph" aria-hidden="true">•</span>;
  }
}

export interface DmHubActivityPanelProps { recentActivity: DmHubDashboard["recentActivity"]; }

export function DmHubActivityPanel({ recentActivity }: DmHubActivityPanelProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const { pageItems, pageCount, clampedPage } = paginate(recentActivity, page, ACTIVITY_PAGE_SIZE);
  return (
    <section className={`dm-panel${recentActivity.length === 0 ? " dm-panel--empty-compact" : ""}`} data-dm-hub-panel="activity">
      <div className="dm-panel__header"><h2 className="dm-panel__title">{t("landing.recentChangesTitle")}</h2></div>
      {recentActivity.length === 0 ? <p className="dm-muted-text dm-hub-activity__empty-compact">{t("landing.noRecentChangesHub")}</p> : (
        <div className="dm-activity-list" data-dm-hub-scroll="activity">
          {pageItems.map((item) => {
            const content = <><div className="dm-activity-row__icon">{activityIcon(item.icon)}</div><span className="dm-activity-row__text">{item.icon === "campaign" ? t("landing.updatedRecently", { title: item.text, time: formatRelativeActivityTime(item.time, t) }) : item.text}</span>{item.icon !== "campaign" && <span className="dm-activity-row__time">{formatRelativeActivityTime(item.time, t)}</span>}</>;
            return item.href ? <a key={item.id} href={item.href} className="dm-activity-row">{content}</a> : <div key={item.id} className="dm-activity-row">{content}</div>;
          })}
        </div>
      )}
      {pageCount > 1 && <div className="dm-hub-pagination"><button type="button" aria-label={t("landing.previousPage")} disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>‹</button><span>{t("landing.pageIndicator", { current: String(clampedPage + 1), total: String(pageCount) })}</span><button type="button" aria-label={t("landing.nextPage")} disabled={clampedPage === pageCount - 1} onClick={() => setPage((p) => p + 1)}>›</button></div>}
    </section>
  );
}
