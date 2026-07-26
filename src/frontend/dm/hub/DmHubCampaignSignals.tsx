import { ArrowRight, BookOpen, Clock3, ListChecks, Play, Route, Sparkles } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import type { DmHubCampaignPreparation, DmHubContinuation, DmHubStoryThreadSummary } from "./dmHubTypes.js";

function countLabel(value: number | undefined, label: string) {
  return value === undefined || value <= 0 ? null : <span key={label} className="dm-signal-metric"><strong>{value}</strong>{label}</span>;
}

export function DmHubPreparationPanel({ preparation, campaignTitle, onPrepare, onOpenSessions }: { preparation: DmHubCampaignPreparation | null; campaignTitle: string | null; onPrepare: () => void; onOpenSessions: () => void }) {
  const { t } = useTranslation();
  const metrics = preparation ? [
    countLabel(preparation.availableClues, t("landing.availableClues")),
    countLabel(preparation.openObjectives, t("landing.openObjectivesShort")),
    countLabel(preparation.preparedScenes, t("landing.preparedScenes")),
    countLabel(preparation.involvedEntities, t("landing.involvedEntities")),
  ].filter(Boolean) : [];
  return <section className="dm-panel dm-panel--ornamented-standard dm-hub-signal-panel" data-dm-hub-panel="preparation">
    <div className="dm-panel__header"><div className="dm-panel__title-group"><ListChecks size={16} className="dm-hub-sidebar__heading-icon" /><h2 className="dm-panel__title">{t("landing.campaignPreparationTitle")}</h2></div></div>
    <div className="dm-preparation-layout">
      <div className="dm-preparation-next"><span className="dm-signal-eyebrow">{t("landing.nextSessionTitle")}</span><strong>{preparation?.nextSession?.title ?? t("landing.noSessionScheduled")}</strong><span>{campaignTitle ?? t("landing.campaignSingleLabel")}{preparation?.nextSession?.scheduledAt ? ` · ${new Date(preparation.nextSession.scheduledAt).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })}` : ""}</span></div>
      {metrics.length > 0 && <div className="dm-signal-metrics">{metrics}</div>}
      <div className="dm-signal-actions"><button type="button" className="btn btn-gold btn-sm" onClick={onPrepare}><Play size={12} /> {t("landing.prepareNextSession")}</button><button type="button" className="btn btn-secondary btn-sm" onClick={onOpenSessions}><BookOpen size={12} /> {t("landing.openSessions")}</button></div>
    </div>
  </section>;
}

export function DmHubStoryThreadsPanel({ threads }: { threads: DmHubStoryThreadSummary[] }) {
  const { t } = useTranslation();
  return <section className="dm-panel dm-panel--ornamented-standard dm-hub-signal-panel" data-dm-hub-panel="story-threads">
    <div className="dm-panel__header"><div className="dm-panel__title-group"><Route size={16} className="dm-hub-sidebar__heading-icon" /><h2 className="dm-panel__title">{t("landing.storyThreadsTitle")}</h2></div></div>
    {threads.length === 0 ? <p className="dm-muted-text dm-signal-empty">{t("landing.noStoryThreads")}</p> : <div className="dm-story-thread-list">{threads.map((thread) => <a key={thread.threadId} href={thread.href} className="dm-story-thread-row"><span className={`dm-story-thread-row__icon dm-story-thread-row__icon--${thread.status}`}><Sparkles size={12} /></span><span className="dm-story-thread-row__body"><strong>{thread.title}</strong><span>{thread.status === "active" ? t("landing.storyThreadActive") : thread.status === "blocked" ? t("landing.storyThreadBlocked") : t("landing.storyThreadPlanned")} · {t("landing.pendingSteps", { count: String(thread.pendingSteps) })}</span></span><ArrowRight size={13} /></a>)}</div>}
  </section>;
}

export function DmHubContinuationPanel({ continuation }: { continuation: DmHubContinuation | null }) {
  const { t } = useTranslation();
  return <section className="dm-panel dm-panel--ornamented-standard dm-hub-signal-panel" data-dm-hub-panel="continuation">
    <div className="dm-panel__header"><div className="dm-panel__title-group"><Clock3 size={16} className="dm-hub-sidebar__heading-icon" /><h2 className="dm-panel__title">{t("landing.continueTitle")}</h2></div></div>
    {continuation ? <div className="dm-continuation"><span className="dm-signal-eyebrow">{continuation.campaignTitle}</span><strong>{continuation.destinationLabel}</strong><span>{continuation.lastVisitedAt ? `${t("landing.lastAccess")}: ${t("landing.daysAgo", { count: String(Math.max(1, Math.floor((Date.now() - new Date(continuation.lastVisitedAt).getTime()) / 86400000))) })}` : t("landing.continueFallback")}</span><a href={continuation.href} className="btn btn-secondary btn-sm"><ArrowRight size={12} /> {t("landing.continueButton")}</a></div> : <p className="dm-muted-text dm-signal-empty">{t("landing.continueFallback")}</p>}
  </section>;
}
