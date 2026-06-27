import React from "react";
import { RotateCcw, Download, Upload, Wifi, WifiOff, Copy, Check } from "lucide-react";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { LanguageSelector } from "../../shared/i18n/LanguageSelector.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

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
  lanStatus?: { lanModeEnabled: boolean; accessCode: string | null; localIp: string; port: number; joinUrl: string } | null;
  toggleLanMode?: (enabled: boolean) => Promise<any>;
}

export function SettingsPage(props: SettingsPageProps = {}) {
  const store = useCampaignStore();
  const { addToast: toastAdd } = useToast();
  const { t } = useTranslation();
  const createBackup = props.createBackup ?? store.createBackup;
  const exportJson = props.exportJson ?? store.exportJson;
  const exportMarkdown = props.exportMarkdown ?? store.exportMarkdown;
  const lanStatus = props.lanStatus !== undefined ? props.lanStatus : store.lanStatus;
  const toggleLanMode = props.toggleLanMode ?? store.toggleLanMode;
  const addToast = props.addToast ?? toastAdd;
  const activeVaultId = props.activeVaultId ?? store.activeVaultId;
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedExportPath, setCopiedExportPath] = React.useState(false);
  const [lastMarkdownExport, setLastMarkdownExport] = React.useState<any | null>(null);


  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    addToast(t("settings.copyCodeSuccess"), "success");
    setTimeout(() => setCopiedCode(false), 2000);
  };

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

  const handleToggleLan = async () => {
    const isEnabling = !lanStatus?.lanModeEnabled;
    try {
      const res = await toggleLanMode(isEnabling);
      addToast(
        isEnabling
          ? t("settings.lanEnabledSuccess", { code: res?.accessCode || "" })
          : t("settings.lanDisabledSuccess"),
        "success"
      );
    } catch {
      addToast(t("settings.lanToggleError"), "error");
    }
  };

  const handleDownloadMarkdown = async () => {
    if (!lastMarkdownExport?.downloadUrl) return;
    try {
      const headers = new Headers();
      headers.set("x-vault-id", activeVaultId || "default");
      const dmToken = sessionStorage.getItem("dmcc_dmSessionToken");
      if (dmToken) headers.set("x-dm-token", dmToken);
      const res = await fetch(lastMarkdownExport.downloadUrl, { headers });
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

      {lanStatus && (
        <section className="card" style={{ border: lanStatus.lanModeEnabled ? "1px solid var(--primary-light)" : "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                {lanStatus.lanModeEnabled ? <Wifi style={{ color: "var(--primary)" }} /> : <WifiOff style={{ color: "var(--text-muted)" }} />}
                {t("settings.lanMultiplayerTitle")}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                {t("settings.lanMultiplayerDescription")}
              </p>
            </div>
            <button
              onClick={handleToggleLan}
              className={`btn ${lanStatus.lanModeEnabled ? "btn-secondary" : "btn-primary"}`}
              style={{ minWidth: "160px" }}
            >
              {lanStatus.lanModeEnabled ? t("settings.disableLan") : t("settings.enableLan")}
            </button>
          </div>

          {lanStatus.lanModeEnabled ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", backgroundColor: "#090b14", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>{t("settings.uniqueAccessCode")}</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: "700", letterSpacing: "1px", color: "var(--primary)" }}>
                      {lanStatus.accessCode}
                    </span>
                    <button
                      className="btn btn-icon btn-secondary btn-sm"
                      onClick={() => handleCopyCode(lanStatus.accessCode || "")}
                      title={t("settings.copyCode")}
                    >
                      {copiedCode ? <Check size={14} style={{ color: "var(--primary)" }} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>{t("settings.serverIp")}</span>
                  <span style={{ fontSize: "1rem", fontWeight: "600" }}>
                    {lanStatus.localIp}:{lanStatus.port}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>{t("settings.playerShareLink")}</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
                  <input
                    type="text"
                    readOnly
                    value={lanStatus.joinUrl}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.85rem", fontFamily: "monospace" }}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopyLink(lanStatus.joinUrl)}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {copiedLink ? <Check size={14} style={{ color: "var(--primary)" }} /> : <Copy size={14} />}
                    {t("settings.copyLink")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "16px", backgroundColor: "#06070e", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {t("settings.lanInactiveDescription")}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
