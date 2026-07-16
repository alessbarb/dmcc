import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchInvitations, revokeInvitation, type InvitationSummary } from "../adminClient.js";
import { Ban, Loader } from "lucide-react";

export function InvitationListPage() {
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvitations({ activeOnly });
      setInvitations(data.invitations);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvitations();
  }, [activeOnly]);

  const handleRevoke = async (invitationId: string) => {
    if (!confirm("Revoke this invitation? It will no longer be usable to join the campaign.")) return;
    setActionLoading(invitationId);
    try {
      await revokeInvitation(invitationId);
      await loadInvitations();
    } catch (err: any) {
      alert(`Error revoking invitation: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const isExpired = (inv: InvitationSummary) => new Date(inv.expiresAt).getTime() < Date.now();

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Invitations</h1>
          <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Review and revoke campaign invitation links across the platform.
          </p>
        </header>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "rgba(220, 53, 69, 0.1)", border: "1px solid var(--red)", borderRadius: "8px", color: "var(--red)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          backgroundColor: "var(--theme-surfaces-base)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: true, label: "Active" },
              { key: false, label: "All" },
            ].map((opt) => (
              <button
                key={String(opt.key)}
                onClick={() => setActiveOnly(opt.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: activeOnly === opt.key ? "var(--gold)" : "rgba(255,255,255,0.03)",
                  color: activeOnly === opt.key ? "var(--theme-surfaces-canvas)" : "inherit",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
            Loading invitations...
          </div>
        ) : invitations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--border)", color: "var(--theme-text-secondary)" }}>
            No invitations found.
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                  <th style={{ padding: "16px" }}>Campaign</th>
                  <th style={{ padding: "16px" }}>Role</th>
                  <th style={{ padding: "16px" }}>Uses</th>
                  <th style={{ padding: "16px" }}>Expires</th>
                  <th style={{ padding: "16px" }}>Status</th>
                  <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => {
                  const expired = isExpired(inv);
                  const revoked = Boolean(inv.revokedAt);
                  return (
                    <tr key={inv.invitationId} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>{inv.campaignId}</div>
                      </td>
                      <td style={{ padding: "16px", textTransform: "capitalize" }}>{inv.role.replace("_", " ")}</td>
                      <td style={{ padding: "16px" }}>{inv.usesCount} / {inv.maxUses}</td>
                      <td style={{ padding: "16px" }}>{new Date(inv.expiresAt).toLocaleString()}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: revoked ? "rgba(220, 53, 69, 0.1)" : expired ? "rgba(255,255,255,0.05)" : "rgba(40, 167, 69, 0.1)",
                          color: revoked ? "var(--red)" : expired ? "var(--theme-text-secondary)" : "var(--green)",
                          border: `1px solid ${revoked ? "rgba(220, 53, 69, 0.3)" : expired ? "var(--border)" : "rgba(40, 167, 69, 0.3)"}`,
                        }}>
                          {revoked ? "Revoked" : expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        {!revoked && (
                          <button
                            onClick={() => void handleRevoke(inv.invitationId)}
                            disabled={actionLoading !== null}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              backgroundColor: "rgba(220, 53, 69, 0.1)",
                              border: "1px solid rgba(220, 53, 69, 0.3)",
                              color: "var(--red)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            {actionLoading === inv.invitationId ? <Loader size={12} className="spin-animation" /> : <Ban size={12} />}
                            <span>Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
