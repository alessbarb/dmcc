import React, { useEffect, useMemo, useState } from "react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import { markdownToPlainText } from "../../../shared/utils/markdownText.js";
import "../../../shared/styles/features/kanban-board.css";
import "../../../shared/styles/features/kanban.css";
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
import { resolveActiveEntity } from "../../entities/relations/resolveActiveEntity.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";

type BoardType = "quests" | "clues" | "consequences" | "npcs" | "secrets";
type BoardState = { key: string; labelKey: string; color: string };
type BoardStyle = React.CSSProperties & { "--board-state-color"?: string; "--board-tab-color"?: string };

type BoardDefinition = {
  id: BoardType;
  labelKey: string;
  entityType: string | string[];
  color: string;
  states: BoardState[];
};

const QUEST_STATES: BoardState[] = [
  { key: "active", labelKey: "boards.statuses.active", color: "var(--theme-feedback-success-foreground)" },
  { key: "blocked", labelKey: "boards.statuses.blocked", color: "var(--theme-feedback-danger-foreground)" },
  { key: "completed", labelKey: "boards.statuses.completed", color: "var(--theme-accents-primary-foreground)" },
  { key: "failed", labelKey: "boards.statuses.failed", color: "var(--theme-text-subtle)" },
  { key: "abandoned", labelKey: "boards.statuses.abandoned", color: "var(--theme-text-secondary)" },
];

const CLUE_STATES: BoardState[] = [
  { key: "prepared", labelKey: "boards.statuses.prepared", color: "var(--theme-text-secondary)" },
  { key: "hidden", labelKey: "boards.statuses.hidden", color: "var(--theme-text-subtle)" },
  { key: "hinted", labelKey: "boards.statuses.hinted", color: "var(--theme-feedback-warning-foreground)" },
  { key: "revealed_to_one", labelKey: "boards.statuses.revealedToOne", color: "var(--theme-feedback-info-foreground)" },
  { key: "revealed_to_some", labelKey: "boards.statuses.revealedToSome", color: "var(--theme-accents-secondary-foreground)" },
  { key: "revealed", labelKey: "boards.statuses.revealed", color: "var(--theme-feedback-success-foreground)" },
  { key: "misunderstood", labelKey: "boards.statuses.misunderstood", color: "var(--theme-feedback-danger-foreground)" },
  { key: "confirmed", labelKey: "boards.statuses.confirmed", color: "var(--theme-feedback-success-foreground)" },
  { key: "resolved", labelKey: "boards.statuses.resolved", color: "var(--theme-accents-primary-foreground)" },
  { key: "obsolete", labelKey: "boards.statuses.obsolete", color: "var(--theme-text-subtle)" },
];

const CONSEQUENCE_STATES: BoardState[] = [
  { key: "pending", labelKey: "boards.statuses.pending", color: "var(--theme-feedback-warning-foreground)" },
  { key: "active", labelKey: "boards.statuses.active", color: "var(--theme-feedback-danger-foreground)" },
  { key: "triggered", labelKey: "boards.statuses.triggered", color: "var(--theme-feedback-danger-foreground)" },
  { key: "resolved", labelKey: "boards.statuses.resolved", color: "var(--theme-feedback-success-foreground)" },
  { key: "averted", labelKey: "boards.statuses.averted", color: "var(--theme-accents-primary-foreground)" },
];

const NPC_STATES: BoardState[] = [
  { key: "alive", labelKey: "boards.statuses.alive", color: "var(--theme-feedback-success-foreground)" },
  { key: "hidden", labelKey: "boards.statuses.hidden", color: "var(--theme-text-secondary)" },
  { key: "revealed", labelKey: "boards.statuses.revealed", color: "var(--theme-accents-secondary-foreground)" },
  { key: "deceased", labelKey: "boards.statuses.deceased", color: "var(--theme-text-subtle)" },
  { key: "missing", labelKey: "boards.statuses.missing", color: "var(--theme-feedback-warning-foreground)" },
  { key: "ally", labelKey: "boards.statuses.ally", color: "var(--theme-feedback-success-foreground)" },
  { key: "enemy", labelKey: "boards.statuses.enemy", color: "var(--theme-feedback-danger-foreground)" },
  { key: "neutral", labelKey: "boards.statuses.neutral", color: "var(--theme-text-subtle)" },
];

const SECRET_STATES: BoardState[] = [
  { key: "dm_only", labelKey: "boards.statuses.dmOnly", color: "var(--theme-feedback-danger-foreground)" },
  { key: "hinted", labelKey: "boards.statuses.hinted", color: "var(--theme-feedback-warning-foreground)" },
  { key: "revealed_to_one", labelKey: "boards.statuses.revealedToOne", color: "var(--theme-feedback-info-foreground)" },
  { key: "revealed_to_some", labelKey: "boards.statuses.revealedToSome", color: "var(--theme-accents-secondary-foreground)" },
  { key: "revealed", labelKey: "boards.statuses.revealed", color: "var(--theme-feedback-success-foreground)" },
];

