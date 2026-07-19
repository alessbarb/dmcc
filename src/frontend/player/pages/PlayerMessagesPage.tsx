import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CampaignMessagingPanel } from "../../shared/components/CampaignMessagingPanel.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { MobileDock } from "../../shared/components/MobileDock.js";
import { buildPlayerMobileDockItems } from "../navigation/playerMobileDockItems.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

function runPlayerMessagesAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

export function PlayerMessagesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const openTab = (tab: string) => {
    runPlayerMessagesAction(
      navigate({ to: `/player/campaigns/$campaignId/${tab}`, params: { campaignId } }),
      "No se pudo abrir la pestaña de la campaña.",
    );
  };
  const dockItems = buildPlayerMobileDockItems({
    t,
    openTab,
    openMessages: () => undefined,
  });

  return (
    <div className="player-messages-page">
      <PortalTopBar actions={(
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => openTab("overview")}
        >
          <ArrowLeft size={15} /> {t("playerPortal.messaging.backToPortal")}
        </button>
      )} />
      <main className="player-messages-page__main">
        <CampaignMessagingPanel campaignId={campaignId} />
      </main>
      <MobileDock
        items={dockItems}
        activeId="messages"
        ariaLabel={t("playerPortal.tabs.ariaLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("playerPortal.title")}
        closeLabel={t("common.close")}
      />
    </div>
  );
}
