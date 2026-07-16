import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck, X, Loader2 } from "lucide-react";
import type { Campaign, CampaignTemplate, CampaignTemplateSummary, CampaignTemplateImportState } from "../stores/campaignStore.js";
import { useTranslation } from "../i18n/useTranslation.js";

export type CampaignTemplateImportMode = "full" | "structure" | "sessions";

export interface CampaignTemplateImportOptions {
  title: string;
  summary?: string;
  importMode: CampaignTemplateImportMode;
  openAfterCreate: boolean;
}

interface CampaignTemplateImportDialogProps {
  template: CampaignTemplateSummary | CampaignTemplate | null;
  campaigns: Campaign[];
  importing?: boolean;
  importProgress?: CampaignTemplateImportState | null;
  error?: string | null;
  onClose: () => void;
  onOpenExisting: (campaignId: string) => void;
  onConfirm: (options: CampaignTemplateImportOptions) => void | Promise<void>;
}

function templateSummary(template: CampaignTemplateSummary | CampaignTemplate): string {
  if ("summary" in template && typeof template.summary === "string" && template.summary.trim()) {
    return template.summary.trim();
  }
  return template.description?.trim() ?? "";
}

function getTemplateOrigin(campaign: Campaign): string | undefined {
  const origin = campaign.metadata?.createdFromTemplateId;
  return typeof origin === "string" ? origin : undefined;
}

export function CampaignTemplateImportDialog({
  template,
  campaigns,
  importing = false,
  importProgress = null,
  error,
  onClose,
  onOpenExisting,
  onConfirm,
}: CampaignTemplateImportDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [importMode, setImportMode] = useState<CampaignTemplateImportMode>("full");
  const [openAfterCreate, setOpenAfterCreate] = useState(true);

  useEffect(() => {
    if (!template) return;
    setTitle(template.title);
    setSummary(templateSummary(template));
    setImportMode("full");
    setOpenAfterCreate(true);
  }, [template?.templateId]);

  const existingCopies = useMemo(() => {
    if (!template) return [];
    return campaigns.filter((campaign) => getTemplateOrigin(campaign) === template.templateId);
  }, [campaigns, template]);

  if (!template) return null;

  const modeOptions: Array<{ value: CampaignTemplateImportMode; title: string; desc: string }> = [
    { value: "full", title: t("premadeImport.mode.full.title"), desc: t("premadeImport.mode.full.desc") },
    { value: "structure", title: t("premadeImport.mode.structure.title"), desc: t("premadeImport.mode.structure.desc") },
    { value: "sessions", title: t("premadeImport.mode.sessions.title"), desc: t("premadeImport.mode.sessions.desc") },
  ];

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || importing) return;

    void onConfirm({
      title: cleanTitle,
      summary: summary.trim() || undefined,
      importMode,
      openAfterCreate,
    });
  };

  const isRunning = importProgress && importProgress.status === "running";

  return (
    <div className="modal-overlay premade-import-dialog-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && !isRunning && !importing) onClose(); }}>
      <form className="premade-import-dialog" onSubmit={handleSubmit} aria-modal="true" role="dialog" aria-labelledby="premade-import-title">
        {isRunning ? (
          <div className="premade-import-loading">
            <Loader2 className="premade-import-loading__spinner" size={40} />
            <h3 className="premade-import-loading__title">{t("premadeImport.creating")}</h3>
            <div 
              className="premade-import-loading__status" 
              role="progressbar" 
              aria-valuenow={importProgress.percent} 
              aria-valuemin={0} 
              aria-valuemax={100}
              aria-live="polite"
            >
              {importProgress.stage 
                ? t(`premadeImport.progress.${importProgress.stage}`, { current: importProgress.completedSteps, total: importProgress.totalSteps }) 
                : ""}
            </div>
            <div className="premade-import-progress">
              <div 
                className="premade-import-progress-fill" 
                style={{ width: `${importProgress.percent}%` }}
              />
            </div>
            <span className="premade-import-loading__tip">
              Por favor, no cierres esta ventana mientras preparamos tu campaña.
            </span>
          </div>
        ) : (
          <>
            <header className="premade-import-dialog__header">
              <div>
                <span className="premade-import-dialog__eyebrow"><ShieldCheck size={14} />{t("premadeImport.eyebrow")}</span>
                <h2 id="premade-import-title">{t("premadeImport.title")}</h2>
                <p>{t("premadeImport.description", { title: template.title })}</p>
              </div>
              <button type="button" className="icon-button" onClick={onClose} disabled={importing} aria-label={t("common.close") || t("common.cancel")}>
                <X size={16} />
              </button>
            </header>

            <div className="premade-import-dialog__body">
              {existingCopies.length > 0 ? (
                <section className="premade-import-existing">
                  <strong>{t("premadeImport.existingTitle", { count: existingCopies.length })}</strong>
                  <p>{t("premadeImport.existingDesc")}</p>
                  <div className="premade-import-existing__list">
                    {existingCopies.map((campaign) => (
                      <button key={campaign.campaignId} type="button" className="btn btn-secondary btn-sm" onClick={() => onOpenExisting(campaign.campaignId)} disabled={importing}>
                        {t("premadeImport.openExisting", { title: campaign.title })}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="form-group">
                <label className="form-label" htmlFor="premade-import-title-input">{t("premadeImport.nameLabel")}</label>
                <input
                  id="premade-import-title-input"
                  className="form-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={importing}
                  autoFocus
                />
                <small className="form-hint">{t("premadeImport.nameConflictHint")}</small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="premade-import-summary-input">{t("premadeImport.summaryLabel")}</label>
                <textarea
                  id="premade-import-summary-input"
                  className="form-input premade-import-dialog__textarea"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder={t("premadeImport.summaryPlaceholder")}
                  disabled={importing}
                />
              </div>

              <div className="form-group">
                <span className="form-label">{t("premadeImport.modeLabel")}</span>
                <div className="premade-import-mode-grid">
                  {modeOptions.map((option) => (
                    <label key={option.value} className={`premade-import-mode ${importMode === option.value ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name="premadeImportMode"
                        value={option.value}
                        checked={importMode === option.value}
                        onChange={() => setImportMode(option.value)}
                        disabled={importing}
                      />
                      <strong>{option.title}</strong>
                      <span>{option.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <section className="premade-import-assurances">
                <p><CheckCircle2 size={16} />{t("premadeImport.privateCopy")}</p>
                <p><CheckCircle2 size={16} />{t("premadeImport.secretsRemainPrivate")}</p>
                <p><CheckCircle2 size={16} />{t("premadeImport.originalUntouched")}</p>
                <label className="premade-import-checkbox">
                  <input type="checkbox" checked={openAfterCreate} onChange={(event) => setOpenAfterCreate(event.target.checked)} disabled={importing} />
                  {t("premadeImport.openAfterCreate")}
                </label>
              </section>

              {error ? <p className="premade-import-error"><AlertTriangle size={16} />{error}</p> : null}
            </div>

            <footer className="premade-import-dialog__footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={importing}>{t("common.cancel")}</button>
              <button type="submit" className="btn btn-primary" disabled={importing || !title.trim()}>
                {importing ? t("premadeImport.creating") : (openAfterCreate ? t("premadeImport.createAndOpen") : t("premadeImport.createOnly"))}
              </button>
            </footer>
          </>
        )}
      </form>
    </div>
  );
}