const BOARDS: BoardDefinition[] = [
  { id: "quests", labelKey: "boards.tabs.quests", entityType: "quest", color: "var(--theme-accents-primary-foreground)", states: QUEST_STATES },
  { id: "clues", labelKey: "boards.tabs.clues", entityType: "clue", color: "var(--theme-feedback-success-foreground)", states: CLUE_STATES },
  { id: "consequences", labelKey: "boards.tabs.consequences", entityType: ["consequence", "front"], color: "var(--theme-feedback-warning-foreground)", states: CONSEQUENCE_STATES },
  { id: "npcs", labelKey: "boards.tabs.npcs", entityType: "npc", color: "var(--theme-narrative-secret-foreground)", states: NPC_STATES },
  { id: "secrets", labelKey: "boards.tabs.secrets", entityType: "secret", color: "var(--theme-feedback-danger-foreground)", states: SECRET_STATES },
];

const STATE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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
            {(() => {
              const summary = markdownToPlainText(entity.summary);
              return summary.length > 90 ? `${summary.slice(0, 90)}…` : summary;
            })()}
          </span>
        )}
        {entity.importance && entity.importance !== "normal" && (
          <span
            className={`kanban-card__badge kanban-card__badge--${entity.importance}`}
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
  const stateStyle: BoardStyle = { "--board-state-color": state.color };

  return (
    <section
      className={`kanban-column ${dragOver ? "kanban-column--drag-over" : ""}`}
      style={stateStyle}
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
        <span className="kanban-column__dot" />
        <Icon className="kanban-column__icon" size={14} />
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
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<BoardType>("quests");
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const allEntities = useMemo<Entity[]>(
    () => (campaignState?.entities ?? []).filter((entity: Entity) => !entity.archived),
    [campaignState?.entities],
  );
  const selectedEntity = selectedEntityId ? resolveActiveEntity(allEntities, selectedEntityId) : null;
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
      setSelectedEntityId(entity.entityId);
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
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : String(error), "error");
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
    color: "var(--theme-text-subtle)",
  };
  const visibleStates = entitiesByStatus._unknown.length > 0
    ? [...board.states, unknownState]
    : board.states;
  const boardLabel = t(board.labelKey);

  return (
    <>
      <div className="entity-boards-view">
        <div role="tablist" aria-label={t("boards.ariaLabel")}>
          {BOARDS.map((candidate) => (
            (() => {
              const tabStyle: BoardStyle | undefined = activeBoard === candidate.id
                ? { "--board-tab-color": candidate.color }
                : undefined;
              return <button
              key={candidate.id}
              type="button"
              role="tab"
              aria-selected={activeBoard === candidate.id}
              className={`btn btn-sm ${activeBoard === candidate.id ? "btn-primary" : "btn-secondary"} ${activeBoard === candidate.id ? "entity-boards-view__tab--active" : ""}`}
              style={tabStyle}
              onClick={() => setActiveBoard(candidate.id)}
            >
              {t(candidate.labelKey)}
              </button>;
            })()
          ))}
        </div>

        <div className="card entity-boards-view__summary" aria-live="polite">
          <span className="entity-boards-view__summary-item">
            {t("boards.total")}: <strong>{boardEntities.length}</strong>
          </span>
          {board.states.map((state) => (
            (() => {
              const stateStyle: BoardStyle = { "--board-state-color": state.color };
              return <span key={state.key} className="entity-boards-view__summary-item entity-boards-view__summary-item--state" style={stateStyle}>
                {t(state.labelKey)}: <strong>{entitiesByStatus[state.key]?.length ?? 0}</strong>
              </span>;
            })()
          ))}
          {entitiesByStatus._unknown.length > 0 && (
            <span className="entity-boards-view__summary-item">
              {t("boards.unknownStatus")}: <strong>{entitiesByStatus._unknown.length}</strong>
            </span>
          )}
        </div>

        {boardEntities.length === 0 ? (
          <div className="card entity-boards-view__empty">
            <p>{t("boards.noItems", { board: boardLabel.toLocaleLowerCase() })}</p>
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
                  onSelect={(entity) => setSelectedEntityId(entity.entityId)}
                  onDragStart={handleDragStart}
                  onDragEnter={setDragOverStatus}
                  onDragLeave={(event) => {
                    const related = event.relatedTarget;
                    if (!(related instanceof Node) || !event.currentTarget.contains(related)) {
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
          onClose={() => setSelectedEntityId(null)}
          onSelectEntity={setSelectedEntityId}
          onEdit={async (entityId, updates) => {
            await updateEntity(entityId, updates);
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setSelectedEntityId(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await updateEntity(entityId, { visibility });
          }}
          addToast={addToast}
        />
      )}
    </>
  );
}
