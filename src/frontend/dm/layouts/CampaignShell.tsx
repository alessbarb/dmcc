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
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  User,
  Users,
  X,
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

type CampaignNavGroup = "primary" | "secondary";

type CampaignNavItem = {
  path: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  group: CampaignNavGroup;
  mobilePrimary?: boolean;
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [liveTableModalOpen, setLiveTableModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("dmcc-sidebar-collapsed") === "1",
  );

  const currentSegment = pathname.split("/")[3] ?? "";
  const isDM = activeCampaignRole === "dm";

  const exitCampaign = () => {
    clearCampaign();
    navigate({ to: "/dm" });
  };

  const handleSignOutDm = async () => {
    clearCampaign();
    await logout();
    await navigate({ to: "/" });
  };

  useKeyboardShortcuts(
    {
      "g d": () => navigate({ to: `/campaigns/${campaignId}/command-center` }),
      "g s": () => navigate({ to: `/campaigns/${campaignId}/session` }),
      "g e": () => navigate({ to: `/campaigns/${campaignId}/entities` }),
      "g b": () => navigate({ to: `/campaigns/${campaignId}/boards` }),
      "/": () => navigate({ to: `/campaigns/${campaignId}/search` }),
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
      navigate({ to: "/portal" });
    }
  }, [activeCampaignRole, navigate]);

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      void selectCampaign(campaignId);
    }
  }, [activeCampaignId, campaignId, selectCampaign]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  const navItems: CampaignNavItem[] = [
    {
      path: "command-center",
      label: t("campaignShell.nav.dashboard"),
      Icon: Shield,
      group: "primary",
      mobilePrimary: true,
    },
    {
      path: "session",
      label: t("campaignShell.nav.session"),
      Icon: Play,
      group: "primary",
      mobilePrimary: true,
    },
    {
      path: "entities",
      label: t("campaignShell.nav.entities"),
      Icon: Layers,
      group: "primary",
      mobilePrimary: true,
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
      mobilePrimary: true,
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
  const mobilePrimaryNav = navItems.filter((item) => item.mobilePrimary);
  const mobileMoreNav = navItems.filter((item) => !item.mobilePrimary);

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
    setMobileNavOpen(false);
    navigate({ to: `/campaigns/${campaignId}/${path}` });
  };

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
      className={`app-container app-container--campaign-shell ${
        currentSegment === "canvas" ? "app-container--canvas" : ""
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

      {mobileNavOpen && (
        <div
          className="campaign-mobile-nav-overlay"
          role="presentation"
          onClick={() => setMobileNavOpen(false)}
        >
          <section
            className="campaign-mobile-nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t("campaignShell.campaignMenuLabel")}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="campaign-mobile-nav-sheet__header">
              <div>
                <strong>{campaignState?.campaign?.title ?? t("campaignShell.defaultTitle")}</strong>
                <span>{campaignState?.campaign?.system ?? ""}</span>
              </div>
              <button
                type="button"
                className="campaign-mobile-icon-btn"
                onClick={() => setMobileNavOpen(false)}
                aria-label={t("campaignShell.closeCampaignMenuLabel")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="campaign-mobile-nav-sheet__body">
              <p className="campaign-mobile-nav-sheet__eyebrow">{t("campaignShell.mobileTools")}</p>
              <div className="campaign-mobile-nav-sheet__grid">
                {mobileMoreNav.map(({ path, label, Icon }) => (
                  <button
                    key={path}
                    type="button"
                    className={`campaign-mobile-nav-sheet__item ${
                      currentSegment === path ? "active" : ""
                    }`}
                    data-tour-id={`campaign-mobile-nav-${path}`}
                    onClick={() => handleNavClick(path)}
                    aria-current={currentSegment === path ? "page" : undefined}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="campaign-mobile-nav-sheet__footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={exitCampaign}>
                <ArrowLeft size={14} /> {t("nav.backToHub")}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setAccountModalOpen(true)}
              >
                <User size={14} /> {t("account.title")}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => void handleSignOutDm()}
              >
                <LogOut size={14} /> {t("nav.signOut")}
              </button>
            </div>
          </section>
        </div>
      )}

      <nav className="campaign-mobile-bottom-nav" aria-label={t("campaignShell.mainNavigationLabel")}>
        {mobilePrimaryNav.map(({ path, label, Icon }) => (
          <button
            key={path}
            type="button"
            className={`campaign-mobile-bottom-nav__item ${
              currentSegment === path ? "active" : ""
            }`}
            data-tour-id={`campaign-mobile-nav-${path}`}
            onClick={() => handleNavClick(path)}
            aria-current={currentSegment === path ? "page" : undefined}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
        <button
          type="button"
          className="campaign-mobile-bottom-nav__item"
          data-tour-id="campaign-mobile-nav-more"
          onClick={() => setMobileNavOpen(true)}
          aria-expanded={mobileNavOpen}
          aria-haspopup="dialog"
        >
          <MoreHorizontal size={19} />
          <span>{t("campaignShell.mobileMore")}</span>
        </button>
      </nav>

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
                  onClick={() => navigate({ to: `/campaigns/${campaignId}/session` })}
                >
                  <Play size={14} /> {t("campaignShell.prepareOrStartSession")}
                </button>
              )}

              <button
                className="btn btn-secondary btn-sm"
                type="button"
                data-tour-id="campaign-action-new-entity"
                onClick={() => setIsEntityModalOpen(true)}
              >
                <Plus size={14} /> {t("campaignShell.newEntity")}
              </button>

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
