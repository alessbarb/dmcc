import { useParams } from "@tanstack/react-router";
import { CampaignMessagingPanel } from "../../shared/components/CampaignMessagingPanel.js";
import "./campaignMessagesPage.css";

export function CampaignMessagesPage() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  return (
    <div className="campaign-messages-page">
      <CampaignMessagingPanel campaignId={campaignId} dmMode />
    </div>
  );
}
