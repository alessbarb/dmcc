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
  ArrowRight,
  Settings,
  Trash2,
  Eye,
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
import { logoutDm } from "../../shared/auth/authClient.js";
import { PremadeImportDialog, type PremadeImportMode } from "../../shared/components/PremadeImportDialog.js";
import { AccountModal } from "../../account/AccountModal.js";
import { AppFooter } from "../../shared/components/AppFooter.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

function formatCampaignSystem(system?: string) {
  if (system === "dnd_srd_5_2_1") return "D&D 5e";
  if (system === "generic_fantasy_d20") return "d20 Fantasy";
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
    premadeTemplates: rawPremadeTemplates,
    loading,
    error,
    fetchCampaigns,
    fetchPremadeCampaigns,
    importPremadeCampaign,
    updateCampaign,
    selectCampaign,
    createCampaign,
    deleteCampaign,
    restoreBackup,
  } = useCampaignStore();

  const navigate = useNavigate();

  // ── Global DM dashboard data ───────────────────────────────────────────────
  const dashboard = useDmHubDashboard(rawCampaigns, rawPremadeTemplates);
  const campaigns = dashboard.campaigns;
  const premadeTemplates = dashboard.premadeTemplates;
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
  const [newCampaignSystem, setNewCampaignSystem] = useState("generic_fantasy_d20");
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
  const [editSystem, setEditSystem] = useState("generic_fantasy_d20");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Premade import
  const [importingTemplateId, setImportingTemplateId] = useState<string | null>(null);
  const [premadeDialogTemplateId, setPremadeDialogTemplateId] = useState<string | null>(null);
  const [premadeImportError, setPremadeImportError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Auth + data init ───────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { fetchAuthStatus } = await import("../../shared/auth/authClient.js");
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
      await Promise.all([
        fetchCampaigns().catch(() => {}),
        fetchPremadeCampaigns().catch(() => {}),
      ]);
      setCampaignsFetched(true);
    };
    void initAuth();
  }, [fetchCampaigns, fetchPremadeCampaigns, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const triggerMysticalTransition = (campaignId: string) => {
    setMysticalTransitionId(campaignId);
    setTimeout(async () => {
      try {
        await selectCampaign(campaignId);
        setMysticalTransitionId(null);
        navigate({ to: `/campaigns/${campaignId}/dashboard` });
      } catch (e) {
        console.error(e);
        setMysticalTransitionId(null);
      }
    }, 850);
  };

  const handleSignOutDm = async () => {
    await logoutDm();
    await navigate({ to: "/" });
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
      if (campaignId) navigate({ to: `/campaigns/${campaignId}/dashboard` });
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
    setEditSystem(campaign.system ?? "generic_fantasy_d20");
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

  const openPremadeImportDialog = (templateId: string) => {
    setPremadeImportError(null);
    setPremadeDialogTemplateId(templateId);
  };

  const handleImportPremade = async (
    templateId: string,
    options: { title: string; summary?: string; importMode: PremadeImportMode; openAfterCreate: boolean }
  ) => {
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
        navigate({ to: `/campaigns/${campaignId}/dashboard` });
      } else {
        await fetchCampaigns();
      }
    } catch (err: any) {
      setPremadeImportError(err.message || t("premadeImport.genericError"));
    } finally {
      setImportingTemplateId(null);
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

  const handleQuickCanvas = () => requireCampaign((cid) => navigate({ to: `/campaigns/${cid}/canvas` }));
  const handleQuickNpcs = () => requireCampaign((cid) => navigate({ to: `/campaigns/${cid}/entities` }));
  const handleQuickLibrary = () => document.getElementById("premade-library-section")?.scrollIntoView({ behavior: "smooth" });
  const handleQuickRules = () => requireCampaign((cid) => navigate({ to: `/campaigns/${cid}/rules` }));
  const handleQuickMap = () => requireCampaign((cid) => navigate({ to: `/campaigns/${cid}/graph` }));
  const handleQuickTimeline = () => requireCampaign((cid) => navigate({ to: `/campaigns/${cid}/timeline` }));
  const handleQuickTemplates = () => document.getElementById("premade-library-section")?.scrollIntoView({ behavior: "smooth" });
  const handleQuickSettings = () => campaigns.length > 0
    ? requireCampaign((cid) => navigate({ to: `/campaigns/${cid}/settings` }))
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

  const selectedPremadeTemplate = premadeTemplates.find((t) => t.templateId === premadeDialogTemplateId) ?? null;

  const dmDisplayName = dmProfile?.displayName || dmProfile?.email || "Director de Juego";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dm-hub-root" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <RpgPortalBackground />

      {/* ── TOPBAR ── */}
      <PortalTopBar actions={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="dm-topbar-ghost-btn"
            onClick={() => navigate({ to: "/dm/setup" })}
          >
            <UserPlus size={13} />
            {t("nav.addDm")}
          </button>
          <button
            type="button"
            className="dm-topbar-ghost-btn"
            onClick={() => { void (async () => { await logoutDm(); navigate({ to: "/dm/unlock" }); })(); }}
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
                <button className="dm-user-dropdown__item dm-user-dropdown__item--danger" onClick={() => { setIsUserDropdownOpen(false); void handleSignOutDm(); }}>
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

        {/* ── MAIN GRID: 70 / 30 ── */}
        <div className="dm-hub-grid">
          {/* ──────────── LEFT COLUMN (70%) ──────────── */}
          <div className="dm-hub-grid__left">

            {/* ── TUS CAMPAÑAS ── */}
            <section className="dm-panel">
              <div className="dm-panel__header">
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
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => fetchCampaigns()}>
                    {t("landing.retryButton")}
                  </button>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="dm-empty-state">
                  <Shield size={32} style={{ color: "var(--accent)", opacity: 0.5, marginBottom: "12px" }} />
                  <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-main)" }}>
                    Todavía no tienes campañas
                  </p>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, display: "block", margin: "8px 0 20px", maxWidth: "380px" }}>
                    Crea tu primera campaña desde cero, usa una aventura preparada o restaura una copia de seguridad.
                  </span>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
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
                      const isActive = Boolean(c.stats.activeSession) || c.status === "active";
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
                            <div className="dm-campaign-card__meta">
                              <span><Clock size={10} /> Sesión {c.stats.sessionsCount}</span>
                              <span><Users size={10} /> {c.stats.playersCount} jugadores</span>
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

            {/* ── AVENTURAS PREPARADAS ── */}
            <section id="premade-library-section" className="dm-panel">
              <div className="dm-panel__header">
                <div className="dm-panel__title-group">
                  <Sparkles size={17} style={{ color: "var(--accent)" }} />
                  <h2 className="dm-panel__title">Aventuras preparadas</h2>
                </div>
              </div>
              <p className="dm-muted-text" style={{ marginTop: 0, marginBottom: "20px" }}>
                {t("landing.premadeDescription")}
              </p>
              {premadeTemplates.length === 0 ? (
                <p className="dm-muted-text">{t("landing.premadeEmpty")}</p>
              ) : (
                <div className="dm-premades-grid">
                  {premadeTemplates.map((template) => {
                    const copies = campaigns.filter((c) => c.metadata?.createdFromTemplateId === template.templateId);
                    return (
                      <article key={template.templateId} className="dm-premade-card">
                        <div className="dm-premade-card__header">
                          <div>
                            <h3 className="dm-premade-card__title">{template.title}</h3>
                            <p className="dm-premade-card__subtitle">{template.subtitle}</p>
                          </div>
                          <span className="dm-premade-card__version">v{template.version}</span>
                        </div>
                        <p className="dm-premade-card__desc">{template.description}</p>
                        <div className="dm-premade-card__meta">
                          <span>{t("landing.premadeDifficulty", { difficulty: template.difficulty })}</span>
                          {copies.length > 0 && (
                            <span style={{ color: "var(--accent)" }}>
                              {t("landing.premadeExistingCopies", { count: String(copies.length) })}
                            </span>
                          )}
                          <span>{t("landing.premadeStats", {
                            entities: String(template.stats.entities),
                            sessions: String(template.stats.preparedSessions),
                          })}</span>
                        </div>
                        <div className="dm-premade-card__tags">
                          {template.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="dm-tag">{tag}</span>
                          ))}
                        </div>
                        <div className="dm-premade-card__actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate({ to: `/premades/${template.templateId}` })}
                            style={{ flex: 1 }}
                          >
                            <Eye size={12} />
                            {t("landing.premadeExploreButton")}
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openPremadeImportDialog(template.templateId)}
                            disabled={loading || importingTemplateId === template.templateId}
                            style={{ flex: 1 }}
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
                  if (firstTable) navigate({ to: `/campaigns/${firstTable.campaignId}/session` });
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

      {/* ════════════════════════════════════════
          MODALS
      ════════════════════════════════════════ */}

      {/* ── CREATE CAMPAIGN MODAL ── */}
      {isCreateModalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div className="dm-modal" role="dialog" aria-modal="true" aria-label={t("landing.createCampaignLabel")}>
            <div className="dm-modal__header">
              <h3 className="dm-modal__title">Nueva campaña</h3>
              <button type="button" className="dm-modal__close" onClick={() => setIsCreateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="dm-muted-text" style={{ marginTop: 0, marginBottom: "20px" }}>
              Crea una nueva campaña desde cero und empieza a construir tu mundo.
            </p>
            <form onSubmit={(e) => void handleCreateCampaignSubmit(e)}>
              <div className="form-group">
                <label className="form-label">{t("landing.campaignTitleLabel")} *</label>
                <input
                  className="form-input"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  placeholder="El Legado de Valdiris..."
                  autoFocus
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
                <label className="form-label">Imagen de portada</label>
                <ImagePickerButton
                  value={newCampaignCoverUrl}
                  onChange={setNewCampaignCoverUrl}
                  catalog="campaigns"
                  defaultImage="/assets/campaigns/default-campaign-cover.jpg"
                />
              </div>
              {createCampaignError && (
                <p style={{ color: "var(--color-danger, #e55)", fontSize: "0.83rem", margin: "0 0 12px" }}>
                  {createCampaignError}
                </p>
              )}
              <div className="dm-modal__footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={isCreatingCampaign || !newCampaignTitle.trim()}
                >
                  {isCreatingCampaign ? t("landing.creating") : t("landing.createCampaignLabel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESTORE BACKUP MODAL ── */}
      {isRestoreModalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) { setIsRestoreModalOpen(false); setBackupRestoreState("idle"); } }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div className="dm-modal" role="dialog" aria-modal="true" aria-label="Restaurar copia de seguridad">
            <div className="dm-modal__header">
              <h3 className="dm-modal__title">Restaurar copia de seguridad</h3>
              <button type="button" className="dm-modal__close" onClick={() => { setIsRestoreModalOpen(false); setBackupRestoreState("idle"); }}>
                <X size={16} />
              </button>
            </div>
            {backupRestoreState === "success" ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ color: "var(--color-success, #4ade80)", fontWeight: 700, fontSize: "1rem" }}>
                  ✓ Copia restaurada correctamente
                </p>
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: "12px" }} onClick={() => { setIsRestoreModalOpen(false); setBackupRestoreState("idle"); }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleRestoreBackupSubmit(e)}>
                <div className="form-group">
                  <label className="form-label">Ruta del archivo de backup</label>
                  <input
                    className="form-input"
                    value={backupRestorePath}
                    onChange={(e) => setBackupRestorePath(e.target.value)}
                    placeholder="/ruta/a/mi/backup.json"
                    autoFocus
                  />
                </div>
                {backupRestoreError && (
                  <p style={{ color: "var(--color-danger, #e55)", fontSize: "0.83rem", margin: "0 0 12px" }}>
                    {backupRestoreError}
                  </p>
                )}
                <div className="dm-modal__footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setIsRestoreModalOpen(false); setBackupRestoreState("idle"); }}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={backupRestoreState === "loading" || !backupRestorePath.trim()}
                  >
                    {backupRestoreState === "loading" ? "Restaurando…" : "Restaurar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── DELETE CAMPAIGN MODAL ── */}
      {deleteTarget && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div className="dm-modal dm-modal--danger" role="dialog" aria-modal="true">
            <div className="dm-modal__header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Trash2 size={18} style={{ color: "var(--color-danger, #e55)" }} />
                <h3 className="dm-modal__title">
                  {deleteConfirmStep === 1 ? t("landing.deleteStep1Title") : t("landing.deleteStep2Title")}
                </h3>
              </div>
              <button type="button" className="dm-modal__close" onClick={closeDeleteModal}><X size={16} /></button>
            </div>
            <p className="dm-muted-text">
              {deleteConfirmStep === 1
                ? t("landing.deleteStep1Desc", { title: deleteTarget.title })
                : t("landing.deleteStep2Desc", { title: deleteTarget.title })}
            </p>
            {deleteConfirmStep === 2 && (
              <div className="form-group">
                <label className="form-label">{t("landing.deleteTypeLabel")}</label>
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
            {deleteError && <p style={{ color: "var(--color-danger, #e55)", fontSize: "0.82rem", margin: "0 0 12px" }}>{deleteError}</p>}
            <div className="dm-modal__footer">
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

      {/* ── EDIT CAMPAIGN MODAL ── */}
      {editTarget && (
        <div
          className="modal-overlay campaign-edit-dialog-overlay"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div className="dm-modal" role="dialog" aria-modal="true">
            <div className="dm-modal__header">
              <h3 className="dm-modal__title">{t("landing.editCampaignTitle")}</h3>
              <button type="button" className="dm-modal__close" onClick={closeEditModal}><X size={16} /></button>
            </div>
            <p className="dm-muted-text">{t("landing.editCampaignDesc")}</p>
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
              <label className="form-label">Portada de campaña</label>
              <ImagePickerButton
                value={editCoverUrl}
                onChange={setEditCoverUrl}
                catalog="campaigns"
                defaultImage="/assets/campaigns/default-campaign-cover.jpg"
              />
            </div>
            {editError && <p style={{ color: "var(--color-danger, #e55)", fontSize: "0.82rem", margin: "0 0 12px" }}>{editError}</p>}
            <div className="dm-modal__footer">
              <button type="button" className="btn btn-secondary" onClick={closeEditModal} disabled={editLoading}>
                Cancelar
              </button>
              <button type="button" className="btn btn-gold" onClick={() => void handleEditConfirm()} disabled={editLoading || !editTitle.trim()}>
                {editLoading ? t("common.saving") : t("common.saveChanges")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CAMPAIGN PICKER MODAL ── */}
      {isCampaignPickerOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) { setIsCampaignPickerOpen(false); setPendingQuickAction(null); } }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div className="dm-modal" role="dialog" aria-modal="true" aria-label={t("landing.selectCampaignLabel")} style={{ maxWidth: "420px" }}>
            <div className="dm-modal__header">
              <h3 className="dm-modal__title">¿Para qué campaña?</h3>
              <button type="button" className="dm-modal__close" onClick={() => { setIsCampaignPickerOpen(false); setPendingQuickAction(null); }}>
                <X size={16} />
              </button>
            </div>
            <p className="dm-muted-text" style={{ marginTop: 0, marginBottom: "16px" }}>
              Selecciona la campaña a la que quieres ir.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {campaigns.map((c) => (
                <button
                  key={c.campaignId}
                  type="button"
                  onClick={() => handlePickerSelect(c.campaignId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "9px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s, border-color 0.15s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,173,79,0.06)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(229,173,79,0.22)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
                >
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "7px", flexShrink: 0,
                    backgroundImage: `url(${c.coverUrl || "/assets/campaigns/default-campaign-cover.jpg"})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {formatCampaignSystem(c.system)} · Sesión {c.stats.sessionsCount}
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT MODAL ── */}

      <AccountModal open={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />

      {/* ── PREMADE IMPORT DIALOG ── */}
      <PremadeImportDialog
        template={selectedPremadeTemplate}
        campaigns={campaigns}
        importing={Boolean(importingTemplateId)}
        error={premadeImportError}
        onClose={() => { if (!importingTemplateId) setPremadeDialogTemplateId(null); }}
        onOpenExisting={(campaignId) => { setPremadeDialogTemplateId(null); triggerMysticalTransition(campaignId); }}
        onConfirm={(options) => selectedPremadeTemplate ? handleImportPremade(selectedPremadeTemplate.templateId, options) : undefined}
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
