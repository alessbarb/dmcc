import React, { useState } from "react";
import { Check, Copy, Download, FileArchive, Languages, RotateCcw, Upload } from "lucide-react";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { LanguageSelector } from "../../shared/i18n/LanguageSelector.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { apiFetch } from "../../shared/api/apiClient.js";
import "./settingsPage.css";

export interface SettingsPageProps {
  campaigns?: any[];
  activeCampaignId?: string | null;
  campaignState?: any;
  createBackup?: () => Promise<any>;
  exportJson?: () => Promise<any>;
  exportMarkdown?: () => Promise<any>;
  onCampaignDeleted?: () => void | Promise<void>;
  addToast?: (msg: string, kind?: ToastKind) => void;
}

function runSettingsAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

export function SettingsPage(props: SettingsPageProps = {}) {
  const store = useCampaignStore();
  const { addToast: toastAdd } = useToast();
  const { t } = useTranslation();
  const createBackup = props.createBackup ?? store.createBackup;
  const exportJson = props.exportJson ?? store.exportJson;
  const exportMarkdown = props.exportMarkdown ?? store.exportMarkdown;
  const addToast = props.addToast ?? toastAdd;
  const [copiedExportPath, setCopiedExportPath] = useState(false);
  const [lastMarkdownExport, setLastMarkdownExport] = useState<any | null>(null);
  const [busyAction, setBusyAction] = useState<"backup" | "json" | "markdown" | null>(null);

  const handleCopyExportPath = (path: string) => {
    runSettingsAction((async () => {
      await navigator.clipboard.writeText(path);
      setCopiedExportPath(true);
      addToast(t("settings.copyExportPathSuccess"), "success");
      window.setTimeout(() => setCopiedExportPath(false), 2000);
    })(), "No se pudo copiar la ruta de exportación.");
  };

  const handleDownloadMarkdown = async () => {
    if (!lastMarkdownExport?.downloadUrl) return;
    try {
      const response = await apiFetch(lastMarkdownExport.downloadUrl);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = lastMarkdownExport.primaryFile || t("settings.markdownFileName");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      addToast(t("settings.downloadMarkdownError"), "error");
    }
  };

  const handleBackup = async () => {
    setBusyAction("backup");
    try {
      await createBackup();
      addToast(t("settings.backupSuccess"), "success");
    } catch {
      addToast(t("settings.backupError"), "error");
    } finally {
      setBusyAction(null);
    }
  };

  const handleJsonExport = async () => {
    setBusyAction("json");
    try {
      await exportJson();
      addToast(t("settings.exportJsonSuccess"), "success");
    } catch {
      addToast(t("settings.exportJsonError"), "error");
    } finally {
      setBusyAction(null);
    }
  };

  const handleMarkdownExport = async () => {
    setBusyAction("markdown");
    try {
      const result = await exportMarkdown();
      setLastMarkdownExport(result);
      addToast(t("settings.exportMarkdownSuccess", { count: result.fileCount ?? "?" }), "success");
    } catch {
      addToast(t("settings.exportMarkdownError"), "error");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="settings-workspace">
      <header className="settings-workspace__header">
        <div>
          <h2>{t("settings.pageTitle")}</h2>
        </div>
      </header>

      <section className="settings-workspace__language" aria-label={t("settings.pageTitle")}>
        <div className="settings-card__header">
          <span className="settings-card__icon" aria-hidden="true"><Languages size={20} /></span>
          <LanguageSelector />
        </div>
      </section>

      <div className="settings-workspace__grid">
        <section className="card settings-card">
          <div className="settings-card__header">
            <span className="settings-card__icon" aria-hidden="true"><RotateCcw size={20} /></span>
            <h3>{t("settings.backupsTitle")}</h3>
          </div>
          <div className="settings-card__actions">
            <button className="btn btn-secondary" disabled={busyAction !== null} onClick={() => void handleBackup()}>
              <RotateCcw size={16} />
              {busyAction === "backup" ? t("common.loading") : t("settings.createBackup")}
            </button>
          </div>
        </section>

        <section className="card settings-card">
          <div className="settings-card__header">
            <span className="settings-card__icon" aria-hidden="true"><FileArchive size={20} /></span>
            <h3>{t("settings.exportsTitle")}</h3>
          </div>

          <div className="settings-card__actions">
            <button className="btn btn-secondary" disabled={busyAction !== null} onClick={() => void handleJsonExport()}>
              <Download size={16} />
              {busyAction === "json" ? t("common.loading") : t("settings.exportCampaignJson")}
            </button>
            <button className="btn btn-secondary" disabled={busyAction !== null} onClick={() => void handleMarkdownExport()}>
              <Upload size={16} />
              {busyAction === "markdown" ? t("common.loading") : t("settings.exportCampaignMarkdown")}
            </button>
          </div>

          {lastMarkdownExport && (
            <div className="settings-export-result">
              <span className="settings-export-result__label">{t("settings.lastMarkdownExport")}</span>
              <input className="settings-export-result__path" type="text" readOnly value={lastMarkdownExport.path} />
              <div className="settings-export-result__actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleCopyExportPath(lastMarkdownExport.path)}>
                  {copiedExportPath ? <Check size={14} /> : <Copy size={14} />}
                  {t("common.copy")}
                </button>
                {lastMarkdownExport.downloadUrl && (
                  <button className="btn btn-primary btn-sm" onClick={() => runSettingsAction(handleDownloadMarkdown(), "No se pudo descargar el Markdown.")}>
                    <Download size={14} /> {t("settings.downloadFile", { file: lastMarkdownExport.primaryFile })}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
