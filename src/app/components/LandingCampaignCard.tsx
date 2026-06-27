import React from "react";
import { Shield, MapPin, Key, Play, ArrowRight, Users, BookOpen } from "lucide-react";

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

  // Format system name for visual badges
  const getSystemBadge = () => {
    switch (system) {
      case "dnd_srd_5_2_1":
        return <span className="system-badge system-badge--dnd">D&D 5.2.1 SRD</span>;
      case "generic_fantasy_d20":
        return <span className="system-badge system-badge--d20">Fantasía d20</span>;
      default:
        return <span className="system-badge system-badge--custom">Sistema Personalizado</span>;
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
          <button type="button" className="campaign-card-enter-btn" aria-label={`Entrar a la campaña ${title}`}>
            <ArrowRight size={18} />
          </button>
        </header>

        {/* Active Session Status Banner */}
        {stats?.activeSession ? (
          <div className="campaign-card-session-banner campaign-card-session-banner--active">
            <span className="pulse-indicator"></span>
            <span className="session-text">
              Sesión Activa: <strong>{stats.activeSession}</strong>
            </span>
          </div>
        ) : (
          <div className="campaign-card-session-banner campaign-card-session-banner--idle">
            <span className="idle-indicator"></span>
            <span className="session-text">
              {stats?.sessionsCount ? `${stats.sessionsCount} sesiones registradas` : "Sin sesiones archivadas"}
            </span>
          </div>
        )}

        {/* Narrative Density Stats Grid */}
        <div className="campaign-card-stats-grid">
          <div className="campaign-stat-item" title="Personajes no jugadores (NPCs)">
            <Users size={15} />
            <span className="stat-value">{stats?.npcsCount ?? 0}</span>
            <span className="stat-label">PNJs</span>
          </div>

          <div className="campaign-stat-item" title="Ubicaciones geográficas">
            <MapPin size={15} />
            <span className="stat-value">{stats?.locationsCount ?? 0}</span>
            <span className="stat-label">Lugares</span>
          </div>

          <div className="campaign-stat-item" title="Misiones activas y secundarias">
            <Shield size={15} />
            <span className="stat-value">{stats?.questsCount ?? 0}</span>
            <span className="stat-label">Misiones</span>
          </div>

          <div className="campaign-stat-item" title="Pistas y secretos revelados/por descubrir">
            <Key size={15} />
            <span className="stat-value">{stats?.secretsCount ?? 0}</span>
            <span className="stat-label">Pistas</span>
          </div>
        </div>
      </div>
      <div className="campaign-card-border-glow"></div>
    </div>
  );
}
