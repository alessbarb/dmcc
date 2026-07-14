import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Plus, Sword } from "lucide-react";
import { getPlayerCampaigns, type PlayerCampaignSummary } from "../../shared/api/webProductClient.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function PlayerCampaignsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<PlayerCampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getPlayerCampaigns()
      .then((response) => setCampaigns(response.campaigns))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="smart-landing" style={{ minHeight: "100vh" }}>
      <div className="smart-landing__background" aria-hidden="true"><RpgPortalBackground /></div>
      <div className="smart-landing__glow" aria-hidden="true" />
      <PortalTopBar />
      <main className="smart-landing__main">
        <section className="smart-landing__hero" aria-labelledby="player-campaigns-title">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void navigate({ to: "/home" })}>
            <ArrowLeft size={15} /> {t("playerCampaigns.backBtn")}
          </button>
          <span className="landing-badge smart-landing__badge"><Sword size={13} /> {t("playerCampaigns.badge")}</span>
          <h1 id="player-campaigns-title" className="landing-hero__title smart-landing__title gold-gradient-text">{t("playerCampaigns.title")}</h1>
          <p className="landing-hero__subtitle smart-landing__subtitle">{t("playerCampaigns.subtitle")}</p>

          {error && <div className="join-portal-error"><p role="alert">{error}</p></div>}
          {loading && <div className="smart-landing-loading"><div className="loading-spinner-glow" /><span>{t("playerCampaigns.loading")}</span></div>}

          {!loading && campaigns.length === 0 && (
            <div className="glass-card player-join-card">
              <div className="card-body centered">
                <Sword size={36} />
                <h2>{t("playerCampaigns.emptyTitle")}</h2>
                <p>{t("playerCampaigns.emptyDescription")}</p>
                <button type="button" className="btn btn-primary" onClick={() => void navigate({ to: "/player/join" })}>
                  <Plus size={16} /> {t("playerCampaigns.joinWithInviteBtn")}
                </button>
              </div>
            </div>
          )}

          {!loading && campaigns.length > 0 && (
            <div className="player-profiles-list" style={{ width: "min(760px, 100%)", margin: "0 auto" }}>
              {campaigns.map((campaign) => (
                <button
                  key={`${campaign.campaignId}-${campaign.playerId ?? "player"}`}
                  type="button"
                  className="glass-card player-profile-row-card"
                  onClick={() => void navigate({
                    to: "/player/campaigns/$campaignId/overview",
                    params: { campaignId: campaign.campaignId },
                  })}
                >
                  <span className="card-body row-layout">
                    <span className="avatar-frame"><img src={campaign.coverUrl || "/assets/avatars/default-avatar.png"} alt="" /></span>
                    <span className="profile-details">
                      <strong className="profile-name">{campaign.title}</strong>
                      <span className="campaign-link-name">{t("playerCampaigns.openCampaignHint")}</span>
                    </span>
                    <ArrowRight size={18} />
                  </span>
                </button>
              ))}
              <button type="button" className="btn btn-secondary btn-full" onClick={() => void navigate({ to: "/player/join" })}>
                <Plus size={16} /> {t("playerCampaigns.joinAnotherBtn")}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
