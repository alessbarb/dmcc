import React, { useEffect, useState } from "react";
import { useNavigate, useRouterState, useParams } from "@tanstack/react-router";
import type { Entity } from "./shared/stores/campaignStore.js";
import { useCampaignStore } from "./shared/stores/campaignStore.js";
import {
  Shield,
  Activity,
  GitFork,
  List,
  Settings,
  Plus,
  Play,
  X,
  RotateCcw,
  Search,
  MapPin,
  User,
  AlertTriangle,
  FolderOpen,
  BookOpen,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";
import { getCampaignExitDecision } from "./shared/utils/campaignExit.js";
import { getRuleSystem } from "@core/domain/rules/index.js";
import { useToast } from "./shared/hooks/useToast.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";
import { ToastContainer } from "./shared/components/ToastContainer.js";
import { TimelinePage } from "./dm/sessions/TimelinePage.js";
import { SearchPage } from "./dm/pages/SearchPage.js";
import { BoardsPage } from "./dm/pages/BoardsPage.js";
import { RulesPage } from "./dm/pages/RulesPage.js";
import { SettingsPage } from "./dm/pages/SettingsPage.js";
import { DashboardPage } from "./dm/pages/DashboardPage.js";
import { WhatNowPage } from "./dm/pages/WhatNowPage.js";
import { PlayersPage } from "./dm/pages/PlayersPage.js";
import { SessionPage } from "./dm/sessions/SessionPage.js";
import { EntitiesPage } from "./dm/entities/EntitiesPage.js";
import { GraphPage } from "./dm/graph/GraphPage.js";
import { EntityDetailModal } from "./dm/entities/EntityDetailModal.js";
import { AppFooter } from "./shared/components/AppFooter.js";
import { TypeMetadataForm } from "./dm/entities/TypeMetadataForm.js";
import { PortalTopBar } from "./shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { lockDm } from "./shared/auth/authClient.js";
import { LandingCampaignCard } from "./shared/components/LandingCampaignCard.js";

export function App() {
  const { t } = useTranslation();
  const {
    campaigns,
    activeCampaignId,
    campaignState,
    dashboard,
    whatNow,
    graph,
    timeline,
    visibility,
    loading,
    error,
    fetchVaults,
    fetchCampaigns,
    selectCampaign,
    createCampaign,
    createEntity,
    createRelation,
    createFact,
    updateEntity,
    archiveEntity,
    createPlayer,
    updatePlayer,
    archivePlayer,
    startSession,
    revealClue,
    closeSession,
    recordSessionEvent,
    exportJson,
    exportMarkdown,
    createBackup,
    restoreBackup,
  } = useCampaignStore();

  const { toasts, addToast, removeToast } = useToast();

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const navigate = useNavigate();
  const params: any = useParams({ strict: false });

  const campaignIdFromUrl = params.campaignId || (pathname.startsWith("/join/") ? pathname.split("/")[2] : null);
  const selectedCampaignId = campaignIdFromUrl || activeCampaignId;
  const currentPage = pathname.startsWith("/join/") ? "join" :
    pathname.endsWith("/player-portal") ? "player-portal" :
      (pathname.split("/")[3] || (selectedCampaignId ? "canvas" : "landing"));

  const setCurrentPage = (pageName: string) => {
    if (selectedCampaignId) {
      if (pageName === "player-portal") {
        navigate({ to: `/campaigns/${selectedCampaignId}/player-portal` });
      } else {
        navigate({ to: `/campaigns/${selectedCampaignId}/${pageName}` });
      }
    } else {
      navigate({ to: "/" });
    }
  };

  // Forms & Modals state
  const [newCampaignTitle, setNewCampaignTitle] = useState("");
  const [newCampaignSystem, setNewCampaignSystem] = useState("generic_fantasy_d20");
  const [newCampaignTemplate, setNewCampaignTemplate] = useState("empty");
  const [landingSearchQuery, setLandingSearchQuery] = useState("");
  const [backupRestorePath, setBackupRestorePath] = useState("");

  const [mysticalTransitionId, setMysticalTransitionId] = useState<string | null>(null);

  const triggerMysticalTransition = (campaignId: string) => {
    setMysticalTransitionId(campaignId);
    setTimeout(async () => {
      try {
        await selectCampaign(campaignId);
        navigate({ to: `/campaigns/${campaignId}/canvas` });
      } catch (e) {
        console.error(e);
        setMysticalTransitionId(null);
      }
    }, 850);
  };

  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityForm, setEntityForm] = useState({
    entityType: "npc",
    title: "",
    subtitle: "",
    summary: "",
    content: "",
    status: "active",
    importance: "normal",
    visibility: { kind: "dm_only" },
    metadata: { imageUrl: "" } as any
  });

  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [relationForm, setRelationForm] = useState({
    sourceEntityId: "",
    targetEntityId: "",
    relationType: "located_in"
  });

  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entitySearchQuery, setEntitySearchQuery] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");

  // Graph filter
  const [graphTypeFilter, setGraphTypeFilter] = useState<string[]>([]);

  // Global search
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchTypeFilter, setGlobalSearchTypeFilter] = useState("all");

  // Player form
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ name: "", displayName: "", email: "", imageUrl: "" });
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // Captura rápida form
  const [quickCaptureType, setQuickCaptureType] = useState("note");
  const [quickCaptureText, setQuickCaptureText] = useState("");

  // Close session summary
  const [sessionSummary, setSessionSummary] = useState("");
  const [isExitSessionModalOpen, setIsExitSessionModalOpen] = useState(false);
  const [exitSessionSummary, setExitSessionSummary] = useState("");

  // Expanded events state for JSON viewing in timeline
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  // Active filter for the timeline events
  const [timelineFilter, setTimelineFilter] = useState<string>("all");

  const toggleEventJson = (eventId: string) => {
    setExpandedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { acquireLocalDmToken, fetchAuthStatus, getDmSessionToken } = await import("./shared/auth/authClient.js");
        const status = await fetchAuthStatus();
        // On /dm: ensure we have a DM session
        if (!status.dmSessionValid && status.localRequest && !status.dmPinConfigured) {
          await acquireLocalDmToken(); // also calls setDmLastUnlocked internally
        } else if (!status.dmSessionValid && !getDmSessionToken()) {
          // No valid session and not local/no PIN — SmartLanding will handle routing
        }
      } catch (e) {
        // Non-fatal: server may not have new auth endpoints yet
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (isLocalhost) {
          try {
            const resToken = await fetch("/api/auth/local-token");
            if (resToken.ok) {
              const { token } = await resToken.json();
              sessionStorage.setItem("dmcc_dmSessionToken", token);
            }
          } catch { /* ignore */ }
        }
      }
      fetchVaults();
      fetchCampaigns();
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (campaignIdFromUrl && campaignIdFromUrl !== activeCampaignId) {
      selectCampaign(campaignIdFromUrl);
    }
  }, [campaignIdFromUrl, activeCampaignId]);

  // Sync default status when entity type changes in form
  const handleEntityTypeChange = (type: string) => {
    let defaultStatus = "active";
    let defaultMetadata = {};

    if (type === "npc") {
      defaultStatus = "known";
      defaultMetadata = { role: "", attitudeToParty: "neutral", goal: "" };
    } else if (type === "location") {
      defaultStatus = "visited";
      defaultMetadata = { locationType: "settlement", atmosphere: "" };
    } else if (type === "quest") {
      defaultStatus = "active";
      defaultMetadata = { priority: "main", rewardPromised: "" };
    } else if (type === "clue") {
      defaultStatus = "prepared";
      defaultMetadata = { clueType: "physical", content: "" };
    } else if (type === "secret") {
      defaultStatus = "dm_only";
      defaultMetadata = { truth: "" };
    } else if (type === "clock") {
      defaultStatus = "active";
      defaultMetadata = { maxSegments: 4, currentSegments: 0, meaning: "" };
    } else if (type === "consequence") {
      defaultStatus = "pending";
      defaultMetadata = { impact: "", triggerCondition: "" };
    } else if (type === "player_character") {
      defaultStatus = "active";
      defaultMetadata = getRuleSystem(campaignState?.campaign?.system).getInitialCharacterMetadata();
    } else if (type === "faction") {
      defaultStatus = "active";
      defaultMetadata = { goal: "", attitudeToParty: "neutral", influence: "minor" };
    } else if (type === "item") {
      defaultStatus = "unknown";
      defaultMetadata = { itemType: "artifact", currentHolder: "" };
    } else if (type === "creature") {
      defaultStatus = "alive";
      defaultMetadata = { creatureType: "beast", threat: "moderate" };
    } else if (type === "encounter") {
      defaultStatus = "planned";
      defaultMetadata = { difficulty: "medium", location: "" };
    } else if (type === "scene") {
      defaultStatus = "planned";
      defaultMetadata = { mood: "", trigger: "" };
    } else if (type === "front") {
      defaultStatus = "active";
      defaultMetadata = { stakes: "", countdown: "" };
    } else if (type === "rumor") {
      defaultStatus = "unverified";
      defaultMetadata = { source: "", truth: "unknown" };
    } else if (type === "decision") {
      defaultStatus = "pending";
      defaultMetadata = { options: "", madeAt: "" };
    } else if (type === "rule_reference") {
      defaultStatus = "active";
      defaultMetadata = { system: "", page: "" };
    } else if (type === "handout") {
      defaultStatus = "withheld";
      defaultMetadata = { deliveredAt: "" };
    }

    setEntityForm({
      ...entityForm,
      entityType: type,
      status: defaultStatus,
      metadata: { imageUrl: "", ...defaultMetadata }
    });
  };

  const handleCreateCampaignSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim()) return;
    try {
      if (newCampaignTemplate && newCampaignTemplate !== "empty") {
        sessionStorage.setItem("dmcc_pending_seed_template", newCampaignTemplate);
      }
      const campaignId = await createCampaign(newCampaignTitle.trim(), newCampaignSystem);
      setNewCampaignTitle("");
      setNewCampaignTemplate("empty");
      if (campaignId) {
        triggerMysticalTransition(campaignId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreBackupSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!backupRestorePath.trim()) return;
    restoreBackup(backupRestorePath.trim());
    setBackupRestorePath("");
  };

  const handleCreateEntitySubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!entityForm.title.trim()) return;
    await createEntity(entityForm);
    setIsEntityModalOpen(false);
    setEntityForm({
      entityType: "npc",
      title: "",
      subtitle: "",
      summary: "",
      content: "",
      status: "known",
      importance: "normal",
      visibility: { kind: "dm_only" },
      metadata: { role: "", attitudeToParty: "neutral", goal: "", imageUrl: "" }
    });
  };

  const handleCreateRelationSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!relationForm.sourceEntityId || !relationForm.targetEntityId) return;
    await createRelation(relationForm);
    // If createRelation set an error (duplicate), keep modal open — user sees the error
    const storeError = useCampaignStore.getState().error;
    if (!storeError) {
      setIsRelationModalOpen(false);
      setRelationForm({ sourceEntityId: "", targetEntityId: "", relationType: "located_in" });
    }
  };

  const handleQuickCaptureSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!quickCaptureText.trim()) return;

    const activeSession = campaignState?.sessions.find(s => s.status === "active");
    const sessionId = activeSession?.sessionId;

    if (quickCaptureType === "note") {
      await createEntity({
        entityType: "note",
        title: quickCaptureText.substring(0, 30) + (quickCaptureText.length > 30 ? "..." : ""),
        content: quickCaptureText,
        status: "active",
        createdInSessionId: sessionId
      });
    } else if (quickCaptureType === "clue") {
      await createEntity({
        entityType: "clue",
        title: quickCaptureText.substring(0, 30) + (quickCaptureText.length > 30 ? "..." : ""),
        content: quickCaptureText,
        status: "prepared",
        createdInSessionId: sessionId,
        metadata: { content: quickCaptureText }
      });
    } else if (quickCaptureType === "fact") {
      await createFact({
        statement: quickCaptureText,
        kind: "canon",
        confidence: "confirmed",
        relatedEntityIds: [],
        source: sessionId ? { kind: "session", sessionId } : { kind: "manual" }
      });
    } else if (quickCaptureType === "consequence") {
      await createEntity({
        entityType: "consequence",
        title: quickCaptureText.substring(0, 30) + (quickCaptureText.length > 30 ? "..." : ""),
        summary: quickCaptureText,
        status: "pending",
        createdInSessionId: sessionId
      });
    }

    setQuickCaptureText("");
  };

  const activeSession = campaignState?.sessions.find(s => s.status === "active");

  const handleLockDm = async () => {
    await lockDm();
    await navigate({ to: "/" });
  };

  const exitCampaign = async () => {
    await navigate({ to: "/" });
    useCampaignStore.setState({
      activeCampaignId: null,
      campaignState: null,
      dashboard: null,
      whatNow: null,
      graph: null,
      timeline: null,
      visibility: null,
      loading: false,
      error: null,
    });
  };

  const handleExitCampaign = () => {
    if (getCampaignExitDecision(campaignState?.sessions) === "confirm-close-session") {
      setExitSessionSummary(activeSession?.summary ?? "");
      setIsExitSessionModalOpen(true);
      return;
    }

    exitCampaign();
  };

  const handleConfirmExitAndCloseSession = async () => {
    if (!activeSession || !exitSessionSummary.trim()) {
      return;
    }

    await closeSession(activeSession.sessionId, exitSessionSummary.trim());
    setExitSessionSummary("");
    setIsExitSessionModalOpen(false);
    exitCampaign();
  };

  // Render Landing Page
  if (!activeCampaignId || !campaignState) {
    const filteredCampaigns = campaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(landingSearchQuery.toLowerCase()) ||
        c.campaignId.toLowerCase().includes(landingSearchQuery.toLowerCase())
    );

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PortalTopBar actions={
          <button
            type="button"
            onClick={() => void handleLockDm()}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
          >
            <Lock size={13} />
            {t("nav.lockWorkspace")}
          </button>
        } />
      <div className="landing-shell">
        {/* Animated Hero Header */}
        <header className="landing-hero">
          <RpgPortalBackground />

          <div className="landing-hero__content">
            <span className="landing-badge">
              <Sparkles size={12} style={{ marginRight: "4px" }} />
              {t("landing.badge")}
            </span>
            <h1 className="landing-hero__title">
              {t("landing.title1")} <span>{t("landing.title2")}</span>
            </h1>
            <p className="landing-hero__subtitle">
              {t("landing.heroSubtitle")}
            </p>
          </div>
        </header>

        {/* Feature Highlights Tour */}
        <section className="landing-features-grid">
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Layers size={20} />
            </div>
            <h4>{t("landing.featureCanvasTitle")}</h4>
            <p>{t("landing.featureCanvasDesc")}</p>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Play size={20} />
            </div>
            <h4>{t("landing.featureLanTitle")}</h4>
            <p>{t("landing.featureLanDesc")}</p>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Activity size={20} />
            </div>
            <h4>{t("landing.featureMemoryTitle")}</h4>
            <p>{t("landing.featureMemoryDesc")}</p>
          </div>
        </section>

        {/* Main Grid: Campaigns & Creator */}
        <div className="landing-grid">
          <section className="card landing-card campaigns-archive-section">
            <div className="campaigns-archive-header">
              <div className="archive-title-group">
                <FolderOpen size={18} />
                <h2>{t("landing.archiveTitle")}</h2>
              </div>

              {/* Instant Search Bar */}
              <div className="archive-search-wrapper">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  className="archive-search-input"
                  {...{placeholder: t("landing.searchPlaceholder")}}
                  value={landingSearchQuery}
                  onChange={(e) => setLandingSearchQuery(e.target.value)}
                />
                {landingSearchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setLandingSearchQuery("")}
                    aria-label={t("landing.searchClearAriaLabel")}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <p className="landing-muted">{t("landing.loadingCampaigns")}</p>
            ) : error ? (
              <div className="landing-empty landing-error-container">
                <AlertTriangle size={24} className="icon-critical" />
                <p>{t("landing.errorTitle")}</p>
                <span>{error}</span>
                <button className="btn btn-secondary" type="button" onClick={() => fetchCampaigns()}>
                  {t("landing.retryButton")}
                </button>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="landing-empty landing-empty--campaigns">
                <img
                  src="/assets/empty_campaigns_list.png"
                  alt=""
                  aria-hidden="true"
                  className="landing-empty__emblem"
                />
                <div className="landing-empty__copy">
                  {landingSearchQuery ? (
                    <>
                      <p>{t("landing.searchEmptyTitle")}</p>
                      <span>{t("landing.searchEmptyDesc", { query: landingSearchQuery })}</span>
                    </>
                  ) : (
                    <>
                      <p>{t("landing.emptyTitle")}</p>
                      <span>{t("landing.emptyDesc")}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="campaign-grid-list">
                {filteredCampaigns.map((c) => (
                  <LandingCampaignCard
                    key={c.campaignId}
                    campaign={c}
                    onSelect={(campaignId) => {
                      triggerMysticalTransition(campaignId);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="landing-side-stack">
            {/* New Campaign Creator Card */}
            <section className="card landing-card landing-create-card">
              <div className="landing-section-header">
                <h2>
                  <Plus size={18} />
                  {t("landing.createTitle")}
                </h2>
              </div>

              <form onSubmit={handleCreateCampaignSubmit} className="landing-creator-form">
                <div className="form-group">
                  <label className="form-label">{t("landing.campaignTitleLabel")}</label>
                  <input
                    type="text"
                    className="form-input"
                    {...{placeholder: t("landing.campaignTitlePlaceholder")}}
                    value={newCampaignTitle}
                    onChange={(e) => setNewCampaignTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("landing.systemLabel")}</label>
                  <select
                    className="form-select"
                    value={newCampaignSystem}
                    onChange={(e) => setNewCampaignSystem(e.target.value)}
                  >
                    <option value="generic_fantasy_d20">{t("landing.systemFantasyD20Generic")}</option>
                    <option value="dnd_srd_5_2_1">{t("landing.systemDnD")}</option>
                    <option value="custom">{t("landing.systemCustom")}</option>
                  </select>
                </div>

                {/* Stepped Template Selection */}
                <div className="form-group">
                  <label className="form-label">{t("landing.templateLabel")}</label>
                  <div className="template-options-grid">
                    <label className={`template-option ${newCampaignTemplate === "empty" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="campaignTemplate"
                        value="empty"
                        checked={newCampaignTemplate === "empty"}
                        onChange={(e) => setNewCampaignTemplate(e.target.value)}
                        className="hidden-radio"
                      />
                      <span className="template-label">{t("landing.templateEmpty")}</span>
                      <span className="template-desc">{t("landing.templateEmptyDesc")}</span>
                    </label>
                    <label className={`template-option ${newCampaignTemplate === "mystery" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="campaignTemplate"
                        value="mystery"
                        checked={newCampaignTemplate === "mystery"}
                        onChange={(e) => setNewCampaignTemplate(e.target.value)}
                        className="hidden-radio"
                      />
                      <span className="template-label">{t("landing.templateMystery")}</span>
                      <span className="template-desc">{t("landing.templateMysteryDesc")}</span>
                    </label>
                    <label className={`template-option ${newCampaignTemplate === "faction" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="campaignTemplate"
                        value="faction"
                        checked={newCampaignTemplate === "faction"}
                        onChange={(e) => setNewCampaignTemplate(e.target.value)}
                        className="hidden-radio"
                      />
                      <span className="template-label">{t("landing.templateFaction")}</span>
                      <span className="template-desc">{t("landing.templateFactionDesc")}</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary landing-primary-action">
                  {t("landing.createButton")}
                </button>
              </form>
            </section>

            {/* Backup Restore Card */}
            <section className="card landing-card landing-restore-card">
              <details>
                <summary>
                  <span>
                    <RotateCcw size={17} />
                    {t("landing.restoreTitle")}
                  </span>
                </summary>

                <form onSubmit={handleRestoreBackupSubmit} className="landing-restore-form">
                  <div className="form-group">
                    <label className="form-label">{t("landing.backupNameLabel")}</label>
                    <input
                      type="text"
                      className="form-input"
                      {...{placeholder: t("landing.backupNamePlaceholder")}}
                      value={backupRestorePath}
                      onChange={(e) => setBackupRestorePath(e.target.value)}
                      required
                    />
                    <small className="form-help">
                      {t("landing.backupHelp")}
                    </small>
                  </div>

                  <button type="submit" className="btn btn-secondary landing-secondary-action">
                    {t("landing.restoreButton")}
                  </button>
                </form>
              </details>
            </section>
          </div>
        </div>

        <AppFooter variant="landing" />

        {mysticalTransitionId && (
          <div className="mystical-portal-overlay mystical-portal-overlay--in" aria-live="assertive">
            <div className="mystical-portal-glow"></div>
            <div className="mystical-portal-text">{t("landing.enteringCampaign")}</div>
          </div>
        )}
      </div>
    </div>
    );
  }

  // Campaña activa Layout
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">{campaignState.campaign?.title}</div>
          <div className="sidebar-logo-subtitle">{campaignState.campaign?.system}</div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentPage("dashboard")}
          >
            <Activity /> {t("nav.dashboard")}
          </div>
          <div
            className={`nav-item ${currentPage === "what-now" ? "active" : ""}`}
            onClick={() => setCurrentPage("what-now")}
          >
            <BookOpen /> {t("nav.whatNow")}
          </div>
          <div
            className={`nav-item ${currentPage === "session" ? "active" : ""}`}
            onClick={() => setCurrentPage("session")}
          >
            <Play /> {t("nav.activeSession")} {activeSession && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-success)", display: "inline-block", marginLeft: "auto" }}></span>}
          </div>
          <div
            className={`nav-item ${currentPage === "entities" ? "active" : ""}`}
            onClick={() => setCurrentPage("entities")}
          >
            <Layers /> {t("nav.entities")}
          </div>
          <div
            className={`nav-item ${currentPage === "graph" ? "active" : ""}`}
            onClick={() => setCurrentPage("graph")}
          >
            <GitFork /> {t("nav.graph")}
          </div>
          <div
            className={`nav-item ${currentPage === "timeline" ? "active" : ""}`}
            onClick={() => setCurrentPage("timeline")}
          >
            <List /> {t("nav.timeline")}
          </div>
          <div
            className={`nav-item ${currentPage === "search" ? "active" : ""}`}
            onClick={() => setCurrentPage("search")}
          >
            <Search /> {t("nav.search")}
          </div>
          {campaignState?.campaign?.system === "dnd_srd_5_2_1" && (
            <div
              className={`nav-item ${currentPage === "rules" ? "active" : ""}`}
              onClick={() => setCurrentPage("rules")}
            >
              <BookOpen /> {t("nav.rules")}
            </div>
          )}
          <div
            className={`nav-item ${currentPage === "players" ? "active" : ""}`}
            onClick={() => setCurrentPage("players")}
          >
            <User /> {t("nav.players")}
          </div>
          <div
            className={`nav-item ${currentPage === "boards" ? "active" : ""}`}
            onClick={() => setCurrentPage("boards")}
          >
            <Layers style={{ transform: "rotate(90deg)" }} /> {t("nav.boards")}
          </div>
          <div
            className={`nav-item ${currentPage === "settings" ? "active" : ""}`}
            onClick={() => setCurrentPage("settings")}
          >
            <Settings /> {t("nav.settings")}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{t("nav.activeCampaign")}</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExitCampaign}
            >
              {t("nav.exit")}
            </button>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", opacity: 0.6, fontSize: "0.78rem" }}
            onClick={() => void handleLockDm()}
          >
            <Lock size={12} />
            {t("nav.lockWorkspace")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            {campaignState.campaign?.currentLocationId && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                <MapPin size={16} /> {campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentLocationId)?.title || t("landing.topBarUnknownLocation")}
              </span>
            )}
            {campaignState.campaign?.currentQuestId && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "var(--primary)", borderLeft: "1px solid var(--border-color)", paddingLeft: "12px", marginLeft: "12px" }}>
                <Shield size={16} /> {t("landing.topBarActiveQuest")} {campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentQuestId)?.title || "Unknown Quest"}
              </span>
            )}
          </div>

          <div className="top-bar-actions">
            {activeSession ? (
              <span className="badge badge-success" style={{ padding: "8px 12px" }}>
                Session #{activeSession.number || 1} Active: "{activeSession.title}"
              </span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => startSession(`Session ${campaignState.sessions.length + 1}`)}>
                <Play size={14} />{t("landing.topBarStartSession")}
              </button>
            )}

            <button className="btn btn-secondary btn-sm" onClick={() => setIsEntityModalOpen(true)}>
              <Plus size={14} />{t("landing.topBarNewEntity")}
            </button>
          </div>
        </div>

        <div className="content-body">
          {/* PAGE CONTENT */}

          {/* 1. Dashboard Page */}
          {currentPage === "dashboard" && dashboard && (
            <DashboardPage
              dashboard={dashboard}
              campaignState={campaignState}
              setCurrentPage={setCurrentPage}
              setSelectedEntity={setSelectedEntity}
            />
          )}

          {/* 2. Qué toca ahora Page */}
          {currentPage === "what-now" && whatNow && (
            <WhatNowPage
              whatNow={whatNow}
              campaignState={campaignState}
              setSelectedEntity={setSelectedEntity}
              setCurrentPage={setCurrentPage}
            />
          )}

          {/* 3. Session Runner Page */}
          {currentPage === "session" && (
            <SessionPage
              campaignState={campaignState}
              activeSession={activeSession}
              quickCaptureType={quickCaptureType}
              setQuickCaptureType={setQuickCaptureType}
              quickCaptureText={quickCaptureText}
              setQuickCaptureText={setQuickCaptureText}
              sessionSummary={sessionSummary}
              setSessionSummary={setSessionSummary}
              handleQuickCaptureSubmit={handleQuickCaptureSubmit}
              startSession={startSession}
              closeSession={closeSession}
              createEntity={createEntity}
              createRelation={createRelation}
              revealClue={revealClue}
              recordSessionEvent={recordSessionEvent}
              addToast={addToast}
              setCurrentPage={setCurrentPage}
              setIsEntityModalOpen={setIsEntityModalOpen}
              setIsRelationModalOpen={setIsRelationModalOpen}
            />
          )}

          {/* 4. Narrative Entities Page */}
          {currentPage === "entities" && (
            <EntitiesPage
              campaignState={campaignState}
              selectedEntity={selectedEntity}
              setSelectedEntity={setSelectedEntity}
              entitySearchQuery={entitySearchQuery}
              setEntitySearchQuery={setEntitySearchQuery}
              entityTypeFilter={entityTypeFilter}
              setEntityTypeFilter={setEntityTypeFilter}
              setIsEntityModalOpen={setIsEntityModalOpen}
            />
          )}

          {/* 5. Relation Graph Page */}
          {currentPage === "graph" && graph && (
            <GraphPage
              graph={graph}
              campaignState={campaignState}
              selectedEntity={selectedEntity}
              setSelectedEntity={setSelectedEntity}
              graphTypeFilter={graphTypeFilter}
              setGraphTypeFilter={setGraphTypeFilter}
              setIsRelationModalOpen={setIsRelationModalOpen}
            />
          )}

          {/* 6. Event Log Timeline Page */}
          {currentPage === "timeline" && timeline && (
            <TimelinePage
              timeline={timeline}
              campaignState={campaignState}
              timelineFilter={timelineFilter}
              setTimelineFilter={setTimelineFilter}
              expandedEvents={expandedEvents}
              toggleEventJson={toggleEventJson}
            />
          )}

          {/* 8. Search Page */}
          {currentPage === "search" && (
            <SearchPage
              campaignState={campaignState}
              searchQuery={globalSearchQuery}
              setSearchQuery={setGlobalSearchQuery}
              searchTypeFilter={globalSearchTypeFilter}
              setSearchTypeFilter={setGlobalSearchTypeFilter}
              setSelectedEntity={setSelectedEntity}
              setCurrentPage={setCurrentPage}
            />
          )}

          {/* Rules Reference Page */}
          {currentPage === "rules" && (
            <RulesPage />
          )}

          {/* 9. Players & Characters Page */}
          {currentPage === "players" && (
            <PlayersPage
              campaignState={campaignState}
              campaigns={campaigns}
              activeCampaignId={activeCampaignId}
              visibility={visibility}
              createPlayer={createPlayer}
              updatePlayer={updatePlayer}
              archivePlayer={archivePlayer}
              isPlayerModalOpen={isPlayerModalOpen}
              setIsPlayerModalOpen={setIsPlayerModalOpen}
              editingPlayerId={editingPlayerId}
              setEditingPlayerId={setEditingPlayerId}
              playerForm={playerForm}
              setPlayerForm={setPlayerForm}
              setSelectedEntity={setSelectedEntity}
              addToast={addToast}
            />
          )}

          {/* 9. Boards Page */}
          {currentPage === "boards" && <BoardsPage />}

          {/* 10. Settings & Export Page */}
          {currentPage === "settings" && (
            <SettingsPage
              campaigns={campaigns}
              activeCampaignId={activeCampaignId}
              campaignState={campaignState}
              vaults={[]}
              activeVaultId={null}
              createBackup={createBackup}
              exportJson={exportJson}
              exportMarkdown={exportMarkdown}
              onCampaignDeleted={exitCampaign}
              addToast={addToast}
            />
          )}
        </div>
      </main>

      {/* CREATE ENTITY MODAL */}
      {isEntityModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontWeight: "700" }}>Crear entidad narrativa</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setIsEntityModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateEntitySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tipo de entidad</label>
                  <select
                    className="form-select"
                    value={entityForm.entityType}
                    onChange={(e) => handleEntityTypeChange(e.target.value)}
                  >
                    <optgroup label="Personajes">
                      <option value="npc">PNJ (Personaje No Jugador)</option>
                      <option value="player_character">Personaje jugador</option>
                      <option value="creature">Criatura / Monstruo</option>
                    </optgroup>
                    <optgroup label="Lugares">
                      <option value="location">Ubicación</option>
                      <option value="scene">Escena</option>
                    </optgroup>
                    <optgroup label="Narrativa">
                      <option value="quest">Misión</option>
                      <option value="clue">Pista</option>
                      <option value="secret">Secreto</option>
                      <option value="rumor">Rumor</option>
                      <option value="decision">Punto de decisión</option>
                      <option value="consequence">Consecuencia</option>
                      <option value="front">Frente / Amenaza</option>
                      <option value="clock">Reloj narrativo</option>
                    </optgroup>
                    <optgroup label="Organizaciones y objetos">
                      <option value="faction">Facción / Organización</option>
                      <option value="item">Objeto / Artefacto</option>
                      <option value="encounter">Encuentro</option>
                    </optgroup>
                    <optgroup label="Referencia">
                      <option value="rule_reference">Regla de referencia</option>
                      <option value="handout">Handout</option>
                      <option value="note">Nota</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Título / Nombre</label>
                  <input
                    type="text"
                    className="form-input"
                    value={entityForm.title}
                    onChange={(e) => setEntityForm({ ...entityForm, title: e.target.value })}
                    placeholder="ej: Mira la posaderera"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtítulo / Clasificación</label>
                  <input
                    type="text"
                    className="form-input"
                    value={entityForm.subtitle}
                    onChange={(e) => setEntityForm({ ...entityForm, subtitle: e.target.value })}
                    placeholder="ej. Aventurero retirado"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resumen breve</label>
                  <input
                    type="text"
                    className="form-input"
                    value={entityForm.summary}
                    onChange={(e) => setEntityForm({ ...entityForm, summary: e.target.value })}
                    placeholder="Descripción breve..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL de la Imagen (PNJ, Entornos, etc.)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={entityForm.metadata?.imageUrl || ""}
                    onChange={(e) => setEntityForm({
                      ...entityForm,
                      metadata: {
                        ...entityForm.metadata,
                        imageUrl: e.target.value
                      }
                    })}
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                  {entityForm.metadata?.imageUrl && (
                    <div style={{ marginTop: "10px", width: "100%", height: "120px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                      <img src={entityForm.metadata.imageUrl} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción / contenido narrativo</label>
                  <textarea
                    className="form-textarea"
                    value={entityForm.content}
                    onChange={(e) => setEntityForm({ ...entityForm, content: e.target.value })}
                    placeholder="Historia detallada, reglas, notas..."
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Importancia</label>
                    <select
                      className="form-select"
                      value={entityForm.importance}
                      onChange={(e) => setEntityForm({ ...entityForm, importance: e.target.value })}
                    >
                      <option value="low">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <input
                      type="text"
                      className="form-input"
                      value={entityForm.status}
                      onChange={(e) => setEntityForm({ ...entityForm, status: e.target.value })}
                    />
                  </div>
                </div>

                {/* Customized fields based on type */}
                {(entityForm.entityType === "npc" || entityForm.entityType === "creature") && (
                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Posadero, Mago..."
                        value={entityForm.metadata.role || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, role: e.target.value } })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Attitude to Party</label>
                      <select
                        className="form-select"
                        value={entityForm.metadata.attitudeToParty || "neutral"}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, attitudeToParty: e.target.value } })}
                      >
                        <option value="friendly">Friendly</option>
                        <option value="neutral">Neutral</option>
                        <option value="suspicious">Suspicious</option>
                        <option value="hostile">Hostile</option>
                      </select>
                    </div>
                  </div>
                )}
                {(entityForm.entityType === "npc" || entityForm.entityType === "creature") && (
                  <div className="form-group">
                    <label className="form-label">Goal / Motivation</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="¿Qué quiere este personaje?"
                      value={entityForm.metadata.goal || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, goal: e.target.value } })}
                    />
                  </div>
                )}
                {entityForm.entityType === "player_character" && (
                  campaignState?.campaign?.system === "dnd_srd_5_2_1" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Información Básica</h4>
                        <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                          <div className="form-group">
                            <label className="form-label">Perfil del jugador</label>
                            <select className="form-select" value={entityForm.metadata.playerId || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, playerId: e.target.value } })}>
                              <option value="">-- Seleccionar jugador --</option>
                              {(campaignState?.players || []).map((p: any) => (
                                <option key={p.playerId} value={p.playerId}>{p.displayName || p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Clase *</label>
                            <input type="text" className="form-input" placeholder="Ej. Pícaro, Mago" required value={entityForm.metadata.className || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, className: e.target.value } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Subclase {entityForm.metadata.level >= 3 ? "*" : "(Nivel 3+)"}</label>
                            <input type="text" className="form-input" placeholder="Ej. Asesino, Ilusionista" required={entityForm.metadata.level >= 3} value={entityForm.metadata.subclass || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, subclass: e.target.value } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Nivel *</label>
                            <input type="number" className="form-input" min={1} max={20} required value={entityForm.metadata.level || 1}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, level: parseInt(e.target.value) || 1 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Especie / Raza *</label>
                            <input type="text" className="form-input" placeholder="Ej. Elfo, Enano" required value={entityForm.metadata.species || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, species: e.target.value } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Trasfondo *</label>
                            <input type="text" className="form-input" placeholder="Ej. Huérfano, Soldado" required value={entityForm.metadata.background || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, background: e.target.value } })} />
                          </div>
                        </div>
                      </div>

                      <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Atributos Principales (1-30)</h4>
                        <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                          <div className="form-group">
                            <label className="form-label">Fuerza (STR) *</label>
                            <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.strength || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, strength: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Destreza (DEX) *</label>
                            <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.dexterity || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, dexterity: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Constitución (CON) *</label>
                            <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.constitution || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, constitution: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Inteligencia (INT) *</label>
                            <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.intelligence || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, intelligence: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Sabiduría (WIS) *</label>
                            <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.wisdom || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, wisdom: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Carisma (CHA) *</label>
                            <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.charisma || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, charisma: parseInt(e.target.value) || 10 } })} />
                          </div>
                        </div>
                      </div>

                      <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Estadísticas de Combate y Progreso</h4>
                        <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                          <div className="form-group">
                            <label className="form-label">CA *</label>
                            <input type="number" className="form-input" min={0} required value={entityForm.metadata.armorClass || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, armorClass: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Iniciativa *</label>
                            <input type="number" className="form-input" required value={entityForm.metadata.initiative || 0}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, initiative: parseInt(e.target.value) || 0 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Velocidad *</label>
                            <input type="number" className="form-input" min={0} required value={entityForm.metadata.speed || 30}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, speed: parseInt(e.target.value) || 30 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">PG Actuales *</label>
                            <input type="number" className="form-input" min={0} required value={entityForm.metadata.hitPointsCurrent || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitPointsCurrent: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">PG Máximos *</label>
                            <input type="number" className="form-input" min={1} required value={entityForm.metadata.hitPointsMax || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitPointsMax: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">PG Temp</label>
                            <input type="number" className="form-input" min={0} value={entityForm.metadata.hitPointsTemp || 0}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitPointsTemp: parseInt(e.target.value) || 0 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Dados de Golpe *</label>
                            <input type="text" className="form-input" placeholder="Ej. 1d8, 3d10" required value={entityForm.metadata.hitDice || "1d8"}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitDice: e.target.value } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Experiencia (XP)</label>
                            <input type="number" className="form-input" min={0} value={entityForm.metadata.xp || 0}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, xp: parseInt(e.target.value) || 0 } })} />
                          </div>
                        </div>
                      </div>

                      <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Habilidades Pasivas</h4>
                        <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                          <div className="form-group">
                            <label className="form-label">Percepción Pasiva *</label>
                            <input type="number" className="form-input" required value={entityForm.metadata.passivePerception || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, passivePerception: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Perspicacia Pasiva *</label>
                            <input type="number" className="form-input" required value={entityForm.metadata.passiveInsight || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, passiveInsight: parseInt(e.target.value) || 10 } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Investigación Pasiva *</label>
                            <input type="number" className="form-input" required value={entityForm.metadata.passiveInvestigation || 10}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, passiveInvestigation: parseInt(e.target.value) || 10 } })} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Competencias, Dotes e Idiomas</h4>
                        <div className="form-group">
                          <label className="form-label">Salvaciones Competentes (ej. dex, con)</label>
                          <input type="text" className="form-input" placeholder="Separadas por comas"
                            value={Array.isArray(entityForm.metadata.savingThrows) ? entityForm.metadata.savingThrows.join(", ") : ""}
                            onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, savingThrows: e.target.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) } })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Habilidades Competentes (ej. perception, stealth)</label>
                          <input type="text" className="form-input" placeholder="Separadas por comas"
                            value={Array.isArray(entityForm.metadata.skills) ? entityForm.metadata.skills.join(", ") : ""}
                            onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, skills: e.target.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) } })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Idiomas conocidos (ej. Común, Élfico)</label>
                          <input type="text" className="form-input" placeholder="Separados por comas"
                            value={Array.isArray(entityForm.metadata.languages) ? entityForm.metadata.languages.join(", ") : ""}
                            onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, languages: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Dotes (ej. Alerta, Iniciación Mágica)</label>
                          <input type="text" className="form-input" placeholder="Separados por comas"
                            value={Array.isArray(entityForm.metadata.feats) ? entityForm.metadata.feats.join(", ") : ""}
                            onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, feats: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })} />
                        </div>
                        <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                          <div className="form-group">
                            <label className="form-label">CD Salvación Conjuros</label>
                            <input type="number" className="form-input" placeholder="Ej. 13" value={entityForm.metadata.spellSaveDC || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, spellSaveDC: parseInt(e.target.value) || undefined } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Bonif. Ataque Conjuros</label>
                            <input type="number" className="form-input" placeholder="Ej. +5" value={entityForm.metadata.spellAttackBonus || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, spellAttackBonus: parseInt(e.target.value) || undefined } })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Notas del personaje</label>
                          <textarea className="form-textarea" rows={3} placeholder="Detalles o anotaciones adicionales..." value={entityForm.metadata.note || ""}
                            onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, note: e.target.value } })} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">Player Profile</label>
                        <select className="form-select" value={entityForm.metadata.playerId || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, playerId: e.target.value } })}>
                          <option value="">-- Select Player --</option>
                          {(campaignState?.players || []).map((p: any) => (
                            <option key={p.playerId} value={p.playerId}>{p.displayName || p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Class</label>
                        <input type="text" className="form-input" placeholder="Rogue, Paladin..." value={entityForm.metadata.className || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, className: e.target.value } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Species</label>
                        <input type="text" className="form-input" placeholder="Human, Elf..." value={entityForm.metadata.species || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, species: e.target.value } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Level</label>
                        <input type="number" className="form-input" min={1} max={20} value={entityForm.metadata.level || 1}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, level: parseInt(e.target.value) || 1 } })} />
                      </div>
                    </div>
                  )
                )}
                {entityForm.entityType === "clock" && (
                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Total Segments</label>
                      <input type="number" className="form-input" min={2} max={12} value={entityForm.metadata.segmentsTotal || 4}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, segmentsTotal: parseInt(e.target.value) } })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Clock Type</label>
                      <select className="form-select" value={entityForm.metadata.clockType || "countdown"}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, clockType: e.target.value } })}>
                        <option value="countdown">Countdown</option>
                        <option value="progress">Progress</option>
                        <option value="threat">Threat</option>
                      </select>
                    </div>
                  </div>
                )}
                {entityForm.entityType === "location" && (
                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Region</label>
                      <input type="text" className="form-input" placeholder="The Sunken Coast..." value={entityForm.metadata.region || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, region: e.target.value } })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Terrain</label>
                      <input type="text" className="form-input" placeholder="Coastal, Forest..." value={entityForm.metadata.terrainType || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, terrainType: e.target.value } })} />
                    </div>
                  </div>
                )}
              </div>
              {["clue", "secret"].includes(entityForm.entityType) && (
                <TypeMetadataForm
                  entityType={entityForm.entityType}
                  metadata={entityForm.metadata}
                  players={campaignState?.players ?? []}
                  entities={campaignState?.entities ?? []}
                  campaignSystem={campaignState?.campaign?.system}
                  onChange={(field, value) =>
                    setEntityForm({
                      ...entityForm,
                      metadata: {
                        ...entityForm.metadata,
                        [field]: value,
                      },
                    })
                  }
                />
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEntityModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RELATION MODAL */}
      {isRelationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontWeight: "700" }}>Crear relación</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setIsRelationModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRelationSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Source Entity</label>
                  <select
                    className="form-select"
                    value={relationForm.sourceEntityId}
                    onChange={(e) => setRelationForm({ ...relationForm, sourceEntityId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Source Node --</option>
                    {campaignState.entities.filter(e => !e.archived).map(e => (
                      <option key={e.entityId} value={e.entityId}>[{e.entityType}] {e.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Relation Type</label>
                  <select
                    className="form-select"
                    value={relationForm.relationType}
                    onChange={(e) => setRelationForm({ ...relationForm, relationType: e.target.value })}
                  >
                    <option value="located_in">located_in</option>
                    <option value="lives_in">lives_in</option>
                    <option value="member_of">member_of</option>
                    <option value="ally_of">ally_of</option>
                    <option value="enemy_of">enemy_of</option>
                    <option value="hides">hides</option>
                    <option value="points_to">points_to</option>
                    <option value="causes">causes</option>
                    <option value="contradicts">contradicts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Entity</label>
                  <select
                    className="form-select"
                    value={relationForm.targetEntityId}
                    onChange={(e) => setRelationForm({ ...relationForm, targetEntityId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Target Node --</option>
                    {campaignState.entities.filter(e => !e.archived).map(e => (
                      <option key={e.entityId} value={e.entityId}>[{e.entityType}] {e.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error?.includes("Duplicate relation") && (
                <div style={{ padding: "10px 16px", backgroundColor: "hsl(30, 60%, 15%)", borderTop: "1px solid hsl(30, 60%, 30%)", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                  <AlertTriangle size={14} style={{ color: "hsl(30, 80%, 60%)", flexShrink: 0 }} />
                  <span style={{ color: "hsl(30, 80%, 70%)" }}>Duplicate relation already exists. Create anyway?</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: "auto", flexShrink: 0 }}
                    onClick={async () => {
                      useCampaignStore.setState({ error: null });
                      await createRelation({ ...relationForm, force: true } as any);
                      setIsRelationModalOpen(false);
                      setRelationForm({ sourceEntityId: "", targetEntityId: "", relationType: "located_in" });
                    }}
                  >
                    Crear igualmente
                  </button>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  useCampaignStore.setState({ error: null });
                  setIsRelationModalOpen(false);
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar relación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ENTITY DETAILS MODAL */}
      {selectedEntity && (
        <EntityDetailModal
          selectedEntity={selectedEntity}
          campaignState={campaignState}
          onClose={() => setSelectedEntity(null)}
          onEdit={async (entityId, updates) => {
            await updateEntity(entityId, updates);
            setSelectedEntity({ ...selectedEntity, ...updates });
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setSelectedEntity(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await updateEntity(entityId, { visibility });
            setSelectedEntity({ ...selectedEntity, visibility });
            if (visibility.kind === "dm_only") {
              addToast("Entidad ocultada al grupo (Solo DM).", "info");
            }
          }}
          addToast={addToast}
        />
      )}
      {isExitSessionModalOpen && activeSession && (
        <div className="modal-overlay" onClick={() => setIsExitSessionModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cerrar sesión activa antes de salir</h2>
              <button type="button" className="icon-btn" onClick={() => setIsExitSessionModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "16px", color: "var(--text-muted)" }}>
                Hay una sesión activa: <strong>Session #{activeSession.number || 1}</strong>
                {activeSession.title ? ` — "${activeSession.title}"` : ""}. Para salir de la campaña,
                confirma el cierre de la sesión con un resumen.
              </p>
              <div className="form-group">
                <label className="form-label">Resumen de cierre</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  value={exitSessionSummary}
                  onChange={e => setExitSessionSummary(e.target.value)}
                  placeholder="Qué ocurrió en la sesión, decisiones importantes, próximos pasos..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setExitSessionSummary("");
                  setIsExitSessionModalOpen(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={!exitSessionSummary.trim()}
                onClick={handleConfirmExitAndCloseSession}
              >
                Cerrar sesión y salir
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
