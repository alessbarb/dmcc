import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchAuditLog, type AuditLogSummary } from "../adminClient.js";
import { RefreshCw, Eye } from "lucide-react";

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogSummary[]>([]);
  const [action, setAction] = useState<string>("");
  const [actorUserId, setActorUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLog({
        action: action || undefined,
        actorUserId: actorUserId || undefined,
      });
      setLogs(data.auditLog);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, [action, actorUserId]);

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>System Audit Logs</h1>
            <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
              Immutable operational audit trail recording all administrative actions.
            </p>
          </div>

          <button
            onClick={() => void loadLogs()}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--theme-surfaces-base)",
              border: "1px solid var(--border)",
              color: "inherit",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <RefreshCw size={14} className={loading ? "spin-animation" : ""} />
            <span>Refresh</span>
          </button>
        </header>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "rgba(220, 53, 69, 0.1)", border: "1px solid var(--red)", borderRadius: "8px", color: "var(--red)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters */}
        <div style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          backgroundColor: "var(--theme-surfaces-base)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginBottom: "6px", fontWeight: 600 }}>Filter by Action</label>
            <input
              type="text"
              placeholder="e.g. campaign.purged"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--border)",
                color: "inherit",
                fontSize: "0.85rem",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginBottom: "6px", fontWeight: 600 }}>Filter by Actor User ID</label>
            <input
              type="text"
              placeholder="User UUID..."
              value={actorUserId}
              onChange={(e) => setActorUserId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--border)",
                color: "inherit",
                fontSize: "0.85rem",
              }}
            />
          </div>
        </div>

        {/* Content & Details panel */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: "600px", backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
                Loading audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--theme-text-secondary)" }}>
                No audit log entries found.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                    <th style={{ padding: "12px 16px" }}>Timestamp</th>
                    <th style={{ padding: "12px 16px" }}>Action</th>
                    <th style={{ padding: "12px 16px" }}>Actor</th>
                    <th style={{ padding: "12px 16px" }}>Target</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr
                      key={l.auditId}
                      onClick={() => setSelectedLog(l)}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        backgroundColor: selectedLog?.auditId === l.auditId ? "rgba(218, 165, 32, 0.05)" : "transparent",
                        transition: "background-color 0.15s",
                      }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--gold)" }}>
                        {l.action}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div>{l.actorType}</div>
                        {l.actorUserId && <div style={{ fontSize: "0.7rem", color: "var(--theme-text-secondary)" }}>{l.actorUserId.substring(0, 8)}...</div>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div>{l.targetType}</div>
                        {l.targetId && <div style={{ fontSize: "0.7rem", color: "var(--theme-text-secondary)" }}>{l.targetId.substring(0, 8)}...</div>}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(l);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--theme-text-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Details sidepanel */}
          <div style={{
            flex: 1,
            minWidth: "300px",
            backgroundColor: "var(--theme-surfaces-base)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            padding: "24px",
            position: "sticky",
            top: "24px",
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>Entry Details</h3>
            {selectedLog ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.8rem" }}>
                <div>
                  <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "4px" }}>Audit ID</span>
                  <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{selectedLog.auditId}</span>
                </div>
                <div>
                  <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "4px" }}>Action</span>
                  <strong style={{ color: "var(--gold)" }}>{selectedLog.action}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "4px" }}>Actor Type</span>
                  <span>{selectedLog.actorType}</span>
                </div>
                {selectedLog.actorUserId && (
                  <div>
                    <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "4px" }}>Actor User ID</span>
                    <span style={{ fontFamily: "monospace" }}>{selectedLog.actorUserId}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "4px" }}>Target</span>
                  <span>{selectedLog.targetType} ({selectedLog.targetId || "None"})</span>
                </div>
                <div>
                  <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "4px" }}>Timestamp</span>
                  <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                {selectedLog.commandId && (
                  <div>
                    <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "4px" }}>Correlation Command ID</span>
                    <span style={{ fontFamily: "monospace" }}>{selectedLog.commandId}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <span style={{ color: "var(--theme-text-secondary)", display: "block", marginBottom: "8px" }}>Audit Metadata (Details)</span>
                  <pre style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    padding: "12px",
                    borderRadius: "6px",
                    overflowX: "auto",
                    margin: 0,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--theme-text-secondary)", padding: "24px 0" }}>
                Select an entry on the left to inspect its parameters and audit details.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
