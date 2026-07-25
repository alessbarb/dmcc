import { ArrowUpRight, CalendarDays, Play, Sparkles, Users } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import type { DmHubCampaign } from "./dmHubTypes.js";

interface DmHubFeaturedCampaignProps {
  campaign: DmHubCampaign;
  onOpen: () => void;
  onPrepare: () => void;
}

export function DmHubFeaturedCampaign({ campaign, onOpen, onPrepare }: DmHubFeaturedCampaignProps) {
  const { t } = useTranslation();
  const isActive = Boolean(campaign.stats?.activeSession) || campaign.status === "active";

  return (
    <article className="dm-hub-featured-campaign dm-panel--ornamented-primary">
      <button type="button" className="dm-hub-featured-campaign__surface" onClick={onOpen}>
        <div className="dm-hub-featured-campaign__cover" style={{ backgroundImage: `url(${campaign.coverUrl || "/assets/campaigns/default-campaign-cover.jpg"})` }} aria-hidden="true" />
        <div className="dm-hub-featured-campaign__content">
          <span className="dm-hub-featured-campaign__eyebrow"><Sparkles size={12} /> {t("landing.featuredCampaignLabel")}</span>
          <h3>{campaign.title}</h3>
          {campaign.summary && <p>{campaign.summary}</p>}
          <div className="dm-hub-featured-campaign__meta">
            <span>{campaign.system}</span>
            <span><CalendarDays size={12} /> {campaign.stats?.sessionsCount ?? 0} {t("landing.sessionsLabel")}</span>
            <span><Users size={12} /> {campaign.stats?.playersCount ?? 0} {t("landing.playersLabel")}</span>
          </div>
        </div>
        <span className={`dm-badge dm-badge--${isActive ? "active" : "paused"}`}>{isActive ? t("landing.statusActive") : t("landing.statusPaused")}</span>
        <ArrowUpRight size={17} className="dm-hub-featured-campaign__arrow" />
      </button>
      <div className="dm-hub-featured-campaign__actions">
        <button type="button" className="btn btn-gold btn-sm" onClick={onOpen}><Play size={13} /> {t("landing.enterCampaign", { title: campaign.title })}</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onPrepare}>{t("landing.prepareSession")}</button>
      </div>
    </article>
  );
}
