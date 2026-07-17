import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import { fetchAdminUsers, enableUser, disableUser, revokeUserSessions, grantPlatformAdmin, revokePlatformAdmin, type AdminUserSummary } from "../adminClient.js";
import { ConfirmPasswordDialog } from "../security/ConfirmPasswordDialog.js";
import { Search, UserCheck, UserX, Shield, ShieldOff, Key, Loader } from "lucide-react";

type PendingAction =
  | { kind: "disable"; user: AdminUserSummary }
  | { kind: "toggleAdmin"; user: AdminUserSummary }
  | { kind: "revokeSessions"; userId: string };

export function UserListPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [status, setStatus] = useState<string>("active");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({ status: status || undefined, query: query || undefined });
      setUsers(data.users);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadUsers();
  };

  const handleToggleStatus = async (user: AdminUserSummary) => {
    if (user.disabledAt) {
      // Re-enabling doesn't need password confirmation — only disabling does.
      setActionLoading(user.userId);
      try {
        await enableUser(user.userId);
        await loadUsers();
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      } finally {
        setActionLoading(null);
      }
      return;
    }
    setPendingAction({ kind: "disable", user });
  };

  const handleToggleAdmin = (user: AdminUserSummary) => {
    setPendingAction({ kind: "toggleAdmin", user });
  };

  const handleRevokeSessions = (userId: string) => {
    setPendingAction({ kind: "revokeSessions", userId });
  };

  const handleConfirmPendingAction = async (currentPassword: string) => {
    if (!pendingAction) return;
    const actionUserId = pendingAction.kind === "revokeSessions" ? pendingAction.userId : pendingAction.user.userId;
    setActionLoading(actionUserId);
    try {
      if (pendingAction.kind === "disable") {
        await disableUser(pendingAction.user.userId, currentPassword);
      } else if (pendingAction.kind === "toggleAdmin") {
        if (pendingAction.user.isPlatformAdmin) {
          await revokePlatformAdmin(pendingAction.user.userId, currentPassword);
        } else {
          await grantPlatformAdmin(pendingAction.user.userId, currentPassword);
        }
      } else {
        await revokeUserSessions(pendingAction.userId, currentPassword);
        alert("All sessions successfully revoked.");
      }
      setPendingAction(null);
      await loadUsers();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>User Management</h1>
          <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Enable or disable user access, manage administrator privileges, and terminate active web sessions.
          </p>
        </header>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "color-mix(in srgb, var(--theme-feedback-danger-foreground) 10%, transparent)", border: "1px solid var(--theme-feedback-danger-foreground)", borderRadius: "8px", color: "var(--theme-feedback-danger-foreground)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters */}
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
            {["active", "disabled"].map((s) => (
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
                placeholder="Search by name or email..."
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
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--theme-borders-default)", color: "var(--theme-text-secondary)" }}>
            No users found matching the criteria.
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--theme-borders-default)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--theme-borders-default)", backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 2%, transparent)" }}>
                  <th style={{ padding: "16px" }}>User</th>
                  <th style={{ padding: "16px" }}>Role</th>
                  <th style={{ padding: "16px" }}>Created</th>
                  <th style={{ padding: "16px" }}>Last Login</th>
                  <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId} style={{ borderBottom: "1px solid var(--theme-borders-default)" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.displayName || u.email} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                            {(u.displayName || u.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.displayName || "(No Name)"}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: u.isPlatformAdmin ? "color-mix(in srgb, var(--theme-accents-primary-foreground) 10%, transparent)" : "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)",
                        color: u.isPlatformAdmin ? "var(--theme-accents-primary-foreground)" : "inherit",
                        border: u.isPlatformAdmin ? "1px solid var(--theme-accents-primary-foreground)" : "1px solid var(--theme-borders-default)",
                      }}>
                        {u.isPlatformAdmin ? "Platform Admin" : "User"}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {/* Disable/Enable */}
                        <button
                          onClick={() => void handleToggleStatus(u)}
                          disabled={actionLoading !== null}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: u.disabledAt ? "color-mix(in srgb, var(--theme-feedback-success-foreground) 10%, transparent)" : "color-mix(in srgb, var(--theme-feedback-danger-foreground) 10%, transparent)",
                            border: u.disabledAt ? "1px solid color-mix(in srgb, var(--theme-feedback-success-foreground) 30%, transparent)" : "1px solid color-mix(in srgb, var(--theme-feedback-danger-foreground) 30%, transparent)",
                            color: u.disabledAt ? "var(--theme-feedback-success-foreground)" : "var(--theme-feedback-danger-foreground)",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          {actionLoading === u.userId ? (
                            <Loader size={12} className="spin-animation" />
                          ) : u.disabledAt ? (
                            <UserCheck size={12} />
                          ) : (
                            <UserX size={12} />
                          )}
                          <span>{u.disabledAt ? "Enable" : "Disable"}</span>
                        </button>

                        {/* Grant/Revoke Admin */}
                        <button
                          onClick={() => handleToggleAdmin(u)}
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
                          {actionLoading === u.userId ? (
                            <Loader size={12} className="spin-animation" />
                          ) : u.isPlatformAdmin ? (
                            <ShieldOff size={12} />
                          ) : (
                            <Shield size={12} />
                          )}
                          <span>{u.isPlatformAdmin ? "Revoke Admin" : "Grant Admin"}</span>
                        </button>

                        {/* Revoke Sessions */}
                        <button
                          onClick={() => handleRevokeSessions(u.userId)}
                          disabled={actionLoading !== null}
                          title="Revoke Sessions"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "6px",
                            borderRadius: "6px",
                            backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 3%, transparent)",
                            border: "1px solid var(--theme-borders-default)",
                            color: "inherit",
                            cursor: "pointer",
                          }}
                        >
                          <Key size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingAction && (
        <ConfirmPasswordDialog
          title={
            pendingAction.kind === "disable"
              ? "Disable user"
              : pendingAction.kind === "toggleAdmin"
                ? pendingAction.user.isPlatformAdmin ? "Revoke platform admin" : "Grant platform admin"
                : "Revoke all sessions"
          }
          description={
            pendingAction.kind === "disable"
              ? `Disable "${pendingAction.user.email}"? They will be signed out immediately and unable to log back in until re-enabled.`
              : pendingAction.kind === "toggleAdmin"
                ? `${pendingAction.user.isPlatformAdmin ? "Revoke" : "Grant"} Platform Admin privileges for "${pendingAction.user.email}"?`
                : "Revoke all active sessions for this user? They will be logged out immediately."
          }
          confirmLabel="Confirm"
          busy={actionLoading !== null}
          onConfirm={(password) => void handleConfirmPendingAction(password)}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </AdminShell>
  );
}
