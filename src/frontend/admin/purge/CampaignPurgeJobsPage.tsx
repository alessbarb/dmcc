import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchPurgeJobs, retryPurgeJob, type PurgeJobSummary } from "../adminClient.js";
import { Play, RotateCw, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader } from "lucide-react";

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
        return <CheckCircle size={16} style={{ color: "var(--theme-feedback-success-foreground)" }} />;
      case "failed":
        return <XCircle size={16} style={{ color: "var(--theme-feedback-danger-foreground)" }} />;
      case "running":
        return <Loader size={16} className="spin-animation" style={{ color: "var(--theme-accents-primary-foreground)" }} />;
      case "pending":
        return <Play size={16} style={{ color: "var(--theme-text-secondary)" }} />;
      default:
        return <AlertCircle size={16} style={{ color: "var(--theme-text-secondary)" }} />;
    }
  };

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Purge Queue</h1>
            <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
              Monitor file purging states, view logs/errors, and retry failed operations.
            </p>
          </div>

          <button
            onClick={() => void loadJobs()}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--theme-surfaces-base)",
              border: "1px solid var(--theme-borders-default)",
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
          <div style={{ padding: "16px", backgroundColor: "color-mix(in srgb, var(--theme-feedback-danger-foreground) 10%, transparent)", border: "1px solid var(--theme-feedback-danger-foreground)", borderRadius: "8px", color: "var(--theme-feedback-danger-foreground)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          backgroundColor: "var(--theme-surfaces-base)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--theme-borders-default)",
          flexWrap: "wrap",
        }}>
          {["failed", "pending", "running", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: status === s ? "var(--theme-accents-primary-foreground)" : "color-mix(in srgb, var(--theme-text-on-media) 3%, transparent)",
                color: status === s ? "var(--theme-surfaces-canvas)" : "inherit",
                border: "1px solid var(--theme-borders-default)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
            Loading purge jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--theme-borders-default)", color: "var(--theme-text-secondary)" }}>
            No purge jobs found matching status "{status}".
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--theme-borders-default)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--theme-borders-default)", backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 2%, transparent)" }}>
                  <th style={{ padding: "16px", width: "40px" }}></th>
                  <th style={{ padding: "16px" }}>Job / Campaign ID</th>
                  <th style={{ padding: "16px" }}>Actor / Reason</th>
                  <th style={{ padding: "16px" }}>Attempts</th>
                  <th style={{ padding: "16px" }}>Created At</th>
                  {status === "failed" && <th style={{ padding: "16px" }}>Last Error</th>}
                  <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.jobId} style={{ borderBottom: "1px solid var(--theme-borders-default)" }}>
                    <td style={{ padding: "16px", verticalAlign: "middle" }}>
                      {getStatusIcon(j.status)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 600 }}>{j.jobId}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginTop: "2px" }}>Campaign: {j.campaignId}</div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ textTransform: "capitalize" }}>{j.actorType}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginTop: "2px" }}>Reason: {j.reason.replace("_", " ")}</div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      {j.attemptCount} / 5
                    </td>
                    <td style={{ padding: "16px" }}>
                      {new Date(j.createdAt).toLocaleString()}
                    </td>
                    {status === "failed" && (
                      <td style={{ padding: "16px", maxWidth: "300px" }}>
                        <div style={{ color: "var(--theme-feedback-danger-foreground)", fontWeight: 500, fontSize: "0.8rem" }}>{j.lastErrorCode || "ERROR"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={j.lastErrorMessage || ""}>
                          {j.lastErrorMessage || "No details provided"}
                        </div>
                      </td>
                    )}
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {j.status === "failed" && (
                          <button
                            onClick={() => void handleRetry(j.jobId)}
                            disabled={actionLoading !== null}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 3%, transparent)",
                              border: "1px solid var(--theme-borders-default)",
                              color: "inherit",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
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
