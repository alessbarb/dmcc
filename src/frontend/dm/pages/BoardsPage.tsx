import React, { useState } from "react";
import type { Entity } from "../../shared/stores/campaignStore.js";
import {
  Play,
  Lock,
  CheckCircle2,
  XCircle,
  Archive,
  FileText,
  EyeOff,
  HelpCircle,
  User,
  Users,
  Eye,
  AlertTriangle,
  CheckSquare,
  Clock,
  Flame,
  Shield,
  Heart,
  Skull,
  Search,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";


type BoardType = "misiones" | "pistas" | "consecuencias" | "pnjs" | "secretos";

const BOARDS: { id: BoardType; label: string; entityType: string | string[]; color: string }[] = [
  { id: "misiones", label: "Misiones", entityType: "quest", color: "var(--primary)" },
  { id: "pistas", label: "Pistas", entityType: "clue", color: "#059669" },
  { id: "consecuencias", label: "Consecuencias", entityType: ["consequence", "front"], color: "#d97706" },
  { id: "pnjs", label: "PNJs", entityType: "npc", color: "#7c3aed" },
  { id: "secretos", label: "Secretos", entityType: "secret", color: "#ef4444" },
];

const QUEST_STATES = [
  { key: "active",     label: "Activa",     color: "#22c55e" },
  { key: "blocked",    label: "Bloqueada",  color: "#ef4444" },
  { key: "completed",  label: "Completada", color: "#6366f1" },
  { key: "failed",     label: "Fallida",    color: "#94a3b8" },
  { key: "abandoned",  label: "Abandonada", color: "#475569" },
];

const CLUE_STATES = [
  { key: "prepared",                label: "Preparada",           color: "#64748b" },
  { key: "hidden",                  label: "Oculta",              color: "#475569" },
  { key: "hinted",                  label: "Insinuada",           color: "#d97706" },
  { key: "revealed_to_one",         label: "Revelada a uno",      color: "#0891b2" },
  { key: "revealed_to_some",        label: "Revelada a algunos",  color: "#2563eb" },
  { key: "revealed",                label: "Revelada al grupo",   color: "#22c55e" },
  { key: "misunderstood",           label: "Malinterpretada",     color: "#dc2626" },
  { key: "confirmed",               label: "Confirmada",          color: "#059669" },
  { key: "resolved",                label: "Resuelta",            color: "#6366f1" },
  { key: "obsolete",                label: "Obsoleta",            color: "#475569" },
];

const CONSEQUENCE_STATES = [
  { key: "pending",   label: "Pendiente",   color: "#d97706" },
  { key: "active",    label: "Activa",      color: "#ef4444" },
  { key: "triggered", label: "Activada",    color: "#dc2626" },
  { key: "resolved",  label: "Resuelta",    color: "#22c55e" },
  { key: "averted",   label: "Evitada",     color: "#6366f1" },
];

const NPC_STATES = [
  { key: "alive",     label: "Vivo",        color: "#22c55e" },
  { key: "hidden",    label: "Oculto",      color: "#64748b" },
  { key: "revealed",  label: "Conocido",    color: "#2563eb" },
  { key: "deceased",  label: "Muerto",      color: "#94a3b8" },
  { key: "missing",   label: "Desaparecido",color: "#d97706" },
  { key: "ally",      label: "Aliado",      color: "#059669" },
  { key: "enemy",     label: "Enemigo",     color: "#ef4444" },
  { key: "neutral",   label: "Neutral",     color: "#475569" },
];

const SECRET_STATES = [
  { key: "dm_only",          label: "Solo DM",             color: "#dc2626" },
  { key: "hinted",           label: "Insinuado",           color: "#d97706" },
  { key: "revealed_to_one",  label: "Revelado a uno",      color: "#0891b2" },
  { key: "revealed_to_some", label: "Revelado a algunos",  color: "#2563eb" },
  { key: "revealed",         label: "Revelado al grupo",   color: "#22c55e" },
];

const STATE_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  active: Play,
  blocked: Lock,
  completed: CheckCircle2,
  failed: XCircle,
  abandoned: Archive,
  prepared: FileText,
  hidden: EyeOff,
  hinted: HelpCircle,
  revealed_to_one: User,
  revealed_to_some: Users,
  revealed: Eye,
  misunderstood: AlertTriangle,
  confirmed: CheckSquare,
  resolved: CheckCircle2,
  obsolete: Archive,
  pending: Clock,
  triggered: Flame,
  averted: Shield,
  alive: Heart,
  deceased: Skull,
  missing: Search,
  ally: Smile,
  enemy: Frown,
  neutral: Meh,
  dm_only: EyeOff,
  _unknown: HelpCircle,
};

