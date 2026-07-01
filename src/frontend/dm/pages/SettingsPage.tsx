import React, { useEffect, useState } from "react";
import { RotateCcw, Download, Upload, Wifi, Copy, Check } from "lucide-react";
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
  vaults?: any[];
  activeVaultId?: string | null;
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
  const activeVaultId = props.activeVaultId ?? store.activeVaultId;
  const [networkInfo, setNetworkInfo] = useState<{ localIp: string; port: number; url: string } | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedExportPath, setCopiedExportPath] = React.useState(false);
  const [lastMarkdownExport, setLastMarkdownExport] = React.useState<any | null>(null);

  useEffect(() => {
    fetch("/api/network-info")
      .then((r) => r.json())
      .then((d: any) => { if (d?.url) setNetworkInfo(d); })
      .catch(() => {});
  }, []);


  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    addToast(t("settings.copyJoinLinkSuccess"), "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyExportPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedExportPath(true);
    addToast(t("settings.copyExportPathSuccess"), "success");
    setTimeout(() => setCopiedExportPath(false), 2000);
  };


const handleDownloadMarkdown = async () => {
    if (!lastMarkdownExport?.downloadUrl) return;
    try {
      const res = await apiFetch(lastMarkdownExport.downloadUrl, {
        vaultId: activeVaultId || "default",
      });
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
          {t("settings.pageSubtitle")}
        </p>
      </div>

      <LanguageSelector />

      <div className="grid grid-cols-2">
        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "20px" }}>{t("settings.backupsTitle")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            {t("settings.backupsDescription")}
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
            {t("settings.exportsDescription")}
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
                    {t("settings.copyLocalPath")}
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

      <section className="card" style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
        <h3 style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Wifi style={{ color: "#34d399" }} />
          {t("settings.lanMultiplayerTitle")}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
          {t("settings.lanAlwaysActiveDescription")}
        </p>
        {networkInfo ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", backgroundColor: "#060a0e", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>{t("settings.serverIp")}</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <code style={{ fontSize: "1rem", fontWeight: "600", color: "#34d399" }}>{networkInfo.url}</code>
                <button
                  className="btn btn-icon btn-secondary btn-sm"
                  onClick={() => handleCopyLink(networkInfo.url)}
                  title={t("settings.copyLink")}
                >
                  {copiedLink ? <Check size={14} style={{ color: "#34d399" }} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
              {t("settings.lanShareHint")}
            </p>
          </div>
        ) : (
          <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {t("settings.lanLoadingNetwork")}
          </div>
        )}
      </section>
    </div>
  );
}
