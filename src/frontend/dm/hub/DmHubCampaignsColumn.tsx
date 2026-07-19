import React from "react";
import { AlertTriangle, Activity, Clock, FileText, FolderOpen, Layers, Plus, RotateCcw, Search, Settings, Shield, Star, Trash2, UserPlus, Users, X } from "lucide-react";
import { CampaignTemplateLibrarySection } from "./CampaignTemplateLibrarySection.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import type { CampaignTemplateSummary } from "../../shared/stores/campaignStore.js";
import type { DmHubCampaign, DmHubDashboard } from "./dmHubTypes.js";

type CampaignTarget = { campaignId: string; title: string; summary?: string; system?: string; coverUrl?: string };

interface DmHubCampaignsColumnProps {
  campaigns: DmHubCampaign[];
  filteredCampaigns: DmHubCampaign[];
  campaignTemplates: CampaignTemplateSummary[];
  loading: boolean;
  error: string | null;
  refreshCampaigns: () => void;
  landingSearchQuery: string;
  setLandingSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  campaignFilter: string;
  setCampaignFilter: React.Dispatch<React.SetStateAction<string>>;
  totalPlayersCount: number;
  totalNpcsCount: number;
  totalEntitiesCount: number;
  totalSessionsCount: number;
  playtimeLast30DaysLabel: string;
  completedCampaigns: number;
  recentActivity: DmHubDashboard["recentActivity"];
  triggerMysticalTransition: (campaignId: string) => void;
  openEditModal: (campaign: CampaignTarget) => void;
  openDeleteModal: (campaignId: string, title: string) => void;
  onCreateCampaign: () => void;
  onExploreTemplates: () => void;
  onRestoreBackup: () => void;
  navigateToCampaignTemplate: (templateId: string) => void;
  importingTemplateId: string | null;
  onImportTemplate: (templateId: string) => void;
}

function formatCampaignSystem(system?: string) {
  if (system === "dnd_5e") return "D&D 5e";
  if (system === "pathfinder_2e") return "Pathfinder 2e";
  if (system === "shadowdark") return "Shadowdark";
  return "Custom";
}

function activityIcon(type: string) {
  switch (type) {
    case "session": return <Activity size={14} style={{ color: "var(--theme-accents-primary-foreground)" }} />;
    case "npc": return <UserPlus size={14} style={{ color: "var(--theme-accents-primary-foreground)" }} />;
    case "note": return <FileText size={14} style={{ color: "var(--theme-accents-primary-foreground)" }} />;
    case "entity": return <Layers size={14} style={{ color: "var(--theme-accents-primary-foreground)" }} />;
    default: return <span aria-hidden="true">•</span>;
  }
}

