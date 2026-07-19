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
    } catch (err: unknown) {
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
      <div className="admin-audit">
        <header className="admin-audit__header">
          <div>
            <h1 className="admin-audit__title">System Audit Logs</h1>
            <p className="admin-audit__subtitle">
              Immutable operational audit trail recording all administrative actions.
            </p>
          </div>

          <button
            onClick={() => void loadLogs()}
            disabled={loading}
            className="admin-audit__refresh"
          >
            <RefreshCw size={14} className={loading ? "spin-animation" : ""} />
            <span>Refresh</span>
          </button>
        </header>

        {error && (
          <div className="admin-audit__error">
            <p className="admin-audit__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="admin-audit__filters">
          <div className="admin-audit__filter-field">
            <label className="admin-audit__label">Filter by Action</label>
            <input
              type="text"
              placeholder="e.g. campaign.purged"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="admin-audit__input"
            />
          </div>

          <div className="admin-audit__filter-field">
            <label className="admin-audit__label">Filter by Actor User ID</label>
            <input
              type="text"
              placeholder="User UUID..."
              value={actorUserId}
              onChange={(e) => setActorUserId(e.target.value)}
              className="admin-audit__input"
            />
          </div>
        </div>

        {/* Content & Details panel */}
        <div className="admin-audit__content">
          <div className="admin-audit__table-panel">
            {loading ? (
              <div className="admin-audit__loading">
                Loading audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="admin-audit__empty">
                No audit log entries found.
              </div>
            ) : (
              <table className="admin-audit__table">
                <thead>
                  <tr className="admin-audit__table-head">
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Target</th>
                    <th className="admin-audit__cell--right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr
                      key={l.auditId}
                      onClick={() => setSelectedLog(l)}
                      className={`admin-audit__row ${selectedLog?.auditId === l.auditId ? "admin-audit__row--selected" : ""}`}
                    >
                      <td>
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="admin-audit__action-cell">
                        {l.action}
                      </td>
                      <td>
                        <div>{l.actorType}</div>
                        {l.actorUserId && <div className="admin-audit__muted-id">{l.actorUserId.substring(0, 8)}...</div>}
                      </td>
                      <td>
                        <div>{l.targetType}</div>
                        {l.targetId && <div className="admin-audit__muted-id">{l.targetId.substring(0, 8)}...</div>}
                      </td>
                      <td className="admin-audit__cell--right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(l);
                          }}
                          className="admin-audit__details-button"
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
          <div className="admin-audit__details-panel">
            <h3 className="admin-audit__details-title">Entry Details</h3>
            {selectedLog ? (
              <div className="admin-audit__details-list">
                <div>
                  <span className="admin-audit__detail-label">Audit ID</span>
                  <span className="admin-audit__mono admin-audit__break-all">{selectedLog.auditId}</span>
                </div>
                <div>
                  <span className="admin-audit__detail-label">Action</span>
                  <strong className="admin-audit__action-cell">{selectedLog.action}</strong>
                </div>
                <div>
                  <span className="admin-audit__detail-label">Actor Type</span>
                  <span>{selectedLog.actorType}</span>
                </div>
                {selectedLog.actorUserId && (
                  <div>
                  <span className="admin-audit__detail-label">Actor User ID</span>
                  <span className="admin-audit__mono">{selectedLog.actorUserId}</span>
                  </div>
                )}
                <div>
                  <span className="admin-audit__detail-label">Target</span>
                  <span>{selectedLog.targetType} ({selectedLog.targetId || "None"})</span>
                </div>
                <div>
                  <span className="admin-audit__detail-label">Timestamp</span>
                  <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                {selectedLog.commandId && (
                  <div>
                  <span className="admin-audit__detail-label">Correlation Command ID</span>
                  <span className="admin-audit__mono">{selectedLog.commandId}</span>
                  </div>
                )}
                <div className="admin-audit__metadata">
                  <span className="admin-audit__detail-label admin-audit__detail-label--metadata">Audit Metadata (Details)</span>
                  <pre className="admin-audit__metadata-code">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="admin-audit__details-empty">
                Select an entry on the left to inspect its parameters and audit details.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
