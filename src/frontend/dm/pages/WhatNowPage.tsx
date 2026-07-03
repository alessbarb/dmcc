import React, { useState } from "react";
import { MapPin, Shield, Calendar, Info, CheckSquare, AlertTriangle, Eye, Flame, Play } from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useNavigate, useParams } from "@tanstack/react-router";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export interface WhatNowPageProps {
  whatNow?: any;
  campaignState?: any;
  setSelectedEntity?: (entity: any) => void;
  setCurrentPage?: (page: string) => void;
}

export function WhatNowPage(props: WhatNowPageProps = {}) {
  const { campaignId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const store = useCampaignStore();
  const rawWhatNow = props.whatNow ?? store.whatNow;
  const whatNow = rawWhatNow ? {
    currentLocation: null,
    currentQuest: null,
    lastSession: null,
    preparationChecklist: [],
    partialKnowledgeAlerts: [],
    hiddenCriticalSecrets: [],
    pendingClues: [],
    unresolvedConsequences: [],
    ...rawWhatNow,
  } : null;
  const campaignState = props.campaignState ?? store.campaignState;
  const { updateCampaignSettings, updateEntity, archiveEntity } = store;
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [selectedEntity, setSelectedEntityLocal] = useState<any>(null);
  const setSelectedEntity = props.setSelectedEntity ?? setSelectedEntityLocal;
  const setCurrentPage = props.setCurrentPage ?? ((page: string) => {
    if (campaignId) navigate({ to: `/campaigns/${campaignId}/${page}` });
  });

  const completedTasks = campaignState?.campaign?.settings?.completedChecklistTasks || [];

  const handleToggleTask = async (taskText: string) => {
    let nextTasks: string[];
    if (completedTasks.includes(taskText)) {
      nextTasks = completedTasks.filter((t: string) => t !== taskText);
    } else {
      nextTasks = [...completedTasks, taskText];
    }
    try {
      await updateCampaignSettings({
        completedChecklistTasks: nextTasks
      });
    } catch (e) {
      console.error("Failed to update checklist tasks", e);
    }
  };

  if (!whatNow) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-muted)" }}>
        {t("common.loading")}
      </div>
    );
  }

  return (<>
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ fontWeight: "700" }}>{t("whatNowPage.title")}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
          {t("whatNowPage.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-3" style={{ gap: "16px" }}>
        <section className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}>
              <MapPin size={18} style={{ color: "var(--secondary)" }} /> {t("whatNowPage.currentLocation")}
            </h3>
            {whatNow.currentLocation ? (
              <div>
                <h4 style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--text-main)" }}>
                  {whatNow.currentLocation.title}
                </h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                  {whatNow.currentLocation.summary || t("whatNowPage.noSummary")}
                </p>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {t("whatNowPage.noActiveLocation")}
              </p>
            )}
          </div>
        </section>

        <section className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}>
              <Shield size={18} style={{ color: "var(--primary)" }} /> {t("whatNowPage.currentQuest")}
            </h3>
            {whatNow.currentQuest ? (
              <div>
                <h4 style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--text-main)" }}>
                  {whatNow.currentQuest.title}
                </h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                  {whatNow.currentQuest.summary || t("whatNowPage.noQuestDescription")}
                </p>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {t("whatNowPage.noActiveQuest")}
              </p>
            )}
          </div>
        </section>

        <section className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}>
              <Calendar size={18} style={{ color: "var(--color-info)" }} /> {t("whatNowPage.lastSession")}
            </h3>
            {whatNow.lastSession ? (
              <div>
                <h4 style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>
                  {t("whatNowPage.sessionTitle", { number: whatNow.lastSession.number, title: whatNow.lastSession.title })}
                </h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                  {whatNow.lastSession.summary || t("whatNowPage.noSessionSummary")}
                </p>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {t("whatNowPage.noClosedSessions")}
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2" style={{ gap: "20px" }}>
        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.05rem" }}>
            <CheckSquare size={18} style={{ color: "var(--primary)" }} /> {t("whatNowPage.prepTitle")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {whatNow.preparationChecklist.map((c: any, i: number) => (
              <label
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer",
                  textDecoration: c.done ? "line-through" : "none",
                  opacity: c.done ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
              >
                <input
                  type="checkbox"
                  checked={!!c.done}
                  onChange={() => handleToggleTask(c.task)}
                  style={{ transform: "scale(1.25)", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.88rem", flex: 1, color: "var(--text-main)" }}>{c.task}</span>
                <span className={`badge ${c.priority === "high" ? "badge-critical" : "badge-default"}`} style={{ fontSize: "0.7rem" }}>
                  {c.priority === "high" ? t("whatNowPage.priorityHigh") : c.priority === "normal" ? t("whatNowPage.priorityNormal") : c.priority === "low" ? t("whatNowPage.priorityLow") : c.priority}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.05rem" }}>
            <AlertTriangle size={18} style={{ color: "var(--warning)" }} /> {t("whatNowPage.confusionRisks")}
          </h3>
          {whatNow.partialKnowledgeAlerts.length === 0 ? (
            <div style={{ padding: "16px", backgroundColor: "#06070e", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                {t("whatNowPage.noConfusionRisks")}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {whatNow.partialKnowledgeAlerts.map((ka: any, i: number) => (
                <div key={i} style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", backgroundColor: "#1c1212" }}>
                  <span style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.88rem", color: "var(--color-critical)" }}>
                    <Info size={16} /> {t("whatNowPage.partialKnowledge")}
                  </span>
                  <p style={{ fontSize: "0.82rem", marginTop: "4px", color: "var(--text-main)" }}>{ka.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-2" style={{ gap: "20px" }}>
        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.05rem" }}>
            <Eye size={18} style={{ color: "var(--secondary)" }} /> {t("whatNowPage.criticalClues")}
          </h3>
          {whatNow.hiddenCriticalSecrets.length === 0 && whatNow.pendingClues.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t("whatNowPage.noCriticalClues")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {whatNow.hiddenCriticalSecrets.map((s: any) => (
                <div key={s.entityId} style={{ padding: "10px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "600", cursor: "pointer", fontSize: "0.88rem" }} onClick={() => setSelectedEntity(s)}>{s.title}</span>
                  <span className="badge badge-critical" style={{ fontSize: "0.65rem" }}>{t("whatNowPage.criticalSecret")}</span>
                </div>
              ))}
              {whatNow.pendingClues.map((c: any) => (
                <div key={c.entityId} style={{ padding: "10px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "600", cursor: "pointer", fontSize: "0.88rem" }} onClick={() => setSelectedEntity(c)}>{c.title}</span>
                  <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>{t("whatNowPage.preparedClue")}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h3 style={{ fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.05rem" }}>
            <Flame size={18} style={{ color: "var(--color-critical)" }} /> {t("whatNowPage.readyConsequences")}
          </h3>
          {whatNow.unresolvedConsequences.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t("whatNowPage.noPendingConsequences")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {whatNow.unresolvedConsequences.map((con: any) => (
                <div key={con.entityId} style={{ padding: "12px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-main)", cursor: "pointer" }} onClick={() => setSelectedEntity(con)}>
                    {con.title}
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {con.summary || t("whatNowPage.pendingConsequence")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {setCurrentPage && (
        <section className="card" style={{ border: "1px dashed var(--border-color)" }}>
          <h3 style={{ fontWeight: "700", marginBottom: "12px", fontSize: "1rem" }}>{t("whatNowPage.quickActions")}</h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-primary" onClick={() => setCurrentPage("session")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Play size={16} /> {t("whatNowPage.openSessionControl")}
            </button>
          </div>
        </section>
      )}
    </div>
    {selectedEntity && campaignState && (
      <EntityDetailModal
        selectedEntity={selectedEntity}
        campaignState={campaignState}
        onClose={() => setSelectedEntityLocal(null)}
        onEdit={async (entityId, updates) => {
          await updateEntity(entityId, updates);
          setSelectedEntityLocal({ ...selectedEntity, ...updates });
        }}
        onArchive={async (entityId) => {
          await archiveEntity(entityId);
          setSelectedEntityLocal(null);
        }}
        onVisibilityChange={async (entityId, visibility) => {
          await updateEntity(entityId, { visibility });
          setSelectedEntityLocal({ ...selectedEntity, visibility });
        }}
        addToast={addToast}
      />
    )}
  </>);
}
