import React, { useEffect, useState } from "react";
import { useNavigate, useRouterState, useParams } from "@tanstack/react-router";
import type { Entity } from "./stores/campaignStore.js";
import { useCampaignStore } from "./stores/campaignStore.js";
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
  ArrowRight,
  Archive,
  Pencil,
  BookOpen,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import { getEntityDefaultImage } from "./utils/entityVisuals.js";
import { getCampaignExitDecision } from "./utils/campaignExit.js";
import { TypeMetadataForm } from "./components/TypeMetadataForm.js";
import { useToast } from "./hooks/useToast.js";
import { ToastContainer } from "./components/ToastContainer.js";
import { TimelinePage } from "./pages/TimelinePage.js";
import { SearchPage } from "./pages/SearchPage.js";
import { BoardsPage } from "./pages/BoardsPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { WhatNowPage } from "./pages/WhatNowPage.js";
import { PlayersPage } from "./pages/PlayersPage.js";
import { SessionPage } from "./pages/SessionPage.js";
import { EntitiesPage } from "./pages/EntitiesPage.js";
import { GraphPage } from "./pages/GraphPage.js";

export function App() {
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
    lanStatus,
    toggleLanMode
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
                      (pathname.split("/")[3] || (selectedCampaignId ? "dashboard" : "landing"));

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
  const [backupRestorePath, setBackupRestorePath] = useState("");
  
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
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [editEntityForm, setEditEntityForm] = useState<Partial<Entity>>({});
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
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isLocalhost && !sessionStorage.getItem("dmcc_dmSessionToken")) {
        try {
          const resToken = await fetch("/api/auth/local-token");
          if (resToken.ok) {
            const { token } = await resToken.json();
            sessionStorage.setItem("dmcc_dmSessionToken", token);
          }
        } catch (e) {
          console.error("Failed to fetch local auth token", e);
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
      defaultMetadata = { playerId: "", species: "", className: "", level: 1 };
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

  const handleCreateCampaignSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim()) return;
    createCampaign(newCampaignTitle.trim(), newCampaignSystem);
    setNewCampaignTitle("");
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
    return (
      <div style={{ maxWidth: "1000px", margin: "80px auto", padding: "0 24px" }}>
        <header style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            width: "100%",
            height: "320px",
            backgroundImage: "url('/assets/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-primary)",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "32px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to top, rgba(11, 13, 25, 0.95) 15%, rgba(11, 13, 25, 0.3) 100%)",
              zIndex: 1
            }}></div>
            <div style={{ position: "relative", zIndex: 2, textAlign: "left" }}>
              <h1 style={{
                fontSize: "2.8rem",
                fontWeight: "900",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "6px",
                letterSpacing: "-0.03em"
              }}>
                DM Campaign Companion
              </h1>
              <p style={{ color: "var(--text-main)", fontSize: "1.1rem", fontWeight: "500", opacity: 0.9 }}>
                The local-first Campaign Memory Engine for Dungeon Masters
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2">
          {/* Left panel: List campaigns */}
          <section className="card">
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FolderOpen style={{ color: "var(--primary)" }} /> Campaigns
            </h2>
            {loading ? (
              <p style={{ color: "var(--text-muted)" }}>Loading campaigns...</p>
            ) : campaigns.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "16px 0" }}>No campaigns found. Create one to get started!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {campaigns.map((c) => (
                  <div
                    key={c.campaignId}
                    className="card"
                    style={{ padding: "16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => {
                      selectCampaign(c.campaignId);
                      navigate({ to: `/campaigns/${c.campaignId}/dashboard` });
                    }}
                  >
                    <div>
                      <h3 style={{ fontWeight: "700", color: "var(--text-main)" }}>{c.title}</h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        ID: {c.campaignId} | System: {c.system || "Custom"}
                      </p>
                    </div>
                    <ArrowRight size={18} style={{ color: "var(--text-muted)" }} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right panel: Create campaign / Restore */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <section className="card">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Plus style={{ color: "var(--secondary)" }} /> Create New Campaign
              </h2>
              <form onSubmit={handleCreateCampaignSubmit}>
                <div className="form-group">
                  <label className="form-label">Campaign Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lost Mine of Phandelver"
                    value={newCampaignTitle}
                    onChange={(e) => setNewCampaignTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">RPG System</label>
                  <select
                    className="form-select"
                    value={newCampaignSystem}
                    onChange={(e) => setNewCampaignSystem(e.target.value)}
                  >
                    <option value="generic_fantasy_d20">Generic Fantasy d20</option>
                    <option value="dnd_srd_5_2_1">Dungeons & Dragons SRD 5.2.1</option>
                    <option value="custom">Custom System</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Initialize Campaign Log
                </button>
              </form>
            </section>

            <section className="card">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <RotateCcw style={{ color: "var(--color-warning)" }} /> Restore Backup
              </h2>
              <form onSubmit={handleRestoreBackupSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre del backup (ej: backup_xxx.json)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="backup_xxx.json"
                    value={backupRestorePath}
                    onChange={(e) => setBackupRestorePath(e.target.value)}
                    required
                  />
                  <small style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
                    Enter only the filename, not a full path. Backups are stored in your campaign's backups/ folder.
                  </small>
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>
                  Restore Campaign State
                </button>
              </form>
            </section>
          </div>
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
            <Activity /> Panel del DM
          </div>
          <div
            className={`nav-item ${currentPage === "what-now" ? "active" : ""}`}
            onClick={() => setCurrentPage("what-now")}
          >
            <BookOpen /> Qué toca ahora
          </div>
          <div
            className={`nav-item ${currentPage === "session" ? "active" : ""}`}
            onClick={() => setCurrentPage("session")}
          >
            <Play /> Sesión activa {activeSession && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-success)", display: "inline-block", marginLeft: "auto" }}></span>}
          </div>
          <div
            className={`nav-item ${currentPage === "entities" ? "active" : ""}`}
            onClick={() => setCurrentPage("entities")}
          >
            <Layers /> Entidades narrativas
          </div>
          <div
            className={`nav-item ${currentPage === "graph" ? "active" : ""}`}
            onClick={() => setCurrentPage("graph")}
          >
            <GitFork /> Grafo de relaciones
          </div>
          <div
            className={`nav-item ${currentPage === "timeline" ? "active" : ""}`}
            onClick={() => setCurrentPage("timeline")}
          >
            <List /> Línea de tiempo
          </div>
          <div
            className={`nav-item ${currentPage === "search" ? "active" : ""}`}
            onClick={() => setCurrentPage("search")}
          >
            <Search /> Búsqueda
          </div>
          <div
            className={`nav-item ${currentPage === "players" ? "active" : ""}`}
            onClick={() => setCurrentPage("players")}
          >
            <User /> Jugadores y personajes
          </div>
          <div
            className={`nav-item ${currentPage === "boards" ? "active" : ""}`}
            onClick={() => setCurrentPage("boards")}
          >
            <Layers style={{ transform: "rotate(90deg)" }} /> Tableros
          </div>
          <div
            className={`nav-item ${currentPage === "settings" ? "active" : ""}`}
            onClick={() => setCurrentPage("settings")}
          >
            <Settings /> Ajustes y exportación
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Campaña activa</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExitCampaign}
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            {campaignState.campaign?.currentLocationId && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                <MapPin size={16} /> {campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentLocationId)?.title || "Unknown Location"}
              </span>
            )}
            {campaignState.campaign?.currentQuestId && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "var(--primary)", borderLeft: "1px solid var(--border-color)", paddingLeft: "12px", marginLeft: "12px" }}>
                <Shield size={16} /> Active Quest: {campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentQuestId)?.title || "Unknown Quest"}
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
                <Play size={14} /> Iniciar nueva sesión
              </button>
            )}

            <button className="btn btn-secondary btn-sm" onClick={() => setIsEntityModalOpen(true)}>
              <Plus size={14} /> Create Entity
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
          {currentPage === "boards" && (
            <BoardsPage
              campaignState={campaignState}
              setSelectedEntity={setSelectedEntity}
              setCurrentPage={setCurrentPage}
            />
          )}

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
              addToast={addToast}
              lanStatus={lanStatus}
              toggleLanMode={toggleLanMode}
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
                  <label className="form-label">Entity Type</label>
                  <select
                    className="form-select"
                    value={entityForm.entityType}
                    onChange={(e) => handleEntityTypeChange(e.target.value)}
                  >
                    <optgroup label="Personajes">
                      <option value="npc">NPC (Non-Player Character)</option>
                      <option value="player_character">Player Character</option>
                      <option value="creature">Creature / Monster</option>
                    </optgroup>
                    <optgroup label="Lugares">
                      <option value="location">Location</option>
                      <option value="scene">Scene</option>
                    </optgroup>
                    <optgroup label="Narrativa">
                      <option value="quest">Quest</option>
                      <option value="clue">Clue</option>
                      <option value="secret">Secret</option>
                      <option value="rumor">Rumor</option>
                      <option value="decision">Decision Point</option>
                      <option value="consequence">Consequence</option>
                      <option value="front">Front / Threat</option>
                      <option value="clock">Reloj narrativo</option>
                    </optgroup>
                    <optgroup label="Organizaciones y objetos">
                      <option value="faction">Faction / Organization</option>
                      <option value="item">Item / Artifact</option>
                      <option value="encounter">Encounter</option>
                    </optgroup>
                    <optgroup label="Referencia">
                      <option value="rule_reference">Rule Reference</option>
                      <option value="handout">Handout</option>
                      <option value="note">Note</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Title / Name</label>
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
                  <label className="form-label">Subtitle / Classification</label>
                  <input
                    type="text"
                    className="form-input"
                    value={entityForm.subtitle}
                    onChange={(e) => setEntityForm({ ...entityForm, subtitle: e.target.value })}
                    placeholder="e.g. Retired Adventurer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Summary</label>
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
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
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
                  <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Player Profile</label>
                      <select className="form-select" value={entityForm.metadata.playerId || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, playerId: e.target.value } })}>
                        <option value="">-- Select Player --</option>
                        {(campaignState?.players || []).map((p: any) => (
                          <option key={p.playerId} value={p.playerId}>{p.displayName}</option>
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
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, level: parseInt(e.target.value) } })} />
                    </div>
                  </div>
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
                    Create Anyway
                  </button>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  useCampaignStore.setState({ error: null });
                  setIsRelationModalOpen(false);
                }}>
                  Cancel
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
        <div className="modal-overlay" onClick={() => setSelectedEntity(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            {(() => {
              const imgUrl = selectedEntity.metadata?.imageUrl || getEntityDefaultImage(selectedEntity.entityType);
              const isDmOnly = selectedEntity.visibility?.kind === "dm_only" || selectedEntity.status === "hidden" || selectedEntity.entityType === "secret" || selectedEntity.status === "dm_only";
              return (
                <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative", borderTopLeftRadius: "inherit", borderTopRightRadius: "inherit" }}>
                  <img
                    src={imgUrl}
                    alt={selectedEntity.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: isDmOnly ? "grayscale(70%) brightness(35%)" : "none",
                      opacity: selectedEntity.metadata?.imageUrl ? 1 : 0.6
                    }}
                  />
                  {isDmOnly && (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      backgroundColor: "rgba(6, 7, 14, 0.4)",
                      color: "var(--color-critical)",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      <EyeOff size={20} />
                      <span>Secreto / Solo DM</span>
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "80px",
                    background: "linear-gradient(to top, var(--bg-card), transparent)"
                  }} />
                </div>
              );
            })()}
            <div className="modal-header" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <div>
                <span className="badge badge-primary">{selectedEntity.entityType}</span>
                <h2 style={{ fontWeight: "800", fontSize: "1.5rem", marginTop: "6px" }}>{selectedEntity.title}</h2>
                {selectedEntity.subtitle && <h4 className="card-subtitle">{selectedEntity.subtitle}</h4>}
              </div>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelectedEntity(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Visibility badge + editor */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>VISIBILITY</span>
                <span style={{
                  padding: "2px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  backgroundColor: selectedEntity.visibility?.kind === "dm_only" ? "hsl(0, 60%, 25%)" :
                    selectedEntity.visibility?.kind === "group" ? "hsl(120, 60%, 20%)" : "hsl(200, 60%, 25%)",
                  color: selectedEntity.visibility?.kind === "dm_only" ? "hsl(0, 80%, 65%)" :
                    selectedEntity.visibility?.kind === "group" ? "hsl(120, 70%, 60%)" : "hsl(200, 80%, 65%)",
                }}>
                  {selectedEntity.visibility?.kind ?? "dm_only"}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                  {selectedEntity.visibility?.kind === "dm_only" && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        await updateEntity(selectedEntity.entityId, { visibility: { kind: "group" } });
                        setSelectedEntity({ ...selectedEntity, visibility: { kind: "group" } });
                      }}
                    >
                      <Eye size={12} /> Reveal to Party
                    </button>
                  )}
                  {selectedEntity.visibility?.kind !== "dm_only" && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        await updateEntity(selectedEntity.entityId, { visibility: { kind: "dm_only" } });
                        setSelectedEntity({ ...selectedEntity, visibility: { kind: "dm_only" } });
                        addToast("Entidad ocultada al DM.", "info");
                      }}
                    >
                      <EyeOff size={12} /> Hide (DM only)
                    </button>
                  )}
                </div>
              </div>

              {selectedEntity.summary && (
                <div>
                  <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-muted)" }}>Summary</h4>
                  <p style={{ marginTop: "4px" }}>{selectedEntity.summary}</p>
                </div>
              )}

              {selectedEntity.content && (
                <div>
                  <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-muted)" }}>Notes & Description</h4>
                  <p style={{ marginTop: "4px", whiteSpace: "pre-line", fontSize: "0.95rem" }}>{selectedEntity.content}</p>
                </div>
              )}

              {/* Metadata details — type-aware */}
              {selectedEntity.metadata && Object.keys(selectedEntity.metadata).length > 0 && (
                <div>
                  <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "8px" }}>Details</h4>
                  {(() => {
                    const m = selectedEntity.metadata;
                    const t = selectedEntity.entityType;
                    const Field = ({ label, value }: { label: string; value: any }) =>
                      value != null && String(value).trim() !== "" ? (
                        <div style={{ fontSize: "0.85rem", display: "flex", gap: "8px" }}>
                          <span style={{ color: "var(--text-muted)", minWidth: "100px" }}>{label}</span>
                          <span style={{ color: "var(--text-main)", fontWeight: "500" }}>{String(value)}</span>
                        </div>
                      ) : null;
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", backgroundColor: "#06070e", padding: "12px", borderRadius: "var(--radius-md)" }}>
                        {(t === "npc" || t === "player_character" || t === "creature") && (<>
                          <Field label="Role" value={m.role} />
                          <Field label="Faction" value={m.factionId} />
                          <Field label="Motivation" value={m.motivation} />
                          <Field label="Goal" value={m.goal} />
                          <Field label="Attitude" value={m.attitude} />
                          {t === "player_character" && <><Field label="Player" value={m.playerId} /><Field label="Class" value={m.className} /><Field label="Species" value={m.species} /><Field label="Level" value={m.level} /></>}
                        </>)}
                        {t === "location" && (<>
                          <Field label="Region" value={m.region} />
                          <Field label="Terrain" value={m.terrainType} />
                          <Field label="Known to party" value={m.isKnownToParty != null ? (m.isKnownToParty ? "Yes" : "No") : null} />
                        </>)}
                        {t === "quest" && (<>
                          <Field label="Location" value={m.locationId} />
                          <Field label="Reward" value={m.reward} />
                        </>)}
                        {(t === "clue") && (<>
                          <Field label="Found" value={m.found != null ? (m.found ? "Yes" : "No") : null} />
                          <Field label="Significance" value={m.significance} />
                        </>)}
                        {t === "secret" && (<>
                          <Field label="Revealed to" value={Array.isArray(m.revealedTo) ? m.revealedTo.join(", ") : m.revealedTo} />
                        </>)}
                        {t === "faction" && (<>
                          <Field label="Alignment" value={m.alignment} />
                          <Field label="Base" value={m.baseOfOperations} />
                        </>)}
                        {t === "clock" && (<>
                          <Field label="Type" value={m.clockType} />
                          <Field label="Progress" value={m.segmentsFilled != null && m.segmentsTotal != null ? `${m.segmentsFilled} / ${m.segmentsTotal}` : null} />
                        </>)}
                        {t === "item" && (<>
                          <Field label="Owner" value={m.ownerId} />
                          <Field label="Rarity" value={m.rarity} />
                        </>)}
                        {t === "encounter" && (<>
                          <Field label="Difficulty" value={m.difficulty} />
                          <Field label="Location" value={m.locationId} />
                        </>)}
                        {/* fallback: remaining keys not shown above */}
                        {!["npc","player_character","creature","location","quest","clue","secret","faction","clock","item","encounter"].includes(t) &&
                          Object.entries(m).map(([key, val]: any) => (
                            <Field key={key} label={key} value={val} />
                          ))
                        }
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Connected entities list */}
              <div>
                <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "8px" }}>Connected Relations</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {campaignState.relations
                    .filter(r => !r.archived && (r.sourceEntityId === selectedEntity.entityId || r.targetEntityId === selectedEntity.entityId))
                    .map(r => {
                      const isSource = r.sourceEntityId === selectedEntity.entityId;
                      const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
                      const other = campaignState.entities.find(ent => ent.entityId === otherId);
                      return (
                        <div key={r.relationId} style={{ fontSize: "0.85rem", padding: "8px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between" }}>
                          <span>
                            {isSource ? (
                              <><strong>This</strong> → <em>{r.relationType}</em> → <strong>{other?.title || otherId}</strong></>
                            ) : (
                              <><strong>{other?.title || otherId}</strong> → <em>{r.relationType}</em> → <strong>This</strong></>
                            )}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            {isEditingEntity && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "var(--bg-input)" }}>
                <h4 style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "4px" }}>Editar entidad</h4>
                <div className="grid grid-cols-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Title</label>
                    <input className="form-input" value={editEntityForm.title ?? selectedEntity.title} onChange={e => setEditEntityForm({ ...editEntityForm, title: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Subtitle</label>
                    <input className="form-input" value={editEntityForm.subtitle ?? selectedEntity.subtitle ?? ""} onChange={e => setEditEntityForm({ ...editEntityForm, subtitle: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Summary</label>
                  <input className="form-input" value={editEntityForm.summary ?? selectedEntity.summary ?? ""} onChange={e => setEditEntityForm({ ...editEntityForm, summary: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">URL de la Imagen (PNJ, Entornos, etc.)</label>
                  <input
                    className="form-input"
                    value={editEntityForm.metadata?.imageUrl ?? selectedEntity.metadata?.imageUrl ?? ""}
                    onChange={e => setEditEntityForm({
                      ...editEntityForm,
                      metadata: {
                        ...(editEntityForm.metadata ?? selectedEntity.metadata ?? {}),
                        imageUrl: e.target.value
                      }
                    })}
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes / Description</label>
                  <textarea className="form-textarea" rows={3} value={editEntityForm.content ?? selectedEntity.content ?? ""} onChange={e => setEditEntityForm({ ...editEntityForm, content: e.target.value })} />
                </div>
                <div className="grid grid-cols-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Status</label>
                    <input className="form-input" value={editEntityForm.status ?? selectedEntity.status} onChange={e => setEditEntityForm({ ...editEntityForm, status: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Importancia</label>
                    <select className="form-select" value={editEntityForm.importance ?? selectedEntity.importance} onChange={e => setEditEntityForm({ ...editEntityForm, importance: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <TypeMetadataForm
                  entityType={selectedEntity.entityType}
                  metadata={editEntityForm.metadata ?? selectedEntity.metadata ?? {}}
                  onChange={(field, value) => setEditEntityForm({ ...editEntityForm, metadata: { ...(editEntityForm.metadata ?? selectedEntity.metadata ?? {}), [field]: value } })}
                  players={campaignState?.players ?? []}
                  entities={campaignState?.entities ?? []}
                />
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setIsEditingEntity(false); setEditEntityForm({}); }}>Cancelar</button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      const updates = { ...editEntityForm };
                      await updateEntity(selectedEntity.entityId, updates);
                      setSelectedEntity({ ...selectedEntity, ...updates });
                      setIsEditingEntity(false);
                      setEditEntityForm({});
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={async () => {
                  await archiveEntity(selectedEntity.entityId);
                  addToast(`"${selectedEntity.title}" archivada.`, "info");
                  setSelectedEntity(null);
                  setIsEditingEntity(false);
                  setEditEntityForm({});
                }}
              >
                <Archive size={14} /> Archive
              </button>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Updated: {new Date(selectedEntity.updatedAt).toLocaleString()}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setIsEditingEntity(!isEditingEntity);
                    if (!isEditingEntity) {
                      setEditEntityForm({
                        title: selectedEntity.title,
                        subtitle: selectedEntity.subtitle,
                        summary: selectedEntity.summary,
                        content: selectedEntity.content,
                        status: selectedEntity.status,
                        importance: selectedEntity.importance,
                        metadata: selectedEntity.metadata ? { ...selectedEntity.metadata } : {}
                      });
                    } else {
                      setEditEntityForm({});
                    }
                  }}
                >
                  <Pencil size={13} /> {isEditingEntity ? "Cancelar edición" : "Editar"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setSelectedEntity(null); setIsEditingEntity(false); setEditEntityForm({}); }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
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
