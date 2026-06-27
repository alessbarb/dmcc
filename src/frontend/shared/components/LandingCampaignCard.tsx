import React from "react";
import { Shield, MapPin, Key, ArrowRight, Users } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation.js";

interface CampaignStats {
  npcsCount: number;
  locationsCount: number;
  questsCount: number;
  secretsCount: number;
  activeSession: string | null;
  sessionsCount: number;
}

interface Campaign {
  campaignId: string;
  title: string;
  system?: string;
  archived?: boolean;
  stats?: CampaignStats;
}

interface LandingCampaignCardProps {
  campaign: Campaign;
  onSelect: (campaignId: string) => void;
}

export function LandingCampaignCard({ campaign, onSelect }: LandingCampaignCardProps) {
  const { title, system, stats } = campaign;
  const { t } = useTranslation();

  // Format system name for visual badges
  const getSystemBadge = () => {
    switch (system) {
      case "dnd_srd_5_2_1":
        return <span className="system-badge system-badge--dnd">D&D 5.2.1 SRD</span>;
      case "generic_fantasy_d20":
        return <span className="system-badge system-badge--d20">{t("landing.systemFantasyD20")}</span>;
      default:
        return <span className="system-badge system-badge--custom">{t("landing.systemCustom")}</span>;
    }
  };

  return (
    <div className="campaign-card-wrapper" onClick={() => onSelect(campaign.campaignId)}>
      <div className="campaign-card-content">
        <header className="campaign-card-header">
          <div className="campaign-card-title-group">
            <h3 className="campaign-card-title">{title}</h3>
            <div className="campaign-card-badges">
              {getSystemBadge()}
              <span className="campaign-card-id">{campaign.campaignId}</span>
            </div>
          </div>
          <button type="button" className="campaign-card-enter-btn" aria-label={t("landing.enterCampaign", { title })}>
            <ArrowRight size={18} />
          </button>
        </header>

        {/* Active Session Status Banner */}
        {stats?.activeSession ? (
          <div className="campaign-card-session-banner campaign-card-session-banner--active">
            <span className="pulse-indicator"></span>
            <span className="session-text">
              {t("landing.activeSession", { title: stats.activeSession })}
            </span>
          </div>
        ) : (
          <div className="campaign-card-session-banner campaign-card-session-banner--idle">
            <span className="idle-indicator"></span>
            <span className="session-text">
              {stats?.sessionsCount ? t("landing.registeredSessions", { count: stats.sessionsCount }) : t("landing.noArchivedSessions")}
            </span>
          </div>
        )}

        {/* Narrative Density Stats Grid */}
        <div className="campaign-card-stats-grid">
          <div className="campaign-stat-item" title={t("landing.npcsTitle")}>
            <Users size={15} />
            <span className="stat-value">{stats?.npcsCount ?? 0}</span>
            <span className="stat-label">{t("landing.npcsLabel")}</span>
          </div>

          <div className="campaign-stat-item" title={t("landing.locationsTitle")}>
            <MapPin size={15} />
            <span className="stat-value">{stats?.locationsCount ?? 0}</span>
            <span className="stat-label">{t("landing.locationsLabel")}</span>
          </div>

          <div className="campaign-stat-item" title={t("landing.questsTitle")}>
            <Shield size={15} />
            <span className="stat-value">{stats?.questsCount ?? 0}</span>
            <span className="stat-label">{t("landing.questsLabel")}</span>
          </div>

          <div className="campaign-stat-item" title={t("landing.secretsTitle")}>
            <Key size={15} />
            <span className="stat-value">{stats?.secretsCount ?? 0}</span>
            <span className="stat-label">{t("landing.secretsLabel")}</span>
          </div>
        </div>
      </div>
      <div className="campaign-card-border-glow"></div>
    </div>
  );
}
