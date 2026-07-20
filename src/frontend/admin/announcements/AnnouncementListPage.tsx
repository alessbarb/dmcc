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
import "../../shared/styles/features/admin-announcements.css";

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

  return (
    <AdminShell>
      <div className="admin-announcements">
        <header className="admin-announcements__header">
          <div>
            <h1 className="admin-announcements__title">Announcements</h1>
            <p className="admin-announcements__subtitle">
              Publish informational banners shown across the landing page and dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className={`admin-announcements__toggle ${showForm ? "admin-announcements__toggle--cancel" : ""}`}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? "Cancel" : "New Announcement"}</span>
          </button>
        </header>

        {error && (
          <div className="admin-announcements__error">
            <p className="admin-announcements__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={(e) => { void handleCreate(e); }}
            className="admin-announcements__form"
          >
            <input
              type="text"
              placeholder="Title"
              value={form.content.title}
              onChange={(e) => setForm({ ...form, content: { ...form.content, title: e.target.value } })}
              className="admin-announcements__control"
            />
            <textarea
              placeholder="Message body"
              value={form.content.body}
              onChange={(e) => setForm({ ...form, content: { ...form.content, body: e.target.value } })}
              rows={3}
              className="admin-announcements__control admin-announcements__textarea"
            />
            <div className="admin-announcements__form-options">
              <select
                value={form.kind}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "info" || value === "warning" || value === "maintenance") {
                    setForm({ ...form, kind: value });
                  }
                }}
                className="admin-announcements__control"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <label className="admin-announcements__checkbox-label">
                <input
                  type="checkbox"
                  checked={form.showOnLanding ?? true}
                  onChange={(e) => setForm({ ...form, showOnLanding: e.target.checked })}
                />
                Show on landing
              </label>
              <label className="admin-announcements__checkbox-label">
                <input
                  type="checkbox"
                  checked={form.showOnDashboard ?? true}
                  onChange={(e) => setForm({ ...form, showOnDashboard: e.target.checked })}
                />
                Show on dashboard
              </label>
              <label className="admin-announcements__checkbox-label">
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
              className="admin-announcements__publish"
            >
              {saving ? "Publishing..." : "Publish Announcement"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="admin-announcements__loading">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="admin-announcements__empty">
            No announcements yet.
          </div>
        ) : (
          <div className="admin-announcements__list">
            {announcements.map((ann) => (
              <div
                key={ann.announcementId}
                className={`admin-announcements__card admin-announcements__card--${ann.kind} ${ann.archivedAt ? "admin-announcements__card--archived" : ""}`}
              >
                <div className="admin-announcements__content">
                  <div className="admin-announcements__card-heading">
                    <strong className="admin-announcements__card-title">{ann.content.title}</strong>
                    <span className={`admin-announcements__kind admin-announcements__kind--${ann.kind}`}>{ann.kind}</span>
                    {ann.archivedAt && <span className="admin-announcements__archived">(archived)</span>}
                  </div>
                  <p className="admin-announcements__body">{ann.content.body}</p>
                </div>
                {!ann.archivedAt && (
                  <div className="admin-announcements__actions">
                    <button
                      onClick={() => void handleToggleEnabled(ann)}
                      disabled={actionLoading !== null}
                      title={ann.isEnabled ? "Disable" : "Enable"}
                      className={`admin-announcements__action ${ann.isEnabled ? "admin-announcements__action--enabled" : ""}`}
                    >
                      {actionLoading === ann.announcementId ? <Loader size={12} className="spin-animation" /> : <Power size={12} />}
                      <span>{ann.isEnabled ? "Enabled" : "Disabled"}</span>
                    </button>
                    <button
                      onClick={() => void handleArchive(ann.announcementId)}
                      disabled={actionLoading !== null}
                      title="Archive"
                      className="admin-announcements__action admin-announcements__action--archive"
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
