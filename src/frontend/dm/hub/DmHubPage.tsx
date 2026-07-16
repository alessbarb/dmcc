import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useDmHubDashboard } from "./useDmHubDashboard.js";
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
  Activity,
  Settings,
  Trash2,
  Users,
  Shield,
  Calendar,
  Clock,
  BookOpen,
  Map,
  FileText,
  Globe,
  Star,
  LayoutGrid,
  Bell,
  ChevronDown,
} from "lucide-react";
import { CampaignTemplateLibrarySection } from "./CampaignTemplateLibrarySection.js";
import { DmHubCampaignModals } from "./DmHubCampaignModals.js";
import { logout } from "../../shared/auth/authClient.js";
import { CampaignTemplateImportDialog, type CampaignTemplateImportMode } from "../../shared/components/CampaignTemplateImportDialog.js";
import { AccountModal } from "../../account/AccountModal.js";
import { AppFooter } from "../../shared/components/AppFooter.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

function formatCampaignSystem(system?: string) {
  if (system === "dnd_5e") return "D&D 5e";
  if (system === "pathfinder_2e") return "Pathfinder 2e";
  if (system === "shadowdark") return "Shadowdark";
  return "Custom";
}

function activityIcon(type: string) {
  switch (type) {
    case "session": return <Activity size={14} style={{ color: "var(--accent)" }} />;
    case "npc": return <UserPlus size={14} style={{ color: "var(--accent)" }} />;
    case "note": return <FileText size={14} style={{ color: "var(--accent)" }} />;
    case "entity": return <Layers size={14} style={{ color: "var(--accent)" }} />;
    default: return <Globe size={14} style={{ color: "var(--accent)" }} />;
  }
}

// ─── Main App Component ──────────────────────────────────────────────────────

