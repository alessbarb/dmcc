import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import {
  fetchGameSystemSettings,
  updateGameSystemSettings,
  type GameSystemSetting,
} from "../adminClient.js";
import { CheckCircle2, XCircle, Loader } from "lucide-react";

export function GameSystemSettingsPage() {
  const [systems, setSystems] = useState<GameSystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSystems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGameSystemSettings();
      setSystems(data.systems);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSystems();
  }, []);

  const handleToggle = async (system: GameSystemSetting) => {
    if (system.systemId === "custom") return;
    setActionLoading(system.systemId);
    try {
      await updateGameSystemSettings(system.systemId, { isEnabledForNewCampaigns: !system.isEnabledForNewCampaigns });
      await loadSystems();
    } catch (err: any) {
      alert(`Error updating game system: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Game Systems</h1>
          <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Control which RPG systems are available when creating a new campaign. The Custom system is always available.
          </p>
        </header>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "rgba(220, 53, 69, 0.1)", border: "1px solid var(--red)", borderRadius: "8px", color: "var(--red)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
            Loading game systems...
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                  <th style={{ padding: "16px" }}>System</th>
                  <th style={{ padding: "16px" }}>Status</th>
                  <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.systemId} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>{s.systemId}</div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: s.isEnabledForNewCampaigns ? "rgba(40, 167, 69, 0.1)" : "rgba(255, 255, 255, 0.05)",
                        color: s.isEnabledForNewCampaigns ? "var(--green)" : "var(--theme-text-secondary)",
                        border: `1px solid ${s.isEnabledForNewCampaigns ? "rgba(40, 167, 69, 0.3)" : "var(--border)"}`,
                      }}>
                        {s.isEnabledForNewCampaigns ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button
                        onClick={() => void handleToggle(s)}
                        disabled={actionLoading !== null || s.systemId === "custom"}
                        title={s.systemId === "custom" ? "Custom system is always enabled" : s.isEnabledForNewCampaigns ? "Disable" : "Enable"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          backgroundColor: s.isEnabledForNewCampaigns ? "rgba(220, 53, 69, 0.1)" : "rgba(40, 167, 69, 0.1)",
                          border: `1px solid ${s.isEnabledForNewCampaigns ? "rgba(220, 53, 69, 0.3)" : "rgba(40, 167, 69, 0.3)"}`,
                          color: s.isEnabledForNewCampaigns ? "var(--red)" : "var(--green)",
                          cursor: s.systemId === "custom" ? "not-allowed" : "pointer",
                          opacity: s.systemId === "custom" ? 0.5 : 1,
                          fontSize: "0.8rem",
                        }}
                      >
                        {actionLoading === s.systemId ? (
                          <Loader size={12} className="spin-animation" />
                        ) : s.isEnabledForNewCampaigns ? (
                          <XCircle size={12} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        <span>{s.isEnabledForNewCampaigns ? "Disable" : "Enable"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
