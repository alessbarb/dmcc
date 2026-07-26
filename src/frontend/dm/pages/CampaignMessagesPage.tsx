import { useParams } from "@tanstack/react-router";
import { CampaignMessagingPanel } from "../../shared/components/CampaignMessagingPanel.js";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import "./campaignMessagesPage.css";

export function CampaignMessagesPage() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  return (
    <CampaignWorkspace
      titleKey="campaignShell.meta.messagesTitle"
      variant="content"
    >
      <div className="campaign-messages-page">
        <CampaignMessagingPanel campaignId={campaignId} dmMode fullBleed />
      </div>
    </CampaignWorkspace>
  );
}
