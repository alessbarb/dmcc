import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  GitFork,
  Layers,
  LayoutGrid,
  List,
  LogOut,
  MapPin,
  MessageCircle,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  User,
  Users,
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

type CampaignNavGroup = "primary" | "secondary";

type CampaignNavItem = {
  path: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  group: CampaignNavGroup;
};

type PageMeta = {
  titleKey: string;
  eyebrowKey: string;
  descriptionKey: string;
};

const PAGE_META: Record<string, PageMeta> = {
  "command-center": {
    titleKey: "campaignShell.meta.dashboardTitle",
    eyebrowKey: "campaignShell.meta.dashboardEyebrow",
    descriptionKey: "campaignShell.meta.dashboardDescription",
  },
  session: {
    titleKey: "campaignShell.meta.sessionTitle",
    eyebrowKey: "campaignShell.meta.sessionEyebrow",
    descriptionKey: "campaignShell.meta.sessionDescription",
  },
  entities: {
    titleKey: "campaignShell.meta.entitiesTitle",
    eyebrowKey: "campaignShell.meta.entitiesEyebrow",
    descriptionKey: "campaignShell.meta.entitiesDescription",
  },
  canvas: {
    titleKey: "campaignShell.meta.canvasTitle",
    eyebrowKey: "campaignShell.meta.canvasEyebrow",
    descriptionKey: "campaignShell.meta.canvasDescription",
  },
  graph: {
    titleKey: "campaignShell.meta.graphTitle",
    eyebrowKey: "campaignShell.meta.graphEyebrow",
    descriptionKey: "campaignShell.meta.graphDescription",
  },
  timeline: {
    titleKey: "campaignShell.meta.timelineTitle",
    eyebrowKey: "campaignShell.meta.timelineEyebrow",
    descriptionKey: "campaignShell.meta.timelineDescription",
  },
  search: {
    titleKey: "campaignShell.meta.searchTitle",
    eyebrowKey: "campaignShell.meta.searchEyebrow",
    descriptionKey: "campaignShell.meta.searchDescription",
  },
  boards: {
    titleKey: "campaignShell.meta.boardsTitle",
    eyebrowKey: "campaignShell.meta.boardsEyebrow",
    descriptionKey: "campaignShell.meta.boardsDescription",
  },
  players: {
    titleKey: "campaignShell.meta.playersTitle",
    eyebrowKey: "campaignShell.meta.playersEyebrow",
    descriptionKey: "campaignShell.meta.playersDescription",
  },
  messages: {
    titleKey: "campaignShell.meta.playersTitle",
    eyebrowKey: "campaignShell.meta.playersEyebrow",
    descriptionKey: "campaignShell.meta.playersDescription",
  },
  rules: {
    titleKey: "nav.rules",
    eyebrowKey: "campaignShell.meta.searchEyebrow",
    descriptionKey: "rules.searchInRules",
  },
  knowledge: {
    titleKey: "campaignShell.meta.knowledgeTitle",
    eyebrowKey: "campaignShell.meta.knowledgeEyebrow",
    descriptionKey: "campaignShell.meta.knowledgeDescription",
  },
  settings: {
    titleKey: "campaignShell.meta.settingsTitle",
    eyebrowKey: "campaignShell.meta.settingsEyebrow",
    descriptionKey: "campaignShell.meta.settingsDescription",
  },
};

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

  useKeyboardShortcuts(
    {
      "g d": () => { void navigate({ to: `/campaigns/${campaignId}/command-center` }).catch(handleNavigationError); },
      "g s": () => { void navigate({ to: `/campaigns/${campaignId}/session` }).catch(handleNavigationError); },
      "g e": () => { void navigate({ to: `/campaigns/${campaignId}/entities` }).catch(handleNavigationError); },
      "g c": () => { void navigate({ to: `/campaigns/${campaignId}/canvas` }).catch(handleNavigationError); },
      "g b": () => { void navigate({ to: `/campaigns/${campaignId}/boards` }).catch(handleNavigationError); },
      "/": () => { void navigate({ to: `/campaigns/${campaignId}/search` }).catch(handleNavigationError); },
      n: () => setIsEntityModalOpen(true),
    },
    isDM,
  );

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

  const navItems: CampaignNavItem[] = [
    {
      path: "command-center",
      label: t("campaignShell.nav.dashboard"),
      Icon: Shield,
      group: "primary",
    },
    {
      path: "session",
      label: t("campaignShell.nav.session"),
      Icon: Play,
      group: "primary",
    },
    {
      path: "entities",
      label: t("campaignShell.nav.entities"),
      Icon: Layers,
      group: "primary",
    },
    {
      path: "canvas",
      label: t("campaignShell.nav.canvas"),
      Icon: LayoutGrid,
      group: "primary",
    },
    {
      path: "graph",
      label: t("campaignShell.nav.graph"),
      Icon: GitFork,
      group: "primary",
    },
    {
      path: "timeline",
      label: t("campaignShell.nav.timeline"),
      Icon: List,
      group: "primary",
    },
    {
      path: "search",
      label: t("campaignShell.nav.search"),
      Icon: Search,
      group: "secondary",
    },
    {
      path: "boards",
      label: t("campaignShell.nav.boards"),
      Icon: LayoutGrid,
      group: "secondary",
    },
    {
      path: "players",
      label: t("campaignShell.nav.players"),
      Icon: User,
      group: "secondary",
    },
    {
      path: "messages",
      label: "Mensajes",
      Icon: MessageCircle,
      group: "secondary",
    },
    {
      path: "rules",
      label: t("nav.rules"),
      Icon: BookOpen,
      group: "secondary",
    },
    {
      path: "knowledge",
      label: t("campaignShell.nav.knowledge"),
      Icon: Users,
      group: "secondary",
    },
    {
      path: "settings",
      label: t("campaignShell.nav.settings"),
      Icon: Settings,
      group: "secondary",
    },
  ];

  const primaryNav = navItems.filter((item) => item.group === "primary");
  const secondaryNav = navItems.filter((item) => item.group === "secondary");

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("dmcc-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const activeSession = campaignState?.sessions?.find((session) => session.status === "active");
  const pageMeta = PAGE_META[currentSegment] ?? {
    titleKey: "campaignShell.defaultTitle",
    eyebrowKey: "campaignShell.defaultEyebrow",
    descriptionKey: "campaignShell.defaultDescription",
  };
  const currentLocation = campaignState?.campaign?.currentLocationId
    ? campaignState.entities.find(
      (entity) => entity.entityId === campaignState.campaign?.currentLocationId,
    )
    : null;
  const currentQuest = campaignState?.campaign?.currentQuestId
    ? campaignState.entities.find(
      (entity) => entity.entityId === campaignState.campaign?.currentQuestId,
    )
    : null;

  const handleNavClick = (path: string) => {
    void navigate({ to: `/campaigns/${campaignId}/${path}` }).catch(handleNavigationError);
  };

  const dockNavItems = orderCampaignMobileDockItems(navItems);
  const dockItems = dockNavItems.map(({ path, label, Icon }) => ({
    id: path,
    label,
    Icon,
    onSelect: () => handleNavClick(path),
  }));

  const renderSidebarItems = (items: CampaignNavItem[]) =>
    items.map(({ path, label, Icon }) => (
      <button
        type="button"
        key={path}
        className={`nav-item ${currentSegment === path ? "active" : ""}`}
        data-tour-id={`campaign-nav-${path}`}
        onClick={() => handleNavClick(path)}
        title={sidebarCollapsed ? label : undefined}
        aria-current={currentSegment === path ? "page" : undefined}
        style={sidebarCollapsed ? { padding: "10px", justifyContent: "center", gap: 0 } : undefined}
      >
        <Icon size={16} />
        {!sidebarCollapsed && <span>{label}</span>}
      </button>
    ));

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
      className={`app-container app-container--campaign-shell ${currentSegment === "canvas" ? "app-container--canvas" : ""
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
        className={`main-content ${currentSegment === "canvas" ? "main-content--canvas" : ""}`}
        data-tour-id="campaign-main-workspace"
      >
        {currentSegment !== "canvas" && (
          <header className="content-header">
            <div className="page-heading">
              <span className="page-eyebrow">{t(pageMeta.eyebrowKey)}</span>
              <div className="page-title-row">
                <h1 className="page-title">{t(pageMeta.titleKey)}</h1>
                {campaignState?.campaign?.system && (
                  <span className="page-system-pill">{campaignState.campaign.system}</span>
                )}
              </div>
              <p className="page-description">{t(pageMeta.descriptionKey)}</p>

              {(currentLocation || currentQuest) && (
                <div className="page-context" aria-label={t("campaignShell.currentContext")}>
                  {currentLocation && (
                    <span className="context-chip">
                      <MapPin size={14} />
                      {t("campaignShell.currentLocation", { title: currentLocation.title })}
                    </span>
                  )}
                  {currentQuest && (
                    <span className="context-chip context-chip--primary">
                      <Flag size={14} />
                      {t("campaignShell.currentQuest", { title: currentQuest.title })}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="top-bar-actions header-actions">
              {activeSession ? (
                <span className="badge badge-success" data-tour-id="campaign-action-session">
                  {t("campaignShell.activeSession", {
                    number: activeSession.number || 1,
                    title: activeSession.title,
                  })}
                </span>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  type="button"
                  data-tour-id="campaign-action-session"
                  onClick={() => { void navigate({ to: `/campaigns/${campaignId}/session` }).catch(handleNavigationError); }}
                >
                  <Play size={14} /> {t("campaignShell.prepareOrStartSession")}
                </button>
              )}

              {currentSegment !== "entities" && (
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  data-tour-id="campaign-action-new-entity"
                  onClick={() => setIsEntityModalOpen(true)}
                >
                  <Plus size={14} /> {t("campaignShell.newEntity")}
                </button>
              )}

              <button
                className="btn btn-secondary btn-sm"
                type="button"
                data-tour-id="campaign-action-live-table"
                onClick={() => setLiveTableModalOpen(true)}
              >
                <Users size={14} /> {t("dashboard.runSession")}
              </button>

              <button
                className="btn btn-secondary btn-sm"
                type="button"
                data-tour-id="campaign-action-tour"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("dmcc:start-campaign-tour", { detail: { campaignId } }),
                  )
                }
              >
                <BookOpen size={14} /> {t("campaignTour.replayShort")}
              </button>
            </div>
          </header>
        )}

        {currentSegment === "canvas" ? <Outlet /> : <div className="content-body"><Outlet /></div>}
      </main>

      {currentSegment !== "canvas" && <AppFooter />}

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

      {campaignId && currentSegment !== "canvas" && <QuickCaptureFAB campaignId={campaignId} />}
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
