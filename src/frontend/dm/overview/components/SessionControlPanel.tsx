import React from "react";
import { CalendarDays } from "lucide-react";
import { NarrativeDivider } from "../../../shared/components/NarrativeDivider.js";
import { Pill, type PillProps } from "../../../shared/components/Pill.js";

export interface SessionAttentionChip {
  key: string;
  label: string;
  count: number;
  tone: Extract<NonNullable<PillProps["tone"]>, "danger" | "warning">;
}

interface SessionControlPanelProps {
  sectionLabel: string;
  sectionId: string;
  title: React.ReactNode;
  recapTitle: string;
  recap?: string | null;
  attentionChips: SessionAttentionChip[];
  primaryAction: React.ReactNode;
  secondaryAction: React.ReactNode;
  liveTableLabel: string;
  liveTableCode?: string | null;
}

/** Continuity surface for the next session; actions stay owned by the page. */
export function SessionControlPanel({
  sectionLabel,
  sectionId,
  title,
  recapTitle,
  recap,
  attentionChips,
  primaryAction,
  secondaryAction,
  liveTableLabel,
  liveTableCode,
}: SessionControlPanelProps) {
  return (
    <section className="dashboard-continuity-section" aria-labelledby={sectionId}>
      <section className="card dashboard-card dm-panel dm-panel--ornamented-primary dashboard-continuity-panel">
        <div className="dashboard-continuity-panel__body">
          <div className="dashboard-continuity-panel__copy">
            <span className="dashboard-header__eyebrow dashboard-continuity-panel__eyebrow">{sectionLabel}</span>
            <h2 id={sectionId} className="dashboard-continuity-panel__title">
              <CalendarDays size={20} className="dashboard-continuity-panel__icon" />
              {title}
            </h2>
            <NarrativeDivider />

            {recap && (
              <div className="dashboard-continuity-panel__recap">
                <h4 className="dashboard-continuity-panel__recap-title">{recapTitle}</h4>
                <p className="dashboard-recap dashboard-continuity-panel__recap-text">{recap}</p>
              </div>
            )}

            {attentionChips.length > 0 && (
              <div className="dashboard-continuity-panel__chips">
                {attentionChips.map((chip) => <Pill key={chip.key} tone={chip.tone}>{chip.label}: {chip.count}</Pill>)}
              </div>
            )}
          </div>

          <div className="dashboard-continuity-panel__actions">
            {primaryAction}
            {secondaryAction}
            {liveTableCode && (
              <div className="dashboard-continuity-panel__live">
                <span className="dashboard-continuity-panel__live-label">{liveTableLabel}:</span>
                <Pill tone="good">{liveTableCode}</Pill>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
