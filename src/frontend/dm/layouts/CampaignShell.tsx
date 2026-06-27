import React, { useEffect, useState } from "react";
import { Outlet, useParams, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { ToastContainer } from "../../shared/components/ToastContainer.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { EntityCreateModal } from "../entities/EntityCreateModal.js";
import { RelationCreateModal } from "../entities/RelationCreateModal.js";
import { AppFooter } from "../../shared/components/AppFooter.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import {
  Shield,
  Activity,
  GitFork,
  List,
  Settings,
  Play,
  Search,
  User,
  Layers,
  BookOpen,
  ArrowLeft,
  Plus,
  MapPin,
  Flag,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
};

export function CampaignShell() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const {
    selectCampaign,
    activeCampaignId,
    campaignState,
    isEntityModalOpen,
    setIsEntityModalOpen,
    isRelationModalOpen,
    setIsRelationModalOpen,
    startSession
  } = useCampaignStore();
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const { t } = useTranslation();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const role = sessionStorage.getItem("dmcc_role");

  const [showExitTransition, setShowExitTransition] = useState(true);

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

  const NAV = [
    { path: "canvas", label: t("campaignShell.nav.canvas"), Icon: LayoutGrid },
    { path: "dashboard", label: t("campaignShell.nav.dashboard"), Icon: Shield },
    { path: "what-now", label: t("campaignShell.nav.whatNow"), Icon: BookOpen },
    { path: "session", label: t("campaignShell.nav.session"), Icon: Play },
    { path: "entities", label: t("campaignShell.nav.entities"), Icon: Layers },
    { path: "graph", label: t("campaignShell.nav.graph"), Icon: GitFork },
    { path: "timeline", label: t("campaignShell.nav.timeline"), Icon: List },
    { path: "boards", label: t("campaignShell.nav.boards"), Icon: Activity },
    { path: "players", label: t("campaignShell.nav.players"), Icon: User },
    { path: "search", label: t("campaignShell.nav.search"), Icon: Search },
    { path: "settings", label: t("campaignShell.nav.settings"), Icon: Settings },
  ];

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
    navigate({ to: `/campaigns/${campaignId}/${path}` });
  };

  return (
    <div className={`app-container ${currentSegment === "canvas" ? "app-container--canvas" : ""}`}>
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
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate({ to: "/" })}
              title={t("nav.exit")}
              style={{ width: "100%", padding: "6px", justifyContent: "center" }}
            >
              <ArrowLeft size={14} />
            </button>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{t("nav.activeCampaign")}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate({ to: "/" })}
              >
                <ArrowLeft size={14} /> {t("nav.exit")}
              </button>
            </div>
          )}
        </div>
      </aside>

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
                  onClick={() => startSession(t("campaignShell.newSessionTitle", { number: (campaignState?.sessions ?? []).length + 1 }))}
                >
                  <Play size={14} /> {t("campaignShell.startNewSession")}
                </button>
              )}

              <button className="btn btn-secondary btn-sm" onClick={() => setIsEntityModalOpen(true)}>
                <Plus size={14} /> {t("campaignShell.newEntity")}
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

      {showExitTransition && (
        <div className="mystical-portal-overlay mystical-portal-overlay--out" aria-hidden="true">
          <div className="mystical-portal-glow"></div>
        </div>
      )}
    </div>
  );
}
