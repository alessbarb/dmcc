import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CampaignMessagingPanel } from "../../shared/components/CampaignMessagingPanel.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function PlayerMessagesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)" }}>
      <PortalTopBar actions={(
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate({ to: `/portal?campaignId=${encodeURIComponent(campaignId)}&tab=home` as any })}
        >
          <ArrowLeft size={15} /> {t("playerPortal.messaging.backToPortal")}
        </button>
      )} />
      <main style={{ width: "min(1100px, calc(100% - 24px))", margin: "0 auto", padding: "18px 0 32px" }}>
        <CampaignMessagingPanel campaignId={campaignId} />
      </main>
    </div>
  );
}
