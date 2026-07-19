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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      alert(`Error revoking invitation: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const isExpired = (inv: InvitationSummary) => new Date(inv.expiresAt).getTime() < Date.now();

  return (
    <AdminShell>
      <div className="admin-invitations">
        <header className="admin-invitations__header">
          <h1 className="admin-invitations__title">Invitations</h1>
          <p className="admin-invitations__subtitle">
            Review and revoke campaign invitation links across the platform.
          </p>
        </header>

        {error && (
          <div className="admin-invitations__error">
            <p className="admin-invitations__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        <div className="admin-invitations__filters">
          <div className="admin-invitations__status-filters">
            {[
              { key: true, label: "Active" },
              { key: false, label: "All" },
            ].map((opt) => (
              <button
                key={String(opt.key)}
                onClick={() => setActiveOnly(opt.key)}
                className={`admin-invitations__filter ${activeOnly === opt.key ? "admin-invitations__filter--active" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-invitations__loading">
            Loading invitations...
          </div>
        ) : invitations.length === 0 ? (
          <div className="admin-invitations__empty">
            No invitations found.
          </div>
        ) : (
          <div className="admin-invitations__table-panel">
            <table className="admin-invitations__table">
              <thead>
                <tr className="admin-invitations__table-head">
                  <th>Campaign</th><th>Role</th><th>Uses</th><th>Expires</th><th>Status</th><th className="admin-invitations__cell--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => {
                  const expired = isExpired(inv);
                  const revoked = Boolean(inv.revokedAt);
                  return (
                    <tr key={inv.invitationId} className="admin-invitations__row">
                      <td>
                        <div className="admin-invitations__muted-detail">{inv.campaignId}</div>
                      </td>
                      <td className="admin-invitations__role">{inv.role.replace("_", " ")}</td>
                      <td>{inv.usesCount} / {inv.maxUses}</td>
                      <td>{new Date(inv.expiresAt).toLocaleString()}</td>
                      <td>
                        <span className={`admin-invitations__status ${revoked ? "admin-invitations__status--revoked" : expired ? "admin-invitations__status--expired" : "admin-invitations__status--active"}`}>
                          {revoked ? "Revoked" : expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="admin-invitations__cell--right">
                        {!revoked && (
                          <button
                            onClick={() => void handleRevoke(inv.invitationId)}
                            disabled={actionLoading !== null}
                            className="admin-invitations__revoke"
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
