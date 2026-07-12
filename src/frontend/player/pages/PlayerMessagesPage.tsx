import React from "react";
import { ArrowLeft, BookOpen, FileText, Flag, Home, MessageCircle, Network, Shield, User } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CampaignMessagingPanel } from "../../shared/components/CampaignMessagingPanel.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { MobileDock } from "../../shared/components/MobileDock.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function PlayerMessagesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const openPortalTab = (tab: string) => navigate({ to: `/portal?campaignId=${encodeURIComponent(campaignId)}&tab=${tab}` as any });
  const dockItems = [
    { id: "home", label: t("playerPortal.tabs.home"), Icon: Home, onSelect: () => openPortalTab("home") },
    { id: "character", label: t("playerPortal.tabs.character"), Icon: User, onSelect: () => openPortalTab("character") },
    { id: "messages", label: t("playerPortal.messaging.heading"), Icon: MessageCircle, onSelect: () => undefined },
    { id: "recap", label: t("playerPortal.tabs.recap"), Icon: BookOpen, onSelect: () => openPortalTab("recap") },
    { id: "memory", label: t("playerPortal.tabs.memory"), Icon: Shield, onSelect: () => openPortalTab("memory") },
    { id: "constellation", label: t("playerPortal.tabs.constellation"), Icon: Network, onSelect: () => openPortalTab("constellation") },
    { id: "objectives", label: t("playerPortal.tabs.objectives"), Icon: Flag, onSelect: () => openPortalTab("objectives") },
    { id: "notes", label: t("playerPortal.tabs.notes"), Icon: FileText, onSelect: () => openPortalTab("notes") },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", paddingBottom: "calc(5.25rem + env(safe-area-inset-bottom))" }}>
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
      <MobileDock
        items={dockItems}
        activeId="messages"
        ariaLabel={t("playerPortal.tabs.ariaLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("playerPortal.title")}
      />
    </div>
  );
}
