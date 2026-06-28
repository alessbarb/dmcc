import React, { useState, useRef } from "react";
import {
  Play,
  StickyNote,
  Eye,
  GitMerge,
  Zap,
  UserPlus,
  X,
  Clock,
  ChevronRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import { createId } from "@shared/ids.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";


export interface SessionPageProps {
  campaignState?: any;
  activeSession?: any;
  quickCaptureType?: string;
  setQuickCaptureType?: (t: string) => void;
  quickCaptureText?: string;
  setQuickCaptureText?: (t: string) => void;
  sessionSummary?: string;
  setSessionSummary?: (s: string) => void;
  handleQuickCaptureSubmit?: (e: React.SyntheticEvent) => Promise<void>;
  startSession?: (title: string) => Promise<any>;
  closeSession?: (sessionId: string, summary: string) => Promise<any>;
  createEntity?: (...args: any[]) => Promise<any>;
  createRelation?: (...args: any[]) => Promise<any>;
  revealClue?: (...args: any[]) => Promise<any>;
  recordSessionEvent?: (...args: any[]) => Promise<any>;
  addToast?: (msg: string, kind?: ToastKind) => void;
  setCurrentPage?: (page: string) => void;
  setIsEntityModalOpen?: (open: boolean) => void;
  setIsRelationModalOpen?: (open: boolean) => void;
}

// ── types ────────────────────────────────────────────────────────────────────

type ActionId =
  | "nota"
  | "pista"
  | "decision"
  | "consecuencia"
  | "pnj"
  | "cerrar";

interface ActionDef {
  id: ActionId;
  label: string;
  icon: React.ReactNode;
  accentVar: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(startedAt: string | undefined): string {
  if (!startedAt) return "—";
  const ms = Date.now() - new Date(startedAt).getTime();
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ── sub-panels ───────────────────────────────────────────────────────────────

function PanelNotaRapida({
  createEntity,
  recordSessionEvent,
  activeSession,
  addToast,
  onClose,
}: {
  createEntity: (...args: any[]) => Promise<any>;
  recordSessionEvent: (...args: any[]) => Promise<any>;
  activeSession: any;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const noteEntityId = createId("ent");
      const sessionId = activeSession?.sessionId;

      await createEntity({
        entityId: noteEntityId,
        entityType: "note",
        title: text.substring(0, 40) + (text.length > 40 ? "…" : ""),
        content: text,
        status: "active",
        createdInSessionId: sessionId,
      });

      await recordSessionEvent(sessionId, {
        type: "note_recorded",
        title: t("toasts.noteRecorded"),
        description: text.substring(0, 80) + (text.length > 80 ? "…" : ""),
        relatedEntityIds: [noteEntityId],
      });

      addToast(t("toasts.noteRecorded"), "success");
      setText("");
    } catch (err: any) {
      addToast(t("toasts.noteSaveError", { error: err.message }), "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="nota-text">
          {t("sessionPage.noteLabel")}
        </label>
        <textarea
          id="nota-text"
          className="form-textarea"
          placeholder={t("sessionPage.notePlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "100px" }}
        />
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("common.saving") : t("players.saveNote")}
        </button>
      </div>
    </form>
  );
}

function PanelRevelarPista({
  campaignState,
  activeSession,
  revealClue,
  addToast,
  onClose,
}: {
  campaignState: any;
  activeSession: any;
  revealClue: (...args: any[]) => Promise<any>;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const clues = (campaignState?.entities ?? []).filter(
    (e: any) =>
      e.entityType === "clue" &&
      !e.archived &&
      (e.status === "prepared" || e.status === "hidden")
  );

  const [selectedClue, setSelectedClue] = useState("");
  const [audience, setAudience] = useState<"party" | "character">("party");
  const [characterId, setCharacterId] = useState("");
  const [how, setHow] = useState("");
  const [busy, setBusy] = useState(false);

  const characters = (campaignState?.entities ?? []).filter(
    (e: any) => e.entityType === "player_character" && !e.archived
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedClue) return;
    setBusy(true);
    const audiencePayload =
      audience === "character" && characterId
        ? { kind: "characters" as const, characterEntityIds: [characterId] }
        : { kind: "party" as const };
    await revealClue(activeSession?.sessionId, selectedClue, audiencePayload, how);
    addToast(t("toasts.clueRevealed"), "success");
    setBusy(false);
    onClose();
  };

  if (clues.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "24px 0",
          color: "var(--text-muted)",
        }}
      >
        <Eye size={32} style={{ opacity: 0.4 }} />
        <p>{t("sessionPage.noUnrevealedClues")}</p>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.close")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="pista-select">
          {t("sessionPage.clueToReveal")}
        </label>
        <select
          id="pista-select"
          className="form-select"
          value={selectedClue}
          onChange={(e) => setSelectedClue(e.target.value)}
          required
        >
          <option value="">{t("sessionPage.selectClue")}</option>
          {clues.map((c: any) => (
            <option key={c.entityId} value={c.entityId}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t("sessionPage.audience")}</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className={`btn btn-sm ${audience === "party" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setAudience("party")}
          >
            {t("sessionPage.wholeParty")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${audience === "character" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setAudience("character")}
          >
            {t("sessionPage.specificCharacter")}
          </button>
        </div>
      </div>

      {audience === "character" && (
        <div className="form-group">
          <label className="form-label" htmlFor="pista-character">
            {t("sessionPage.character")}
          </label>
          <select
            id="pista-character"
            className="form-select"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            required
          >
            <option value="">{t("sessionPage.selectCharacter")}</option>
            {characters.map((c: any) => (
              <option key={c.entityId} value={c.entityId}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="pista-how">
          {t("sessionPage.howRevealedOptional")}
        </label>
        <input
          id="pista-how"
          type="text"
          className="form-input"
          placeholder={t("sessionPage.howRevealedPlaceholder")}
          value={how}
          onChange={(e) => setHow(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy || !selectedClue}>
          {busy ? t("sessionPage.revealing") : t("sessionPage.revealClueButton")}
        </button>
      </div>
    </form>
  );
}

function PanelDecision({
  campaignState,
  createEntity,
  createRelation,
  recordSessionEvent,
  activeSession,
  addToast,
  onClose,
}: {
  campaignState: any;
  createEntity: (...args: any[]) => Promise<any>;
  createRelation: (...args: any[]) => Promise<any>;
  recordSessionEvent: (...args: any[]) => Promise<any>;
  activeSession: any;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [decision, setDecision] = useState("");
  const [affectedIds, setAffectedIds] = useState<string[]>([]);
  const [immediateConsequence, setImmediateConsequence] = useState("");
  const [createPending, setCreatePending] = useState(false);
  const [pendingTitle, setPendingTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const entities = (campaignState?.entities ?? []).filter(
    (e: any) => !e.archived
  );

  const toggleAffected = (id: string) => {
    setAffectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;
    setBusy(true);

    try {
      const decisionEntityId = createId("ent");
      const sessionId = activeSession?.sessionId;

      // 1. Create Decision Entity
      await createEntity({
        entityId: decisionEntityId,
        entityType: "decision",
        title: decision.substring(0, 50) + (decision.length > 50 ? "…" : ""),
        summary: immediateConsequence || undefined,
        content: decision,
        status: "made",
        createdInSessionId: sessionId,
        metadata: {
          decisionText: decision,
          sessionId: sessionId || "sess_unknown",
          madeByCharacterIds: affectedIds,
          immediateConsequence: immediateConsequence || undefined,
        },
      });

      // 2. Record Session Event for the decision
      await recordSessionEvent(sessionId, {
        type: "decision_made",
        title: t("session.decisionMade", { decision: decision.substring(0, 40), suffix: decision.length > 40 ? "…" : "" }),
        description: decision,
        relatedEntityIds: [decisionEntityId, ...affectedIds],
      });

      // 3. Create Consequence if checked
      if (createPending && pendingTitle.trim()) {
        const consequenceEntityId = createId("ent");
        await createEntity({
          entityId: consequenceEntityId,
          entityType: "consequence",
          title: pendingTitle.trim(),
          summary: t("session.decisionConsequence"),
          status: "pending",
          createdInSessionId: sessionId,
          metadata: {
            originEntityId: decisionEntityId,
          },
        });

        // 3.1. Create relation "causes" connecting decision to consequence
        await createRelation({
          sourceEntityId: decisionEntityId,
          targetEntityId: consequenceEntityId,
          relationType: "causes",
          status: "active",
          description: t("session.decisionCausesConsequence"),
          visibility: { kind: "dm_only" },
        });

        // 3.2. Record Session Event for the consequence
        await recordSessionEvent(sessionId, {
          type: "consequence_created",
          title: `Consecuencia creada: ${pendingTitle.trim()}`,
          description: t("session.pendingConsequence", { decision: decision.substring(0, 40) }),
          relatedEntityIds: [consequenceEntityId, decisionEntityId],
        });
      }

      addToast(t("toasts.decisionRecorded"), "success");
    } catch (err: any) {
      addToast(t("toasts.decisionError", { error: err.message }), "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="decision-text">
          {t("sessionPage.whatDidTheyDecide")}
        </label>
        <textarea
          id="decision-text"
          className="form-textarea"
          placeholder={t("sessionPage.decidePlaceholder")}
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "80px" }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="decision-consequence">
          {t("sessionPage.immediateConsequence")}
        </label>
        <input
          id="decision-consequence"
          type="text"
          className="form-input"
          placeholder={t("sessionPage.immConsequencePlaceholder")}
          value={immediateConsequence}
          onChange={(e) => setImmediateConsequence(e.target.value)}
        />
      </div>

      {entities.length > 0 && (
        <div className="form-group">
          <label className="form-label">{t("sessionPage.affectedEntities")}</label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              maxHeight: "120px",
              overflowY: "auto",
              padding: "4px",
            }}
          >
            {entities.slice(0, 30).map((e: any) => (
              <button
                key={e.entityId}
                type="button"
                className={`btn btn-sm ${affectedIds.includes(e.entityId) ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleAffected(e.entityId)}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                {e.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="form-group"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: createPending ? "12px" : "20px",
        }}
      >
        <input
          id="create-pending"
          type="checkbox"
          checked={createPending}
          onChange={(e) => setCreatePending(e.target.checked)}
          style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
        />
        <label
          htmlFor="create-pending"
          className="form-label"
          style={{ marginBottom: 0, cursor: "pointer" }}
        >
          {t("sessionPage.createPendingConsequence")}
        </label>
      </div>

      {createPending && (
        <div className="form-group">
          <label className="form-label" htmlFor="pending-title">
            {t("sessionPage.pendingConsequenceTitle")}
          </label>
          <input
            id="pending-title"
            type="text"
            className="form-input"
            placeholder={t("session.exampleConsequence")}
            value={pendingTitle}
            onChange={(e) => setPendingTitle(e.target.value)}
            required={createPending}
            autoFocus={createPending}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("common.saving") : t("session.recordDecision")}
        </button>
      </div>
    </form>
  );
}

function PanelConsecuencia({
  campaignState,
  createEntity,
  recordSessionEvent,
  activeSession,
  addToast,
  onClose,
}: {
  campaignState: any;
  createEntity: (...args: any[]) => Promise<any>;
  recordSessionEvent: (...args: any[]) => Promise<any>;
  activeSession: any;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [questId, setQuestId] = useState("");
  const [severity, setSeverity] = useState<"high" | "medium" | "low">("medium");
  const [busy, setBusy] = useState(false);

  const quests = (campaignState?.entities ?? []).filter(
    (e: any) => e.entityType === "quest" && !e.archived
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const consequenceEntityId = createId("ent");
      const sessionId = activeSession?.sessionId;

      await createEntity({
        entityId: consequenceEntityId,
        entityType: "consequence",
        title: title.trim(),
        status: "pending",
        importance: severity === "high" ? "high" : severity === "medium" ? "normal" : "low",
        createdInSessionId: sessionId,
        metadata: {
          originEntityId: questId || undefined,
          severity,
        },
      });

      await recordSessionEvent(sessionId, {
        type: "consequence_created",
        title: t("toasts.consequenceCreated"),
        description: `${t("sessionPage.severity")}: ${severity}`,
        relatedEntityIds: [consequenceEntityId, ...(questId ? [questId] : [])],
      });

      addToast(t("toasts.consequenceCreated"), "success");
    } catch (err: any) {
      addToast(t("toasts.captureError", { error: err.message }), "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="cons-title">
          {t("sessionPage.pendingConsequenceTitle")}
        </label>
        <input
          id="cons-title"
          type="text"
          className="form-input"
          placeholder={t("session.exampleNote")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t("sessionPage.severity")}</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {(["low", "medium", "high"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${severity === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSeverity(s)}
            >
              {s === "low" ? t("sessionPage.severityLow") : s === "medium" ? t("sessionPage.severityMedium") : t("sessionPage.severityHigh")}
            </button>
          ))}
        </div>
      </div>

      {quests.length > 0 && (
        <div className="form-group">
          <label className="form-label" htmlFor="cons-quest">
            {t("sessionPage.questAffected")}
          </label>
          <select
            id="cons-quest"
            className="form-select"
            value={questId}
            onChange={(e) => setQuestId(e.target.value)}
          >
            <option value="">{t("sessionPage.noSpecificQuest")}</option>
            {quests.map((q: any) => (
              <option key={q.entityId} value={q.entityId}>
                {q.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("common.saving") : t("session.createConsequence")}
        </button>
      </div>
    </form>
  );
}

function PanelPNJRapido({
  createEntity,
  activeSession,
  addToast,
  onClose,
}: {
  createEntity: (...args: any[]) => Promise<any>;
  activeSession: any;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await createEntity({
      entityType: "npc",
      title: name.trim(),
      subtitle: role.trim(),
      summary: description.trim(),
      status: "known",
      importance: "normal",
      createdInSessionId: activeSession?.sessionId,
      metadata: {
        role: role.trim(),
      },
    });
    addToast(t("toasts.npcCreated", { name: name.trim() }), "success");
    setBusy(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <div className="form-group">
          <label className="form-label" htmlFor="pnj-name">
            {t("sessionPage.npcNameLabel")}
          </label>
          <input
            id="pnj-name"
            type="text"
            className="form-input"
            placeholder={t("sessionPage.npcNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pnj-role">
            {t("sessionPage.npcRoleLabel")}
          </label>
          <input
            id="pnj-role"
            type="text"
            className="form-input"
            placeholder={t("sessionPage.npcRolePlaceholder")}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pnj-desc">
          {t("sessionPage.briefDescription")}
        </label>
        <input
          id="pnj-desc"
          type="text"
          className="form-input"
          placeholder={t("sessionPage.npcDescPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("common.saving") : t("session.createNpc")}
        </button>
      </div>
    </form>
  );
}

function PanelCerrarSesion({
  activeSession,
  closeSession,
  sessionSummary,
  setSessionSummary,
  setCurrentPage,
  addToast,
  onClose,
}: {
  activeSession: any;
  closeSession: (id: string, summary: string) => Promise<any>;
  sessionSummary: string;
  setSessionSummary: (s: string) => void;
  setCurrentPage: (p: string) => void;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!sessionSummary.trim()) return;
    setBusy(true);
    await closeSession(activeSession.sessionId, sessionSummary.trim());
    addToast(t("toasts.sessionClosed"), "success");
    setSessionSummary("");
    setBusy(false);
    setCurrentPage("dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 14px",
          backgroundColor: "var(--color-warning-bg)",
          borderRadius: "var(--radius-md)",
          border: "1px solid hsla(38, 95%, 55%, 0.25)",
          marginBottom: "20px",
        }}
      >
        <AlertTriangle size={16} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.87rem", color: "var(--color-warning)" }}>
          {t("sessionPage.closingWarning")}
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="close-summary">
          Resumen de la sesión
        </label>
        <textarea
          id="close-summary"
          className="form-textarea"
          placeholder={t("session.exampleSummary")}
          value={sessionSummary}
          onChange={(e) => setSessionSummary(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "120px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-danger" disabled={busy || !sessionSummary.trim()}>
          {busy ? t("sessionPage.closingButton") : t("session.closeAndSave")}
        </button>
      </div>
    </form>
  );
}

// ── quick capture bar ────────────────────────────────────────────────────────

type ParsedCapture =
  | { kind: "note"; text: string }
  | { kind: "npc"; name: string; role: string }
  | { kind: "decision"; text: string }
  | { kind: "consequence"; text: string }
  | { kind: "clue" }
  | { kind: "unknown" };

function parseCapture(raw: string): ParsedCapture {
  const s = raw.trim();
  const lower = s.toLowerCase();
  if (lower.startsWith("+pnj ") || lower.startsWith("+npc ")) {
    const body = s.slice(5).trim();
    const [name, role = ""] = body.split("|").map((x) => x.trim());
    return { kind: "npc", name, role };
  }
  if (lower.startsWith("+decision ") || lower.startsWith("+d ")) {
    const text = s.slice(lower.startsWith("+d ") ? 3 : 10).trim();
    return { kind: "decision", text };
  }
  if (lower.startsWith("+consecuencia ") || lower.startsWith("+consequence ") || lower.startsWith("+c ")) {
    const offset = lower.startsWith("+c ") ? 3 : lower.startsWith("+consecuencia ") ? 14 : 13;
    return { kind: "consequence", text: s.slice(offset).trim() };
  }
  if (lower === "+pista" || lower === "+clue" || lower === "+reveal") {
    return { kind: "clue" };
  }
  if (lower.startsWith("+nota ") || lower.startsWith("+note ") || lower.startsWith("+n ") || lower.startsWith("+h ")) {
    const offset = lower.startsWith("+n ") || lower.startsWith("+h ") ? 3 : lower.startsWith("+nota ") ? 6 : 6;
    return { kind: "note", text: s.slice(offset).trim() };
  }
  if (!s.startsWith("+")) {
    return { kind: "note", text: s };
  }
  return { kind: "unknown" };
}

function QuickCaptureBar({
  campaignState,
  activeSession,
  createEntity,
  createRelation,
  recordSessionEvent,
  revealClue,
  addToast,
  onOpenCluePanel,
}: {
  campaignState: any;
  activeSession: any;
  createEntity: (...args: any[]) => Promise<any>;
  createRelation: (...args: any[]) => Promise<any>;
  recordSessionEvent: (...args: any[]) => Promise<any>;
  revealClue: (...args: any[]) => Promise<any>;
  addToast: (msg: string, kind?: ToastKind) => void;
  onOpenCluePanel: () => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    const parsed = parseCapture(value);
    if (parsed.kind === "unknown") {
      addToast(t("toasts.unknownCommand"), "error");
      return;
    }
    if (parsed.kind === "clue") {
      onOpenCluePanel();
      setValue("");
      return;
    }
    setBusy(true);
    const sessionId = activeSession?.sessionId;
    try {
      if (parsed.kind === "note") {
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "note",
          title: parsed.text.substring(0, 40) + (parsed.text.length > 40 ? "…" : ""),
          content: parsed.text,
          status: "active",
          createdInSessionId: sessionId,
        });
        await recordSessionEvent(sessionId, {
          type: "note_recorded",
          title: parsed.text.substring(0, 60) + (parsed.text.length > 60 ? "…" : ""),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.noteRecorded"), "success");
      } else if (parsed.kind === "npc") {
        if (!parsed.name) { addToast(t("toasts.npcNameRequired"), "error"); return; }
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "npc",
          title: parsed.name,
          subtitle: parsed.role,
          status: "known",
          importance: "normal",
          createdInSessionId: sessionId,
          metadata: { role: parsed.role },
        });
        await recordSessionEvent(sessionId, {
          type: "npc_introduced",
          title: t("sessionPage.quickNPCIntroduced", { name: parsed.name }),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.npcCreated", { name: parsed.name }), "success");
      } else if (parsed.kind === "decision") {
        if (!parsed.text) { addToast(t("toasts.decisionTextRequired"), "error"); return; }
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "decision",
          title: parsed.text.substring(0, 50) + (parsed.text.length > 50 ? "…" : ""),
          content: parsed.text,
          status: "made",
          createdInSessionId: sessionId,
          metadata: { decisionText: parsed.text, sessionId: sessionId || "sess_unknown", madeByCharacterIds: [] },
        });
        await recordSessionEvent(sessionId, {
          type: "decision_made",
          title: t("sessionPage.decisionPrefix", { text: parsed.text.substring(0, 50) }),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.noteRecorded"), "success");
      } else if (parsed.kind === "consequence") {
        if (!parsed.text) { addToast(t("toasts.consequenceTextRequired"), "error"); return; }
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "consequence",
          title: parsed.text,
          status: "pending",
          importance: "normal",
          createdInSessionId: sessionId,
          metadata: {},
        });
        await recordSessionEvent(sessionId, {
          type: "consequence_created",
          title: t("sessionPage.consequencePrefix", { text: parsed.text }),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.consequenceCreated"), "success");
      }
      setValue("");
      inputRef.current?.focus();
    } catch (err: any) {
      addToast(t("toasts.captureError", { error: err.message }), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label={t("session.quickCaptureLabel")}>
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          padding: "10px 14px",
          backgroundColor: "var(--bg-input)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          transition: "border-color var(--transition-fast)",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)";
        }}
      >
        <Terminal size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("session.quickCapturePlaceholder")}
          disabled={busy}
          autoComplete="off"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "0.92rem",
            color: "var(--text-main)",
            fontFamily: "inherit",
          }}
        />
        {value.trim() && (
          <button
            type="submit"
            disabled={busy}
            style={{
              background: "var(--primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#fff",
              fontSize: "0.78rem",
              fontWeight: "700",
              padding: "4px 10px",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            {busy ? "…" : "↵"}
          </button>
        )}
      </div>
      <p
        style={{
          fontSize: "0.73rem",
          color: "var(--text-muted)",
          marginTop: "5px",
          paddingLeft: "4px",
          opacity: 0.7,
        }}
      >
        {"+nota · +pnj nombre | rol · +decision · +consecuencia · +pista"}
      </p>
    </form>
  );
}

// ── session event feed ────────────────────────────────────────────────────────

const EVENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  note_recorded: <StickyNote size={13} />,
  npc_introduced: <UserPlus size={13} />,
  clue_revealed: <Eye size={13} />,
  decision_made: <GitMerge size={13} />,
  consequence_created: <Zap size={13} />,
  custom: <ChevronRight size={13} />,
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  note_recorded: "var(--color-info)",
  npc_introduced: "var(--color-success)",
  clue_revealed: "var(--secondary)",
  decision_made: "var(--primary)",
  consequence_created: "var(--color-warning)",
  custom: "var(--text-muted)",
};

function formatRelative(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours}h`;
}

function SessionEventFeed({
  sessionEvents,
  sessionId,
}: {
  sessionEvents: any[];
  sessionId: string;
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const events = sessionEvents
    .filter((ev: any) => ev.sessionId === sessionId)
    .sort((a: any, b: any) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 20);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <Clock size={13} />
          {t("session.eventFeedTitle")}
          {events.length > 0 && (
            <span
              style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                borderRadius: "var(--radius-full)",
                padding: "1px 7px",
                fontSize: "0.72rem",
                fontWeight: "800",
              }}
            >
              {events.length}
            </span>
          )}
        </span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!collapsed && (
        <div style={{ borderTop: "1px solid var(--border-color)" }}>
          {events.length === 0 ? (
            <p
              style={{
                padding: "20px 16px",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {t("session.noEventsYet")}
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {events.map((ev: any, i: number) => {
                const color = EVENT_TYPE_COLORS[ev.type] ?? EVENT_TYPE_COLORS.custom;
                const icon = EVENT_TYPE_ICONS[ev.type] ?? EVENT_TYPE_ICONS.custom;
                return (
                  <li
                    key={ev.id ?? i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "9px 16px",
                      borderBottom: i < events.length - 1 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <span
                      style={{
                        color,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: "0.85rem",
                        color: "var(--text-main)",
                        lineHeight: 1.35,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={ev.title}
                    >
                      {ev.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.73rem",
                        color: "var(--text-muted)",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      {ev.occurredAt ? formatRelative(ev.occurredAt) : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export function SessionPage(props: SessionPageProps = {}) {
  const { t } = useTranslation();
  const { campaignId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const store = useCampaignStore();
  const { addToast: toastAdd } = useToast();
  const [sessionSummaryLocal, setSessionSummaryLocal] = useState("");

  const campaignState = props.campaignState ?? store.campaignState;
  const sessionEvents: any[] = (campaignState as any)?.sessionEvents ?? [];
  const activeSession = props.activeSession ?? (campaignState?.sessions ?? []).find((s: any) => s.status === "active");
  const sessionSummary = props.sessionSummary ?? sessionSummaryLocal;
  const setSessionSummary = props.setSessionSummary ?? setSessionSummaryLocal;
  const startSession = props.startSession ?? store.startSession;
  const closeSession = props.closeSession ?? store.closeSession;
  const createEntity = props.createEntity ?? store.createEntity;
  const createRelation = props.createRelation ?? store.createRelation;
  const revealClue = props.revealClue ?? store.revealClue;
  const recordSessionEvent = props.recordSessionEvent ?? store.recordSessionEvent;
  const addToast = props.addToast ?? toastAdd;
  const setCurrentPage = props.setCurrentPage ?? ((page: string) => {
    if (campaignId) navigate({ to: `/campaigns/${campaignId}/${page}` });
  });

  const [newTitle, setNewTitle] = useState("");
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);

  // ── no active session ────────────────────────────────────────────────────

  if (!activeSession) {
    const recentSessions = [...(campaignState?.sessions ?? [])]
      .filter((s: any) => s.status === "closed" || s.status === "archived")
      .sort(
        (a: any, b: any) =>
          new Date(b.endedAt ?? b.updatedAt ?? 0).getTime() -
          new Date(a.endedAt ?? a.updatedAt ?? 0).getTime()
      )
      .slice(0, 5);

    const nextNumber = (campaignState?.sessions?.length ?? 0) + 1;

    const handleStart = async (e: React.SubmitEvent) => {
      e.preventDefault();
      const title = newTitle.trim() || t("session.sessionNumber", { number: nextNumber });
      await startSession(title);
      setNewTitle("");
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Start session card */}
        <section
          className="card"
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            width: "100%",
            textAlign: "center",
            padding: "48px 40px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--primary-light)",
              border: "1px solid hsla(255, 85%, 65%, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Play size={28} style={{ color: "var(--primary)" }} />
          </div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: "800",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Iniciar nueva sesión
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: "28px",
              fontSize: "0.93rem",
            }}
          >
            Sesión #{nextNumber} de la campaña
          </p>
          <form onSubmit={handleStart}>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label" htmlFor="session-title-input">
                Título de la sesión
              </label>
              <input
                id="session-title-input"
                type="text"
                className="form-input"
                placeholder={t("session.sessionNumber", { number: nextNumber })}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ fontSize: "1rem" }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
            >
              <Play size={16} /> Iniciar sesión #{nextNumber}
            </button>
          </form>
        </section>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <section style={{ maxWidth: "520px", margin: "0 auto", width: "100%" }}>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                marginBottom: "14px",
              }}
            >
              Sesiones anteriores
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentSessions.map((s: any) => (
                <div
                  key={s.sessionId}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "14px 16px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "0.93rem",
                        marginBottom: "4px",
                        color: "var(--text-main)",
                      }}
                    >
                      {s.number ? `#${s.number} ` : ""}{s.title}
                    </div>
                    {s.summary && (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {s.summary}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {s.endedAt
                      ? new Date(s.endedAt).toLocaleDateString("es", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── active session ────────────────────────────────────────────────────────

  const actions: ActionDef[] = [
    {
      id: "nota",
      label: t("session.quickNote"),
      icon: <StickyNote size={22} />,
      accentVar: "var(--color-info)",
    },
    {
      id: "pista",
      label: t("sessionPage.revealClueButton"),
      icon: <Eye size={22} />,
      accentVar: "var(--secondary)",
    },
    {
      id: "decision",
      label: t("session.recordDecision"),
      icon: <GitMerge size={22} />,
      accentVar: "var(--primary)",
    },
    {
      id: "consecuencia",
      label: t("session.createConsequence"),
      icon: <Zap size={22} />,
      accentVar: "var(--color-warning)",
    },
    {
      id: "pnj",
      label: t("session.createQuickNpc"),
      icon: <UserPlus size={22} />,
      accentVar: "var(--color-success)",
    },
    {
      id: "cerrar",
      label: t("session.closeSession"),
      icon: <X size={22} />,
      accentVar: "var(--color-critical)",
    },
  ];

  const selectedAction = actions.find((a) => a.id === activeAction);

  const elapsed = formatElapsed(activeSession.startedAt);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Session top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "16px 20px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          borderLeft: "3px solid var(--color-success)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "var(--color-success)",
              boxShadow: "0 0 8px var(--color-success)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "1.1rem",
                letterSpacing: "-0.01em",
                color: "var(--text-main)",
              }}
            >
              {activeSession.title}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              Sesión {activeSession.number ? `#${activeSession.number}` : ""}{" "}
              · Iniciada a las{" "}
              {activeSession.startedAt
                ? new Date(activeSession.startedAt).toLocaleTimeString("es", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            fontSize: "0.88rem",
            fontWeight: "700",
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          <Clock size={14} />
          {elapsed}
        </div>
      </div>

      {/* Quick capture bar */}
      <QuickCaptureBar
        campaignState={campaignState}
        activeSession={activeSession}
        createEntity={createEntity}
        createRelation={createRelation}
        recordSessionEvent={recordSessionEvent}
        revealClue={revealClue}
        addToast={addToast}
        onOpenCluePanel={() => setActiveAction("pista")}
      />

      {/* Session event feed */}
      <SessionEventFeed
        sessionEvents={sessionEvents}
        sessionId={activeSession.sessionId}
      />

      {/* Action grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
        role="group"
        aria-label={t("session.actions")}
      >
        {actions.map((action) => {
          const isActive = activeAction === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() =>
                setActiveAction(isActive ? null : action.id)
              }
              aria-pressed={isActive}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                minHeight: "96px",
                padding: "16px 12px",
                backgroundColor: isActive
                  ? "var(--bg-card-hover)"
                  : "var(--bg-card)",
                border: isActive
                  ? `2px solid ${action.accentVar}`
                  : "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                transition: "var(--transition-fast)",
                color: isActive ? action.accentVar : "var(--text-muted)",
                boxShadow: isActive
                  ? `0 0 14px ${action.accentVar}33`
                  : "none",
              }}
            >
              <span
                style={{
                  color: isActive ? action.accentVar : "var(--text-muted)",
                  transition: "var(--transition-fast)",
                }}
              >
                {action.icon}
              </span>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  textAlign: "center",
                  lineHeight: 1.25,
                  color: isActive ? "var(--text-main)" : "var(--text-muted)",
                }}
              >
                {action.label}
              </span>
              {isActive && (
                <ChevronRight
                  size={12}
                  style={{
                    transform: "rotate(90deg)",
                    color: action.accentVar,
                    marginTop: "-4px",
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Inline action panel */}
      {activeAction && selectedAction && (
        <section
          className="card"
          style={{
            borderLeft: `3px solid ${selectedAction.accentVar}`,
            padding: "24px",
          }}
          aria-label={`Panel: ${selectedAction.label}`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontWeight: "800",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: selectedAction.accentVar,
              }}
            >
              {selectedAction.icon}
              {selectedAction.label}
            </h3>
            <button
              type="button"
              className="btn btn-icon btn-secondary"
              onClick={() => setActiveAction(null)}
              aria-label={t("common.close")}
              style={{ padding: "6px" }}
            >
              <X size={16} />
            </button>
          </div>

          {activeAction === "nota" && (
            <PanelNotaRapida
              createEntity={createEntity}
              recordSessionEvent={recordSessionEvent}
              activeSession={activeSession}
              addToast={addToast}
              onClose={() => setActiveAction(null)}
            />
          )}
          {activeAction === "pista" && (
            <PanelRevelarPista
              campaignState={campaignState}
              activeSession={activeSession}
              revealClue={revealClue}
              addToast={addToast}
              onClose={() => setActiveAction(null)}
            />
          )}
          {activeAction === "decision" && (
            <PanelDecision
              campaignState={campaignState}
              createEntity={createEntity}
              createRelation={createRelation}
              recordSessionEvent={recordSessionEvent}
              activeSession={activeSession}
              addToast={addToast}
              onClose={() => setActiveAction(null)}
            />
          )}
          {activeAction === "consecuencia" && (
            <PanelConsecuencia
              campaignState={campaignState}
              createEntity={createEntity}
              recordSessionEvent={recordSessionEvent}
              activeSession={activeSession}
              addToast={addToast}
              onClose={() => setActiveAction(null)}
            />
          )}
          {activeAction === "pnj" && (
            <PanelPNJRapido
              createEntity={createEntity}
              activeSession={activeSession}
              addToast={addToast}
              onClose={() => setActiveAction(null)}
            />
          )}
          {activeAction === "cerrar" && (
            <PanelCerrarSesion
              activeSession={activeSession}
              closeSession={closeSession}
              sessionSummary={sessionSummary}
              setSessionSummary={setSessionSummary}
              setCurrentPage={setCurrentPage}
              addToast={addToast}
              onClose={() => setActiveAction(null)}
            />
          )}
        </section>
      )}
    </div>
  );
}
