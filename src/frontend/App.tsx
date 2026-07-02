import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "./shared/stores/campaignStore.js";
import {
  Plus,
  X,
  RotateCcw,
  Search,
  AlertTriangle,
  FolderOpen,
  Layers,
  Sparkles,
  LogOut,
  UserPlus,
  UserRound,
  Play,
  Activity,
  ArrowRight,
  Settings,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { logoutDm } from "./shared/auth/authClient.js";
import { LandingCampaignCard } from "./shared/components/LandingCampaignCard.js";
import { PremadeImportDialog, type PremadeImportMode } from "./shared/components/PremadeImportDialog.js";
import { AppFooter } from "./shared/components/AppFooter.js";
import { PortalTopBar } from "./shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";

function formatCampaignSystem(system?: string) {
  if (system === "dnd_srd_5_2_1") return "D&D 5e";
  if (system === "generic_fantasy_d20") return "d20 Fantasy";
  return "Custom";
}

export function App() {
  const { t } = useTranslation();
  const {
    campaigns,
    premadeTemplates,
    activeCampaignId,
    campaignState,
    loading,
    error,
    fetchVaults,
    fetchCampaigns,
    fetchPremadeCampaigns,
    importPremadeCampaign,
    updateCampaign,
    selectCampaign,
    clearCampaign,
    createCampaign,
    deleteCampaign,
    restoreBackup,
  } = useCampaignStore();

  const navigate = useNavigate();

  // Forms & Modals state
  const [, setCampaignsFetched] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState("");
  const [newCampaignSystem, setNewCampaignSystem] = useState("generic_fantasy_d20");
  const [newCampaignCoverUrl, setNewCampaignCoverUrl] = useState("");
  const [newCampaignTemplate, setNewCampaignTemplate] = useState("empty");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [createCampaignError, setCreateCampaignError] = useState<string | null>(null);
  const [landingSearchQuery, setLandingSearchQuery] = useState("");
  const [backupRestorePath, setBackupRestorePath] = useState("");
  const [backupRestoreState, setBackupRestoreState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [backupRestoreError, setBackupRestoreError] = useState<string | null>(null);

  const [mysticalTransitionId, setMysticalTransitionId] = useState<string | null>(null);
  const [importingTemplateId, setImportingTemplateId] = useState<string | null>(null);
  const [premadeDialogTemplateId, setPremadeDialogTemplateId] = useState<string | null>(null);
  const [premadeImportError, setPremadeImportError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ campaignId: string; title: string } | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<1 | 2>(1);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit confirmation state
  const [editTarget, setEditTarget] = useState<{ campaignId: string; title: string; summary?: string; system?: string; coverUrl?: string } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editSystem, setEditSystem] = useState("generic_fantasy_d20");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // DM Profile & View Switching States
  const [dmProfile, setDmProfile] = useState<{ displayName?: string; email?: string; avatarUrl?: string } | null>(null);
  const [isViewingArchive, setIsViewingArchive] = useState(false);

  const openDeleteModal = (campaignId: string, title: string) => {
    setDeleteTarget({ campaignId, title });
    setDeleteConfirmStep(1);
    setDeleteConfirmInput("");
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmInput("");
    setDeleteError(null);
  };

  const openEditModal = (campaign: { campaignId: string; title: string; summary?: string; system?: string; coverUrl?: string }) => {
    setEditTarget(campaign);
    setEditTitle(campaign.title);
    setEditSummary(campaign.summary ?? "");
    setEditSystem(campaign.system ?? "generic_fantasy_d20");
    setEditCoverUrl(campaign.coverUrl ?? "");
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditError(null);
  };

  const handleEditConfirm = async () => {
    if (!editTarget || !editTitle.trim()) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await updateCampaign(editTarget.campaignId, {
        title: editTitle.trim(),
        summary: editSummary.trim(),
        system: editSystem,
        coverUrl: editCoverUrl.trim() || undefined,
      });
      closeEditModal();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2);
      return;
    }
    if (deleteConfirmInput.trim() !== deleteTarget.title) {
      setDeleteError(t("landing.deleteConfirmMismatch"));
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteCampaign(deleteTarget.campaignId, deleteTarget.title);
      closeDeleteModal();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const triggerMysticalTransition = (campaignId: string) => {
    setMysticalTransitionId(campaignId);
    setTimeout(async () => {
      try {
        await selectCampaign(campaignId);
        setIsViewingArchive(false);
        setMysticalTransitionId(null);
      } catch (e) {
        console.error(e);
        setMysticalTransitionId(null);
      }
    }, 850);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { fetchAuthStatus } = await import("./shared/auth/authClient.js");
        const status = await fetchAuthStatus();
        if (!status.dmSessionValid) {
          await navigate({ to: status.dmAccountConfigured || status.dmPinConfigured ? "/dm/unlock" : "/dm/setup" });
          return;
        }
        setDmProfile(status.dm || null);
      } catch {
        await navigate({ to: "/" });
        return;
      }
      fetchVaults();
      await Promise.all([
        fetchCampaigns().catch(() => {}),
        fetchPremadeCampaigns().catch(() => {}),
      ]);
      setCampaignsFetched(true);
    };
    void initAuth();
  }, [fetchCampaigns, fetchPremadeCampaigns, fetchVaults, navigate]);

  const handleCreateCampaignSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim()) return;
    setIsCreatingCampaign(true);
    setCreateCampaignError(null);
    try {
      if (newCampaignTemplate && newCampaignTemplate !== "empty") {
        sessionStorage.setItem("dmcc_pending_seed_template", newCampaignTemplate);
      }
      const campaignId = await createCampaign(
        newCampaignTitle.trim(),
        newCampaignSystem,
        newCampaignCoverUrl.trim() || undefined
      );
      setNewCampaignTitle("");
      setNewCampaignCoverUrl("");
      setNewCampaignTemplate("empty");
      if (campaignId) {
        triggerMysticalTransition(campaignId);
      }
    } catch (err: any) {
      setCreateCampaignError(err.message || t("landing.createCampaignError"));
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const openPremadeImportDialog = (templateId: string) => {
    setPremadeImportError(null);
    setPremadeDialogTemplateId(templateId);
  };

  const handleImportPremade = async (templateId: string, options: { title: string; summary?: string; importMode: PremadeImportMode; openAfterCreate: boolean }) => {
    setImportingTemplateId(templateId);
    setPremadeImportError(null);
    try {
      const campaignId = await importPremadeCampaign(templateId, {
        title: options.title,
        summary: options.summary,
        importMode: options.importMode,
      });
      setPremadeDialogTemplateId(null);
      if (campaignId && options.openAfterCreate) {
        triggerMysticalTransition(campaignId);
      } else {
        await fetchCampaigns();
      }
    } catch (err: any) {
      setPremadeImportError(err.message || t("premadeImport.genericError"));
    } finally {
      setImportingTemplateId(null);
    }
  };

  const handleRestoreBackupSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!backupRestorePath.trim()) return;
    setBackupRestoreState("loading");
    setBackupRestoreError(null);
    try {
      await restoreBackup(backupRestorePath.trim());
      setBackupRestorePath("");
      setBackupRestoreState("success");
    } catch (err: any) {
      setBackupRestoreError(err.message || "Restore failed");
      setBackupRestoreState("error");
    }
  };

  const handleSignOutDm = async () => {
    clearCampaign();
    await logoutDm();
    await navigate({ to: "/" });
  };

  const handleAddDm = () => {
    navigate({ to: "/dm/setup" });
  };

  const handleSwitchDm = async () => {
    clearCampaign();
    await logoutDm();
    await navigate({ to: "/dm/unlock" });
  };

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(landingSearchQuery.toLowerCase()) ||
      c.campaignId.toLowerCase().includes(landingSearchQuery.toLowerCase())
  );
  const selectedPremadeTemplate = premadeTemplates.find((template) => template.templateId === premadeDialogTemplateId) ?? null;

  // Resolve active campaign or fallback to latest updated
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt || "";
    const dateB = b.updatedAt || b.createdAt || "";
    return dateB.localeCompare(dateA);
  });

  const resolvedActiveCampaign = campaigns.find(c => c.campaignId === activeCampaignId) || sortedCampaigns[0] || null;

  // Handle active loading fallback
  if (activeCampaignId && !campaignState && !isViewingArchive) {
    return (
      <div className="smart-landing-loading">
        <div className="loading-spinner-glow"></div>
        <span>{t("common.loading")}</span>
      </div>
    );
  }

  const renderActiveCampaignDashboard = () => {
    if (!resolvedActiveCampaign) return null;

    // Filter real densities from live campaignState
    const entities = campaignState?.entities || [];
    const sessions = campaignState?.sessions || [];
    const players = campaignState?.players || [];

    const npcsCount = entities.filter(e => e.entityType === "npc").length;
    const locationsCount = entities.filter(e => e.entityType === "location").length;
    const questsCount = entities.filter(e => e.entityType === "quest").length;
    const secretsCount = entities.filter(e => e.entityType === "secret").length;
    const cluesCount = entities.filter(e => e.entityType === "clue").length;

    const activeSession = sessions.find(s => s.status === "active");

    // Gather recently updated elements
    const recentEntities = [...entities]
      .filter(e => !e.archived)
      .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""))
      .slice(0, 5);

    const recentSessions = [...sessions]
      .sort((a, b) => (b.number ?? 0) - (a.number ?? 0))
      .slice(0, 3);

    return (
      <div className="dm-dashboard">
        <PortalTopBar actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleAddDm}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
            >
              <UserPlus size={13} />
              {t("nav.addDm")}
            </button>
            <button
              type="button"
              onClick={() => void handleSwitchDm()}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
            >
              <UserRound size={13} />
              {t("nav.switchDm")}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/account" })}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer" }}
            >
              <Settings size={13} />
              Account
            </button>
            <button
              type="button"
              onClick={() => void handleSignOutDm()}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
            >
              <LogOut size={13} />
              {t("nav.signOut")}
            </button>
          </div>
        } />

        {/* DM User Header */}
        <header className="dm-dashboard-header">
          <div className="dm-profile-area">
            <div className="dm-avatar-frame">
              <img src={dmProfile?.avatarUrl || "/assets/avatars/default-avatar.png"} alt={dmProfile?.displayName || "DM"} />
            </div>
            <div className="dm-welcome-text">
              <h1>{t("landing.dmWelcome", { name: dmProfile?.displayName || dmProfile?.email || "Game Master" })}</h1>
              <p>{t("landing.dmDashboardTitle")}</p>
            </div>
          </div>
          <div className="header-action-buttons">
            <button className="btn btn-secondary" onClick={() => setIsViewingArchive(true)}>
              {t("landing.changeCampaign")}
            </button>
          </div>
        </header>

        {/* Quick Actions Navigation Bar */}
        <div className="quick-actions-bar">
          <button className="quick-action-link" onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/canvas` })}>
            <Layers size={14} />
            {t("landing.openCanvas")}
          </button>
          <button className="quick-action-link" onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/players` })}>
            <Users size={14} />
            {t("landing.managePlayers")}
          </button>
          <button className="quick-action-link" onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/timeline` })}>
            <Activity size={14} />
            {t("landing.metricSessions")}
          </button>
          <button className="quick-action-link" onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/settings` })}>
            <Settings size={14} />
            {t("landing.campaignSettings")}
          </button>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", height: "20px", margin: "0 8px" }} />
          <button className="quick-action-link" onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/entities` })}>
            <Plus size={14} />
            {t("landing.quickActionCreateNpc")}
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="dm-dashboard-layout">
          <div className="main-content-stack">
            {/* Active Campaign Spotlight Card */}
            <section className="featured-campaign-wrapper">
              <span className="section-label-gold">{t("landing.activeCampaignSection")}</span>
              <div className="glass-card featured-campaign-card" style={{ cursor: "default" }}>
                <div className="featured-campaign-cover" style={{ backgroundImage: `url(${resolvedActiveCampaign.coverUrl || '/assets/campaigns/default-campaign-cover.jpg'})` }}>
                  <div className="cover-overlay"></div>
                  {activeSession && (
                    <span className="active-badge animate-pulse">
                      <span className="pulse-dot"></span>
                      {t("landing.activeSession", { title: activeSession.title })}
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h2 className="campaign-title" style={{ fontSize: "1.6rem" }}>{resolvedActiveCampaign.title}</h2>
                  <div className="campaign-meta-row" style={{ marginBottom: "12px" }}>
                    <span className={`system-tag system-${resolvedActiveCampaign.system || 'generic'}`}>
                      {formatCampaignSystem(resolvedActiveCampaign.system)}
                    </span>
                    {resolvedActiveCampaign.updatedAt && (
                      <span className="campaign-id-tag" style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem" }}>
                        {t("landing.lastUpdated", { time: new Date(resolvedActiveCampaign.updatedAt).toLocaleDateString() })}
                      </span>
                    )}
                  </div>

                  {resolvedActiveCampaign.summary && (
                    <p className="card-desc" style={{ fontSize: "0.95rem", marginBottom: "24px" }}>
                      {resolvedActiveCampaign.summary}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/canvas` })}>
                      {t("landing.openCanvas")}
                      <ArrowRight size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/dashboard` })}>
                      {t("landing.manageCampaign")}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Narrative Metrics Grid */}
            <section className="narrative-metrics-section">
              <span className="section-label-gold">{t("landing.narrativeMetrics")}</span>
              <div className="narrative-metrics-grid" style={{ marginTop: "12px" }}>
                <div className="metric-narrative-card">
                  <span className="metric-value">{npcsCount}</span>
                  <span className="metric-label">{t("landing.metricNpcs")}</span>
                </div>
                <div className="metric-narrative-card">
                  <span className="metric-value">{locationsCount}</span>
                  <span className="metric-label">{t("landing.metricLocations")}</span>
                </div>
                <div className="metric-narrative-card">
                  <span className="metric-value">{questsCount}</span>
                  <span className="metric-label">{t("landing.metricQuests")}</span>
                </div>
                <div className="metric-narrative-card">
                  <span className="metric-value">{secretsCount}</span>
                  <span className="metric-label">{t("landing.metricSecrets")}</span>
                </div>
                <div className="metric-narrative-card">
                  <span className="metric-value">{cluesCount}</span>
                  <span className="metric-label">{t("landing.metricClues")}</span>
                </div>
                <div className="metric-narrative-card">
                  <span className="metric-value">{sessions.length}</span>
                  <span className="metric-label">{t("landing.metricSessions")}</span>
                </div>
              </div>
            </section>

            {/* Recent Memory Chronicle */}
            <section className="recent-memory-section">
              <span className="section-label-gold">{t("landing.recentMemory")}</span>
              <div className="recent-memory-layout" style={{ marginTop: "12px" }}>
                {recentEntities.length === 0 && recentSessions.length === 0 ? (
                  <div className="recent-memory-empty-state">
                    {t("landing.recentMemoryEmpty")}
                  </div>
                ) : (
                  <>
                    <div className="recent-memory-list-box">
                      <h4 style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {t("landing.recentEntities")}
                      </h4>
                      {recentEntities.map(e => (
                        <div key={e.entityId} className="recent-item-row" onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/entities` })}>
                          <span className="recent-item-name">{e.title}</span>
                          <span className="recent-item-meta">{e.entityType}</span>
                        </div>
                      ))}
                    </div>
                    <div className="recent-memory-list-box">
                      <h4 style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {t("landing.recentSessions")}
                      </h4>
                      {recentSessions.map(s => (
                        <div key={s.sessionId} className="recent-item-row" onClick={() => navigate({ to: `/campaigns/${resolvedActiveCampaign.campaignId}/timeline` })}>
                          <span className="recent-item-name">#{s.number} {s.title}</span>
                          <span className="recent-item-meta">{s.status}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar scroll card */}
          <aside className="active-world-scroll-card">
            <div className="scroll-image-header" style={{ backgroundImage: `url('/assets/ui/active_world_scenic.jpg')` }}>
              <div className="scroll-image-overlay"></div>
            </div>
            <div className="scroll-campaign-info">
              <span className="scroll-title">{t("landing.activeWorldSide")}</span>
              <h3 style={{ margin: "4px 0 0", color: "#fff", fontSize: "1.1rem" }}>{resolvedActiveCampaign.title}</h3>

              <div className="scroll-mini-stats" style={{ marginTop: "16px" }}>
                <span className="scroll-density-title">{t("landing.narrativeMetrics")}</span>
                <div className="scroll-stat-row">
                  <span>{t("landing.metricNpcs")}</span>
                  <span>{npcsCount}</span>
                </div>
                <div className="scroll-stat-row">
                  <span>{t("landing.metricLocations")}</span>
                  <span>{locationsCount}</span>
                </div>
                <div className="scroll-stat-row">
                  <span>{t("landing.metricPlayers")}</span>
                  <span>{players.length}</span>
                </div>
                {activeSession && (
                  <div className="scroll-stat-row">
                    <span>{t("landing.activeSession", { title: "" }).replace(":", "")}</span>
                    <span style={{ color: "#10b981" }}>#{activeSession.number}</span>
                  </div>
                )}
              </div>

              <button className="btn btn-amethyst-outline scroll-btn-switch" onClick={() => setIsViewingArchive(true)}>
                {t("landing.changeCampaign")}
              </button>
            </div>
          </aside>
        </div>

        <AppFooter variant="landing" />
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {resolvedActiveCampaign && !isViewingArchive ? (
        renderActiveCampaignDashboard()
      ) : (
        /* Campaign Archive/Switcher Screen */
        <>
          <PortalTopBar actions={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleAddDm}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
              >
                <UserPlus size={13} />
                {t("nav.addDm")}
              </button>
              <button
                type="button"
                onClick={() => void handleSwitchDm()}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
              >
                <UserRound size={13} />
                {t("nav.switchDm")}
              </button>
              <button
                type="button"
                onClick={() => void handleSignOutDm()}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
              >
                <LogOut size={13} />
                {t("nav.signOut")}
              </button>
            </div>
          } />

          {/* Quick Back to Command Center bar if campaign exists */}
          {resolvedActiveCampaign && (
            <div className="dashboard-back-header">
              <button className="btn-back-dashboard" onClick={() => setIsViewingArchive(false)}>
                <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
                {t("landing.dmDashboardTitle")}
              </button>
            </div>
          )}

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
                      src="/assets/ui/watermark.png"
                      alt=""
                      aria-hidden="true"
                      className="landing-empty__emblem"
                      style={{ opacity: 0.1, width: "120px", height: "auto" }}
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
                        onDelete={openDeleteModal}
                        onRename={() => openEditModal(c)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="card landing-card landing-premade-section">
                <div className="landing-section-header">
                  <h2>
                    <Sparkles size={18} />
                    {t("landing.premadeTitle")}
                  </h2>
                </div>
                <p className="landing-muted" style={{ marginTop: 0 }}>
                  {t("landing.premadeDescription")}
                </p>

                {premadeTemplates.length === 0 ? (
                  <p className="landing-muted">{t("landing.premadeEmpty")}</p>
                ) : (
                  <div className="premade-template-list">
                    {premadeTemplates.map((template) => {
                      const copies = campaigns.filter((campaign) => campaign.metadata?.createdFromTemplateId === template.templateId);
                      return (
                        <article className="premade-template-card" key={template.templateId}>
                          <div className="premade-template-card__header">
                            <div>
                              <h3>{template.title}</h3>
                              <p>{template.subtitle}</p>
                            </div>
                            <span className="premade-template-card__badge">v{template.version}</span>
                          </div>
                          <p className="premade-template-card__description">{template.description}</p>
                          <div className="premade-template-card__meta">
                            <span>{t("landing.premadeDifficulty", { difficulty: template.difficulty })}</span>
                            {copies.length > 0 ? <span>{t("landing.premadeExistingCopies", { count: String(copies.length) })}</span> : null}
                            <span>{t("landing.premadeStats", {
                              entities: String(template.stats.entities),
                              sessions: String(template.stats.preparedSessions),
                            })}</span>
                          </div>
                          <div className="premade-template-card__tags" aria-label={t("landing.premadeTagsLabel")}>
                            {template.tags.slice(0, 5).map((tag) => (
                              <span key={tag}>{tag}</span>
                            ))}
                          </div>
                          <div className="premade-template-card__actions">
                            <button
                              type="button"
                              className="btn btn-secondary landing-secondary-action"
                              onClick={() => navigate({ to: `/premades/${template.templateId}` })}
                            >
                              <Eye size={14} />
                              {t("landing.premadeExploreButton")}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary landing-secondary-action"
                              onClick={() => openPremadeImportDialog(template.templateId)}
                              disabled={loading || importingTemplateId === template.templateId}
                            >
                              {importingTemplateId === template.templateId ? "…" : t("landing.premadeImportButton")}
                            </button>
                          </div>
                        </article>
                      );
                    })}
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

                    <div className="form-group">
                      <label className="form-label">Cover Image Path (e.g. /assets/campaigns/default-campaign-cover.jpg)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="/assets/campaigns/default-campaign-cover.jpg"
                        value={newCampaignCoverUrl}
                        onChange={(e) => setNewCampaignCoverUrl(e.target.value)}
                      />
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

                    {createCampaignError && (
                      <p className="form-error" role="alert">{createCampaignError}</p>
                    )}

                    <button type="submit" className="btn btn-primary landing-primary-action" disabled={isCreatingCampaign}>
                      {isCreatingCampaign ? t("landing.creating") : t("landing.createButton")}
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
                          disabled={backupRestoreState === "loading"}
                          required
                        />
                        <small className="form-help">
                          {t("landing.backupHelp")}
                        </small>
                        {backupRestoreError && (
                          <p className="form-error" role="alert">{backupRestoreError}</p>
                        )}
                        {backupRestoreState === "success" && (
                          <p className="form-success" role="status">{t("landing.restoreSuccess")}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-secondary landing-secondary-action"
                        disabled={backupRestoreState === "loading"}
                      >
                        {backupRestoreState === "loading" ? t("landing.restoring") : t("landing.restoreButton")}
                      </button>
                    </form>
                  </details>
                </section>
              </div>
            </div>

            <AppFooter variant="landing" />
          </div>
        </>
      )}

      {deleteTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
        >
          <div style={{ background: "var(--bg-card, #1a1a2e)", border: "1px solid var(--border)", borderRadius: "12px", padding: "28px", maxWidth: "420px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
              <Trash2 size={20} style={{ color: "var(--color-danger, #e55)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1rem" }}>
                  {deleteConfirmStep === 1 ? t("landing.deleteStep1Title") : t("landing.deleteStep2Title")}
                </h3>
                <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {deleteConfirmStep === 1
                    ? t("landing.deleteStep1Desc", { title: deleteTarget.title })
                    : t("landing.deleteStep2Desc", { title: deleteTarget.title })}
                </p>
              </div>
            </div>

            {deleteConfirmStep === 2 && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                  {t("landing.deleteTypeLabel")}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={deleteConfirmInput}
                  onChange={(e) => { setDeleteConfirmInput(e.target.value); setDeleteError(null); }}
                  placeholder={deleteTarget.title}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") void handleDeleteConfirm(); if (e.key === "Escape") closeDeleteModal(); }}
                />
              </div>
            )}

            {deleteError && (
              <p style={{ color: "var(--color-danger, #e55)", fontSize: "0.82rem", margin: "0 0 12px" }}>{deleteError}</p>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={closeDeleteModal} disabled={deleteLoading}>
                {t("landing.deleteCancel")}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--color-danger, #c33)", color: "#fff", border: "none" }}
                onClick={() => void handleDeleteConfirm()}
                disabled={deleteLoading || (deleteConfirmStep === 2 && deleteConfirmInput.trim() !== deleteTarget.title)}
              >
                {deleteLoading ? "…" : deleteConfirmStep === 1 ? t("landing.deleteStep1Btn") : t("landing.deleteStep2Btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="modal-overlay campaign-edit-dialog-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}>
          <section className="card campaign-edit-dialog" role="dialog" aria-modal="true">
            <h3>{t("landing.editCampaignTitle")}</h3>
            <p className="landing-muted">{t("landing.editCampaignDesc")}</p>
            <div className="form-group">
              <label className="form-label">{t("landing.campaignTitleLabel")}</label>
              <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">{t("common.summary")}</label>
              <textarea className="form-input" rows={4} value={editSummary} onChange={(e) => setEditSummary(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t("landing.systemLabel")}</label>
              <select className="form-select" value={editSystem} onChange={(e) => setEditSystem(e.target.value)}>
                <option value="generic_fantasy_d20">{t("landing.systemFantasyD20Generic")}</option>
                <option value="dnd_srd_5_2_1">{t("landing.systemDnD")}</option>
                <option value="custom">{t("landing.systemCustom")}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cover Image Path (e.g. /assets/campaigns/default-campaign-cover.jpg)</label>
              <input className="form-input" value={editCoverUrl} onChange={(e) => setEditCoverUrl(e.target.value)} placeholder="/assets/campaigns/default-campaign-cover.jpg" />
            </div>
            {editError ? <p className="form-error">{editError}</p> : null}
            <footer className="campaign-edit-dialog__footer">
              <button type="button" className="btn btn-secondary" onClick={closeEditModal} disabled={editLoading}>{t("common.cancel")}</button>
              <button type="button" className="btn btn-primary" onClick={() => void handleEditConfirm()} disabled={editLoading || !editTitle.trim()}>
                {editLoading ? "…" : t("common.saveChanges")}
              </button>
            </footer>
          </section>
        </div>
      )}

      <PremadeImportDialog
        template={selectedPremadeTemplate}
        campaigns={campaigns}
        importing={Boolean(importingTemplateId)}
        error={premadeImportError}
        onClose={() => { if (!importingTemplateId) setPremadeDialogTemplateId(null); }}
        onOpenExisting={(campaignId) => { setPremadeDialogTemplateId(null); triggerMysticalTransition(campaignId); }}
        onConfirm={(options) => selectedPremadeTemplate ? handleImportPremade(selectedPremadeTemplate.templateId, options) : undefined}
      />

      {mysticalTransitionId && (
        <div className="mystical-portal-overlay mystical-portal-overlay--in" aria-live="assertive">
          <div className="mystical-portal-glow"></div>
          <div className="mystical-portal-text">{t("landing.enteringCampaign")}</div>
        </div>
      )}
    </div>
  );
}
