import React from "react";
import { RotateCcw, Download, Upload, Wifi, WifiOff, Copy, Check } from "lucide-react";
import type { ToastKind } from "../hooks/useToast.js";
import { useCampaignStore } from "../stores/campaignStore.js";
import { useToast } from "../hooks/useToast.js";

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
    addToast("Código de acceso copiado al portapapeles.", "success");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    addToast("Enlace de unión copiado al portapapeles.", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyExportPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedExportPath(true);
    addToast("Ruta de exportación copiada al portapapeles.", "success");
    setTimeout(() => setCopiedExportPath(false), 2000);
  };

  const handleToggleLan = async () => {
    const isEnabling = !lanStatus?.lanModeEnabled;
    try {
      const res = await toggleLanMode(isEnabling);
      addToast(
        isEnabling
          ? `Modo LAN activado. Código generado: ${res?.accessCode || ""}`
          : "Modo LAN desactivado con éxito.",
        "success"
      );
    } catch {
      addToast("Error al cambiar el estado de red LAN.", "error");
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
      link.download = lastMarkdownExport.primaryFile || "Campaña completa.md";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      addToast("Error al descargar el Markdown principal.", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontWeight: "700" }}>Ajustes y exportación</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
          Administra las copias de seguridad de la campaña, exporta tus datos narrativos y configura la conexión de red local.
        </p>
      </div>

      <div className="grid grid-cols-2">
        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "20px" }}>Copias de seguridad de la campaña</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Guarda capturas JSON locales. Estas copias contienen los registros históricos de eventos y metadatos de restauración.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="btn btn-primary" onClick={async () => {
              try {
                await createBackup();
                addToast("Copia de seguridad creada correctamente.", "success");
              } catch {
                addToast("Error al crear la copia de seguridad.", "error");
              }
            }}>
              <RotateCcw size={16} /> Crear copia de seguridad
            </button>
          </div>
        </section>

        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "20px" }}>Exportaciones</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Exporta los registros de la campaña a archivos estructurados en tu sistema de archivos local.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="btn btn-secondary" onClick={async () => {
              try {
                await exportJson();
                addToast("Exportación JSON creada.", "success");
              } catch {
                addToast("Error al exportar JSON.", "error");
              }
            }}>
              <Download size={16} /> Exportar campaña a JSON
            </button>

            <button className="btn btn-secondary" onClick={async () => {
              try {
                const result = await exportMarkdown();
                setLastMarkdownExport(result);
                addToast(`Exportación Markdown completa creada (${result.fileCount ?? "?"} archivos).`, "success");
              } catch {
                addToast("Error al exportar Markdown.", "error");
              }
            }}>
              <Upload size={16} /> Exportar campaña completa a Markdown
            </button>

            {lastMarkdownExport && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "#06070e" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Última exportación Markdown</span>
                <input
                  type="text"
                  readOnly
                  value={lastMarkdownExport.path}
                  style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.8rem", fontFamily: "monospace" }}
                />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopyExportPath(lastMarkdownExport.path)}>
                    {copiedExportPath ? <Check size={14} style={{ color: "var(--primary)" }} /> : <Copy size={14} />}
                    Copiar ruta local
                  </button>
                  {lastMarkdownExport.downloadUrl && (
                    <button className="btn btn-primary btn-sm" onClick={handleDownloadMarkdown}>
                      <Download size={14} /> Descargar {lastMarkdownExport.primaryFile}
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
                Modo Multijugador en Red Local (LAN)
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                Permite que tus jugadores se conecten desde sus propios dispositivos en la misma red Wi-Fi/LAN para ver el portal.
              </p>
            </div>
            <button
              onClick={handleToggleLan}
              className={`btn ${lanStatus.lanModeEnabled ? "btn-secondary" : "btn-primary"}`}
              style={{ minWidth: "160px" }}
            >
              {lanStatus.lanModeEnabled ? "Desactivar LAN" : "Activar LAN"}
            </button>
          </div>

          {lanStatus.lanModeEnabled ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", backgroundColor: "#090b14", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Código de Acceso (Único)</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: "700", letterSpacing: "1px", color: "var(--primary)" }}>
                      {lanStatus.accessCode}
                    </span>
                    <button
                      className="btn btn-icon btn-secondary btn-sm"
                      onClick={() => handleCopyCode(lanStatus.accessCode || "")}
                      title="Copiar código"
                    >
                      {copiedCode ? <Check size={14} style={{ color: "var(--primary)" }} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Dirección IP del Servidor</span>
                  <span style={{ fontSize: "1rem", fontWeight: "600" }}>
                    {lanStatus.localIp}:{lanStatus.port}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Enlace para Compartir con Jugadores</span>
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
                    Copiar Enlace
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "16px", backgroundColor: "#06070e", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                El modo LAN está actualmente inactivo. Actívalo para que tus jugadores puedan conectarse y registrar sus perfiles.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