function KanbanColumn({ label, color, stateKey, entities, onSelect }: {
  label: string;
  color: string;
  stateKey: string;
  entities: Entity[];
  onSelect: (e: Entity) => void;
}) {
  const IconComponent = STATE_ICONS[stateKey] || HelpCircle;
  const { t } = useTranslation();

  return (
    <div style={{ minWidth: "200px", flex: "0 0 200px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
        <IconComponent size={14} style={{ color: color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>({entities.length})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "60px" }}>
        {entities.length === 0 ? (
          <div style={{ padding: "12px 10px", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            {t("boards.empty")}
          </div>
        ) : entities.map((e) => {
          let cardClass = "kanban-card";
          if (e.entityType === "quest") {
            cardClass += " kanban-card--quest";
          } else if (e.entityType === "clue") {
            cardClass += " kanban-card--clue";
          } else if (e.entityType === "consequence" || e.entityType === "front") {
            cardClass += " kanban-card--consequence";
          } else if (e.entityType === "npc") {
            cardClass += " kanban-card--npc";
          } else if (e.entityType === "secret") {
            cardClass += " kanban-card--secret";
          } else {
            cardClass += " kanban-card--unknown";
          }

          return (
            <div
              key={e.entityId}
              className={cardClass}
              onClick={() => onSelect(e)}
            >
              <p className="kanban-card__title">{e.title}</p>
              {e.summary && (
                <p className="kanban-card__summary">
                  {e.summary.length > 55 ? e.summary.slice(0, 55) + "…" : e.summary}
                </p>
              )}
              {(e as any).importance && (e as any).importance !== "normal" && (
                <span className="kanban-card__badge" style={{ backgroundColor: (e as any).importance === "critical" ? "#dc262633" : "#d9770633", color: (e as any).importance === "critical" ? "#fca5a5" : "#fcd34d" }}>
                  {(e as any).importance === "critical" ? t("boards.importanceCritical") : (e as any).importance === "high" ? t("boards.importanceHigh") : (e as any).importance === "low" ? t("boards.importanceLow") : (e as any).importance}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BoardsPage() {
  const { campaignState, updateEntity, archiveEntity } = useCampaignStore();
  const { addToast } = useToast();
  const [selectedEntityLocal, setSelectedEntityLocal] = useState<Entity | null>(null);
  const [activeBoard, setActiveBoard] = useState<BoardType>("misiones");

  const board = BOARDS.find((b) => b.id === activeBoard)!;

  const allEntities: Entity[] = Array.from(
    (campaignState?.entities instanceof Map
      ? campaignState.entities.values()
      : Object.values(campaignState?.entities ?? {})) as Iterable<Entity>
  );

  const boardEntities = allEntities.filter((e: Entity) => {
    if (e.archived) return false;
    const types = Array.isArray(board.entityType) ? board.entityType : [board.entityType];
    return types.includes(e.entityType);
  });

  const stateMap: Record<BoardType, { key: string; label: string; color: string }[]> = {
    misiones: QUEST_STATES,
    pistas: CLUE_STATES,
    consecuencias: CONSEQUENCE_STATES,
    pnjs: NPC_STATES,
    secretos: SECRET_STATES,
  };

  const states = stateMap[activeBoard];

  const byStatus: Record<string, Entity[]> = {};
  states.forEach((s) => (byStatus[s.key] = []));
  byStatus["_unknown"] = [];

  boardEntities.forEach((e: Entity) => {
    const s = (e as any).status as string;
    if (s && byStatus[s] !== undefined) {
      byStatus[s].push(e);
    } else {
      byStatus["_unknown"].push(e);
    }
  });

  const nonEmptyStates = states.filter((s) => byStatus[s.key].length > 0);
  const unknownCount = byStatus["_unknown"].length;

  const handleSelect = (e: Entity) => {
    setSelectedEntityLocal(e);
  };

  return (<>
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header + tab nav */}
      <div>
        <h2 style={{ fontWeight: 700, marginBottom: "16px" }}>Tableros</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {BOARDS.map((b) => (
            <button
              key={b.id}
              className={`btn btn-sm ${activeBoard === b.id ? "btn-primary" : "btn-secondary"}`}
              style={activeBoard === b.id ? { borderColor: b.color } : {}}
              onClick={() => setActiveBoard(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "16px", padding: "12px 16px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-sm)", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total: <strong style={{ color: "var(--text-main)" }}>{boardEntities.length}</strong></span>
        {nonEmptyStates.map((s) => (
          <span key={s.key} style={{ fontSize: "0.85rem", color: s.color }}>
            {s.label}: <strong>{byStatus[s.key].length}</strong>
          </span>
        ))}
        {unknownCount > 0 && (
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Sin estado: <strong>{unknownCount}</strong></span>
        )}
      </div>

      {/* Kanban scroll area */}
      {boardEntities.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "1rem" }}>Sin {board.label.toLowerCase()} todavía.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
          <div style={{ display: "flex", gap: "12px", minWidth: "max-content" }}>
            {states.filter((s) => byStatus[s.key].length > 0).map((s) => (
              <KanbanColumn
                key={s.key}
                stateKey={s.key}
                label={s.label}
                color={s.color}
                entities={byStatus[s.key]}
                onSelect={handleSelect}
              />
            ))}
            {states.filter((s) => byStatus[s.key].length === 0).map((s) => (
              <KanbanColumn
                key={s.key}
                stateKey={s.key}
                label={s.label}
                color={s.color}
                entities={[]}
                onSelect={handleSelect}
              />
            ))}
            {unknownCount > 0 && (
              <KanbanColumn
                stateKey="_unknown"
                label="Sin estado"
                color="#475569"
                entities={byStatus["_unknown"]}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>
      )}
    </div>
    {selectedEntityLocal && campaignState && (
      <EntityDetailModal
        selectedEntity={selectedEntityLocal}
        campaignState={campaignState}
        onClose={() => setSelectedEntityLocal(null)}
        onEdit={async (entityId, updates) => {
          await updateEntity(entityId, updates);
          setSelectedEntityLocal({ ...selectedEntityLocal, ...updates } as Entity);
        }}
        onArchive={async (entityId) => {
          await archiveEntity(entityId);
          setSelectedEntityLocal(null);
        }}
        onVisibilityChange={async (entityId, visibility) => {
          await updateEntity(entityId, { visibility });
          setSelectedEntityLocal({ ...selectedEntityLocal, visibility } as Entity);
        }}
        addToast={addToast}
      />
    )}
  </>);
}
