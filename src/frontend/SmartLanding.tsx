import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Shield,
  Sword,
  Users,
  MapPin,
  ShieldAlert,
  Key,
  Plus,
  Sparkles,
  LogOut,
  ArrowRight,
  Compass
} from "lucide-react";
import { fetchAuthStatus, logout } from "./shared/auth/authClient.js";
import type { AuthStatus } from "./shared/auth/authTypes.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "./shared/components/PortalTopBar.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";
import { apiFetch } from "./shared/api/apiClient.js";
import { getPlayerCampaigns } from "./shared/api/webProductClient.js";
import type { PlayerCampaignSummary } from "./shared/api/webProductClient.js";


interface PlayerCampaignCard {
  campaignId: string;
  playerId: string;
  displayName: string;
  campaignTitle: string;
  avatarUrl?: string;
  characterName?: string;
}

function formatCampaignSystem(system?: string) {
  if (system === "dnd_srd_5_2_1") return "D&D 5e";
  if (system === "generic_fantasy_d20") return "d20 Fantasy";
  return "Custom";
}

export function SmartLanding() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasDmSession, setHasDmSession] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [playerCampaignCards, setPlayerCampaignCards] = useState<PlayerCampaignCard[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const authStatus = await fetchAuthStatus();
        setStatus(authStatus);
        setHasDmSession(authStatus.sessionValid);

        if (authStatus.sessionValid) {
          const res = await apiFetch("/api/campaigns");
          if (res.ok) {
            const data = await res.json();
            setCampaigns(Array.isArray(data) ? data : []);
          }

          const playerCampaigns = await getPlayerCampaigns().catch(() => ({ campaigns: [] }));
          setPlayerCampaignCards(playerCampaigns.campaigns.map((campaign: PlayerCampaignSummary) => ({
            campaignId: campaign.campaignId,
            playerId: campaign.playerId ?? campaign.campaignId,
            displayName: campaign.title,
            campaignTitle: campaign.title,
            avatarUrl: campaign.coverUrl ?? undefined,
          })));
        }
      } catch {
        // Server unreachable
      }

      setLoading(false);
    };

    void init();
  }, []);

  if (loading) {
    return (
      <div className="smart-landing-loading">
        <div className="loading-spinner-glow"></div>
        <span>{t("common.loading")}</span>
      </div>
    );
  }

  const handleDmNavigate = () => {
    if (hasDmSession) {
      navigate({ to: "/dm" });
    } else if (status?.accountConfigured) {
      navigate({ to: "/dm/login" });
    } else {
      navigate({ to: "/dm/setup" });
    }
  };

  const handleDmSignOut = async () => {
    await logout();
    setHasDmSession(false);
    setCampaigns([]);
  };

  // Find featured campaign: latest updated or created
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt || "";
    const dateB = b.updatedAt || b.createdAt || "";
    return dateB.localeCompare(dateA);
  });

  const featuredCampaign = sortedCampaigns[0] || null;
  const otherCampaignsList = sortedCampaigns.slice(1, 4); // Limit other campaigns to 3 items

  return (
    <div className="smart-landing">
      <div className="smart-landing__background" aria-hidden="true">
        <RpgPortalBackground />
      </div>

      <div className="smart-landing__glow" aria-hidden="true" />

      <PortalTopBar />

      <main className="smart-landing__main">
        <section className="smart-landing__hero" aria-labelledby="landing-title">
          <span className="landing-badge smart-landing__badge animate-pulse-gold">
            <Sparkles size={12} className="gold-icon" />
            {t("landing.badge")}
          </span>

          <h1 id="landing-title" className="landing-hero__title smart-landing__title gold-gradient-text">
            {t("landing.narrativeHeading")}
          </h1>

          <p className="landing-hero__subtitle smart-landing__subtitle">
            {t("landing.subtitle")}
          </p>

          <div className="smart-landing__grid">
            {/* LEFT COLUMN: DM / ARCHIVE */}
            <div className="smart-column-wrapper dm-theme">
              <div className="column-header">
                <Shield className="column-icon gold-glow" size={20} />
                <h2>{t("landing.dmTitle")}</h2>
              </div>

              {!hasDmSession ? (
                // Setup or Unlock State
                <div className="glass-card login-card" onClick={handleDmNavigate}>
                  <div className="card-body">
                    <p className="card-desc">{t("landing.dmDesc")}</p>
                    <button className="btn btn-gold btn-full">
                      {status?.accountConfigured ? t("landing.loginArchive") : t("landing.serverConfig")}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                // Authenticated DM State
                <div className="dm-archive-stack">
                  {!featuredCampaign ? (
                    // Empty State
                    <div className="glass-card empty-campaigns-card">
                      <div className="card-body centered">
                        <Compass className="empty-icon" size={36} />
                        <h3>{t("landing.noCampaignsTitle")}</h3>
                        <p>{t("landing.noCampaignsDesc")}</p>
                        <button className="btn btn-gold" onClick={() => navigate({ to: "/dm" })}>
                          {t("landing.createCampaignBtn")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Featured Campaign
                    <div className="featured-campaign-wrapper">
                      <span className="section-label-gold">{t("landing.recentCampaign")}</span>
                      <div className="glass-card featured-campaign-card" onClick={() => navigate({ to: `/campaigns/${featuredCampaign.campaignId}/dashboard` })}>
                        <div className="featured-campaign-cover" style={{ backgroundImage: `url(${featuredCampaign.coverUrl || '/assets/campaigns/default-campaign-cover.jpg'})` }}>
                          <div className="cover-overlay"></div>
                          {featuredCampaign.stats?.activeSession && (
                            <span className="active-badge animate-pulse">
                              <span className="pulse-dot"></span>
                              {t("landing.activeSession", { title: featuredCampaign.stats.activeSession })}
                            </span>
                          )}
                        </div>
                        <div className="card-body">
                          <h3 className="campaign-title">{featuredCampaign.title}</h3>
                          <div className="campaign-meta-row">
                            <span className={`system-tag system-${featuredCampaign.system || 'generic'}`}>
                              {formatCampaignSystem(featuredCampaign.system)}
                            </span>
                          </div>

                          {/* Stats mini grid */}
                          <div className="campaign-stats-mini">
                            <div className="stat-pill" title={t("landing.npcsTitle")}>
                              <Users size={12} />
                              <span>{featuredCampaign.stats?.npcsCount ?? 0}</span>
                            </div>
                            <div className="stat-pill" title={t("landing.locationsTitle")}>
                              <MapPin size={12} />
                              <span>{featuredCampaign.stats?.locationsCount ?? 0}</span>
                            </div>
                            <div className="stat-pill" title={t("landing.questsTitle")}>
                              <ShieldAlert size={12} />
                              <span>{featuredCampaign.stats?.questsCount ?? 0}</span>
                            </div>
                            <div className="stat-pill" title={t("landing.secretsTitle")}>
                              <Key size={12} />
                              <span>{featuredCampaign.stats?.secretsCount ?? 0}</span>
                            </div>
                          </div>

                          <div className="card-actions">
                            <button className="btn btn-gold btn-full">
                              {t("landing.continueCampaign")}
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other campaigns list */}
                  {otherCampaignsList.length > 0 && (
                    <div className="other-campaigns-section">
                      <span className="section-label-gold-sub">{t("landing.otherCampaigns")}</span>
                      <div className="other-campaigns-list">
                        {otherCampaignsList.map((campaign) => (
                          <div key={campaign.campaignId} className="campaign-row-item" onClick={() => navigate({ to: `/campaigns/${campaign.campaignId}/dashboard` })}>
                            <div className="campaign-row-thumb" style={{ backgroundImage: `url(${campaign.coverUrl || '/assets/campaigns/default-campaign-cover.jpg'})` }}></div>
                            <div className="campaign-row-info">
                              <h4>{campaign.title}</h4>
                              <p className="system-text">
                                {formatCampaignSystem(campaign.system)} • {campaign.stats?.sessionsCount ?? 0} {t("landing.sessionsShortLabel")}
                              </p>
                            </div>
                            <ArrowRight size={14} className="row-arrow" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions & Log Out */}
                  <div className="dm-actions-footer">
                    <button className="link-action-gold" onClick={() => navigate({ to: "/dm" })}>
                      {t("landing.viewAllCampaigns")}
                    </button>
                    <button className="smart-landing__sign-out" onClick={handleDmSignOut}>
                      <LogOut size={11} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                      {t("landing.dmSignOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PLAYER / CONNECTIONS */}
            <div className="smart-column-wrapper player-theme">
              <div className="column-header">
                <Sword className="column-icon amethyst-glow" size={20} />
                <h2>{t("landing.playerTitle")}</h2>
              </div>

              {playerCampaignCards.length === 0 ? (
                // Player empty join state
                <div className="glass-card player-join-card" onClick={() => navigate({ to: "/player/join" })}>
                  <div className="card-body">
                    <p className="card-desc">{t("landing.playerDesc")}</p>
                    <div className="join-cta-box">
                      <Compass size={24} className="compass-icon" />
                      <p>{t("landing.charactersEmptyDesc")}</p>
                    </div>
                    <button className="btn btn-amethyst btn-full">
                      {t("landing.joinWithCodeBtn")}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                // Active player character connections
                <div className="player-portal-stack">
                  <span className="section-label-amethyst">{t("landing.yourCharacters")}</span>
                  <div className="player-profiles-list">
                    {playerCampaignCards.map((profile) => (
                      <div
                        key={`${profile.campaignId}-${profile.playerId}`}
                        className="glass-card player-profile-row-card"
                        onClick={() => navigate({ to: `/player/campaigns/${profile.campaignId}/home` })}
                      >
                        <div className="card-body row-layout">
                          <div className="avatar-frame">
                            <img src={profile.avatarUrl || "/assets/avatars/default-avatar.png"} alt={profile.displayName} />
                          </div>
                          <div className="profile-details">
                            <h3 className="profile-name">{profile.displayName}</h3>
                            {profile.characterName && <p className="char-name">{t("landing.characterLabel")}: {profile.characterName}</p>}
                            <p className="campaign-link-name">{t("landing.campaignLabel")}: {profile.campaignTitle}</p>
                          </div>
                          <ArrowRight size={18} className="amethyst-arrow" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-amethyst-outline btn-full" onClick={() => navigate({ to: "/player/join" })}>
                    <Plus size={16} />
                    {t("landing.joinAnother")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="smart-landing__footer">
          {t("landing.footer")}
        </footer>
      </main>
    </div>
  );
}
