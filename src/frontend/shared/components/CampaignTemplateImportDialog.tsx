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
  // Only campaignId/title/metadata are read here, so any Campaign-shaped list
  // (including DmHubCampaign, which narrows `stats` differently) is accepted.
  campaigns: Array<Omit<Campaign, "stats">>;
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

function getTemplateOrigin(campaign: Omit<Campaign, "stats">): string | undefined {
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
    { value: "full", title: t("campaignTemplateImport.mode.full.title"), desc: t("campaignTemplateImport.mode.full.desc") },
    { value: "structure", title: t("campaignTemplateImport.mode.structure.title"), desc: t("campaignTemplateImport.mode.structure.desc") },
    { value: "sessions", title: t("campaignTemplateImport.mode.sessions.title"), desc: t("campaignTemplateImport.mode.sessions.desc") },
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
    <div className="modal-overlay campaign-template-import-dialog-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && !isRunning && !importing) onClose(); }}>
      <form className="campaign-template-import-dialog" onSubmit={handleSubmit} aria-modal="true" role="dialog" aria-labelledby="campaign-template-import-title">
        {isRunning ? (
          <div className="campaign-template-import-loading">
            <Loader2 className="campaign-template-import-loading__spinner" size={40} />
            <h3 className="campaign-template-import-loading__title">{t("campaignTemplateImport.creating")}</h3>
            <div 
              className="campaign-template-import-loading__status"
              role="progressbar" 
              aria-valuenow={importProgress.percent} 
              aria-valuemin={0} 
              aria-valuemax={100}
              aria-live="polite"
            >
              {importProgress.stage 
                ? t(`campaignTemplateImport.progress.${importProgress.stage}`, { current: importProgress.completedSteps, total: importProgress.totalSteps })
                : ""}
            </div>
            <div className="campaign-template-import-progress">
              <div 
                className="campaign-template-import-progress-fill"
                style={{ width: `${importProgress.percent}%` }}
              />
            </div>
            <span className="campaign-template-import-loading__tip">
              Por favor, no cierres esta ventana mientras preparamos tu campaña.
            </span>
          </div>
        ) : (
          <>
            <header className="campaign-template-import-dialog__header">
              <div>
                <span className="campaign-template-import-dialog__eyebrow"><ShieldCheck size={14} />{t("campaignTemplateImport.eyebrow")}</span>
                <h2 id="campaign-template-import-title">{t("campaignTemplateImport.title")}</h2>
                <p>{t("campaignTemplateImport.description", { title: template.title })}</p>
              </div>
              <button type="button" className="icon-button" onClick={onClose} disabled={importing} aria-label={t("common.close") || t("common.cancel")}>
                <X size={16} />
              </button>
            </header>

            <div className="campaign-template-import-dialog__body">
              {existingCopies.length > 0 ? (
                <section className="campaign-template-import-existing">
                  <strong>{t("campaignTemplateImport.existingTitle", { count: existingCopies.length })}</strong>
                  <p>{t("campaignTemplateImport.existingDesc")}</p>
                  <div className="campaign-template-import-existing__list">
                    {existingCopies.map((campaign) => (
                      <button key={campaign.campaignId} type="button" className="btn btn-secondary btn-sm" onClick={() => onOpenExisting(campaign.campaignId)} disabled={importing}>
                        {t("campaignTemplateImport.openExisting", { title: campaign.title })}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="form-group">
                <label className="form-label" htmlFor="campaign-template-import-title-input">{t("campaignTemplateImport.nameLabel")}</label>
                <input
                  id="campaign-template-import-title-input"
                  className="form-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={importing}
                  autoFocus
                />
                <small className="form-hint">{t("campaignTemplateImport.nameConflictHint")}</small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="campaign-template-import-summary-input">{t("campaignTemplateImport.summaryLabel")}</label>
                <textarea
                  id="campaign-template-import-summary-input"
                  className="form-input campaign-template-import-dialog__textarea"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder={t("campaignTemplateImport.summaryPlaceholder")}
                  disabled={importing}
                />
              </div>

              <div className="form-group">
                <span className="form-label">{t("campaignTemplateImport.modeLabel")}</span>
                <div className="campaign-template-import-mode-grid">
                  {modeOptions.map((option) => (
                    <label key={option.value} className={`campaign-template-import-mode ${importMode === option.value ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name="campaignTemplateImportMode"
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

              <section className="campaign-template-import-assurances">
                <p><CheckCircle2 size={16} />{t("campaignTemplateImport.privateCopy")}</p>
                <p><CheckCircle2 size={16} />{t("campaignTemplateImport.secretsRemainPrivate")}</p>
                <p><CheckCircle2 size={16} />{t("campaignTemplateImport.originalUntouched")}</p>
                <label className="campaign-template-import-checkbox">
                  <input type="checkbox" checked={openAfterCreate} onChange={(event) => setOpenAfterCreate(event.target.checked)} disabled={importing} />
                  {t("campaignTemplateImport.openAfterCreate")}
                </label>
              </section>

              {error ? <p className="campaign-template-import-error"><AlertTriangle size={16} />{error}</p> : null}
            </div>

            <footer className="campaign-template-import-dialog__footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={importing}>{t("common.cancel")}</button>
              <button type="submit" className="btn btn-primary" disabled={importing || !title.trim()}>
                {importing ? t("campaignTemplateImport.creating") : (openAfterCreate ? t("campaignTemplateImport.createAndOpen") : t("campaignTemplateImport.createOnly"))}
              </button>
            </footer>
          </>
        )}
      </form>
    </div>
  );
}
