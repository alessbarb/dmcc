import React from "react";
import { Activity, Bell, BookOpen, Clock, FileText, LayoutGrid, Map, Settings, Sparkles, Users } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import type { DmHubDashboard } from "./dmHubTypes.js";

interface DmHubSidebarProps {
  activeTables: DmHubDashboard["activeTables"];
  alerts: DmHubDashboard["alerts"];
  triggerMysticalTransition: (campaignId: string) => void;
  navigateToActiveSession: (campaignId: string) => void;
  onQuickCanvas: () => void;
  onQuickNpcs: () => void;
  onQuickLibrary: () => void;
  onQuickRules: () => void;
  onQuickMap: () => void;
  onQuickTimeline: () => void;
  onQuickTemplates: () => void;
  onQuickSettings: () => void;
}

export function DmHubSidebar({
  activeTables, alerts, triggerMysticalTransition, navigateToActiveSession, onQuickCanvas, onQuickNpcs,
  onQuickLibrary, onQuickRules, onQuickMap, onQuickTimeline, onQuickTemplates, onQuickSettings,
}: DmHubSidebarProps) {
  const { t } = useTranslation();
  return (
    <div className="dm-hub-grid__right">

            {/* ── MESAS ACTIVAS ── */}
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div className="dm-panel__title-group">
                  <Activity size={16} style={{ color: "var(--accent)" }} />
                  <h2 className="dm-panel__title">Mesas activas ahora</h2>
                </div>
                <button type="button" className="dm-panel__link" disabled={activeTables.length === 0}>Ver todas</button>
              </div>
              {activeTables.length === 0 ? (
                <div className="dm-empty-state dm-empty-state--compact">
                  <Activity size={22} style={{ color: "var(--accent)", opacity: 0.55, marginBottom: "10px" }} />
                  <p>No hay mesas activas ahora.</p>
                  <span>Cuando una campaña tenga una sesión activa, aparecerá aquí.</span>
                </div>
              ) : (
                <div className="dm-tables-list">
                  {activeTables.map((table) => (
                    <div key={table.id} className="dm-table-row" onClick={() => triggerMysticalTransition(table.campaignId)}>
                      <div className="dm-table-row__cover" />
                      <div className="dm-table-row__info">
                        <div className="dm-table-row__title-line">
                          <span className="dm-table-row__name">{table.tableName}</span>
                          <span className={`dm-badge dm-badge--${table.status === "running" ? "active" : "paused"}`}>
                            {table.status === "running" ? "EN CURSO" : "PAUSADA"}
                          </span>
                        </div>
                        <span className="dm-table-row__campaign">{table.campaignTitle}</span>
                        <span className="dm-table-row__session">{table.sessionTitle}</span>
                      </div>
                      <div className="dm-table-row__stats">
                        {table.elapsed && <span className="dm-table-row__time"><Clock size={10} /> {table.elapsed}</span>}
                        <span className="dm-table-row__players"><Users size={10} /> {table.playersPresent}/{table.playersTotal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", marginTop: "14px" }}
                disabled={activeTables.length === 0}
                onClick={() => {
                  const firstTable = activeTables[0];
                  if (firstTable) navigateToActiveSession(firstTable.campaignId);
                }}
              >
                Gestionar mesas
              </button>
            </section>

            {/* ── ALERTAS Y PENDIENTES ── */}
            <section className="dm-panel">
              <div className="dm-panel__header">
                <div className="dm-panel__title-group">
                  <Bell size={16} style={{ color: "var(--accent)" }} />
                  <h2 className="dm-panel__title">Alertas y pendientes</h2>
                </div>
                <button type="button" className="dm-panel__link" disabled={alerts.length === 0}>Ver todas</button>
              </div>
              {alerts.length === 0 ? (
                <div className="dm-empty-state dm-empty-state--compact">
                  <Bell size={22} style={{ color: "var(--accent)", opacity: 0.55, marginBottom: "10px" }} />
                  <p>Todo está al día.</p>
                  <span>No tienes pendientes importantes ahora mismo.</span>
                </div>
              ) : (
                <div className="dm-alerts-list">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="dm-alert-row">
                      <span className="dm-alert-row__label">{alert.label}</span>
                      <span className={`dm-alert-row__badge ${alert.severity}`}>{alert.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── ACCESOS RÁPIDOS ── */}
            <section className="dm-panel">
              <div className="dm-panel__header">
                <h2 className="dm-panel__title">Accesos rápidos</h2>
              </div>
              <div className="dm-quick-grid">
                {[
                  { icon: <LayoutGrid size={18} />, label: "Abrir Canvas", action: onQuickCanvas },
                  { icon: <Users size={18} />, label: "Gestionar PNJs", action: onQuickNpcs },
                  { icon: <BookOpen size={18} />, label: "Biblioteca", action: onQuickLibrary },
                  { icon: <FileText size={18} />, label: t("landing.rulesLabel"), action: onQuickRules },
                  { icon: <Map size={18} />, label: "Mapa del mundo", action: onQuickMap },
                  { icon: <Clock size={18} />, label: t("landing.timelineLabel"), action: onQuickTimeline },
                  { icon: <Sparkles size={18} />, label: "Plantillas", action: onQuickTemplates },
                  { icon: <Settings size={18} />, label: t("landing.settingsLabel"), action: onQuickSettings },
                ].map((item, i) => (
                  <button key={i} type="button" className="dm-quick-btn" onClick={item.action}>
                    <span className="dm-quick-btn__icon">{item.icon}</span>
                    <span className="dm-quick-btn__label">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
    </div>
  );
}
