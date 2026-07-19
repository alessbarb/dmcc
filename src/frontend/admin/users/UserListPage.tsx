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
    } catch (err: unknown) {
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
      } catch (err: unknown) {
        alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
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
    } catch (err: unknown) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminShell>
      <div className="admin-users">
        <header className="admin-users__header">
          <h1 className="admin-users__title">User Management</h1>
          <p className="admin-users__subtitle">
            Enable or disable user access, manage administrator privileges, and terminate active web sessions.
          </p>
        </header>

        {error && (
          <div className="admin-users__error">
            <p className="admin-users__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="admin-users__filters">
          <div className="admin-users__status-filters">
            {["active", "disabled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`admin-users__status-filter ${status === s ? "admin-users__status-filter--active" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="admin-users__search-form">
            <div className="admin-users__search-field">
              <Search size={16} className="admin-users__search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="admin-users__search-input"
              />
            </div>
            <button
              type="submit"
              className="admin-users__search-submit"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="admin-users__loading">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="admin-users__empty">
            No users found matching the criteria.
          </div>
        ) : (
          <div className="admin-users__table-panel">
            <table className="admin-users__table">
              <thead>
                <tr className="admin-users__table-head">
                  <th>User</th><th>Role</th><th>Created</th><th>Last Login</th><th className="admin-users__cell--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId} className="admin-users__row">
                    <td>
                      <div className="admin-users__identity">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.displayName || u.email} className="admin-users__avatar" />
                        ) : (
                          <div className="admin-users__avatar admin-users__avatar--initial">
                            {(u.displayName || u.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="admin-users__name">{u.displayName || "(No Name)"}</div>
                          <div className="admin-users__email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-users__role ${u.isPlatformAdmin ? "admin-users__role--admin" : ""}`}>
                        {u.isPlatformAdmin ? "Platform Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                    </td>
                    <td className="admin-users__cell--right">
                      <div className="admin-users__actions">
                        {/* Disable/Enable */}
                        <button
                          onClick={() => void handleToggleStatus(u)}
                          disabled={actionLoading !== null}
                          className={`admin-users__action admin-users__action--status ${u.disabledAt ? "admin-users__action--enable" : "admin-users__action--disable"}`}
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
                          className="admin-users__action"
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
                          className="admin-users__action admin-users__action--icon"
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
