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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Campaign Management</h1>
          <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Monitor campaign states, restore soft-deleted campaigns, or permanently purge them.
          </p>
        </header>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "color-mix(in srgb, var(--theme-feedback-danger-foreground) 10%, transparent)", border: "1px solid var(--theme-feedback-danger-foreground)", borderRadius: "8px", color: "var(--theme-feedback-danger-foreground)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters and search */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          backgroundColor: "var(--theme-surfaces-base)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--theme-borders-default)",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {["active", "trashed", "importing"].map((s) => (
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

          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, maxWidth: "400px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--theme-text-secondary)" }} />
              <input
                type="text"
                placeholder="Search by title or owner email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: "8px",
                  backgroundColor: "color-mix(in srgb, var(--theme-surfaces-canvas) 20%, transparent)",
                  border: "1px solid var(--theme-borders-default)",
                  color: "inherit",
                  fontSize: "0.85rem",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)",
                border: "1px solid var(--theme-borders-default)",
                color: "inherit",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--theme-borders-default)", color: "var(--theme-text-secondary)" }}>
            No campaigns found matching the criteria.
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--theme-borders-default)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--theme-borders-default)", backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 2%, transparent)" }}>
                  <th style={{ padding: "16px" }}>Campaign Title / ID</th>
                  <th style={{ padding: "16px" }}>Owner</th>
                  <th style={{ padding: "16px" }}>Created</th>
                  {status === "trashed" && <th style={{ padding: "16px" }}>Purge Eligibility</th>}
                  <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.campaignId} style={{ borderBottom: "1px solid var(--theme-borders-default)", transition: "background-color 0.2s" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginTop: "2px" }}>{c.campaignId}</div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div>{c.ownerName || c.ownerEmail}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginTop: "2px" }}>{c.ownerEmail}</div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    {status === "trashed" && (
                      <td style={{ padding: "16px", color: "var(--theme-accents-primary-foreground)" }}>
                        {c.purgeEligibleAt ? new Date(c.purgeEligibleAt).toLocaleDateString() : "Immediate"}
                      </td>
                    )}
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {status === "trashed" && (
                          <>
                            <button
                              onClick={() => void handleRestore(c.campaignId)}
                              disabled={actionLoading !== null}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: "color-mix(in srgb, var(--theme-feedback-success-foreground) 10%, transparent)",
                                border: "1px solid color-mix(in srgb, var(--theme-feedback-success-foreground) 30%, transparent)",
                                color: "var(--theme-feedback-success-foreground)",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              {actionLoading === c.campaignId ? <Loader size={12} className="spin-animation" /> : <RotateCcw size={12} />}
                              <span>Restore</span>
                            </button>

                            <button
                              onClick={() => setPendingPurgeId(c.campaignId)}
                              disabled={actionLoading !== null}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: "color-mix(in srgb, var(--theme-feedback-danger-foreground) 10%, transparent)",
                                border: "1px solid color-mix(in srgb, var(--theme-feedback-danger-foreground) 30%, transparent)",
                                color: "var(--theme-feedback-danger-foreground)",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              {actionLoading === c.campaignId ? <Loader size={12} className="spin-animation" /> : <Trash2 size={12} />}
                              <span>Purge</span>
                            </button>
                          </>
                        )}
                        {status === "active" && (
                          <span style={{ color: "var(--theme-text-secondary)", fontSize: "0.8rem", padding: "6px 12px" }}>
                            Active
                          </span>
                        )}
                        {status === "importing" && (
                          <span style={{ color: "var(--theme-accents-primary-foreground)", fontSize: "0.8rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}>
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
