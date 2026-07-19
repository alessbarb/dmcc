import React, { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell.js";
import {
  fetchCampaignTemplateSettings,
  updateCampaignTemplateSettings,
  type CampaignTemplateSetting,
} from "../adminClient.js";
import { Eye, EyeOff, Star, Loader } from "lucide-react";

export function CampaignTemplateSettingsPage() {
  const [templates, setTemplates] = useState<CampaignTemplateSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCampaignTemplateSettings();
      setTemplates(data.templates);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleToggleVisible = async (template: CampaignTemplateSetting) => {
    setActionLoading(template.templateId);
    try {
      await updateCampaignTemplateSettings(template.templateId, { isVisible: !template.isVisible });
      await loadTemplates();
    } catch (err: unknown) {
      alert(`Error updating template: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (template: CampaignTemplateSetting) => {
    setActionLoading(template.templateId);
    try {
      await updateCampaignTemplateSettings(template.templateId, { isFeatured: !template.isFeatured });
      await loadTemplates();
    } catch (err: unknown) {
      alert(`Error updating template: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminShell>
      <div className="admin-template-settings">
        <header className="admin-template-settings__header">
          <h1 className="admin-template-settings__title">Campaign Templates</h1>
          <p className="admin-template-settings__subtitle">
            Control which campaign templates are visible to users and which are featured.
          </p>
        </header>

        {error && (
          <div className="admin-template-settings__error">
            <p className="admin-template-settings__zero-margin"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {loading ? (
          <div className="admin-template-settings__loading">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="admin-template-settings__empty">
            No campaign templates found on disk.
          </div>
        ) : (
          <div className="admin-template-settings__table-panel">
            <table className="admin-template-settings__table">
              <thead>
                <tr className="admin-template-settings__table-head">
                  <th>Template</th><th>System</th><th>Difficulty</th><th className="admin-template-settings__cell--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.templateId} className="admin-template-settings__row">
                    <td>
                      <div className="admin-template-settings__name">{t.title}</div>
                      <div className="admin-template-settings__id">{t.templateId}</div>
                    </td>
                    <td>{t.system}</td>
                    <td className="admin-template-settings__difficulty">{t.difficulty}</td>
                    <td className="admin-template-settings__cell--right">
                      <div className="admin-template-settings__actions">
                        <button
                          onClick={() => void handleToggleFeatured(t)}
                          disabled={actionLoading !== null}
                          title={t.isFeatured ? "Unfeature" : "Feature"}
                          className={`admin-template-settings__action ${t.isFeatured ? "admin-template-settings__action--featured" : ""}`}
                        >
                          <Star size={12} fill={t.isFeatured ? "currentColor" : "none"} />
                          <span>Featured</span>
                        </button>
                        <button
                          onClick={() => void handleToggleVisible(t)}
                          disabled={actionLoading !== null}
                          title={t.isVisible ? "Hide" : "Show"}
                          className={`admin-template-settings__action ${t.isVisible ? "admin-template-settings__action--visible" : "admin-template-settings__action--hidden"}`}
                        >
                          {actionLoading === t.templateId ? (
                            <Loader size={12} className="spin-animation" />
                          ) : t.isVisible ? (
                            <Eye size={12} />
                          ) : (
                            <EyeOff size={12} />
                          )}
                          <span>{t.isVisible ? "Visible" : "Hidden"}</span>
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
    </AdminShell>
  );
}
