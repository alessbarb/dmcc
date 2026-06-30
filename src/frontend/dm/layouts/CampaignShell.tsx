import React, { useEffect, useState } from "react";
import { Outlet, useParams, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { ToastContainer } from "../../shared/components/ToastContainer.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { EntityCreateModal } from "../entities/EntityCreateModal.js";
import { RelationCreateModal } from "../entities/RelationCreateModal.js";
import { AppFooter } from "../../shared/components/AppFooter.js";
import { logoutDm } from "../../shared/auth/authClient.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { QuickCaptureFAB } from "../capture/QuickCaptureFAB.js";
import { useKeyboardShortcuts } from "../../shared/hooks/useKeyboardShortcuts.js";
import {
  Shield,
  Activity,
  GitFork,
  List,
  Settings,
  Play,
  Search,
  User,
  Users,
  Layers,
  BookOpen,
  ArrowLeft,
  Plus,
  MapPin,
  Flag,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  LogOut,
} from "lucide-react";

type CampaignNavItem = {
  path: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  mobilePrimary?: boolean;
};

type PageMeta = {
  titleKey: string;
  eyebrowKey: string;
  descriptionKey: string;
};

const PAGE_META: Record<string, PageMeta> = {
  canvas: {
    titleKey: "campaignShell.meta.canvasTitle",
    eyebrowKey: "campaignShell.meta.canvasEyebrow",
    descriptionKey: "campaignShell.meta.canvasDescription",
  },
  dashboard: {
    titleKey: "campaignShell.meta.dashboardTitle",
    eyebrowKey: "campaignShell.meta.dashboardEyebrow",
    descriptionKey: "campaignShell.meta.dashboardDescription",
  },
  "what-now": {
    titleKey: "campaignShell.meta.whatNowTitle",
    eyebrowKey: "campaignShell.meta.whatNowEyebrow",
    descriptionKey: "campaignShell.meta.whatNowDescription",
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
  search: {
    titleKey: "campaignShell.meta.searchTitle",
    eyebrowKey: "campaignShell.meta.searchEyebrow",
    descriptionKey: "campaignShell.meta.searchDescription",
  },
  settings: {
    titleKey: "campaignShell.meta.settingsTitle",
    eyebrowKey: "campaignShell.meta.settingsEyebrow",
    descriptionKey: "campaignShell.meta.settingsDescription",
  },
  knowledge: {
    titleKey: "campaignShell.meta.knowledgeTitle",
    eyebrowKey: "campaignShell.meta.knowledgeEyebrow",
    descriptionKey: "campaignShell.meta.knowledgeDescription",
  },
};

export function CampaignShell() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const {
    selectCampaign,
    clearCampaign,
    activeCampaignId,
    campaignState,
    loading,
    error,
    isEntityModalOpen,
    setIsEntityModalOpen,
    isRelationModalOpen,
    setIsRelationModalOpen
  } = useCampaignStore();

  const exitCampaign = () => {
    clearCampaign();
    navigate({ to: "/dm" });
  };
  const navigate = useNavigate();

  const handleSignOutDm = async () => {
    clearCampaign();
    await logoutDm();
    await navigate({ to: "/" });
  };
  const { toasts, removeToast } = useToast();
  const { t } = useTranslation();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const role = sessionStorage.getItem("dmcc_role");

  const isDM = !role || role === "dm";

  useKeyboardShortcuts(
    {
      "g d": () => navigate({ to: `/campaigns/${campaignId}/dashboard` }),
      "g s": () => navigate({ to: `/campaigns/${campaignId}/session` }),
      "g e": () => navigate({ to: `/campaigns/${campaignId}/entities` }),
      "g b": () => navigate({ to: `/campaigns/${campaignId}/boards` }),
      "/": () => navigate({ to: `/campaigns/${campaignId}/search` }),
      n: () => setIsEntityModalOpen(true),
    },
    isDM
  );

  const [showExitTransition, setShowExitTransition] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setShowExitTransition(true);
    const timer = setTimeout(() => {
      setShowExitTransition(false);
    }, 850);
    return () => clearTimeout(timer);
  }, [campaignId]);

  useEffect(() => {
    if (role === "player") {
      navigate({ to: `/campaigns/${campaignId}/player-portal` });
    }
  }, [campaignId, role]);

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      selectCampaign(campaignId as any);
    }
  }, [campaignId]);

  const currentSegment = pathname.split("/")[3] ?? "";

  const NAV: CampaignNavItem[] = [
    { path: "dashboard", label: t("campaignShell.nav.dashboard"), Icon: Shield, mobilePrimary: true },
    { path: "what-now", label: t("campaignShell.nav.whatNow"), Icon: BookOpen, mobilePrimary: true },
    { path: "session", label: t("campaignShell.nav.session"), Icon: Play, mobilePrimary: true },
    { path: "entities", label: t("campaignShell.nav.entities"), Icon: Layers, mobilePrimary: true },
    { path: "search", label: t("campaignShell.nav.search"), Icon: Search, mobilePrimary: true },
    { path: "canvas", label: t("campaignShell.nav.canvas"), Icon: LayoutGrid },
    { path: "graph", label: t("campaignShell.nav.graph"), Icon: GitFork },
    { path: "timeline", label: t("campaignShell.nav.timeline"), Icon: List },
    { path: "boards", label: t("campaignShell.nav.boards"), Icon: Activity },
    { path: "players", label: t("campaignShell.nav.players"), Icon: User },
    { path: "knowledge", label: t("campaignShell.nav.knowledge"), Icon: Users },
    { path: "settings", label: t("campaignShell.nav.settings"), Icon: Settings },
  ];

  const mobilePrimaryNav = NAV.filter((item) => item.mobilePrimary);
  const mobileMoreNav = NAV.filter((item) => !item.mobilePrimary);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("dmcc-sidebar-collapsed") === "1"
  );
  const toggleSidebar = () => {
    setSidebarCollapsed(v => {
      const next = !v;
      localStorage.setItem("dmcc-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const activeSession = campaignState?.sessions?.find(s => s.status === "active");

  const pageMeta = PAGE_META[currentSegment] ?? {
    titleKey: currentSegment ? "" : "campaignShell.defaultTitle",
    eyebrowKey: "campaignShell.defaultEyebrow",
    descriptionKey: "campaignShell.defaultDescription",
  };

  const currentLocation = campaignState?.campaign?.currentLocationId
    ? campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentLocationId)
    : null;

  const currentQuest = campaignState?.campaign?.currentQuestId
    ? campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentQuestId)
    : null;

  const handleNavClick = (path: string) => {
    setMobileNavOpen(false);
    navigate({ to: `/campaigns/${campaignId}/${path}` });
  };

  const isFirstLoad = loading && !campaignState;
  const isLoadError = error && !campaignState;

  if (isFirstLoad) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px", opacity: 0.4 }}>⏳</div>
          <p style={{ margin: 0 }}>{t("campaignShell.loading.loadingTitle")}</p>
        </div>
      </div>
    );
  }

  if (isLoadError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", padding: "24px" }}>
        <div style={{ maxWidth: "400px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.3 }}>⚠️</div>
          <h2 style={{ color: "var(--text-main)", marginBottom: "8px" }}>{t("campaignShell.loading.errorTitle")}</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>{t("campaignShell.loading.errorDesc")}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "24px", fontFamily: "monospace", opacity: 0.6 }}>{error}</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => selectCampaign(campaignId as any)}
              style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              {t("campaignShell.loading.retry")}
            </button>
            <button
              onClick={exitCampaign}
              style={{ padding: "8px 16px", background: "transparent", color: "var(--text-main)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={14} />
              {t("campaignShell.loading.backToCampaigns")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container app-container--campaign-shell ${currentSegment === "canvas" ? "app-container--canvas" : ""}`}>
      {/* Sidebar Navigation */}
      <aside
        className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}
        style={{ width: sidebarCollapsed ? "52px" : "260px", transition: "width 0.2s ease" }}
      >
        <div className="sidebar-header" style={{ padding: sidebarCollapsed ? "16px 8px" : undefined, overflow: "hidden" }}>
          {!sidebarCollapsed && (
            <>
              <div className="sidebar-logo">{campaignState?.campaign?.title ?? t("campaignShell.defaultTitle")}</div>
              <div className="sidebar-logo-subtitle">{campaignState?.campaign?.system ?? ""}</div>
            </>
          )}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? t("campaignShell.expandMenu") : t("campaignShell.collapseMenu")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              marginTop: sidebarCollapsed ? 0 : "10px",
              width: "100%",
              justifyContent: sidebarCollapsed ? "center" : "flex-end",
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav" style={{ padding: sidebarCollapsed ? "12px 6px" : undefined }}>
          {NAV.map(({ path, label, Icon }) => (
            <div
              key={path}
              className={`nav-item ${currentSegment === path ? "active" : ""}`}
              onClick={() => handleNavClick(path)}
              title={sidebarCollapsed ? label : undefined}
              style={sidebarCollapsed ? { padding: "10px", justifyContent: "center", gap: 0 } : undefined}
            >
              <Icon size={16} />
              {!sidebarCollapsed && <span>{label}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: sidebarCollapsed ? "12px 8px" : undefined }}>
          {sidebarCollapsed ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={exitCampaign}
                title={t("nav.exit")}
                style={{ width: "100%", padding: "6px", justifyContent: "center" }}
              >
                <ArrowLeft size={14} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => void handleSignOutDm()}
                title={t("nav.signOut")}
                style={{ width: "100%", padding: "6px", justifyContent: "center" }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("nav.activeCampaign")}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={exitCampaign}
                >
                  <ArrowLeft size={14} /> {t("nav.exit")}
                </button>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => void handleSignOutDm()}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <LogOut size={14} /> {t("nav.signOut")}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top navigation */}
      <header className="campaign-mobile-header">
        <div className="campaign-mobile-header__title">
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
                    className={`campaign-mobile-nav-sheet__item ${currentSegment === path ? "active" : ""}`}
                    onClick={() => handleNavClick(path)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="campaign-mobile-nav-sheet__footer" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={exitCampaign}
              >
                <ArrowLeft size={14} />
                {t("nav.exit")}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => void handleSignOutDm()}
              >
                <LogOut size={14} />
                {t("nav.signOut")}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="campaign-mobile-bottom-nav" aria-label={t("campaignShell.mainNavigationLabel")}>
        {mobilePrimaryNav.map(({ path, label, Icon }) => (
          <button
            key={path}
            type="button"
            className={`campaign-mobile-bottom-nav__item ${currentSegment === path ? "active" : ""}`}
            onClick={() => handleNavClick(path)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}

        <button
          type="button"
          className="campaign-mobile-bottom-nav__item"
          onClick={() => setMobileNavOpen(true)}
        >
          <MoreHorizontal size={19} />
          <span>{t("campaignShell.mobileMore")}</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className={`main-content ${currentSegment === "canvas" ? "main-content--canvas" : ""}`}>
        {currentSegment !== "canvas" && (
          <header className="content-header">
            <div className="page-heading">
              <span className="page-eyebrow">{pageMeta.eyebrowKey ? t(pageMeta.eyebrowKey) : t("campaignShell.defaultEyebrow")}</span>
              <div className="page-title-row">
                <h1 className="page-title">{pageMeta.titleKey ? t(pageMeta.titleKey) : currentSegment}</h1>
                {campaignState?.campaign?.system && (
                  <span className="page-system-pill">{campaignState.campaign.system}</span>
                )}
              </div>
              <p className="page-description">{pageMeta.descriptionKey ? t(pageMeta.descriptionKey) : t("campaignShell.defaultDescription")}</p>

              {(currentLocation || currentQuest) && (
                <div className="page-context" aria-label={t("campaignShell.currentContext")}>
                  {currentLocation && (
                    <span className="context-chip">
                      <MapPin size={14} /> {t("campaignShell.currentLocation", { title: currentLocation.title })}
                    </span>
                  )}
                  {currentQuest && (
                    <span className="context-chip context-chip--primary">
                      <Flag size={14} /> {t("campaignShell.currentQuest", { title: currentQuest.title })}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="top-bar-actions header-actions">
              {activeSession ? (
                <span className="badge badge-success" style={{ padding: "8px 12px" }}>
                  {t("campaignShell.activeSession", { number: activeSession.number || 1, title: activeSession.title })}
                </span>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate({ to: `/campaigns/${campaignId}/session` })}
                >
                  <Play size={14} /> {t("campaignShell.prepareOrStartSession")}
                </button>
              )}

              <button className="btn btn-secondary btn-sm" onClick={() => setIsEntityModalOpen(true)}>
                <Plus size={14} /> {t("campaignShell.newEntity")}
              </button>

              <button className="btn btn-secondary btn-sm" onClick={() => void handleSignOutDm()}>
                <LogOut size={14} /> {t("nav.signOut")}
              </button>
            </div>
          </header>
        )}

        {currentSegment === "canvas" ? (
          <Outlet />
        ) : (
          <div className="content-body">
            <Outlet />
          </div>
        )}
      </main>

      {currentSegment !== "canvas" && <AppFooter />}

      {/* Modals */}
      <EntityCreateModal isOpen={isEntityModalOpen} onClose={() => setIsEntityModalOpen(false)} />
      <RelationCreateModal isOpen={isRelationModalOpen} onClose={() => setIsRelationModalOpen(false)} />

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {campaignId && <QuickCaptureFAB campaignId={campaignId} />}

      {showExitTransition && (
        <div className="mystical-portal-overlay mystical-portal-overlay--out" aria-hidden="true">
          <div className="mystical-portal-glow"></div>
        </div>
      )}
    </div>
  );
}
