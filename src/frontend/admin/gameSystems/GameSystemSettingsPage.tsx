import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import {
  fetchGameSystemSettings,
  updateGameSystemSettings,
  type GameSystemSetting,
} from "../adminClient.js";
import { CheckCircle2, XCircle, Loader } from "lucide-react";
import "../../shared/styles/features/admin-game-systems.css";

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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      alert(`Error updating game system: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminShell>
      <div className="game-systems-page">
        <header className="game-systems-header">
          <h1 className="game-systems-title">Game Systems</h1>
          <p className="game-systems-subtitle">
            Control which RPG systems are available when creating a new campaign. The Custom system is always available.
          </p>
        </header>

        {error && (
          <div className="game-systems-error">
            <p className="game-systems-error-copy"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {loading ? (
          <div className="game-systems-loading">
            Loading game systems...
          </div>
        ) : (
          <div className="game-systems-table-shell">
            <table className="game-systems-table">
              <thead>
                <tr className="game-systems-table-header">
                  <th className="game-systems-cell">System</th>
                  <th className="game-systems-cell">Status</th>
                  <th className="game-systems-cell game-systems-cell--actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.systemId} className="game-systems-row">
                    <td className="game-systems-cell">
                      <div className="game-systems-label">{s.label}</div>
                      <div className="game-systems-id">{s.systemId}</div>
                    </td>
                    <td className="game-systems-cell">
                      <span className={`game-system-status ${s.isEnabledForNewCampaigns ? "game-system-status--enabled" : "game-system-status--disabled"}`}>
                        {s.isEnabledForNewCampaigns ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="game-systems-cell game-systems-cell--actions">
                      <button
                        onClick={() => void handleToggle(s)}
                        disabled={actionLoading !== null || s.systemId === "custom"}
                        title={s.systemId === "custom" ? "Custom system is always enabled" : s.isEnabledForNewCampaigns ? "Disable" : "Enable"}
                        className={`game-system-toggle ${s.isEnabledForNewCampaigns ? "game-system-toggle--disable" : "game-system-toggle--enable"} ${s.systemId === "custom" ? "game-system-toggle--locked" : ""}`}
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
