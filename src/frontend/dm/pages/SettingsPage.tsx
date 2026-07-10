import React, { useState } from "react";
import { RotateCcw, Download, Upload, Copy, Check } from "lucide-react";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { LanguageSelector } from "../../shared/i18n/LanguageSelector.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { apiFetch } from "../../shared/api/apiClient.js";

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

export function SettingsPage(props: SettingsPageProps = {}) {
  const store = useCampaignStore();
  const { addToast: toastAdd } = useToast();
  const { t } = useTranslation();
  const createBackup = props.createBackup ?? store.createBackup;
  const exportJson = props.exportJson ?? store.exportJson;
  const exportMarkdown = props.exportMarkdown ?? store.exportMarkdown;
  const addToast = props.addToast ?? toastAdd;
  const [copiedExportPath, setCopiedExportPath] = React.useState(false);
  const [lastMarkdownExport, setLastMarkdownExport] = useState<any | null>(null);

  const handleCopyExportPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedExportPath(true);
    addToast(t("settings.copyExportPathSuccess"), "success");
    setTimeout(() => setCopiedExportPath(false), 2000);
  };


const handleDownloadMarkdown = async () => {
    if (!lastMarkdownExport?.downloadUrl) return;
    try {
      const res = await apiFetch(lastMarkdownExport.downloadUrl);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontWeight: "700" }}>{t("settings.pageTitle")}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
          Administra copias de seguridad, exportaciones e idioma de la aplicación.
        </p>
      </div>

      <LanguageSelector />

      <div className="grid grid-cols-2">
        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "20px" }}>{t("settings.backupsTitle")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Crea puntos de recuperación de la campaña con registros históricos y metadatos de restauración.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="btn btn-primary" onClick={async () => {
              try {
                await createBackup();
                addToast(t("settings.backupSuccess"), "success");
              } catch {
                addToast(t("settings.backupError"), "error");
              }
            }}>
              <RotateCcw size={16} /> {t("settings.createBackup")}
            </button>
          </div>
        </section>

        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "20px" }}>{t("settings.exportsTitle")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Exporta los registros de la campaña a formatos estructurados para revisión, archivo o documentación.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="btn btn-secondary" onClick={async () => {
              try {
                await exportJson();
                addToast(t("settings.exportJsonSuccess"), "success");
              } catch {
                addToast(t("settings.exportJsonError"), "error");
              }
            }}>
              <Download size={16} /> {t("settings.exportCampaignJson")}
            </button>

            <button className="btn btn-secondary" onClick={async () => {
              try {
                const result = await exportMarkdown();
                setLastMarkdownExport(result);
                addToast(t("settings.exportMarkdownSuccess", { count: result.fileCount ?? "?" }), "success");
              } catch {
                addToast(t("settings.exportMarkdownError"), "error");
              }
            }}>
              <Upload size={16} /> {t("settings.exportCampaignMarkdown")}
            </button>

            {lastMarkdownExport && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "#06070e" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>{t("settings.lastMarkdownExport")}</span>
                <input
                  type="text"
                  readOnly
                  value={lastMarkdownExport.path}
                  style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.8rem", fontFamily: "monospace" }}
                />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopyExportPath(lastMarkdownExport.path)}>
                    {copiedExportPath ? <Check size={14} style={{ color: "var(--primary)" }} /> : <Copy size={14} />}
                    Copiar ruta
                  </button>
                  {lastMarkdownExport.downloadUrl && (
                    <button className="btn btn-primary btn-sm" onClick={handleDownloadMarkdown}>
                      <Download size={14} /> {t("settings.downloadFile", { file: lastMarkdownExport.primaryFile })}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}