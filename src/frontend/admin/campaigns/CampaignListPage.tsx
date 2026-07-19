import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchAdminCampaigns, purgeCampaign, restoreCampaign, type AdminCampaignSummary } from "../adminClient.js";
import { ConfirmPasswordDialog } from "../security/ConfirmPasswordDialog.js";
import { Search, Trash2, RotateCcw, Loader } from "lucide-react";

export function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaignSummary[]>([]);
  const [status, setStatus] = useState<string>("active");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingPurgeId, setPendingPurgeId] = useState<string | null>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCampaigns({ status: status || undefined, query: query || undefined });
      setCampaigns(data.campaigns);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadCampaigns();
  };

  const handleRestore = async (campaignId: string) => {
    if (!confirm("Restore this campaign to active status?")) return;
    setActionLoading(campaignId);
    try {
      await restoreCampaign(campaignId);
      await loadCampaigns();
    } catch (err: unknown) {
      alert(`Error restoring campaign: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurgeConfirmed = async (currentPassword: string) => {
    const campaignId = pendingPurgeId;
    if (!campaignId) return;
    setActionLoading(campaignId);
    try {
      const result = await purgeCampaign(campaignId, currentPassword);
      setPendingPurgeId(null);
      if (result.outcome === "already_queued") {
        alert("Campaign purge job is already enqueued.");
      } else {
        alert("Campaign successfully enqueued for purge.");
      }
      await loadCampaigns();
    } catch (err: unknown) {
      alert(`Error enqueuing purge: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminShell>
      <div className="admin-campaigns">
        <header className="admin-campaigns__header">
          <h1 className="admin-campaigns__title">Campaign Management</h1>
          <p className="admin-campaigns__subtitle">
            Monitor campaign states, restore soft-deleted campaigns, or permanently purge them.
          </p>
        </header>

        {error && (
          <div className="admin-campaigns__error">
            <p className="admin-campaigns__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters and search */}
        <div className="admin-campaigns__filters">
          <div className="admin-campaigns__status-filters">
            {["active", "trashed", "importing"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`admin-campaigns__status-filter ${status === s ? "admin-campaigns__status-filter--active" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="admin-campaigns__search-form">
            <div className="admin-campaigns__search-field">
              <Search size={16} className="admin-campaigns__search-icon" />
              <input
                type="text"
                placeholder="Search by title or owner email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="admin-campaigns__search-input"
              />
            </div>
            <button
              type="submit"
              className="admin-campaigns__search-submit"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="admin-campaigns__loading">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="admin-campaigns__empty">
            No campaigns found matching the criteria.
          </div>
        ) : (
          <div className="admin-campaigns__table-panel">
            <table className="admin-campaigns__table">
              <thead>
                <tr className="admin-campaigns__table-head">
                  <th>Campaign Title / ID</th><th>Owner</th><th>Created</th>
                  {status === "trashed" && <th>Purge Eligibility</th>}
                  <th className="admin-campaigns__cell--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.campaignId} className="admin-campaigns__row">
                    <td>
                      <div className="admin-campaigns__name">{c.title}</div>
                      <div className="admin-campaigns__muted-detail">{c.campaignId}</div>
                    </td>
                    <td>
                      <div>{c.ownerName || c.ownerEmail}</div>
                      <div className="admin-campaigns__muted-detail">{c.ownerEmail}</div>
                    </td>
                    <td>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    {status === "trashed" && (
                      <td className="admin-campaigns__eligibility">
                        {c.purgeEligibleAt ? new Date(c.purgeEligibleAt).toLocaleDateString() : "Immediate"}
                      </td>
                    )}
                    <td className="admin-campaigns__cell--right">
                      <div className="admin-campaigns__actions">
                        {status === "trashed" && (
                          <>
                            <button
                              onClick={() => void handleRestore(c.campaignId)}
                              disabled={actionLoading !== null}
                              className="admin-campaigns__action admin-campaigns__action--restore"
                            >
                              {actionLoading === c.campaignId ? <Loader size={12} className="spin-animation" /> : <RotateCcw size={12} />}
                              <span>Restore</span>
                            </button>

                            <button
                              onClick={() => setPendingPurgeId(c.campaignId)}
                              disabled={actionLoading !== null}
                              className="admin-campaigns__action admin-campaigns__action--purge"
                            >
                              {actionLoading === c.campaignId ? <Loader size={12} className="spin-animation" /> : <Trash2 size={12} />}
                              <span>Purge</span>
                            </button>
                          </>
                        )}
                        {status === "active" && (
                          <span className="admin-campaigns__status-note">
                            Active
                          </span>
                        )}
                        {status === "importing" && (
                          <span className="admin-campaigns__status-note admin-campaigns__status-note--importing">
                            <Loader size={12} className="spin-animation" /> Importing...
                          </span>
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

      {pendingPurgeId && (
        <ConfirmPasswordDialog
          title="Permanently purge campaign"
          description="This will permanently delete the campaign and ALL its files. This action cannot be undone."
          confirmLabel="Purge permanently"
          busy={actionLoading === pendingPurgeId}
          onConfirm={(password) => void handlePurgeConfirmed(password)}
          onCancel={() => setPendingPurgeId(null)}
        />
      )}
    </AdminShell>
  );
}
