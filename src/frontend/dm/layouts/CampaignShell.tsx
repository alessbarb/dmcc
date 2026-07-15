import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { ToastContainer } from "../../shared/components/ToastContainer.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { EntityCreateModal } from "../entities/EntityCreateModal.js";
import { RelationCreateModal } from "../entities/RelationCreateModal.js";
import { AppFooter } from "../../shared/components/AppFooter.js";
import { logout } from "../../shared/auth/authClient.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { QuickCaptureFAB } from "../capture/QuickCaptureFAB.js";
import { CampaignGuidedTour } from "../onboarding/CampaignGuidedTour.js";
import { LiveTableModal } from "../components/LiveTableModal.js";
import { AccountModal } from "../../account/AccountModal.js";
import { useKeyboardShortcuts } from "../../shared/hooks/useKeyboardShortcuts.js";
import { MobileDock } from "../../shared/components/MobileDock.js";
import { orderCampaignMobileDockItems } from "../navigation/campaignNavigation.js";
import { CAMPAIGN_SECTIONS } from "../navigation/campaignSections.js";
import { ShortcutsPanel } from "../shortcuts/ShortcutsPanel.js";

export function CampaignShell() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const navigate = useNavigate();
  const handleNavigationError = (error: unknown) => {
    console.error("Campaign navigation failed", error);
  };
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { t } = useTranslation();
  const { toasts, removeToast } = useToast();
  const {
    selectCampaign,
    clearCampaign,
    activeCampaignId,
    activeCampaignRole,
    campaignState,
    loading,
    error,
    isEntityModalOpen,
    setIsEntityModalOpen,
    isRelationModalOpen,
    setIsRelationModalOpen,
  } = useCampaignStore();

  const [showEnterTransition, setShowEnterTransition] = useState(true);
  const [liveTableModalOpen, setLiveTableModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("dmcc-sidebar-collapsed") === "1",
  );

  const currentSegment = pathname.split("/")[3] ?? "";
  const isDM = activeCampaignRole === "dm";

  const exitCampaign = () => {
    clearCampaign();
    void navigate({ to: "/dm" }).catch(handleNavigationError);
  };

  const handleSignOutDm = async () => {
    clearCampaign();
    await logout();
    await navigate({ to: "/" });
  };

  const shortcuts: Record<string, () => void> = {
    n: () => setIsEntityModalOpen(true),
  };
  for (const section of CAMPAIGN_SECTIONS) {
    if (section.keyboardShortcut) {
      shortcuts[section.keyboardShortcut] = () => {
        void navigate({ to: `/campaigns/${campaignId}/${section.path}` }).catch(handleNavigationError);
      };
    }
  }

  useKeyboardShortcuts(shortcuts, isDM);

  useEffect(() => {
    setShowEnterTransition(true);
    const timer = window.setTimeout(() => setShowEnterTransition(false), 420);
    return () => window.clearTimeout(timer);
  }, [campaignId]);

  useEffect(() => {
    if (activeCampaignRole === "player") {
      void navigate({ to: "/player/campaigns/$campaignId/overview", params: { campaignId } }).catch(handleNavigationError);
    }
  }, [activeCampaignRole, campaignId, navigate]);

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      void selectCampaign(campaignId);
    }
  }, [activeCampaignId, campaignId, selectCampaign]);

  const primaryNav = CAMPAIGN_SECTIONS.filter((item) => item.placement === "primary");
  const secondaryNav = CAMPAIGN_SECTIONS.filter((item) => item.placement === "secondary");

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("dmcc-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const activeSession = campaignState?.sessions?.find((session) => session.status === "active");

  const handleNavClick = (path: string) => {
    void navigate({ to: `/campaigns/${campaignId}/${path}` }).catch(handleNavigationError);
  };

  const dockNavItems = orderCampaignMobileDockItems(CAMPAIGN_SECTIONS);
  const dockItems = dockNavItems.map(({ path, labelKey, icon: Icon }) => ({
    id: path,
    label: t(labelKey),
    Icon,
    onSelect: () => handleNavClick(path),
  }));

  const renderSidebarItems = (items: typeof CAMPAIGN_SECTIONS) =>
    items.map(({ path, labelKey, icon: Icon }) => (
      <button
        type="button"
        key={path}
        className={`nav-item ${currentSegment === path ? "active" : ""}`}
        data-tour-id={`campaign-nav-${path}`}
        onClick={() => handleNavClick(path)}
        title={sidebarCollapsed ? t(labelKey) : undefined}
        aria-current={currentSegment === path ? "page" : undefined}
        style={sidebarCollapsed ? { padding: "10px", justifyContent: "center", gap: 0 } : undefined}
      >
        <Icon size={16} />
        {!sidebarCollapsed && <span>{t(labelKey)}</span>}
      </button>
    ));

  const isCanvasRoute = pathname.includes("/map/canvas");

  if (loading && !campaignState) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main)",
        }}
      >
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          {t("campaignShell.loading.loadingTitle")}
        </p>
      </div>
    );
  }

  if (error && !campaignState) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main)",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h2>{t("campaignShell.loading.errorTitle")}</h2>
          <p style={{ color: "var(--text-muted)" }}>{t("campaignShell.loading.errorDesc")}</p>
          <p style={{ color: "var(--color-danger)", fontFamily: "monospace" }}>{error}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary" type="button" onClick={() => void selectCampaign(campaignId)}>
              {t("campaignShell.loading.retry")}
            </button>
            <button className="btn btn-secondary" type="button" onClick={exitCampaign}>
              <ArrowLeft size={14} /> {t("campaignShell.loading.backToCampaigns")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`app-container app-container--campaign-shell ${isCanvasRoute ? "app-container--canvas" : ""
        }`}
    >
      <aside className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
        <div
          className="sidebar-header"
          data-tour-id="campaign-current-campaign"
          style={{ padding: sidebarCollapsed ? "16px 8px" : undefined, overflow: "hidden" }}
        >
          <button
            type="button"
            onClick={exitCampaign}
            title={t("nav.backToHub")}
            className="btn btn-secondary btn-sm"
            style={{
              width: "100%",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
            }}
          >
            <ArrowLeft size={13} />
            {!sidebarCollapsed && <span>{t("nav.backToHub")}</span>}
          </button>

          {!sidebarCollapsed && (
            <>
              <div className="sidebar-logo">
                {campaignState?.campaign?.title ?? t("campaignShell.defaultTitle")}
              </div>
              <div className="sidebar-logo-subtitle">{campaignState?.campaign?.system ?? ""}</div>
            </>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            title={
              sidebarCollapsed
                ? t("campaignShell.expandMenu")
                : t("campaignShell.collapseMenu")
            }
            aria-label={
              sidebarCollapsed
                ? t("campaignShell.expandMenu")
                : t("campaignShell.collapseMenu")
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 4,
              display: "flex",
              width: "100%",
              justifyContent: sidebarCollapsed ? "center" : "flex-end",
              marginTop: 10,
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav
          className="sidebar-nav"
          aria-label={t("campaignShell.mainNavigationLabel")}
          style={{ padding: sidebarCollapsed ? "12px 6px" : undefined }}
        >
          {renderSidebarItems(primaryNav)}
          <div className="sidebar-nav__separator" aria-hidden="true" />
          {!sidebarCollapsed && (
            <p className="sidebar-nav__section-label">{t("campaignShell.mobileTools")}</p>
          )}
          {renderSidebarItems(secondaryNav)}
          {isDM && campaignId && (
            <>
              <div className="sidebar-nav__separator" aria-hidden="true" />
              <ShortcutsPanel campaignId={campaignId} collapsed={sidebarCollapsed} />
            </>
          )}
        </nav>

        <div className="sidebar-footer" style={{ padding: sidebarCollapsed ? "12px 8px" : undefined }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => setAccountModalOpen(true)}
              title={t("account.title")}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <User size={14} /> {!sidebarCollapsed && t("account.title")}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => void handleSignOutDm()}
              title={t("nav.signOut")}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <LogOut size={14} /> {!sidebarCollapsed && t("nav.signOut")}
            </button>
          </div>
        </div>
      </aside>

      <header className="campaign-mobile-header">
        <div className="campaign-mobile-header__title" data-tour-id="campaign-mobile-title">
          <strong>{campaignState?.campaign?.title ?? t("campaignShell.defaultTitle")}</strong>
          <span>{campaignState?.campaign?.system ?? ""}</span>
        </div>
      </header>

      <MobileDock
        items={dockItems}
        activeId={currentSegment}
        ariaLabel={t("campaignShell.mainNavigationLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("campaignShell.campaignMenuLabel")}
        closeLabel={t("common.close")}
      />


      <main
        className={`main-content ${isCanvasRoute ? "main-content--canvas" : ""}`}
        data-tour-id="campaign-main-workspace"
      >
        {isCanvasRoute ? <Outlet /> : <div className="content-body"><Outlet /></div>}
      </main>

      {!isCanvasRoute && <AppFooter />}

      <EntityCreateModal isOpen={isEntityModalOpen} onClose={() => setIsEntityModalOpen(false)} />
      <RelationCreateModal
        isOpen={isRelationModalOpen}
        onClose={() => setIsRelationModalOpen(false)}
      />
      <LiveTableModal
        campaignId={campaignId}
        isOpen={liveTableModalOpen}
        onClose={() => setLiveTableModalOpen(false)}
        activeSessionId={activeSession?.sessionId ?? null}
      />
      <AccountModal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {campaignId && !isCanvasRoute && <QuickCaptureFAB campaignId={campaignId} />}
      {campaignId && (
        <CampaignGuidedTour
          campaignId={campaignId}
          enabled={isDM && Boolean(campaignState?.campaign)}
        />
      )}

      {showEnterTransition && (
        <div className="mystical-portal-overlay mystical-portal-overlay--out" aria-hidden="true">
          <div className="mystical-portal-glow" />
        </div>
      )}
    </div>
  );
}
