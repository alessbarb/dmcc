import React from "react";
import { Activity, Calendar, FolderOpen, Layers, UserRound, Users } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

type DmProfile = { displayName?: string; email?: string; avatarUrl?: string } | null;

interface DmHubHeroProps {
  dmProfile: DmProfile;
  dmDisplayName: string;
  formattedTodayDate: string;
  totalCampaignsCount: number;
  activeTablesCount: number;
  totalPlayersCount: number;
  totalSessionsCount: number;
  totalNpcsCount: number;
  totalEntitiesCount: number;
  activeTablesLength: number;
  onViewTimeline: () => void;
}

export function DmHubHero({
  dmProfile, dmDisplayName, formattedTodayDate, totalCampaignsCount, activeTablesCount,
  totalPlayersCount, totalSessionsCount, totalNpcsCount, totalEntitiesCount, activeTablesLength,
  onViewTimeline,
}: DmHubHeroProps) {
  const { t } = useTranslation();

  return (
    <header className="dm-hub-hero dm-panel--ornamented-accent" data-dm-hub-panel="hero">
          <div className="dm-hub-hero__profile">
            <div className="dm-hub-hero__avatar-ring">
              <img
                className="dm-hub-hero__avatar"
                src={dmProfile?.avatarUrl || "/assets/avatars/default-avatar.webp"}
                alt={dmDisplayName}
              />
            </div>
            <div className="dm-hub-hero__info">
              <h1 className="dm-hub-hero__greeting">
                {t("landing.dmWelcome", { name: dmDisplayName })}
              </h1>
              <p className="dm-hub-hero__subtitle">{t("landing.heroSubtitle")}</p>
              <div className="dm-hub-hero__stats">
                {[
                  { icon: <FolderOpen size={14} />, value: totalCampaignsCount, label: t("landing.campaignsLabel") },
                  { icon: <Activity size={14} />, value: activeTablesCount, label: t("landing.activeTablesNowTitle") },
                  { icon: <Users size={14} />, value: totalPlayersCount, label: t("landing.playersLabel") },
                  { icon: <Calendar size={14} />, value: totalSessionsCount, label: t("landing.sessionsLabel") },
                  { icon: <UserRound size={14} />, value: totalNpcsCount, label: t("landing.npcsLabel") },
                  { icon: <Layers size={14} />, value: totalEntitiesCount, label: t("landing.entitiesLabel") },
                ].map((s, i) => (
                  <div key={i} className="dm-stat-pill">
                    <span className="dm-stat-pill__icon">{s.icon}</span>
                    <span className="dm-stat-pill__value">{s.value}</span>
                    <span className="dm-stat-pill__label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dm-hub-hero__calendar">
            <div className="dm-hub-hero__calendar-date">
              <Calendar className="dm-hub-hero__calendar-icon" size={13} />
              {formattedTodayDate}
            </div>
            <div className="dm-hub-hero__calendar-world">{activeTablesLength > 0 ? t("landing.activeTablesNowLabel", { count: String(activeTablesLength) }) : t("landing.noActiveTablesNowLabel")}</div>
            <button
              type="button"
              className="btn btn-secondary btn-sm dm-hub-hero__timeline-button"
              onClick={activeTablesLength > 0 ? onViewTimeline : undefined}
              disabled={activeTablesLength === 0}
            >
              {t("landing.viewTimeline")}
            </button>
          </div>
        </header>
  );
}