export function DmHubPage() {
  const { t } = useTranslation();
  const {
    campaigns: rawCampaigns,
    campaignTemplates: rawCampaignTemplates,
    loading,
    error,
    fetchCampaigns,
    fetchCampaignTemplates,
    importCampaignTemplate,
    updateCampaign,
    selectCampaign,
    createCampaign,
    deleteCampaign,
    restoreBackup,
    campaignTemplateImportState,
    clearCampaignTemplateImportState,
  } = useCampaignStore();

  const navigate = useNavigate();

  // ── Global DM dashboard data ───────────────────────────────────────────────
  const dashboard = useDmHubDashboard(rawCampaigns, rawCampaignTemplates);
  const campaigns = dashboard.campaigns;
  const campaignTemplates = dashboard.campaignTemplates;
  const totalCampaignsCount = dashboard.totals.campaigns;
  const activeTablesCount = dashboard.totals.activeTables;
  const totalPlayersCount = dashboard.totals.players;
  const totalSessionsCount = dashboard.totals.sessions;
  const totalNpcsCount = dashboard.totals.npcs;
  const totalEntitiesCount = dashboard.totals.entities;

  const formattedTodayDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date());

  // ── UI state ───────────────────────────────────────────────────────────────
  const [, setCampaignsFetched] = useState(false);
  const [landingSearchQuery, setLandingSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isCampaignPickerOpen, setIsCampaignPickerOpen] = useState(false);
  const [pendingQuickAction, setPendingQuickAction] = useState<((cid: string) => void) | null>(null);
  const [dmProfile, setDmProfile] = useState<{ displayName?: string; email?: string; avatarUrl?: string } | null>(null);
  const [mysticalTransitionId, setMysticalTransitionId] = useState<string | null>(null);

  // Create campaign form
  const [newCampaignTitle, setNewCampaignTitle] = useState("");
  const [newCampaignSystem, setNewCampaignSystem] = useState("custom");
  const [newCampaignCoverUrl, setNewCampaignCoverUrl] = useState("");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [createCampaignError, setCreateCampaignError] = useState<string | null>(null);

  // Restore backup form
  const [backupRestorePath, setBackupRestorePath] = useState("");
  const [backupRestoreState, setBackupRestoreState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [backupRestoreError, setBackupRestoreError] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ campaignId: string; title: string } | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<1 | 2>(1);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit modal
  const [editTarget, setEditTarget] = useState<{ campaignId: string; title: string; summary?: string; system?: string; coverUrl?: string } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editSystem, setEditSystem] = useState("custom");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Campaign template import
  const [campaignTemplateDialogId, setCampaignTemplateDialogId] = useState<string | null>(null);
  const importingTemplateId = campaignTemplateImportState.status === "running" ? campaignTemplateImportState.templateId : null;
  const campaignTemplateImportError = campaignTemplateImportState.error ? t(campaignTemplateImportState.error) : null;

  const dropdownRef = useRef<HTMLDivElement>(null);

  const runDmHubAction = (operation: Promise<unknown>, errorMessage: string) => {
    void operation.catch((error: unknown) => {
      console.error(errorMessage, error);
    });
  };

  // ── Auth + data init ───────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { fetchSession } = await import("../../shared/auth/authClient.js");
        const session = await fetchSession();
        if (!session.sessionValid) {
          await navigate({ to: "/auth/login" });
          return;
        }
        setDmProfile(session.user || null);
      } catch {
        await navigate({ to: "/" });
        return;
      }
      await Promise.all([
        fetchCampaigns().catch(() => {}),
        fetchCampaignTemplates().catch(() => {}),
      ]);
      setCampaignsFetched(true);
    };
    void initAuth().catch((error: unknown) => {
      console.error("No se pudo inicializar el hub de DM.", error);
    });
  }, [fetchCampaigns, fetchCampaignTemplates, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && e.target instanceof Node && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const triggerMysticalTransition = (campaignId: string) => {
    setMysticalTransitionId(campaignId);
    window.setTimeout(() => {
      runDmHubAction((async () => {
        try {
          await selectCampaign(campaignId);
          setMysticalTransitionId(null);
          await navigate({ to: `/campaigns/${campaignId}/overview` });
        } catch (e) {
          console.error(e);
          setMysticalTransitionId(null);
        }
      })(), "No se pudo abrir la campaña desde el hub de DM.");
    }, 850);
  };

  const handleSwitchDm = () => {
    runDmHubAction((async () => {
      await logout();
      await navigate({ to: "/auth/login" });
    })(), "No se pudo cambiar de DM.");
  };

  const handleSignOutDm = () => {
    runDmHubAction((async () => {
      await logout();
      await navigate({ to: "/" });
    })(), "No se pudo cerrar la sesión de DM.");
  };

  const refreshCampaigns = () => {
    runDmHubAction(fetchCampaigns(), "No se pudieron recargar las campañas.");
  };

  const navigateToDmSetup = () => {
    runDmHubAction(navigate({ to: "/auth/register" }), "No se pudo abrir la configuración de DM.");
  };

  const navigateToCampaignTemplate = (templateId: string) => {
    runDmHubAction(navigate({ to: `/campaign-templates/${templateId}` }), "No se pudo abrir la aventura preparada.");
  };

  const navigateToActiveSession = (campaignId: string) => {
    runDmHubAction(navigate({ to: `/campaigns/${campaignId}/session` }), "No se pudo abrir la sesión activa.");
  };

  const navigateToCampaignSection = (
    campaignId: string,
    section: "canvas" | "entities" | "rules" | "graph" | "timeline" | "settings",
  ) => {
    runDmHubAction(navigate({ to: `/campaigns/${campaignId}/${section}` }), "No se pudo abrir la sección de campaña.");
  };

  const handleCreateCampaignSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim()) return;
    setIsCreatingCampaign(true);
    setCreateCampaignError(null);
    try {
      const campaignId = await createCampaign(
        newCampaignTitle.trim(),
        newCampaignSystem,
        newCampaignCoverUrl.trim() || undefined
      );
      setNewCampaignTitle("");
      setNewCampaignCoverUrl("");
      setIsCreateModalOpen(false);
      if (campaignId) await navigate({ to: `/campaigns/${campaignId}/overview` });
    } catch (err: any) {
      setCreateCampaignError(err.message || t("landing.createCampaignError"));
    } finally {
      setIsCreatingCampaign(false);
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
      await fetchCampaigns();
    } catch (err: any) {
      setBackupRestoreError(err.message || "Restore failed");
      setBackupRestoreState("error");
    }
  };

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmStep === 1) { setDeleteConfirmStep(2); return; }
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

  const openEditModal = (campaign: { campaignId: string; title: string; summary?: string; system?: string; coverUrl?: string }) => {
    setEditTarget(campaign);
    setEditTitle(campaign.title);
    setEditSummary(campaign.summary ?? "");
    setEditSystem(campaign.system ?? "custom");
    setEditCoverUrl(campaign.coverUrl ?? "");
    setEditError(null);
  };

  const closeEditModal = () => { setEditTarget(null); setEditError(null); };

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

  const openCampaignTemplateImportDialog = (templateId: string) => {
    clearCampaignTemplateImportState();
    setCampaignTemplateDialogId(templateId);
  };

  const handleImportCampaignTemplate = async (
    templateId: string,
    options: { title: string; summary?: string; importMode: CampaignTemplateImportMode; openAfterCreate: boolean }
  ) => {
    try {
      const campaignId = await importCampaignTemplate(templateId, {
        title: options.title,
        summary: options.summary,
        importMode: options.importMode,
      });
      if (campaignId) {
        setCampaignTemplateDialogId(null);
        clearCampaignTemplateImportState();
        if (options.openAfterCreate) {
          await navigate({ to: `/campaigns/${campaignId}/overview` });
        }
      }
    } catch (err) {
      console.error("Import failed:", err);
    }
  };

  // Quick action handlers (global — requests campaign selection if none or multiple)
  const requireCampaign = (action: (cid: string) => void) => {
    if (campaigns.length === 0) {
      setIsCreateModalOpen(true);
    } else if (campaigns.length === 1) {
      action(campaigns[0].campaignId);
    } else {
      // Show picker
      setPendingQuickAction(() => action);
      setIsCampaignPickerOpen(true);
    }
  };

  const handlePickerSelect = (campaignId: string) => {
    setIsCampaignPickerOpen(false);
    if (pendingQuickAction) {
      pendingQuickAction(campaignId);
      setPendingQuickAction(null);
    }
  };

  const handleQuickCanvas = () => requireCampaign((cid) => navigateToCampaignSection(cid, "canvas"));
  const handleQuickNpcs = () => requireCampaign((cid) => navigateToCampaignSection(cid, "entities"));
  const handleQuickLibrary = () => document.getElementById("campaign-template-library-section")?.scrollIntoView({ behavior: "smooth" });
  const handleQuickRules = () => requireCampaign((cid) => navigateToCampaignSection(cid, "rules"));
  const handleQuickMap = () => requireCampaign((cid) => navigateToCampaignSection(cid, "graph"));
  const handleQuickTimeline = () => requireCampaign((cid) => navigateToCampaignSection(cid, "timeline"));
  const handleQuickTemplates = () => document.getElementById("campaign-template-library-section")?.scrollIntoView({ behavior: "smooth" });
  const handleQuickSettings = () => campaigns.length > 0
    ? requireCampaign((cid) => navigateToCampaignSection(cid, "settings"))
    : setIsAccountModalOpen(true);

  // ── Filtered campaigns ─────────────────────────────────────────────────────
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesQuery =
      c.title.toLowerCase().includes(landingSearchQuery.toLowerCase()) ||
      c.campaignId.toLowerCase().includes(landingSearchQuery.toLowerCase());
    if (campaignFilter === "all") return matchesQuery;
    if (campaignFilter === "active") return matchesQuery && (c.status === "active" || c.stats?.activeSession);
    if (campaignFilter === "paused") return matchesQuery && c.status !== "active" && !c.stats?.activeSession;
    return matchesQuery;
  });

  const selectedCampaignTemplate = campaignTemplates.find((t) => t.templateId === campaignTemplateDialogId) ?? null;

  const dmDisplayName = dmProfile?.displayName || dmProfile?.email || "Director de Juego";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dm-hub-root" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <RpgPortalBackground />

      {/* ── TOPBAR ── */}
      <PortalTopBar actions={
        <div className="dm-hub-topbar-actions">
          <button
            type="button"
            className="dm-topbar-ghost-btn"
            onClick={navigateToDmSetup}
          >
            <UserPlus size={13} />
            {t("nav.addDm")}
          </button>
          <button
            type="button"
            className="dm-topbar-ghost-btn"
            onClick={handleSwitchDm}
          >
            <UserRound size={13} />
            {t("nav.switchDm")}
          </button>

          {/* User dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="dm-topbar-ghost-btn dm-topbar-user-btn"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <UserRound size={13} />
              <span>{dmDisplayName}</span>
              <ChevronDown size={11} style={{ opacity: 0.6 }} />
            </button>
            {isUserDropdownOpen && (
              <div className="dm-user-dropdown animate-fade-in">
                <div className="dm-user-dropdown__header">
                  <p className="dm-user-dropdown__name">{dmDisplayName}</p>
                  <p className="dm-user-dropdown__email">{dmProfile?.email}</p>
                </div>
                <button className="dm-user-dropdown__item" onClick={() => { setIsUserDropdownOpen(false); setIsAccountModalOpen(true); }}>
                  <Settings size={13} />
                  Gestionar cuenta
                </button>
                <div className="dm-user-dropdown__divider" />
                <button className="dm-user-dropdown__item dm-user-dropdown__item--danger" onClick={() => { setIsUserDropdownOpen(false); handleSignOutDm(); }}>
                  <LogOut size={13} />
                  {t("nav.signOut")}
                </button>
              </div>
            )}
          </div>
        </div>
      } />

      {/* ── MAIN CONTENT ── */}
      <main className="dm-hub-main">

        {/* ── DM HEADER HERO ── */}
        <header className="dm-hub-hero">
          <div className="dm-hub-hero__profile">
            <div className="dm-hub-hero__avatar-ring">
              <img
                className="dm-hub-hero__avatar"
                src={dmProfile?.avatarUrl || "/assets/avatars/default-avatar.png"}
                alt={dmDisplayName}
              />
            </div>
            <div className="dm-hub-hero__info">
              <h1 className="dm-hub-hero__greeting">
                {t("landing.dmWelcome", { name: dmProfile?.displayName || dmProfile?.email || "Maestro" })}
              </h1>
              <p className="dm-hub-hero__subtitle">Centro de Mando del Director de Juego</p>
              <div className="dm-hub-hero__stats">
                {[
                  { icon: <FolderOpen size={14} />, value: totalCampaignsCount, label: t("landing.campaignsLabel") },
                  { icon: <Activity size={14} />, value: activeTablesCount, label: "Mesas activas" },
                  { icon: <Users size={14} />, value: totalPlayersCount, label: t("landing.playersLabel") },
                  { icon: <Calendar size={14} />, value: totalSessionsCount, label: "Sesiones" },
                  { icon: <UserRound size={14} />, value: totalNpcsCount, label: "PNJs" },
                  { icon: <Layers size={14} />, value: totalEntitiesCount, label: t("landing.entitiesLabel") },
                ].map((s, i) => (
                  <div key={i} className="dm-stat-pill">
                    <span className="dm-stat-pill__icon">{s.icon}</span>
                    <span className="dm-stat-pill__value">{s.value}</span>
                    <span className="dm-stat-pill__label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dm-hub-hero__calendar">
            <div className="dm-hub-hero__calendar-date">
              <Calendar size={13} style={{ color: "var(--accent)", marginRight: "6px", verticalAlign: "middle" }} />
              {formattedTodayDate}
            </div>
            <div className="dm-hub-hero__calendar-world">{dashboard.activeTables.length > 0 ? `${dashboard.activeTables.length} mesa(s) activas ahora` : "Sin mesas activas ahora"}</div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "8px", width: "100%" }}
              onClick={dashboard.activeTables.length > 0 ? handleQuickTimeline : undefined}
              disabled={dashboard.activeTables.length === 0}
            >
              {t("landing.viewTimeline")}
            </button>
          </div>
        </header>

        <nav className="dm-hub-mobile-actions" aria-label="Acciones rápidas de campañas">
          <button type="button" className="dm-hub-mobile-action dm-hub-mobile-action--theme-accents-primary-foreground" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} />
            <span>Nueva</span>
          </button>
          <button type="button" className="dm-hub-mobile-action" onClick={() => document.getElementById("dm-campaigns-section")?.scrollIntoView({ behavior: "smooth" })}>
            <FolderOpen size={16} />
            <span>Campañas</span>
          </button>
          <button type="button" className="dm-hub-mobile-action" onClick={handleQuickTemplates}>
            <Sparkles size={16} />
            <span>Aventuras</span>
          </button>
          <button type="button" className="dm-hub-mobile-action" onClick={() => setIsRestoreModalOpen(true)}>
            <RotateCcw size={16} />
            <span>Restaurar</span>
          </button>
        </nav>

        {/* ── MAIN GRID: 70 / 30 ── */}
        <div className="dm-hub-grid">
          {/* ──────────── LEFT COLUMN (70%) ──────────── */}
          <div className="dm-hub-grid__left">

            {/* ── TUS CAMPAÑAS ── */}
            <section id="dm-campaigns-section" className="dm-panel dm-panel--campaigns">
              <div className="dm-panel__header dm-panel__header--campaigns">
                <div className="dm-panel__title-group">
                  <FolderOpen size={17} style={{ color: "var(--accent)" }} />
                  <h2 className="dm-panel__title">Tus campañas</h2>
                </div>
                <div className="dm-panel__controls">
                  <div className="dm-search-wrapper">
                    <Search size={13} className="dm-search-icon" />
                    <input
                      type="text"
                      className="dm-search-input"
                      placeholder={t("landing.searchCampaignPlaceholder")}
                      value={landingSearchQuery}
                      onChange={(e) => setLandingSearchQuery(e.target.value)}
                    />
                    {landingSearchQuery && (
                      <button type="button" className="dm-search-clear" onClick={() => setLandingSearchQuery("")}>
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <select
                    className="dm-filter-select"
                    value={campaignFilter}
                    onChange={(e) => setCampaignFilter(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    <option value="active">En curso</option>
                    <option value="paused">Pausadas</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="dm-muted-text">{t("landing.loadingCampaigns")}</p>
              ) : error ? (
                <div className="dm-empty-state dm-empty-state--error">
                  <AlertTriangle size={22} className="icon-critical" />
                  <p>{t("landing.errorTitle")}</p>
                  <span>{error}</span>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={refreshCampaigns}>
                    {t("landing.retryButton")}
                  </button>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="dm-empty-state">
                  <Shield size={32} style={{ color: "var(--accent)", opacity: 0.5, marginBottom: "12px" }} />
                  <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--theme-text-primary)" }}>
                    Todavía no tienes campañas
                  </p>
                  <span style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)", lineHeight: 1.5, display: "block", margin: "8px 0 20px", maxWidth: "380px" }}>
                    Crea tu primera campaña desde cero, usa una aventura preparada o restaura una copia de seguridad.
                  </span>
                  <div className="dm-empty-state__actions">
                    <button className="btn btn-gold btn-sm" onClick={() => setIsCreateModalOpen(true)}>
                      <Plus size={14} /> {t("landing.createCampaignLabel")}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleQuickTemplates}>
                      Explorar aventuras
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsRestoreModalOpen(true)}>
                      <RotateCcw size={14} /> Restaurar copia
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="dm-campaigns-grid">
                    {filteredCampaigns.map((c) => {
                      const isActive = Boolean(c.stats?.activeSession) || c.status === "active";
                      const statusLabel = isActive ? "EN CURSO" : "PAUSADA";
                      const lastUpdated = c.updatedAt
                        ? t("landing.daysAgo", { count: String(Math.max(1, Math.floor((Date.now() - new Date(c.updatedAt).getTime()) / 86400000))) })
                        : "Sin actividad registrada";

                      return (
                        <div
                          key={c.campaignId}
                          className="dm-campaign-card"
                          onClick={() => triggerMysticalTransition(c.campaignId)}
                        >
                          <div
                            className="dm-campaign-card__cover"
                            style={{ backgroundImage: `url(${c.coverUrl || "/assets/campaigns/default-campaign-cover.jpg"})` }}
                          >
                            <div className="dm-campaign-card__cover-overlay" />
                            <span className={`dm-campaign-card__badge ${isActive ? "active" : "paused"}`}>
                              {statusLabel}
                            </span>
                            <button
                              type="button"
                              className="dm-campaign-card__fav"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Star size={11} fill="var(--accent)" style={{ color: "var(--accent)" }} />
                            </button>
                            <div
                              className="dm-campaign-card__actions"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Acciones de campaña"
                            >
                              <button
                                type="button"
                                className="dm-campaign-card__action"
                                onClick={() => openEditModal(c)}
                                aria-label="Editar campaña"
                              >
                                <Settings size={11} />
                              </button>
                              <button
                                type="button"
                                className="dm-campaign-card__action dm-campaign-card__action--danger"
                                onClick={() => openDeleteModal(c.campaignId, c.title)}
                                aria-label="Eliminar campaña"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                          <div className="dm-campaign-card__body">
                            <h3 className="dm-campaign-card__title">{c.title}</h3>
                            <p className="dm-campaign-card__system">{formatCampaignSystem(c.system)}</p>
                            <p className="dm-campaign-card__desc">
                              {c.summary || t("landing.noDescriptionYet")}
                            </p>
                            {c.loadWarning === "snapshot_unreadable" ? (
                              <p className="dm-muted-text" role="status">
                                <AlertTriangle size={12} aria-hidden="true" /> Snapshot unreadable; campaign metadata may be incomplete.
                              </p>
                            ) : null}
                            <div className="dm-campaign-card__meta">
                              <span><Clock size={10} /> Sesión {c.stats?.sessionsCount ?? 0}</span>
                              <span><Users size={10} /> {c.stats?.playersCount ?? 0} jugadores</span>
                            </div>
                            <div className="dm-campaign-card__footer">
                              <span>Última sesión: {lastUpdated}</span>
                              {c.progressPercent !== null && (
                                <span className="dm-campaign-card__pct">{c.progressPercent}%</span>
                              )}
                            </div>
                            {c.progressPercent !== null && (
                              <div className="dm-campaign-card__progress-track">
                                <div className="dm-campaign-card__progress-fill" style={{ width: `${c.progressPercent}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* Create card */}
                    <div className="dm-campaign-card dm-campaign-card--create" onClick={() => setIsCreateModalOpen(true)}>
                      <div className="dm-campaign-card--create__inner">
                        <div className="dm-campaign-card--create__icon"><Plus size={22} /></div>
                        <h3>Nueva campaña</h3>
                        <p>Crea desde cero</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* ── RESUMEN GENERAL + ACTIVIDAD RECIENTE ── */}
            <div className="dm-hub-twin-grid">
              <section className="dm-panel">
                <div className="dm-panel__header">
                  <h2 className="dm-panel__title">Resumen general</h2>
                </div>
                <div className="dm-summary-grid">
                  {[
                    { value: totalPlayersCount, label: t("landing.totalPlayers") },
                    { value: totalNpcsCount, label: "PNJs creados" },
                    { value: totalEntitiesCount, label: t("landing.totalEntities") },
                    { value: totalSessionsCount, label: "Sesiones realizadas" },
                    { value: dashboard.totals.playtimeLast30DaysLabel, label: "Tiempo de juego (30d)" },
                    { value: dashboard.totals.completedCampaigns, label: t("landing.completedCampaigns") },
                  ].map((s, i) => (
                    <div key={i} className="dm-summary-item">
                      <span className="dm-summary-item__value">{s.value}</span>
                      <span className="dm-summary-item__label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="dm-panel">
                <div className="dm-panel__header">
                  <h2 className="dm-panel__title">Actividad reciente</h2>
                </div>
                {dashboard.recentActivity.length === 0 ? (
                  <div className="dm-empty-state dm-empty-state--compact">
                    <FileText size={22} style={{ color: "var(--accent)", opacity: 0.55, marginBottom: "10px" }} />
                    <p>No hay actividad reciente.</p>
                    <span>Cuando crees campañas, sesiones, PNJs o notas, aparecerán aquí.</span>
                  </div>
                ) : (
                  <div className="dm-activity-list">
                    {dashboard.recentActivity.map((item) => (
                      <div key={item.id} className="dm-activity-row">
                        <div className="dm-activity-row__icon">{activityIcon(item.icon)}</div>
                        <span className="dm-activity-row__text">{item.text}</span>
                        <span className="dm-activity-row__time">{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <CampaignTemplateLibrarySection
              templates={campaignTemplates}
              campaigns={campaigns}
              loading={loading}
              importingTemplateId={importingTemplateId}
              t={t}
              onExplore={navigateToCampaignTemplate}
              onImport={openCampaignTemplateImportDialog}
            />
          </div>

          {/* ──────────── RIGHT COLUMN (30%) ──────────── */}
          <div className="dm-hub-grid__right">

            {/* ── MESAS ACTIVAS ── */}
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div className="dm-panel__title-group">
                  <Activity size={16} style={{ color: "var(--accent)" }} />
                  <h2 className="dm-panel__title">Mesas activas ahora</h2>
                </div>
                <button type="button" className="dm-panel__link" disabled={dashboard.activeTables.length === 0}>Ver todas</button>
              </div>
              {dashboard.activeTables.length === 0 ? (
                <div className="dm-empty-state dm-empty-state--compact">
                  <Activity size={22} style={{ color: "var(--accent)", opacity: 0.55, marginBottom: "10px" }} />
                  <p>No hay mesas activas ahora.</p>
                  <span>Cuando una campaña tenga una sesión activa, aparecerá aquí.</span>
                </div>
              ) : (
                <div className="dm-tables-list">
                  {dashboard.activeTables.map((table) => (
                    <div key={table.id} className="dm-table-row" onClick={() => triggerMysticalTransition(table.campaignId)}>
                      <div className="dm-table-row__cover" />
                      <div className="dm-table-row__info">
                        <div className="dm-table-row__title-line">
                          <span className="dm-table-row__name">{table.tableName}</span>
                          <span className={`dm-badge dm-badge--${table.status === "running" ? "active" : "paused"}`}>
                            {table.status === "running" ? "EN CURSO" : "PAUSADA"}
                          </span>
                        </div>
                        <span className="dm-table-row__campaign">{table.campaignTitle}</span>
                        <span className="dm-table-row__session">{table.sessionTitle}</span>
                      </div>
                      <div className="dm-table-row__stats">
                        {table.elapsed && <span className="dm-table-row__time"><Clock size={10} /> {table.elapsed}</span>}
                        <span className="dm-table-row__players"><Users size={10} /> {table.playersPresent}/{table.playersTotal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", marginTop: "14px" }}
                disabled={dashboard.activeTables.length === 0}
                onClick={() => {
                  const firstTable = dashboard.activeTables[0];
                  if (firstTable) navigateToActiveSession(firstTable.campaignId);
                }}
              >
                Gestionar mesas
              </button>
            </section>

            {/* ── ALERTAS Y PENDIENTES ── */}
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div className="dm-panel__title-group">
                  <Bell size={16} style={{ color: "var(--accent)" }} />
                  <h2 className="dm-panel__title">Alertas y pendientes</h2>
                </div>
                <button type="button" className="dm-panel__link" disabled={dashboard.alerts.length === 0}>Ver todas</button>
              </div>
              {dashboard.alerts.length === 0 ? (
                <div className="dm-empty-state dm-empty-state--compact">
                  <Bell size={22} style={{ color: "var(--accent)", opacity: 0.55, marginBottom: "10px" }} />
                  <p>Todo está al día.</p>
                  <span>No tienes pendientes importantes ahora mismo.</span>
                </div>
              ) : (
                <div className="dm-alerts-list">
                  {dashboard.alerts.map((alert) => (
                    <div key={alert.id} className="dm-alert-row">
                      <span className="dm-alert-row__label">{alert.label}</span>
                      <span className={`dm-alert-row__badge ${alert.severity}`}>{alert.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── ACCESOS RÁPIDOS ── */}
            <section className="dm-panel">
              <div className="dm-panel__header">
                <h2 className="dm-panel__title">Accesos rápidos</h2>
              </div>
              <div className="dm-quick-grid">
                {[
                  { icon: <LayoutGrid size={18} />, label: "Abrir Canvas", action: handleQuickCanvas },
                  { icon: <Users size={18} />, label: "Gestionar PNJs", action: handleQuickNpcs },
                  { icon: <BookOpen size={18} />, label: "Biblioteca", action: handleQuickLibrary },
                  { icon: <FileText size={18} />, label: t("landing.rulesLabel"), action: handleQuickRules },
                  { icon: <Map size={18} />, label: "Mapa del mundo", action: handleQuickMap },
                  { icon: <Clock size={18} />, label: t("landing.timelineLabel"), action: handleQuickTimeline },
                  { icon: <Sparkles size={18} />, label: "Plantillas", action: handleQuickTemplates },
                  { icon: <Settings size={18} />, label: t("landing.settingsLabel"), action: handleQuickSettings },
                ].map((item, i) => (
                  <button key={i} type="button" className="dm-quick-btn" onClick={item.action}>
                    <span className="dm-quick-btn__icon">{item.icon}</span>
                    <span className="dm-quick-btn__label">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <AppFooter variant="landing" />
      </main>

      <DmHubCampaignModals
        runDmHubAction={runDmHubAction}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        newCampaignTitle={newCampaignTitle}
        setNewCampaignTitle={setNewCampaignTitle}
        newCampaignSystem={newCampaignSystem}
        setNewCampaignSystem={setNewCampaignSystem}
        newCampaignCoverUrl={newCampaignCoverUrl}
        setNewCampaignCoverUrl={setNewCampaignCoverUrl}
        isCreatingCampaign={isCreatingCampaign}
        createCampaignError={createCampaignError}
        handleCreateCampaignSubmit={handleCreateCampaignSubmit}
        isRestoreModalOpen={isRestoreModalOpen}
        setIsRestoreModalOpen={setIsRestoreModalOpen}
        backupRestorePath={backupRestorePath}
        setBackupRestorePath={setBackupRestorePath}
        backupRestoreState={backupRestoreState}
        setBackupRestoreState={setBackupRestoreState}
        backupRestoreError={backupRestoreError}
        handleRestoreBackupSubmit={handleRestoreBackupSubmit}
        deleteTarget={deleteTarget}
        deleteConfirmStep={deleteConfirmStep}
        deleteConfirmInput={deleteConfirmInput}
        setDeleteConfirmInput={setDeleteConfirmInput}
        deleteLoading={deleteLoading}
        deleteError={deleteError}
        setDeleteError={setDeleteError}
        closeDeleteModal={closeDeleteModal}
        handleDeleteConfirm={handleDeleteConfirm}
        editTarget={editTarget}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editSummary={editSummary}
        setEditSummary={setEditSummary}
        editSystem={editSystem}
        setEditSystem={setEditSystem}
        editCoverUrl={editCoverUrl}
        setEditCoverUrl={setEditCoverUrl}
        editLoading={editLoading}
        editError={editError}
        closeEditModal={closeEditModal}
        handleEditConfirm={handleEditConfirm}
        isCampaignPickerOpen={isCampaignPickerOpen}
        setIsCampaignPickerOpen={setIsCampaignPickerOpen}
        setPendingQuickAction={setPendingQuickAction}
        campaigns={campaigns}
        handlePickerSelect={handlePickerSelect}
      />
      {/* ── ACCOUNT MODAL ── */}

      <AccountModal open={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />

      {/* ── CAMPAIGN TEMPLATE IMPORT DIALOG ── */}
      <CampaignTemplateImportDialog
        template={selectedCampaignTemplate}
        // DmHubCampaign.stats uses a different shape than Campaign.stats; CampaignTemplateImportDialog never reads stats.
        campaigns={campaigns as unknown as React.ComponentProps<typeof CampaignTemplateImportDialog>["campaigns"]}
        importing={Boolean(importingTemplateId)}
        importProgress={campaignTemplateImportState}
        error={campaignTemplateImportError}
        onClose={() => { if (!importingTemplateId) { setCampaignTemplateDialogId(null); clearCampaignTemplateImportState(); } }}
        onOpenExisting={(campaignId) => { setCampaignTemplateDialogId(null); clearCampaignTemplateImportState(); triggerMysticalTransition(campaignId); }}
        onConfirm={(options) => selectedCampaignTemplate ? handleImportCampaignTemplate(selectedCampaignTemplate.templateId, options) : undefined}
      />

      {/* ── MYSTICAL TRANSITION ── */}
      {mysticalTransitionId && (
        <div className="mystical-portal-overlay mystical-portal-overlay--in" aria-live="assertive">
          <div className="mystical-portal-glow"></div>
          <div className="mystical-portal-text">{t("landing.enteringCampaign")}</div>
        </div>
      )}
    </div>
  );
}
