import React from "react";
import { ArrowRight, Trash2, X } from "lucide-react";
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import type { DmHubCampaign } from "./dmHubTypes.js";

type CampaignTarget = { campaignId: string; title: string; summary?: string; system?: string; coverUrl?: string };
type DeleteTarget = { campaignId: string; title: string };

interface DmHubCampaignModalsProps {
  runDmHubAction: (operation: Promise<unknown>, errorMessage: string) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newCampaignTitle: string;
  setNewCampaignTitle: React.Dispatch<React.SetStateAction<string>>;
  newCampaignSystem: string;
  setNewCampaignSystem: React.Dispatch<React.SetStateAction<string>>;
  newCampaignCoverUrl: string;
  setNewCampaignCoverUrl: React.Dispatch<React.SetStateAction<string>>;
  isCreatingCampaign: boolean;
  createCampaignError: string | null;
  handleCreateCampaignSubmit: (event: React.SyntheticEvent) => Promise<void>;
  isRestoreModalOpen: boolean;
  setIsRestoreModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  backupRestorePath: string;
  setBackupRestorePath: React.Dispatch<React.SetStateAction<string>>;
  backupRestoreState: "idle" | "loading" | "success" | "error";
  setBackupRestoreState: React.Dispatch<React.SetStateAction<"idle" | "loading" | "success" | "error">>;
  backupRestoreError: string | null;
  handleRestoreBackupSubmit: (event: React.SyntheticEvent) => Promise<void>;
  deleteTarget: DeleteTarget | null;
  deleteConfirmStep: 1 | 2;
  deleteConfirmInput: string;
  setDeleteConfirmInput: React.Dispatch<React.SetStateAction<string>>;
  deleteLoading: boolean;
  deleteError: string | null;
  setDeleteError: React.Dispatch<React.SetStateAction<string | null>>;
  closeDeleteModal: () => void;
  handleDeleteConfirm: () => Promise<void>;
  editTarget: CampaignTarget | null;
  editTitle: string;
  setEditTitle: React.Dispatch<React.SetStateAction<string>>;
  editSummary: string;
  setEditSummary: React.Dispatch<React.SetStateAction<string>>;
  editSystem: string;
  setEditSystem: React.Dispatch<React.SetStateAction<string>>;
  editCoverUrl: string;
  setEditCoverUrl: React.Dispatch<React.SetStateAction<string>>;
  editLoading: boolean;
  editError: string | null;
  closeEditModal: () => void;
  handleEditConfirm: () => Promise<void>;
  isCampaignPickerOpen: boolean;
  setIsCampaignPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingQuickAction: React.Dispatch<React.SetStateAction<((campaignId: string) => void) | null>>;
  campaigns: DmHubCampaign[];
  handlePickerSelect: (campaignId: string) => void;
}

function formatCampaignSystem(system?: string) {
  if (system === "dnd_5e") return "D&D 5e";
  if (system === "pathfinder_2e") return "Pathfinder 2e";
  if (system === "shadowdark") return "Shadowdark";
  return "Custom";
}

export function DmHubCampaignModals(props: DmHubCampaignModalsProps) {
  const { t } = useTranslation();
  const {
    runDmHubAction,
    isCreateModalOpen, setIsCreateModalOpen, newCampaignTitle, setNewCampaignTitle,
    newCampaignSystem, setNewCampaignSystem, newCampaignCoverUrl, setNewCampaignCoverUrl,
    isCreatingCampaign, createCampaignError, handleCreateCampaignSubmit,
    isRestoreModalOpen, setIsRestoreModalOpen, backupRestorePath, setBackupRestorePath,
    backupRestoreState, setBackupRestoreState, backupRestoreError, handleRestoreBackupSubmit,
    deleteTarget, deleteConfirmStep, deleteConfirmInput, setDeleteConfirmInput,
    deleteLoading, deleteError, setDeleteError, closeDeleteModal, handleDeleteConfirm,
    editTarget, editTitle, setEditTitle, editSummary, setEditSummary, editSystem, setEditSystem,
    editCoverUrl, setEditCoverUrl, editLoading, editError, closeEditModal, handleEditConfirm,
    isCampaignPickerOpen, setIsCampaignPickerOpen, setPendingQuickAction, campaigns, handlePickerSelect,
  } = props;

  return (
    <>
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
              Crea una nueva campaña desde cero y empieza a construir tu mundo.
            </p>
            <form onSubmit={(e) => {
              runDmHubAction(handleCreateCampaignSubmit(e), "No se pudo crear la campaña.");
            }}>
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
                  <option value="dnd_5e">{t("landing.systemDnD")}</option>
                  <option value="pathfinder_2e">Pathfinder 2e</option>
                  <option value="shadowdark">Shadowdark</option>
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
                <p style={{ color: "var(--theme-feedback-success-foreground, #4ade80)", fontWeight: 700, fontSize: "1rem" }}>
                  ✓ Copia restaurada correctamente
                </p>
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: "12px" }} onClick={() => { setIsRestoreModalOpen(false); setBackupRestoreState("idle"); }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                runDmHubAction(handleRestoreBackupSubmit(e), "No se pudo restaurar la copia de seguridad.");
              }}>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runDmHubAction(handleDeleteConfirm(), "No se pudo eliminar la campaña.");
                    if (e.key === "Escape") closeDeleteModal();
                  }}
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
                onClick={() => {
                  runDmHubAction(handleDeleteConfirm(), "No se pudo eliminar la campaña.");
                }}
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
                <option value="dnd_5e">{t("landing.systemDnD")}</option>
                <option value="pathfinder_2e">Pathfinder 2e</option>
                <option value="shadowdark">Shadowdark</option>
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
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => {
                  runDmHubAction(handleEditConfirm(), "No se pudo guardar la campaña.");
                }}
                disabled={editLoading || !editTitle.trim()}
              >
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
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "var(--theme-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--theme-text-secondary)" }}>
                      {formatCampaignSystem(c.system)} · Sesión {c.stats?.sessionsCount ?? 0}
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
