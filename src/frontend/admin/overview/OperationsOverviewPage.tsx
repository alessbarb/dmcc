import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchAdminOverview, type AdminOverview } from "../adminClient.js";
import { Users, Layers, ShieldAlert, RefreshCw } from "lucide-react";

export function OperationsOverviewPage() {
  const [metrics, setMetrics] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOverview();
      setMetrics(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>System Dashboard</h1>
            <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
              Real-time platform metrics and operations monitoring.
            </p>
          </div>

          <button
            onClick={() => void loadData()}
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

        {loading && !metrics ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
            Loading metrics...
          </div>
        ) : metrics ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {/* User Statistics Card */}
            <div style={{
              backgroundColor: "var(--theme-surfaces-base)",
              borderRadius: "12px",
              border: "1px solid var(--theme-borders-default)",
              padding: "24px",
              position: "relative",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Users size={20} style={{ color: "var(--theme-accents-primary-foreground)" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)", fontWeight: 500 }}>Total Accounts</span>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: "8px 0 16px" }}>{metrics.totalUsers}</h2>
              <div style={{ display: "flex", gap: "16px", borderTop: "1px solid var(--theme-borders-default)", paddingTop: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>Active</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "2px 0 0" }}>{metrics.activeUsers}</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>Disabled</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "2px 0 0", color: "var(--theme-feedback-danger-foreground)" }}>
                    {metrics.totalUsers - metrics.activeUsers}
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Statistics Card */}
            <div style={{
              backgroundColor: "var(--theme-surfaces-base)",
              borderRadius: "12px",
              border: "1px solid var(--theme-borders-default)",
              padding: "24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Layers size={20} style={{ color: "var(--theme-accents-primary-foreground)" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)", fontWeight: 500 }}>Total Campaigns</span>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: "8px 0 16px" }}>{metrics.totalCampaigns}</h2>
              <div style={{ display: "flex", gap: "16px", borderTop: "1px solid var(--theme-borders-default)", paddingTop: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>Active</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "2px 0 0" }}>{metrics.activeCampaigns}</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>In Trash</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "2px 0 0", color: "var(--theme-accents-primary-foreground)" }}>{metrics.trashedCampaigns}</p>
                </div>
              </div>
            </div>

            {/* Purge Jobs Statistics Card */}
            <div style={{
              backgroundColor: "var(--theme-surfaces-base)",
              borderRadius: "12px",
              border: "1px solid var(--theme-borders-default)",
              padding: "24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <ShieldAlert size={20} style={{ color: metrics.failedPurgeJobs > 0 ? "var(--theme-feedback-danger-foreground)" : "var(--theme-accents-primary-foreground)" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)", fontWeight: 500 }}>Purge Queue Jobs</span>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: "8px 0 16px" }}>{metrics.totalPurgeJobs}</h2>
              <div style={{ display: "flex", gap: "16px", borderTop: "1px solid var(--theme-borders-default)", paddingTop: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>Pending</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "2px 0 0" }}>{metrics.pendingPurgeJobs}</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>Failed</span>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "2px 0 0", color: metrics.failedPurgeJobs > 0 ? "var(--theme-feedback-danger-foreground)" : "inherit" }}>
                    {metrics.failedPurgeJobs}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
