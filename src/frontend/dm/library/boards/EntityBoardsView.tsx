import React, { useEffect, useMemo, useState } from "react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  CheckSquare,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Frown,
  Heart,
  HelpCircle,
  Lock,
  Meh,
  Play,
  Search,
  Shield,
  Skull,
  Smile,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { EntityDetailModal } from "../../entities/EntityDetailModal.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";

type BoardType = "quests" | "clues" | "consequences" | "npcs" | "secrets";
type BoardState = { key: string; labelKey: string; color: string };

type BoardDefinition = {
  id: BoardType;
  labelKey: string;
  entityType: string | string[];
  color: string;
  states: BoardState[];
};

const QUEST_STATES: BoardState[] = [
  { key: "active", labelKey: "boards.statuses.active", color: "#22c55e" },
  { key: "blocked", labelKey: "boards.statuses.blocked", color: "#ef4444" },
  { key: "completed", labelKey: "boards.statuses.completed", color: "#6366f1" },
  { key: "failed", labelKey: "boards.statuses.failed", color: "#94a3b8" },
  { key: "abandoned", labelKey: "boards.statuses.abandoned", color: "#475569" },
];

const CLUE_STATES: BoardState[] = [
  { key: "prepared", labelKey: "boards.statuses.prepared", color: "#64748b" },
  { key: "hidden", labelKey: "boards.statuses.hidden", color: "#475569" },
  { key: "hinted", labelKey: "boards.statuses.hinted", color: "#d97706" },
  { key: "revealed_to_one", labelKey: "boards.statuses.revealedToOne", color: "#0891b2" },
  { key: "revealed_to_some", labelKey: "boards.statuses.revealedToSome", color: "#2563eb" },
  { key: "revealed", labelKey: "boards.statuses.revealed", color: "#22c55e" },
  { key: "misunderstood", labelKey: "boards.statuses.misunderstood", color: "#dc2626" },
  { key: "confirmed", labelKey: "boards.statuses.confirmed", color: "#059669" },
  { key: "resolved", labelKey: "boards.statuses.resolved", color: "#6366f1" },
  { key: "obsolete", labelKey: "boards.statuses.obsolete", color: "#475569" },
];

const CONSEQUENCE_STATES: BoardState[] = [
  { key: "pending", labelKey: "boards.statuses.pending", color: "#d97706" },
  { key: "active", labelKey: "boards.statuses.active", color: "#ef4444" },
  { key: "triggered", labelKey: "boards.statuses.triggered", color: "#dc2626" },
  { key: "resolved", labelKey: "boards.statuses.resolved", color: "#22c55e" },
  { key: "averted", labelKey: "boards.statuses.averted", color: "#6366f1" },
];

const NPC_STATES: BoardState[] = [
  { key: "alive", labelKey: "boards.statuses.alive", color: "#22c55e" },
  { key: "hidden", labelKey: "boards.statuses.hidden", color: "#64748b" },
  { key: "revealed", labelKey: "boards.statuses.revealed", color: "#2563eb" },
  { key: "deceased", labelKey: "boards.statuses.deceased", color: "#94a3b8" },
  { key: "missing", labelKey: "boards.statuses.missing", color: "#d97706" },
  { key: "ally", labelKey: "boards.statuses.ally", color: "#059669" },
  { key: "enemy", labelKey: "boards.statuses.enemy", color: "#ef4444" },
  { key: "neutral", labelKey: "boards.statuses.neutral", color: "#475569" },
];

const SECRET_STATES: BoardState[] = [
  { key: "dm_only", labelKey: "boards.statuses.dmOnly", color: "#dc2626" },
  { key: "hinted", labelKey: "boards.statuses.hinted", color: "#d97706" },
  { key: "revealed_to_one", labelKey: "boards.statuses.revealedToOne", color: "#0891b2" },
  { key: "revealed_to_some", labelKey: "boards.statuses.revealedToSome", color: "#2563eb" },
  { key: "revealed", labelKey: "boards.statuses.revealed", color: "#22c55e" },
];

