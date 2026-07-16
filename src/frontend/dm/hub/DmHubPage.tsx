import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useDmHubDashboard } from "./useDmHubDashboard.js";
import {
  Sparkles,
  LogOut,
  UserPlus,
  UserRound,
  Activity,
  Settings,
  Users,
  Clock,
  BookOpen,
  Map,
  FileText,
  LayoutGrid,
  Bell,
  ChevronDown,
} from "lucide-react";
import { DmHubCampaignModals } from "./DmHubCampaignModals.js";
import { DmHubCampaignsColumn } from "./DmHubCampaignsColumn.js";
import { DmHubHero } from "./DmHubHero.js";
import { logout } from "../../shared/auth/authClient.js";
import { CampaignTemplateImportDialog, type CampaignTemplateImportMode } from "../../shared/components/CampaignTemplateImportDialog.js";
import { AccountModal } from "../../account/AccountModal.js";
import { AppFooter } from "../../shared/components/AppFooter.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

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

        <DmHubHero
          dmProfile={dmProfile}
          dmDisplayName={dmDisplayName}
          formattedTodayDate={formattedTodayDate}
          totalCampaignsCount={totalCampaignsCount}
          activeTablesCount={activeTablesCount}
          totalPlayersCount={totalPlayersCount}
          totalSessionsCount={totalSessionsCount}
          totalNpcsCount={totalNpcsCount}
          totalEntitiesCount={totalEntitiesCount}
          activeTablesLength={dashboard.activeTables.length}
          onViewTimeline={handleQuickTimeline}
          onCreateCampaign={() => setIsCreateModalOpen(true)}
          onOpenCampaigns={() => document.getElementById("dm-campaigns-section")?.scrollIntoView({ behavior: "smooth" })}
          onOpenTemplates={handleQuickTemplates}
          onRestoreBackup={() => setIsRestoreModalOpen(true)}
        />
        {/* ── MAIN GRID: 70 / 30 ── */}
        <div className="dm-hub-grid">
          <DmHubCampaignsColumn
            campaigns={campaigns}
            filteredCampaigns={filteredCampaigns}
            campaignTemplates={campaignTemplates}
            loading={loading}
            error={error}
            refreshCampaigns={refreshCampaigns}
            landingSearchQuery={landingSearchQuery}
            setLandingSearchQuery={setLandingSearchQuery}
            campaignFilter={campaignFilter}
            setCampaignFilter={setCampaignFilter}
            totalPlayersCount={totalPlayersCount}
            totalNpcsCount={totalNpcsCount}
            totalEntitiesCount={totalEntitiesCount}
            totalSessionsCount={totalSessionsCount}
            playtimeLast30DaysLabel={dashboard.totals.playtimeLast30DaysLabel}
            completedCampaigns={dashboard.totals.completedCampaigns}
            recentActivity={dashboard.recentActivity}
            triggerMysticalTransition={triggerMysticalTransition}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            onCreateCampaign={() => setIsCreateModalOpen(true)}
            onExploreTemplates={handleQuickTemplates}
            onRestoreBackup={() => setIsRestoreModalOpen(true)}
            navigateToCampaignTemplate={navigateToCampaignTemplate}
            importingTemplateId={importingTemplateId}
            onImportTemplate={openCampaignTemplateImportDialog}
          />
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
