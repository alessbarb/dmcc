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
    } catch (err: any) {
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
    } catch (err: any) {
      alert(`Error updating template: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (template: CampaignTemplateSetting) => {
    setActionLoading(template.templateId);
    try {
      await updateCampaignTemplateSettings(template.templateId, { isFeatured: !template.isFeatured });
      await loadTemplates();
    } catch (err: any) {
      alert(`Error updating template: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Campaign Templates</h1>
          <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Control which premade campaigns are visible to users and which are featured.
          </p>
        </header>

        {error && (
          <div style={{ padding: "16px", backgroundColor: "rgba(220, 53, 69, 0.1)", border: "1px solid var(--red)", borderRadius: "8px", color: "var(--red)", marginBottom: "24px" }}>
            <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--theme-text-secondary)" }}>
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--border)", color: "var(--theme-text-secondary)" }}>
            No campaign templates found on disk.
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--theme-surfaces-base)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                  <th style={{ padding: "16px" }}>Template</th>
                  <th style={{ padding: "16px" }}>System</th>
                  <th style={{ padding: "16px" }}>Difficulty</th>
                  <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.templateId} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>{t.templateId}</div>
                    </td>
                    <td style={{ padding: "16px" }}>{t.system}</td>
                    <td style={{ padding: "16px", textTransform: "capitalize" }}>{t.difficulty}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => void handleToggleFeatured(t)}
                          disabled={actionLoading !== null}
                          title={t.isFeatured ? "Unfeature" : "Feature"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: t.isFeatured ? "rgba(218, 165, 32, 0.1)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${t.isFeatured ? "var(--gold)" : "var(--border)"}`,
                            color: t.isFeatured ? "var(--gold)" : "inherit",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          <Star size={12} fill={t.isFeatured ? "currentColor" : "none"} />
                          <span>Featured</span>
                        </button>
                        <button
                          onClick={() => void handleToggleVisible(t)}
                          disabled={actionLoading !== null}
                          title={t.isVisible ? "Hide" : "Show"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: t.isVisible ? "rgba(40, 167, 69, 0.1)" : "rgba(220, 53, 69, 0.1)",
                            border: `1px solid ${t.isVisible ? "rgba(40, 167, 69, 0.3)" : "rgba(220, 53, 69, 0.3)"}`,
                            color: t.isVisible ? "var(--green)" : "var(--red)",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
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