export function DmHubCampaignsColumn({
  campaigns, filteredCampaigns, campaignTemplates, loading, error, refreshCampaigns, landingSearchQuery,
  setLandingSearchQuery, campaignFilter, setCampaignFilter, totalPlayersCount, totalNpcsCount,
  totalEntitiesCount, totalSessionsCount, playtimeLast30DaysLabel, completedCampaigns, recentActivity,
  triggerMysticalTransition, openEditModal, openDeleteModal, onCreateCampaign, onExploreTemplates,
  onRestoreBackup, navigateToCampaignTemplate, importingTemplateId, onImportTemplate,
}: DmHubCampaignsColumnProps) {
  const { t } = useTranslation();
  return (
    <div className="dm-hub-grid__left">

            {/* ── TUS CAMPAÑAS ── */}
            <section id="dm-campaigns-section" className="dm-panel dm-panel--campaigns">
              <div className="dm-panel__header dm-panel__header--campaigns">
                <div className="dm-panel__title-group">
                <FolderOpen size={17} className="dm-hub-campaigns__icon" />
                  <h2 className="dm-panel__title">Tus campañas</h2>
                </div>
                <div className="dm-panel__controls">
                  <div className="dm-search-wrapper">
                    <Search size={13} className="dm-search-icon" />
                    <input
                      type="text"
                      className="dm-search-input"
                      placeholder={t("landing.searchCampaignPlaceholder")}
                      value={landingSearchQuery}
                      onChange={(e) => setLandingSearchQuery(e.target.value)}
                    />
                    {landingSearchQuery && (
                      <button type="button" className="dm-search-clear" onClick={() => setLandingSearchQuery("")}>
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <select
                    className="dm-filter-select"
                    value={campaignFilter}
                    onChange={(e) => setCampaignFilter(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    <option value="active">En curso</option>
                    <option value="paused">Pausadas</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="dm-muted-text">{t("landing.loadingCampaigns")}</p>
              ) : error ? (
                <div className="dm-empty-state dm-empty-state--error">
                  <AlertTriangle size={22} className="icon-critical" />
                  <p>{t("landing.errorTitle")}</p>
                  <span>{error}</span>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={refreshCampaigns}>
                    {t("landing.retryButton")}
                  </button>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="dm-empty-state">
                  <Shield size={32} style={{ color: "var(--theme-accents-primary-foreground)", opacity: 0.5, marginBottom: "12px" }} />
                  <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--theme-text-primary)" }}>
                    Todavía no tienes campañas
                  </p>
                  <span style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)", lineHeight: 1.5, display: "block", margin: "8px 0 20px", maxWidth: "380px" }}>
                    Crea tu primera campaña desde cero, usa una aventura preparada o restaura una copia de seguridad.
                  </span>
                  <div className="dm-empty-state__actions">
                    <button className="btn btn-gold btn-sm" onClick={onCreateCampaign}>
                      <Plus size={14} /> {t("landing.createCampaignLabel")}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={onExploreTemplates}>
                      Explorar aventuras
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={onRestoreBackup}>
                      <RotateCcw size={14} /> Restaurar copia
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="dm-campaigns-grid">
                    {filteredCampaigns.map((c) => {
                      const isActive = Boolean(c.stats?.activeSession) || c.status === "active";
                      const statusLabel = isActive ? "EN CURSO" : "PAUSADA";
                      const lastUpdated = c.updatedAt
                        ? t("landing.daysAgo", { count: String(Math.max(1, Math.floor((Date.now() - new Date(c.updatedAt).getTime()) / 86400000))) })
                        : "Sin actividad registrada";

                      return (
                        <div
                          key={c.campaignId}
                          className="dm-campaign-card"
                          onClick={() => triggerMysticalTransition(c.campaignId)}
                        >
                          <div
                            className="dm-campaign-card__cover"
                            style={{ backgroundImage: `url(${c.coverUrl || "/assets/campaigns/default-campaign-cover.jpg"})` }}
                          >
                            <div className="dm-campaign-card__cover-overlay" />
                            <span className={`dm-campaign-card__badge ${isActive ? "active" : "paused"}`}>
                              {statusLabel}
                            </span>
                            <button
                              type="button"
                              className="dm-campaign-card__fav"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Star size={11} fill="var(--theme-accents-primary-foreground)" style={{ color: "var(--theme-accents-primary-foreground)" }} />
                            </button>
                            <div
                              className="dm-campaign-card__actions"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Acciones de campaña"
                            >
                              <button
                                type="button"
                                className="dm-campaign-card__action"
                                onClick={() => openEditModal(c)}
                                aria-label="Editar campaña"
                              >
                                <Settings size={11} />
                              </button>
                              <button
                                type="button"
                                className="dm-campaign-card__action dm-campaign-card__action--danger"
                                onClick={() => openDeleteModal(c.campaignId, c.title)}
                                aria-label="Eliminar campaña"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                          <div className="dm-campaign-card__body">
                            <h3 className="dm-campaign-card__title">{c.title}</h3>
                            <p className="dm-campaign-card__system">{formatCampaignSystem(c.system)}</p>
                            <p className="dm-campaign-card__desc">
                              {c.summary || t("landing.noDescriptionYet")}
                            </p>
                            {c.loadWarning === "snapshot_unreadable" ? (
                              <p className="dm-muted-text" role="status">
                                <AlertTriangle size={12} aria-hidden="true" /> Snapshot unreadable; campaign metadata may be incomplete.
                              </p>
                            ) : null}
                            <div className="dm-campaign-card__meta">
                              <span><Clock size={10} /> Sesión {c.stats?.sessionsCount ?? 0}</span>
                              <span><Users size={10} /> {c.stats?.playersCount ?? 0} jugadores</span>
                            </div>
                            <div className="dm-campaign-card__footer">
                              <span>Última sesión: {lastUpdated}</span>
                              {c.progressPercent !== null && (
                                <span className="dm-campaign-card__pct">{c.progressPercent}%</span>
                              )}
                            </div>
                            {c.progressPercent !== null && (
                              <div className="dm-campaign-card__progress-track">
                                <div className="dm-campaign-card__progress-fill" style={{ width: `${c.progressPercent}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* Create card */}
                    <div className="dm-campaign-card dm-campaign-card--create" onClick={onCreateCampaign}>
                      <div className="dm-campaign-card--create__inner">
                        <div className="dm-campaign-card--create__icon"><Plus size={22} /></div>
                        <h3>Nueva campaña</h3>
                        <p>Crea desde cero</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* ── RESUMEN GENERAL + ACTIVIDAD RECIENTE ── */}
            <div className="dm-hub-twin-grid">
              <section className="dm-panel">
                <div className="dm-panel__header">
                  <h2 className="dm-panel__title">Resumen general</h2>
                </div>
                <div className="dm-summary-grid">
                  {[
                    { value: totalPlayersCount, label: t("landing.totalPlayers") },
                    { value: totalNpcsCount, label: "PNJs creados" },
                    { value: totalEntitiesCount, label: t("landing.totalEntities") },
                    { value: totalSessionsCount, label: "Sesiones realizadas" },
                    { value: playtimeLast30DaysLabel, label: "Tiempo de juego (30d)" },
                    { value: completedCampaigns, label: t("landing.completedCampaigns") },
                  ].map((s, i) => (
                    <div key={i} className="dm-summary-item">
                      <span className="dm-summary-item__value">{s.value}</span>
                      <span className="dm-summary-item__label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="dm-panel">
                <div className="dm-panel__header">
                  <h2 className="dm-panel__title">Actividad reciente</h2>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="dm-empty-state dm-empty-state--compact">
                    <FileText size={22} style={{ color: "var(--theme-accents-primary-foreground)", opacity: 0.55, marginBottom: "10px" }} />
                    <p>No hay actividad reciente.</p>
                    <span>Cuando crees campañas, sesiones, PNJs o notas, aparecerán aquí.</span>
                  </div>
                ) : (
                  <div className="dm-activity-list">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="dm-activity-row">
                        <div className="dm-activity-row__icon">{activityIcon(item.icon)}</div>
                        <span className="dm-activity-row__text">{item.text}</span>
                        <span className="dm-activity-row__time">{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <CampaignTemplateLibrarySection
              templates={campaignTemplates}
              campaigns={campaigns}
              loading={loading}
              importingTemplateId={importingTemplateId}
              t={t}
              onExplore={navigateToCampaignTemplate}
              onImport={onImportTemplate}
            />
    </div>
  );
}
