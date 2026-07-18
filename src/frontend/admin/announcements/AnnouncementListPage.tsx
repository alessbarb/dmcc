import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import {
  fetchAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  archiveAnnouncement,
  type AnnouncementSummary,
  type AnnouncementInput,
} from "../adminClient.js";
import { Plus, Archive, Power, Loader, X } from "lucide-react";

const EMPTY_FORM: AnnouncementInput = {
  content: { title: "", body: "" },
  kind: "info",
  isEnabled: true,
  showOnLanding: true,
  showOnDashboard: true,
  isDismissible: true,
  priority: 0,
  startsAt: null,
  expiresAt: null,
};

export function AnnouncementListPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AnnouncementInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAnnouncements({});
      setAnnouncements(data.announcements);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.title.trim() || !form.content.body.trim()) {
      alert("Title and body are required.");
      return;
    }
    setSaving(true);
    try {
      await createAnnouncement(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadAnnouncements();
    } catch (err: unknown) {
      alert(`Error creating announcement: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (ann: AnnouncementSummary) => {
    setActionLoading(ann.announcementId);
    try {
      await updateAnnouncement(ann.announcementId, { isEnabled: !ann.isEnabled });
      await loadAnnouncements();
    } catch (err: unknown) {
      alert(`Error updating announcement: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (announcementId: string) => {
    if (!confirm("Archive this announcement? It will stop being shown publicly.")) return;
    setActionLoading(announcementId);
    try {
      await archiveAnnouncement(announcementId);
      await loadAnnouncements();
    } catch (err: unknown) {
      alert(`Error archiving announcement: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const kindColor = (kind: AnnouncementSummary["kind"]) => {
    if (kind === "warning") return "var(--theme-feedback-warning-foreground)";
    if (kind === "maintenance") return "var(--theme-feedback-danger-foreground)";
    return "var(--theme-accents-primary-foreground)";
  };

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Announcements</h1>
            <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
              Publish informational banners shown across the landing page and dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: showForm ? "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)" : "var(--theme-accents-primary-foreground)",
              color: showForm ? "inherit" : "var(--theme-surfaces-canvas)",
              border: "1px solid var(--theme-borders-default)",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? "Cancel" : "New Announcement"}</span>
          </button>
        </header>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "color-mix(in srgb, var(--theme-feedback-danger-foreground) 10%, transparent)", border: "1px solid var(--theme-feedback-danger-foreground)", borderRadius: "8px", color: "var(--theme-feedback-danger-foreground)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={(e) => { void handleCreate(e); }}
            style={{
              backgroundColor: "var(--theme-surfaces-base)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid var(--theme-borders-default)",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <input
              type="text"
              placeholder="Title"
              value={form.content.title}
              onChange={(e) => setForm({ ...form, content: { ...form.content, title: e.target.value } })}
              style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "color-mix(in srgb, var(--theme-surfaces-canvas) 20%, transparent)", border: "1px solid var(--theme-borders-default)", color: "inherit", fontSize: "0.85rem" }}
            />
            <textarea
              placeholder="Message body"
              value={form.content.body}
              onChange={(e) => setForm({ ...form, content: { ...form.content, body: e.target.value } })}
              rows={3}
              style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "color-mix(in srgb, var(--theme-surfaces-canvas) 20%, transparent)", border: "1px solid var(--theme-borders-default)", color: "inherit", fontSize: "0.85rem", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={form.kind}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "info" || value === "warning" || value === "maintenance") {
                    setForm({ ...form, kind: value });
                  }
                }}
                style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "color-mix(in srgb, var(--theme-surfaces-canvas) 20%, transparent)", border: "1px solid var(--theme-borders-default)", color: "inherit", fontSize: "0.85rem" }}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--theme-text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={form.showOnLanding ?? true}
                  onChange={(e) => setForm({ ...form, showOnLanding: e.target.checked })}
                />
                Show on landing
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--theme-text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={form.showOnDashboard ?? true}
                  onChange={(e) => setForm({ ...form, showOnDashboard: e.target.checked })}
                />
                Show on dashboard
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--theme-text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={form.isDismissible ?? true}
                  onChange={(e) => setForm({ ...form, isDismissible: e.target.checked })}
                />
                Dismissible
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: "flex-start",
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "var(--theme-accents-primary-foreground)",
                color: "var(--theme-surfaces-canvas)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {saving ? "Publishing..." : "Publish Announcement"}
            </button>
          </form>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--theme-borders-default)", color: "var(--theme-text-secondary)" }}>
            No announcements yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {announcements.map((ann) => (
              <div
                key={ann.announcementId}
                style={{
                  backgroundColor: "var(--theme-surfaces-base)",
                  border: "1px solid var(--theme-borders-default)",
                  borderLeft: `3px solid ${kindColor(ann.kind)}`,
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  opacity: ann.archivedAt ? 0.5 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "0.95rem" }}>{ann.content.title}</strong>
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: kindColor(ann.kind), fontWeight: 700 }}>{ann.kind}</span>
                    {ann.archivedAt && <span style={{ fontSize: "0.7rem", color: "var(--theme-text-secondary)" }}>(archived)</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--theme-text-secondary)" }}>{ann.content.body}</p>
                </div>
                {!ann.archivedAt && (
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => void handleToggleEnabled(ann)}
                      disabled={actionLoading !== null}
                      title={ann.isEnabled ? "Disable" : "Enable"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        backgroundColor: ann.isEnabled ? "color-mix(in srgb, var(--theme-feedback-success-foreground) 10%, transparent)" : "color-mix(in srgb, var(--theme-text-on-media) 3%, transparent)",
                        border: `1px solid ${ann.isEnabled ? "color-mix(in srgb, var(--theme-feedback-success-foreground) 30%, transparent)" : "var(--theme-borders-default)"}`,
                        color: ann.isEnabled ? "var(--theme-feedback-success-foreground)" : "inherit",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      {actionLoading === ann.announcementId ? <Loader size={12} className="spin-animation" /> : <Power size={12} />}
                      <span>{ann.isEnabled ? "Enabled" : "Disabled"}</span>
                    </button>
                    <button
                      onClick={() => void handleArchive(ann.announcementId)}
                      disabled={actionLoading !== null}
                      title="Archive"
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
                      <Archive size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