const BOARDS: BoardDefinition[] = [
  { id: "quests", labelKey: "boards.tabs.quests", entityType: "quest", color: "var(--theme-accents-primary-foreground)", states: QUEST_STATES },
  { id: "clues", labelKey: "boards.tabs.clues", entityType: "clue", color: "#059669", states: CLUE_STATES },
  { id: "consequences", labelKey: "boards.tabs.consequences", entityType: ["consequence", "front"], color: "#d97706", states: CONSEQUENCE_STATES },
  { id: "npcs", labelKey: "boards.tabs.npcs", entityType: "npc", color: "#7c3aed", states: NPC_STATES },
  { id: "secrets", labelKey: "boards.tabs.secrets", entityType: "secret", color: "#ef4444", states: SECRET_STATES },
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

function boardForEntity(entity: Entity): BoardDefinition | undefined {
  return BOARDS.find((board) => {
    const types = Array.isArray(board.entityType) ? board.entityType : [board.entityType];
    return types.includes(entity.entityType);
  });
}

function cardClassFor(entity: Entity): string {
  if (entity.entityType === "quest") return "kanban-card kanban-card--quest";
  if (entity.entityType === "clue") return "kanban-card kanban-card--clue";
  if (entity.entityType === "consequence" || entity.entityType === "front") {
    return "kanban-card kanban-card--consequence";
  }
  if (entity.entityType === "npc") return "kanban-card kanban-card--npc";
  if (entity.entityType === "secret") return "kanban-card kanban-card--secret";
  return "kanban-card kanban-card--unknown";
}

function KanbanCard({
  entity,
  states,
  moving,
  onMove,
  onSelect,
  onDragStart,
}: {
  entity: Entity;
  states: BoardState[];
  moving: boolean;
  onMove: (entity: Entity, status: string) => void;
  onSelect: (entity: Entity) => void;
  onDragStart: (event: React.DragEvent, entity: Entity) => void;
}) {
  const { t } = useTranslation();
  return (
    <article
      className={cardClassFor(entity)}
      draggable={!moving}
      onDragStart={(event) => onDragStart(event, entity)}
      aria-busy={moving}
    >
      <button
        type="button"
        className="kanban-card__open"
        onClick={() => onSelect(entity)}
        aria-label={entity.title}
      >
        <strong className="kanban-card__title">{entity.title}</strong>
        {entity.summary && (
          <span className="kanban-card__summary">
            {entity.summary.length > 90 ? `${entity.summary.slice(0, 90)}…` : entity.summary}
          </span>
        )}
        {entity.importance && entity.importance !== "normal" && (
          <span
            className="kanban-card__badge"
            style={{
              backgroundColor: entity.importance === "critical" ? "#dc262633" : "#d9770633",
              color: entity.importance === "critical" ? "#fca5a5" : "#fcd34d",
            }}
          >
            {entity.importance === "critical"
              ? t("boards.importanceCritical")
              : entity.importance === "high"
                ? t("boards.importanceHigh")
                : entity.importance === "low"
                  ? t("boards.importanceLow")
                  : entity.importance}
          </span>
        )}
      </button>

      <label className="kanban-card__move">
        <span>{t("boards.moveTo")}</span>
        <select
          className="form-select"
          value={entity.status}
          disabled={moving}
          onChange={(event) => onMove(entity, event.target.value)}
          aria-label={t("boards.moveLabel", { title: entity.title })}
        >
          {!states.some((state) => state.key === entity.status) && (
            <option value={entity.status}>{entity.status || t("boards.unknownStatus")}</option>
          )}
          {states.map((state) => (
            <option key={state.key} value={state.key}>{t(state.labelKey)}</option>
          ))}
        </select>
      </label>
    </article>
  );
}

function KanbanColumn({
  state,
  entities,
  states,
  movingIds,
  dragOver,
  onDrop,
  onMove,
  onSelect,
  onDragStart,
  onDragEnter,
  onDragLeave,
}: {
  state: BoardState;
  entities: Entity[];
  states: BoardState[];
  movingIds: Set<string>;
  dragOver: boolean;
  onDrop: (event: React.DragEvent, status: string) => void;
  onMove: (entity: Entity, status: string) => void;
  onSelect: (entity: Entity) => void;
  onDragStart: (event: React.DragEvent, entity: Entity) => void;
  onDragEnter: (status: string) => void;
  onDragLeave: (event: React.DragEvent) => void;
}) {
  const Icon = STATE_ICONS[state.key] || HelpCircle;
  const { t } = useTranslation();

  return (
    <section
      className={`kanban-column ${dragOver ? "kanban-column--drag-over" : ""}`}
      aria-labelledby={`kanban-column-${state.key}`}
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter(state.key);
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, state.key)}
    >
      <header className="kanban-column__header">
        <span className="kanban-column__dot" style={{ backgroundColor: state.color }} />
        <Icon size={14} style={{ color: state.color, flexShrink: 0 }} />
        <strong id={`kanban-column-${state.key}`}>{t(state.labelKey)}</strong>
        <span className="kanban-column__count">{entities.length}</span>
      </header>

      <div className="kanban-column__body">
        {entities.length === 0 ? (
          <div className="kanban-column__empty">{t("boards.dropHint")}</div>
        ) : (
          entities.map((entity) => (
            <KanbanCard
              key={entity.entityId}
              entity={entity}
              states={states}
              moving={movingIds.has(entity.entityId)}
              onMove={onMove}
              onSelect={onSelect}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function EntityBoardsView() {
  const { campaignState, updateEntity, archiveEntity } = useCampaignStore();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeBoard, setActiveBoard] = useState<BoardType>("quests");
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const allEntities = useMemo<Entity[]>(
    () => (campaignState?.entities ?? []).filter((entity: Entity) => !entity.archived),
    [campaignState?.entities],
  );
  const board = BOARDS.find((candidate) => candidate.id === activeBoard) ?? BOARDS[0];
  const boardEntities = useMemo(() => {
    const types = Array.isArray(board.entityType) ? board.entityType : [board.entityType];
    return allEntities.filter((entity) => types.includes(entity.entityType));
  }, [allEntities, board]);

  const entitiesByStatus = useMemo(() => {
    const grouped: Record<string, Entity[]> = Object.fromEntries(
      board.states.map((state) => [state.key, []]),
    );
    grouped._unknown = [];
    for (const entity of boardEntities) {
      if (grouped[entity.status]) grouped[entity.status].push(entity);
      else grouped._unknown.push(entity);
    }
    return grouped;
  }, [board.states, boardEntities]);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const itemId = parameters.get("itemId");
    if (!itemId) return;
    const entity = allEntities.find((candidate) => candidate.entityId === itemId);
    if (entity) {
      const destinationBoard = boardForEntity(entity);
      if (destinationBoard) setActiveBoard(destinationBoard.id);
      setSelectedEntity(entity);
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, [allEntities]);

  const moveEntity = async (entity: Entity, status: string) => {
    if (!status || status === entity.status || movingIds.has(entity.entityId)) return;
    setMovingIds((current) => new Set(current).add(entity.entityId));
    try {
      await updateEntity(entity.entityId, { status });
      const translatedStatus = board.states.find((state) => state.key === status);
      addToast(
        t("boards.moved", {
          title: entity.title,
          status: translatedStatus ? t(translatedStatus.labelKey) : status,
        }),
        "success",
      );
      setSelectedEntity((current) =>
        current?.entityId === entity.entityId ? { ...current, status } : current,
      );
    } catch (error: any) {
      addToast(error?.message ?? String(error), "error");
    } finally {
      setMovingIds((current) => {
        const next = new Set(current);
        next.delete(entity.entityId);
        return next;
      });
    }
  };

  const handleDragStart = (event: React.DragEvent, entity: Entity) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-dmcc-entity-id", entity.entityId);
    event.dataTransfer.setData("text/plain", entity.entityId);
  };

  const handleDrop = (event: React.DragEvent, status: string) => {
    event.preventDefault();
    setDragOverStatus(null);
    const entityId =
      event.dataTransfer.getData("application/x-dmcc-entity-id") ||
      event.dataTransfer.getData("text/plain");
    const entity = boardEntities.find((candidate) => candidate.entityId === entityId);
    if (entity) void moveEntity(entity, status);
  };

  const unknownState: BoardState = {
    key: "_unknown",
    labelKey: "boards.unknownStatus",
    color: "#475569",
  };
  const visibleStates = entitiesByStatus._unknown.length > 0
    ? [...board.states, unknownState]
    : board.states;
  const boardLabel = t(board.labelKey);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div role="tablist" aria-label={t("boards.ariaLabel")} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {BOARDS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              role="tab"
              aria-selected={activeBoard === candidate.id}
              className={`btn btn-sm ${activeBoard === candidate.id ? "btn-primary" : "btn-secondary"}`}
              style={activeBoard === candidate.id ? { borderColor: candidate.color } : undefined}
              onClick={() => setActiveBoard(candidate.id)}
            >
              {t(candidate.labelKey)}
            </button>
          ))}
        </div>

        <div className="card" style={{ display: "flex", gap: 16, padding: "12px 16px", flexWrap: "wrap" }} aria-live="polite">
          <span style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)" }}>
            {t("boards.total")}: <strong style={{ color: "var(--theme-text-primary)" }}>{boardEntities.length}</strong>
          </span>
          {board.states.map((state) => (
            <span key={state.key} style={{ fontSize: "0.85rem", color: state.color }}>
              {t(state.labelKey)}: <strong>{entitiesByStatus[state.key]?.length ?? 0}</strong>
            </span>
          ))}
          {entitiesByStatus._unknown.length > 0 && (
            <span style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)" }}>
              {t("boards.unknownStatus")}: <strong>{entitiesByStatus._unknown.length}</strong>
            </span>
          )}
        </div>

        {boardEntities.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--theme-text-secondary)" }}>
            <p style={{ fontSize: "1rem" }}>{t("boards.noItems", { board: boardLabel.toLocaleLowerCase() })}</p>
          </div>
        ) : (
          <div className="kanban-scroll" tabIndex={0} aria-label={`${boardLabel}. Kanban`}>
            <div className="kanban-board">
              {visibleStates.map((state) => (
                <KanbanColumn
                  key={state.key}
                  state={state}
                  states={board.states}
                  entities={entitiesByStatus[state.key] ?? []}
                  movingIds={movingIds}
                  dragOver={dragOverStatus === state.key}
                  onDrop={handleDrop}
                  onMove={(entity, status) => void moveEntity(entity, status)}
                  onSelect={setSelectedEntity}
                  onDragStart={handleDragStart}
                  onDragEnter={setDragOverStatus}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDragOverStatus(null);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedEntity && campaignState && (
        <EntityDetailModal
          selectedEntity={selectedEntity}
          campaignState={campaignState}
          onClose={() => setSelectedEntity(null)}
          onEdit={async (entityId, updates) => {
            await updateEntity(entityId, updates);
            setSelectedEntity((current) => current ? { ...current, ...updates } as Entity : null);
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setSelectedEntity(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await updateEntity(entityId, { visibility });
            setSelectedEntity((current) => current ? { ...current, visibility } : null);
          }}
          addToast={addToast}
        />
      )}
    </>
  );
}
