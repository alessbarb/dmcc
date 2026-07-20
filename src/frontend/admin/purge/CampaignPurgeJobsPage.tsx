import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchPurgeJobs, retryPurgeJob, type PurgeJobSummary } from "../adminClient.js";
import { Play, RotateCw, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader } from "lucide-react";
import "../../shared/styles/features/admin-purge.css";

export function CampaignPurgeJobsPage() {
  const [jobs, setJobs] = useState<PurgeJobSummary[]>([]);
  const [status, setStatus] = useState<string>("failed");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPurgeJobs({ status: status || undefined });
      setJobs(data.jobs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, [status]);

  const handleRetry = async (jobId: string) => {
    if (!confirm("Are you sure you want to retry this failed purge job? it will be reset to pending status.")) return;

    setActionLoading(jobId);
    try {
      await retryPurgeJob(jobId);
      alert("Job reset to pending. The background worker will pick it up shortly.");
      await loadJobs();
    } catch (err: unknown) {
      alert(`Error retrying job: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (jobStatus: string) => {
    switch (jobStatus) {
      case "completed":
        return <CheckCircle size={16} className="admin-purge__status-icon admin-purge__status-icon--success" />;
      case "failed":
        return <XCircle size={16} className="admin-purge__status-icon admin-purge__status-icon--danger" />;
      case "running":
        return <Loader size={16} className="spin-animation admin-purge__status-icon admin-purge__status-icon--accent" />;
      case "pending":
        return <Play size={16} className="admin-purge__status-icon admin-purge__status-icon--muted" />;
      default:
        return <AlertCircle size={16} className="admin-purge__status-icon admin-purge__status-icon--muted" />;
    }
  };

  return (
    <AdminShell>
      <div className="admin-purge">
        <header className="admin-purge__header">
          <div>
            <h1 className="admin-purge__title">Purge Queue</h1>
            <p className="admin-purge__subtitle">
              Monitor file purging states, view logs/errors, and retry failed operations.
            </p>
          </div>

          <button
            onClick={() => void loadJobs()}
            disabled={loading}
            className="admin-purge__refresh"
          >
            <RefreshCw size={14} className={loading ? "spin-animation" : ""} />
            <span>Refresh</span>
          </button>
        </header>

        {error && (
          <div className="admin-purge__error">
            <p className="admin-purge__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="admin-purge__filters">
          {["failed", "pending", "running", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`admin-purge__filter ${status === s ? "admin-purge__filter--active" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-purge__loading">
            Loading purge jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="admin-purge__empty">
            No purge jobs found matching status "{status}".
          </div>
        ) : (
          <div className="admin-purge__table-panel">
            <table className="admin-purge__table">
              <thead>
                <tr className="admin-purge__table-head">
                  <th className="admin-purge__icon-cell"></th>
                  <th>Job / Campaign ID</th>
                  <th>Actor / Reason</th>
                  <th>Attempts</th>
                  <th>Created At</th>
                  {status === "failed" && <th>Last Error</th>}
                  <th className="admin-purge__cell--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.jobId} className="admin-purge__row">
                    <td className="admin-purge__icon-cell">
                      {getStatusIcon(j.status)}
                    </td>
                    <td>
                      <div className="admin-purge__job-id">{j.jobId}</div>
                      <div className="admin-purge__muted-detail">Campaign: {j.campaignId}</div>
                    </td>
                    <td>
                      <div className="admin-purge__capitalize">{j.actorType}</div>
                      <div className="admin-purge__muted-detail">Reason: {j.reason.replace("_", " ")}</div>
                    </td>
                    <td>
                      {j.attemptCount} / 5
                    </td>
                    <td>
                      {new Date(j.createdAt).toLocaleString()}
                    </td>
                    {status === "failed" && (
                      <td className="admin-purge__error-cell">
                        <div className="admin-purge__error-code">{j.lastErrorCode || "ERROR"}</div>
                        <div className="admin-purge__muted-detail admin-purge__truncate" title={j.lastErrorMessage || ""}>
                          {j.lastErrorMessage || "No details provided"}
                        </div>
                      </td>
                    )}
                    <td className="admin-purge__cell--right">
                      <div className="admin-purge__actions">
                        {j.status === "failed" && (
                          <button
                            onClick={() => void handleRetry(j.jobId)}
                            disabled={actionLoading !== null}
                            className="admin-purge__retry"
                          >
                            {actionLoading === j.jobId ? (
                              <Loader size={12} className="spin-animation" />
                            ) : (
                              <RotateCw size={12} />
                            )}
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
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
