import React, { useState } from "react";
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
} from "lucide-react";
import type { ToastKind } from "../hooks/useToast.js";
import { createId } from "../../shared/ids.js";

export interface SessionPageProps {
  campaignState: any;
  activeSession: any;
  quickCaptureType: string;
  setQuickCaptureType: (t: string) => void;
  quickCaptureText: string;
  setQuickCaptureText: (t: string) => void;
  sessionSummary: string;
  setSessionSummary: (s: string) => void;
  handleQuickCaptureSubmit: (e: React.SyntheticEvent) => Promise<void>;
  startSession: (title: string) => Promise<any>;
  closeSession: (sessionId: string, summary: string) => Promise<any>;
  createEntity: (...args: any[]) => Promise<any>;
  createRelation: (...args: any[]) => Promise<any>;
  revealClue: (...args: any[]) => Promise<any>;
  recordSessionEvent: (...args: any[]) => Promise<any>;
  addToast: (msg: string, kind?: ToastKind) => void;
  setCurrentPage: (page: string) => void;
  setIsEntityModalOpen: (open: boolean) => void;
  setIsRelationModalOpen: (open: boolean) => void;
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
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        title: `Nota registrada`,
        description: text.substring(0, 80) + (text.length > 80 ? "…" : ""),
        relatedEntityIds: [noteEntityId],
      });

      addToast("Nota registrada.", "success");
      setText("");
    } catch (err: any) {
      addToast(`Error al guardar nota: ${err.message}`, "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="nota-text">
          Nota rápida
        </label>
        <textarea
          id="nota-text"
          className="form-textarea"
          placeholder="Escribe lo que ocurre en la mesa ahora mismo…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "100px" }}
        />
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Guardando…" : "Guardar nota"}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClue) return;
    setBusy(true);
    const audiencePayload =
      audience === "character" && characterId
        ? { kind: "characters" as const, characterEntityIds: [characterId] }
        : { kind: "party" as const };
    await revealClue(activeSession?.sessionId, selectedClue, audiencePayload, how);
    addToast("Pista revelada.", "success");
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
        <p>No hay pistas preparadas sin revelar.</p>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="pista-select">
          Pista a revelar
        </label>
        <select
          id="pista-select"
          className="form-select"
          value={selectedClue}
          onChange={(e) => setSelectedClue(e.target.value)}
          required
        >
          <option value="">— Selecciona pista —</option>
          {clues.map((c: any) => (
            <option key={c.entityId} value={c.entityId}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Audiencia</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className={`btn btn-sm ${audience === "party" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setAudience("party")}
          >
            Grupo completo
          </button>
          <button
            type="button"
            className={`btn btn-sm ${audience === "character" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setAudience("character")}
          >
            Personaje específico
          </button>
        </div>
      </div>

      {audience === "character" && (
        <div className="form-group">
          <label className="form-label" htmlFor="pista-character">
            Personaje
          </label>
          <select
            id="pista-character"
            className="form-select"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            required
          >
            <option value="">— Selecciona personaje —</option>
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
          ¿Cómo se reveló? (opcional)
        </label>
        <input
          id="pista-how"
          type="text"
          className="form-input"
          placeholder="Encontraron una carta, interrogaron al tabernero…"
          value={how}
          onChange={(e) => setHow(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy || !selectedClue}>
          {busy ? "Revelando…" : "Revelar pista"}
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        title: `Decisión tomada: ${decision.substring(0, 40)}${decision.length > 40 ? "…" : ""}`,
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
          summary: `Consecuencia de la decisión`,
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
          description: "La decisión causa esta consecuencia",
          visibility: { kind: "dm_only" },
        });

        // 3.2. Record Session Event for the consequence
        await recordSessionEvent(sessionId, {
          type: "consequence_created",
          title: `Consecuencia creada: ${pendingTitle.trim()}`,
          description: `Consecuencia pendiente originada por la decisión: ${decision.substring(0, 40)}`,
          relatedEntityIds: [consequenceEntityId, decisionEntityId],
        });
      }

      addToast("Decisión registrada.", "success");
    } catch (err: any) {
      addToast(`Error al guardar decisión: ${err.message}`, "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="decision-text">
          ¿Qué decidieron?
        </label>
        <textarea
          id="decision-text"
          className="form-textarea"
          placeholder="Los jugadores decidieron aliarse con los bandidos en lugar de combatirlos…"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "80px" }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="decision-consequence">
          Consecuencia inmediata (opcional)
        </label>
        <input
          id="decision-consequence"
          type="text"
          className="form-input"
          placeholder="El jefe de los bandidos les da un salvoconducto…"
          value={immediateConsequence}
          onChange={(e) => setImmediateConsequence(e.target.value)}
        />
      </div>

      {entities.length > 0 && (
        <div className="form-group">
          <label className="form-label">Entidades afectadas (opcional)</label>
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
          Crear consecuencia pendiente
        </label>
      </div>

      {createPending && (
        <div className="form-group">
          <label className="form-label" htmlFor="pending-title">
            Título de la consecuencia pendiente
          </label>
          <input
            id="pending-title"
            type="text"
            className="form-input"
            placeholder="Los bandidos reclamarán un favor más adelante…"
            value={pendingTitle}
            onChange={(e) => setPendingTitle(e.target.value)}
            required={createPending}
            autoFocus={createPending}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Guardando…" : "Registrar decisión"}
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
  const [title, setTitle] = useState("");
  const [questId, setQuestId] = useState("");
  const [severity, setSeverity] = useState<"high" | "medium" | "low">("medium");
  const [busy, setBusy] = useState(false);

  const quests = (campaignState?.entities ?? []).filter(
    (e: any) => e.entityType === "quest" && !e.archived
  );

  const handleSubmit = async (e: React.FormEvent) => {
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
        title: `Consecuencia creada: ${title.trim()}`,
        description: `Consecuencia con severidad ${severity}`,
        relatedEntityIds: [consequenceEntityId, ...(questId ? [questId] : [])],
      });

      addToast("Consecuencia creada.", "success");
    } catch (err: any) {
      addToast(`Error al crear consecuencia: ${err.message}`, "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="cons-title">
          Título de la consecuencia
        </label>
        <input
          id="cons-title"
          type="text"
          className="form-input"
          placeholder="El rey convoca al grupo en 3 días…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">Severidad</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {(["low", "medium", "high"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${severity === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSeverity(s)}
            >
              {s === "low" ? "Baja" : s === "medium" ? "Media" : "Alta"}
            </button>
          ))}
        </div>
      </div>

      {quests.length > 0 && (
        <div className="form-group">
          <label className="form-label" htmlFor="cons-quest">
            Misión afectada (opcional)
          </label>
          <select
            id="cons-quest"
            className="form-select"
            value={questId}
            onChange={(e) => setQuestId(e.target.value)}
          >
            <option value="">— Sin misión específica —</option>
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
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Guardando…" : "Crear consecuencia"}
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
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    addToast(`PNJ "${name.trim()}" creado.`, "success");
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
            Nombre
          </label>
          <input
            id="pnj-name"
            type="text"
            className="form-input"
            placeholder="Mira la Posaderera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pnj-role">
            Rol
          </label>
          <input
            id="pnj-role"
            type="text"
            className="form-input"
            placeholder="Informante, guardia…"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pnj-desc">
          Descripción breve
        </label>
        <input
          id="pnj-desc"
          type="text"
          className="form-input"
          placeholder="Mujer de mediana edad, nervioso, esconde algo…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Guardando…" : "Crear PNJ"}
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
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionSummary.trim()) return;
    setBusy(true);
    await closeSession(activeSession.sessionId, sessionSummary.trim());
    addToast("Sesión cerrada y guardada.", "success");
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
          Esta acción cierra la sesión activa. Asegúrate de haber registrado todo
          lo importante.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="close-summary">
          Resumen de la sesión
        </label>
        <textarea
          id="close-summary"
          className="form-textarea"
          placeholder="El grupo exploró las ruinas, encontró a Elara prisionera y decidió negociar con el jefe de la guardia…"
          value={sessionSummary}
          onChange={(e) => setSessionSummary(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "120px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-danger" disabled={busy || !sessionSummary.trim()}>
          {busy ? "Cerrando…" : "Cerrar sesión y guardar"}
        </button>
      </div>
    </form>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export function SessionPage(props: SessionPageProps) {
  const {
    campaignState,
    activeSession,
    sessionSummary,
    setSessionSummary,
    startSession,
    closeSession,
    createEntity,
    createRelation,
    revealClue,
    recordSessionEvent,
    addToast,
    setCurrentPage,
  } = props;

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

    const handleStart = async (e: React.FormEvent) => {
      e.preventDefault();
      const title = newTitle.trim() || `Sesión ${nextNumber}`;
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
                placeholder={`Sesión ${nextNumber}`}
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
      label: "Nota rápida",
      icon: <StickyNote size={22} />,
      accentVar: "var(--color-info)",
    },
    {
      id: "pista",
      label: "Revelar pista",
      icon: <Eye size={22} />,
      accentVar: "var(--secondary)",
    },
    {
      id: "decision",
      label: "Registrar decisión",
      icon: <GitMerge size={22} />,
      accentVar: "var(--primary)",
    },
    {
      id: "consecuencia",
      label: "Crear consecuencia",
      icon: <Zap size={22} />,
      accentVar: "var(--color-warning)",
    },
    {
      id: "pnj",
      label: "Crear PNJ rápido",
      icon: <UserPlus size={22} />,
      accentVar: "var(--color-success)",
    },
    {
      id: "cerrar",
      label: "Cerrar sesión",
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

      {/* Action grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
        role="group"
        aria-label="Acciones de sesión"
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
              aria-label="Cerrar panel"
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
