import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchAdminOverview, type AdminOverview } from "../adminClient.js";
import { Users, Layers, ShieldAlert, RefreshCw } from "lucide-react";
import "../../shared/styles/features/admin-overview.css";

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
    } catch (err: unknown) {
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
      <div className="admin-overview">
        <header className="admin-overview__header">
          <div>
            <h1 className="admin-overview__title">System Dashboard</h1>
            <p className="admin-overview__subtitle">
              Real-time platform metrics and operations monitoring.
            </p>
          </div>

          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="admin-overview__refresh"
          >
            <RefreshCw size={14} className={loading ? "spin-animation" : ""} />
            <span>Refresh</span>
          </button>
        </header>

        {error && (
          <div className="admin-overview__error">
            <p className="admin-overview__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {loading && !metrics ? (
          <div className="admin-overview__loading">
            Loading metrics...
          </div>
        ) : metrics ? (
          <div className="admin-overview__grid">
            {/* User Statistics Card */}
            <div className="admin-overview__card">
              <div className="admin-overview__card-header">
                <div className="admin-overview__metric-icon">
                  <Users size={20} />
                </div>
              </div>
              <span className="admin-overview__metric-label">Total Accounts</span>
              <h2 className="admin-overview__metric-value">{metrics.totalUsers}</h2>
              <div className="admin-overview__metric-breakdown">
                <div>
                  <span className="admin-overview__breakdown-label">Active</span>
                  <p className="admin-overview__breakdown-value">{metrics.activeUsers}</p>
                </div>
                <div>
                  <span className="admin-overview__breakdown-label">Disabled</span>
                  <p className="admin-overview__breakdown-value admin-overview__breakdown-value--danger">
                    {metrics.totalUsers - metrics.activeUsers}
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Statistics Card */}
            <div className="admin-overview__card">
              <div className="admin-overview__card-header">
                <div className="admin-overview__metric-icon">
                  <Layers size={20} />
                </div>
              </div>
              <span className="admin-overview__metric-label">Total Campaigns</span>
              <h2 className="admin-overview__metric-value">{metrics.totalCampaigns}</h2>
              <div className="admin-overview__metric-breakdown">
                <div>
                  <span className="admin-overview__breakdown-label">Active</span>
                  <p className="admin-overview__breakdown-value">{metrics.activeCampaigns}</p>
                </div>
                <div>
                  <span className="admin-overview__breakdown-label">In Trash</span>
                  <p className="admin-overview__breakdown-value admin-overview__breakdown-value--accent">{metrics.trashedCampaigns}</p>
                </div>
              </div>
            </div>

            {/* Purge Jobs Statistics Card */}
            <div className="admin-overview__card">
              <div className="admin-overview__card-header">
                <div className={`admin-overview__metric-icon ${metrics.failedPurgeJobs > 0 ? "admin-overview__metric-icon--danger" : ""}`}>
                  <ShieldAlert size={20} />
                </div>
              </div>
              <span className="admin-overview__metric-label">Purge Queue Jobs</span>
              <h2 className="admin-overview__metric-value">{metrics.totalPurgeJobs}</h2>
              <div className="admin-overview__metric-breakdown">
                <div>
                  <span className="admin-overview__breakdown-label">Pending</span>
                  <p className="admin-overview__breakdown-value">{metrics.pendingPurgeJobs}</p>
                </div>
                <div>
                  <span className="admin-overview__breakdown-label">Failed</span>
                  <p className={`admin-overview__breakdown-value ${metrics.failedPurgeJobs > 0 ? "admin-overview__breakdown-value--danger" : ""}`}>
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
