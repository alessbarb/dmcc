import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
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
import { useWorkspaceDensity } from "../../shared/hooks/useWorkspaceDensity.js";
import { useScreenSafeModeStore } from "../../shared/stores/screenSafeModeStore.js";
import { useBodyWatermark, type BodyWatermarkMode } from "../../shared/hooks/useBodyWatermark.js";
import { formatSystemName } from "../../shared/presentation/formatSystemName.js";
import "./campaign-route-transitions.css";
import "../../shared/styles/layout/campaign-navigation.css";
import "../../shared/styles/features/sidebar-nav.css";

export function CampaignShell() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const navigate = useNavigate();
  const handleNavigationError = (error: unknown) => {
    console.error("Campaign navigation failed", error);
  };
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { t, locale } = useTranslation();
  const { toasts, removeToast } = useToast();

  const isImmersiveRoute = (path: string): boolean => {
    return path.includes("/map/canvas") || path.includes("/map/network");
  };
  const isImmersive = isImmersiveRoute(pathname);
  const watermarkMode: BodyWatermarkMode = pathname.includes("/map/network")
    ? "network"
    : pathname.includes("/map/canvas")
      ? "canvas"
      : pathname.includes("/library/notebooks")
        ? "notebooks"
        : pathname.includes("/rules")
          ? "hidden"
          : "default";
  useBodyWatermark(watermarkMode);
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("dmcc-sidebar-collapsed") === "1",
  );
  const workspaceDensity = useWorkspaceDensity();
  const screenSafeMode = useScreenSafeModeStore((s) => s.enabled);
  const toggleScreenSafeMode = useScreenSafeModeStore((s) => s.toggle);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

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
        className={`nav-item ${currentSegment === path ? "active" : ""} ${sidebarCollapsed ? "nav-item--collapsed" : ""}`}
        data-tour-id={`campaign-nav-${path}`}
        onClick={() => handleNavClick(path)}
        title={sidebarCollapsed ? t(labelKey) : undefined}
        aria-label={sidebarCollapsed ? t(labelKey) : undefined}
        aria-current={currentSegment === path ? "page" : undefined}
      >
        <Icon size={16} />
        {!sidebarCollapsed && <span>{t(labelKey)}</span>}
      </button>
    ));

  // Immersive route logic replaces isCanvasRoute check

  if (loading && !campaignState) {
    return (
      <div className="campaign-shell-feedback campaign-shell-feedback--loading">
        <p className="campaign-shell-feedback__message">
          {t("campaignShell.loading.loadingTitle")}
        </p>
      </div>
    );
  }

  if (error && !campaignState) {
    return (
      <div className="campaign-shell-feedback campaign-shell-feedback--error">
        <div className="campaign-shell-feedback__content">
          <h2>{t("campaignShell.loading.errorTitle")}</h2>
          <p className="campaign-shell-feedback__description">{t("campaignShell.loading.errorDesc")}</p>
          <p className="campaign-shell-feedback__error">{error}</p>
          <div className="campaign-shell-feedback__actions">
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
      className={`app-container app-container--campaign-shell app-container--workspace ${
        sidebarCollapsed ? "app-container--sidebar-collapsed" : ""
      } ${isImmersive ? "app-container--canvas" : ""} ${isFullscreen ? "app-container--fullscreen" : ""}`}
      data-workspace-density={workspaceDensity}
      data-shell-fullscreen={isFullscreen ? "true" : "false"}
      data-screen-safe-mode={screenSafeMode ? "true" : "false"}
    >
      <aside className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
        <div
          className={`sidebar-header ${sidebarCollapsed ? "sidebar-header--collapsed" : ""}`}
          data-tour-id="campaign-current-campaign"
        >
          <button
            type="button"
            onClick={exitCampaign}
            title={t("nav.backToHub")}
            aria-label={sidebarCollapsed ? t("nav.backToHub") : undefined}
            className={`campaign-shell__back-button ${sidebarCollapsed ? "campaign-shell__back-button--collapsed" : ""}`}
          >
            <ArrowLeft size={16} />
            {!sidebarCollapsed && <span>{t("nav.backToHub")}</span>}
          </button>

          {!sidebarCollapsed && (
            <>
              <div
                className="sidebar-logo u-truncate u-truncate--full-width"
                title={campaignState?.campaign?.title ?? t("campaignShell.defaultTitle")}
              >
                {campaignState?.campaign?.title ?? t("campaignShell.defaultTitle")}
              </div>
              <div className="sidebar-logo-subtitle">{formatSystemName(campaignState?.campaign?.system, locale)}</div>
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
            className={`sidebar-toggle ${sidebarCollapsed ? "sidebar-toggle--collapsed" : ""}`}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav
          className={`sidebar-nav ${sidebarCollapsed ? "sidebar-nav--collapsed" : ""}`}
          aria-label={t("campaignShell.mainNavigationLabel")}
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

        <div className={`sidebar-footer ${sidebarCollapsed ? "sidebar-footer--collapsed" : ""}`}>
          <div className="sidebar-footer__actions">
            <button
              className={`btn btn-sm sidebar-footer__action ${screenSafeMode ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={toggleScreenSafeMode}
              title={screenSafeMode ? t("campaignShell.screenSafeModeOff") : t("campaignShell.screenSafeModeOn")}
              aria-label={sidebarCollapsed ? (screenSafeMode ? t("campaignShell.screenSafeModeOff") : t("campaignShell.screenSafeModeOn")) : undefined}
              aria-pressed={screenSafeMode}
            >
              {screenSafeMode ? <EyeOff size={14} /> : <Eye size={14} />}
              {!sidebarCollapsed && (screenSafeMode ? t("campaignShell.screenSafeModeOff") : t("campaignShell.screenSafeModeOn"))}
            </button>
            <button
              className="btn btn-secondary btn-sm sidebar-footer__action"
              type="button"
              onClick={() => setAccountModalOpen(true)}
              title={t("account.title")}
              aria-label={sidebarCollapsed ? t("account.title") : undefined}
            >
              <User size={14} /> {!sidebarCollapsed && t("account.title")}
            </button>
            <button
              className="btn btn-secondary btn-sm sidebar-footer__action"
              type="button"
              onClick={() => void handleSignOutDm()}
              title={t("nav.signOut")}
              aria-label={sidebarCollapsed ? t("nav.signOut") : undefined}
            >
              <LogOut size={14} /> {!sidebarCollapsed && t("nav.signOut")}
            </button>
          </div>
        </div>
      </aside>

      <header className="campaign-mobile-header">
        <div className="campaign-mobile-header__title" data-tour-id="campaign-mobile-title">
          <strong>{campaignState?.campaign?.title ?? t("campaignShell.defaultTitle")}</strong>
          <span>{formatSystemName(campaignState?.campaign?.system, locale)}</span>
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
        id="campaign-main-workspace"
        className={`main-content main-content--workspace ${isImmersive ? "main-content--canvas" : ""}`}
        data-tour-id="campaign-main-workspace"
      >
        <Outlet />
      </main>

      {!isImmersive && <AppFooter />}


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

      {campaignId && !isImmersive && !pathname.includes("/messages") && (
        <QuickCaptureFAB campaignId={campaignId} />
      )}
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
