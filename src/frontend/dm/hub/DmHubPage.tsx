import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useDmHubDashboard } from "./useDmHubDashboard.js";
import { DmHubCampaignModals } from "./DmHubCampaignModals.js";
import { DmHubCampaignsColumn } from "./DmHubCampaignsColumn.js";
import { DmHubActiveTablesPanel } from "./DmHubActiveTablesPanel.js";
import { DmHubAlertsPanel } from "./DmHubAlertsPanel.js";
import { DmHubSummaryPanel } from "./DmHubSummaryPanel.js";
import { DmHubActivityPanel } from "./DmHubActivityPanel.js";
import { DmHubMobileDashboard, type DmHubMobileTile } from "./DmHubMobileDashboard.js";
import { DmHubDetailSheet } from "./DmHubDetailSheet.js";
import { CampaignTemplateLibrarySection } from "./CampaignTemplateLibrarySection.js";
import { useDmHubViewport } from "./useDmHubViewport.js";
import { DmHubHero } from "./DmHubHero.js";
import { DmHubQuickActions } from "./DmHubQuickActions.js";
import { DmHubDashboardBoard } from "./DmHubDashboardBoard.js";
import { DmHubTopBar } from "./DmHubTopBar.js";
import { logout } from "../../shared/auth/authClient.js";
import { CampaignTemplateImportDialog, type CampaignTemplateImportMode } from "../../shared/components/CampaignTemplateImportDialog.js";
import { AccountModal } from "../../account/AccountModal.js";
import "../../shared/styles/features/dm-hub-dashboard.css";
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
  const viewport = useDmHubViewport();

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
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isCampaignPickerOpen, setIsCampaignPickerOpen] = useState(false);
  const [pendingQuickAction, setPendingQuickAction] = useState<((cid: string) => void) | null>(null);
  const [dmProfile, setDmProfile] = useState<{ displayName?: string; email?: string; avatarUrl?: string } | null>(null);
  const [mysticalTransitionId, setMysticalTransitionId] = useState<string | null>(null);
  const [activeDetail, setActiveDetail] = useState<DmHubMobileTile | null>(null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const detailTriggerRef = useRef<HTMLElement>(null);

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
    runDmHubAction(navigate({ to: `/campaigns/${campaignId}/sessions` }), "No se pudo abrir la sesión activa.");
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
    } catch (err: unknown) {
      setCreateCampaignError(err instanceof Error ? err.message : t("landing.createCampaignError"));
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
    } catch (err: unknown) {
      setBackupRestoreError(err instanceof Error ? err.message : "Restore failed");
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
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : String(err));
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
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : String(err));
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
  const handleQuickTemplates = () => {
    document.getElementById("dm-hub-template-strip")?.focus();
  };
  const handleQuickRules = () => requireCampaign((cid) => navigateToCampaignSection(cid, "rules"));
  const handleQuickMap = () => requireCampaign((cid) => navigateToCampaignSection(cid, "graph"));
  const handleQuickTimeline = () => requireCampaign((cid) => navigateToCampaignSection(cid, "timeline"));
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
  const featuredCampaignTitle = campaigns[0]?.title ?? null;
  const firstActiveTable = dashboard.activeTables[0] ?? null;
  const activeTableStatus = firstActiveTable?.sessionTitle ?? null;
  const recentActivitySummary = dashboard.recentActivity[0]?.text ?? null;
  const mobileDetailTitle = (tile: DmHubMobileTile) => ({
    campaigns: t("landing.campaignsSectionTitle"), tables: t("landing.activeTablesNowTitle"), alerts: t("landing.alertsTitle"),
    summary: t("landing.summaryGeneralTitle"), activity: t("landing.recentActivityTitle"), templates: t("landing.templateStripTitle"),
  })[tile];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dm-hub-root">
      <RpgPortalBackground />

      <DmHubTopBar
        dmProfile={dmProfile}
        dmDisplayName={dmDisplayName}
        onAddDm={navigateToDmSetup}
        onSwitchDm={handleSwitchDm}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onSignOut={handleSignOutDm}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="dm-hub-main">

        {viewport === "desktop" ? <>
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
        />
        <DmHubQuickActions
          onCreateCampaign={() => setIsCreateModalOpen(true)}
          onCanvas={handleQuickCanvas}
          onNpcs={handleQuickNpcs}
          onFocusTemplates={handleQuickTemplates}
          onRules={handleQuickRules}
          onMap={handleQuickMap}
          onTimeline={handleQuickTimeline}
          onSettings={handleQuickSettings}
          onRestoreBackup={() => setIsRestoreModalOpen(true)}
        />
        {/* ── MAIN GRID: 70 / 30 ── */}
        <DmHubDashboardBoard
          campaignsSlot={<DmHubCampaignsColumn
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
            triggerMysticalTransition={triggerMysticalTransition}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            onCreateCampaign={() => setIsCreateModalOpen(true)}
            onExploreTemplates={handleQuickTemplates}
            onRestoreBackup={() => setIsRestoreModalOpen(true)}
            navigateToActiveSession={navigateToActiveSession}
            navigateToCampaignTemplate={navigateToCampaignTemplate}
            importingTemplateId={importingTemplateId}
            onImportTemplate={openCampaignTemplateImportDialog}
          />}
          tablesSlot={<DmHubActiveTablesPanel
            activeTables={dashboard.activeTables}
            nextSession={dashboard.nextSession}
            triggerMysticalTransition={triggerMysticalTransition}
            navigateToActiveSession={navigateToActiveSession}
          />}
          alertsSlot={<DmHubAlertsPanel alerts={dashboard.alerts} preparation={dashboard.preparation} onOpenPreparation={() => { const campaign = campaigns[0]; if (campaign) navigateToCampaignSection(campaign.campaignId, "canvas"); }} />}
          summarySlot={<DmHubSummaryPanel campaigns={campaigns} sessionsCount={dashboard.totals.sessions} completedCampaigns={dashboard.totals.completedCampaigns} />}
          activitySlot={<DmHubActivityPanel recentActivity={dashboard.recentActivity} />}
        />
        </> : <>
          <DmHubMobileDashboard
            dmDisplayName={dmDisplayName}
            campaignsCount={totalCampaignsCount}
            activeTablesCount={activeTablesCount}
            alertsCount={dashboard.alerts.length}
            featuredCampaignTitle={featuredCampaignTitle}
            activeTableStatus={activeTableStatus}
            recentActivitySummary={recentActivitySummary}
            playtimeLast30DaysLabel={dashboard.totals.playtimeLast30DaysLabel}
            templatesCount={campaignTemplates.length}
            onSelectTile={(tile) => { const activeElement = document.activeElement; detailTriggerRef.current = activeElement instanceof HTMLElement ? activeElement : null; setActiveDetail(tile); }}
            onCreateCampaign={() => setIsCreateModalOpen(true)}
            onOpenActiveSession={() => firstActiveTable ? navigateToActiveSession(firstActiveTable.campaignId) : requireCampaign((cid) => navigateToActiveSession(cid))}
            onCanvas={handleQuickCanvas}
            onEntities={handleQuickNpcs}
            onMore={() => setMobileMoreOpen((open) => !open)}
          />
          {mobileMoreOpen && <DmHubQuickActions onCreateCampaign={() => setIsCreateModalOpen(true)} onCanvas={handleQuickCanvas} onNpcs={handleQuickNpcs} onFocusTemplates={handleQuickTemplates} onRules={handleQuickRules} onMap={handleQuickMap} onTimeline={handleQuickTimeline} onSettings={handleQuickSettings} onRestoreBackup={() => setIsRestoreModalOpen(true)} onlySecondary />}
          <DmHubDetailSheet open={activeDetail !== null} title={activeDetail ? mobileDetailTitle(activeDetail) : ""} onClose={() => setActiveDetail(null)} returnFocusRef={detailTriggerRef}>
            {activeDetail === "campaigns" && <DmHubCampaignsColumn campaigns={campaigns} filteredCampaigns={filteredCampaigns} campaignTemplates={campaignTemplates} loading={loading} error={error} refreshCampaigns={refreshCampaigns} landingSearchQuery={landingSearchQuery} setLandingSearchQuery={setLandingSearchQuery} campaignFilter={campaignFilter} setCampaignFilter={setCampaignFilter} triggerMysticalTransition={triggerMysticalTransition} openEditModal={openEditModal} openDeleteModal={openDeleteModal} onCreateCampaign={() => setIsCreateModalOpen(true)} onExploreTemplates={handleQuickTemplates} onRestoreBackup={() => setIsRestoreModalOpen(true)} navigateToActiveSession={navigateToActiveSession} navigateToCampaignTemplate={navigateToCampaignTemplate} importingTemplateId={importingTemplateId} onImportTemplate={openCampaignTemplateImportDialog} />}
            {activeDetail === "tables" && <DmHubActiveTablesPanel activeTables={dashboard.activeTables} nextSession={dashboard.nextSession} triggerMysticalTransition={triggerMysticalTransition} navigateToActiveSession={navigateToActiveSession} />}
            {activeDetail === "alerts" && <DmHubAlertsPanel alerts={dashboard.alerts} preparation={dashboard.preparation} />}
            {activeDetail === "summary" && <DmHubSummaryPanel campaigns={campaigns} sessionsCount={dashboard.totals.sessions} completedCampaigns={dashboard.totals.completedCampaigns} />}
            {activeDetail === "activity" && <DmHubActivityPanel recentActivity={dashboard.recentActivity} />}
            {activeDetail === "templates" && <CampaignTemplateLibrarySection templates={campaignTemplates} campaigns={campaigns} loading={loading} importingTemplateId={importingTemplateId} t={t} onExplore={navigateToCampaignTemplate} onImport={openCampaignTemplateImportDialog} />}
          </DmHubDetailSheet>
        </>}

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
        campaigns={campaigns}
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
