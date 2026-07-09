import React, { useMemo, useState } from "react";
import { Search, Crosshair, PlusCircle } from "lucide-react";
import type { Canvas, CanvasNode } from "@core/domain/canvas/types.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import {
  filterNavigatorEntities,
  filterNavigatorFacts,
  filterNavigatorNotes,
  getPlacedNodesByType,
  getUnplacedEntities,
  type CanvasNavigatorStatusFilter,
  type CanvasNavigatorVisibilityFilter,
} from "../selectors/canvasNavigatorSelectors.js";

export interface CanvasNavigatorPanelProps {
  canvas: Canvas;
  onFocusNode: (nodeId: string) => boolean;
  onFocusEntity: (entityId: string) => boolean;
  onFocusFact: (factId: string) => boolean;
}

const ENTITY_TYPES = ["npc", "player_character", "location", "faction", "quest", "clue", "secret", "item", "scene", "consequence", "rumor"];

export function CanvasNavigatorPanel({ canvas, onFocusNode, onFocusEntity, onFocusFact }: CanvasNavigatorPanelProps) {
  const { t } = useTranslation();
  const { campaignState, placeNodeOnCanvas } = useCampaignStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [visibility, setVisibility] = useState<CanvasNavigatorVisibilityFilter>("all");
  const [status, setStatus] = useState<CanvasNavigatorStatusFilter>("active");

  const placed = useMemo(() => getPlacedNodesByType(canvas, campaignState), [canvas, campaignState]);
  const filters = useMemo(() => ({ query, type, visibility, status }), [query, type, visibility, status]);

  const placedEntities = useMemo(() => filterNavigatorEntities(placed.entities.map((item) => item.entity), filters), [placed.entities, filters]);
  const placedFacts = useMemo(() => filterNavigatorFacts(placed.facts.map((item) => item.fact), filters), [placed.facts, filters]);
  const placedNotes = useMemo(() => filterNavigatorNotes(placed.notes.map((item) => item.node), filters), [placed.notes, filters]);
  const unplacedEntities = useMemo(() => filterNavigatorEntities(getUnplacedEntities(canvas, campaignState), filters), [canvas, campaignState, filters]);

  const nodeByEntityId = useMemo(() => new Map(placed.entities.map((item) => [item.entity.entityId, item.node])), [placed.entities]);
  const nodeByFactId = useMemo(() => new Map(placed.facts.map((item) => [item.fact.factId, item.node])), [placed.facts]);

  const [focusFallback, setFocusFallback] = useState<{ kind: "missing" | "addEntity"; id: string } | null>(null);

  const focusNode = (nodeId: string) => {
    setFocusFallback(onFocusNode(nodeId) ? null : { kind: "missing", id: nodeId });
  };

  const focusEntity = (entityId: string) => {
    setFocusFallback(onFocusEntity(entityId) ? null : { kind: "addEntity", id: entityId });
  };

  const focusFact = (factId: string) => {
    setFocusFallback(onFocusFact(factId) ? null : { kind: "missing", id: factId });
  };

  const handlePlaceEntity = async (entityId: string) => {
    const x = 120 + Math.round(Math.random() * 140);
    const y = 120 + Math.round(Math.random() * 140);
    await placeNodeOnCanvas(canvas.id, { kind: "entity", entityId, x, y });
    const createdNode = (useCampaignStore.getState().canvasesById[canvas.id]?.nodes as CanvasNode[] | undefined)
      ?.find((node) => node.entityId === entityId);
    if (createdNode?.id) {
      window.setTimeout(() => {
        const focused = onFocusEntity(entityId) || onFocusNode(createdNode.id);
        setFocusFallback(focused ? null : { kind: "missing", id: createdNode.id });
      }, 0);
    }
  };

  return (
    <aside className="canvas-navigator-panel" aria-label={t("canvas.navigator.title")}>
      <div className="canvas-navigator-panel__header">
        <h2>{t("canvas.navigator.title")}</h2>
      </div>

      <label className="canvas-navigator-search">
        <Search size={14} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("canvas.navigator.searchPlaceholder")} />
      </label>

      <div className="canvas-navigator-filters" aria-label={t("canvas.navigator.filtersLabel")}>
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label={t("canvas.navigator.typeFilter")}>
          <option value="all">{t("canvas.navigator.allTypes")}</option>
          <option value="fact">{t("canvas.navigator.facts")}</option>
          <option value="note">{t("canvas.navigator.notes")}</option>
          {ENTITY_TYPES.map((entityType) => <option key={entityType} value={entityType}>{t(`domain.entityTypes.${entityType}`)}</option>)}
        </select>
        <select value={visibility} onChange={(event) => setVisibility(event.target.value as CanvasNavigatorVisibilityFilter)} aria-label={t("canvas.navigator.visibilityFilter")}>
          <option value="all">{t("canvas.navigator.allVisibility")}</option>
          <option value="public">{t("canvas.navigator.public")}</option>
          <option value="private">{t("canvas.navigator.private")}</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as CanvasNavigatorStatusFilter)} aria-label={t("canvas.navigator.statusFilter")}>
          <option value="all">{t("canvas.navigator.allStatuses")}</option>
          <option value="active">{t("canvas.navigator.active")}</option>
          <option value="archived">{t("canvas.navigator.archived")}</option>
        </select>
      </div>

      <NavigatorSection title={t("canvas.navigator.inCanvas")} emptyText={t("canvas.navigator.emptyCanvasResults")}>
        {placedEntities.map((entity) => {
          const node = nodeByEntityId.get(entity.entityId);
          return node ? <ResultButton key={entity.entityId} label={entity.title} meta={entity.entityType} icon={<Crosshair size={13} />} onClick={() => focusEntity(entity.entityId)} fallback={focusFallback?.kind === "addEntity" && focusFallback.id === entity.entityId ? { label: t("canvas.navigator.addToCanvas"), onClick: () => void handlePlaceEntity(entity.entityId) } : undefined} /> : null;
        })}
        {placedFacts.map((fact) => {
          const node = nodeByFactId.get(fact.factId);
          return node ? <ResultButton key={fact.factId} label={fact.statement} meta={t("canvas.navigator.fact")} icon={<Crosshair size={13} />} onClick={() => focusFact(fact.factId)} fallback={focusFallback?.kind === "missing" && focusFallback.id === fact.factId ? { label: t("canvas.navigator.notFoundInCanvas") } : undefined} /> : null;
        })}
        {placedNotes.map((node) => <ResultButton key={node.id} label={node.title || node.text || t("canvas.navigator.untitledNote")} meta={t("canvas.navigator.note")} icon={<Crosshair size={13} />} onClick={() => focusNode(node.id)} fallback={focusFallback?.kind === "missing" && focusFallback.id === node.id ? { label: t("canvas.navigator.notFoundInCanvas") } : undefined} />)}
      </NavigatorSection>

      <NavigatorSection title={t("canvas.navigator.campaignArchive")} emptyText={t("canvas.navigator.emptyArchiveResults")}>
        {unplacedEntities.map((entity) => <ResultButton key={entity.entityId} label={entity.title} meta={entity.entityType} icon={<PlusCircle size={13} />} onClick={() => handlePlaceEntity(entity.entityId)} />)}
      </NavigatorSection>
    </aside>
  );
}

function NavigatorSection({ title, emptyText, children }: { title: string; emptyText: string; children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return <section className="canvas-navigator-section"><h3>{title}</h3>{items.length > 0 ? <div className="canvas-navigator-results">{items}</div> : <p className="canvas-navigator-empty">{emptyText}</p>}</section>;
}

function ResultButton({ label, meta, icon, onClick, fallback }: { label: string; meta: string; icon: React.ReactNode; onClick: () => void; fallback?: { label: string; onClick?: () => void } }) {
  return (
    <div className="canvas-navigator-result-group">
      <button type="button" className="canvas-navigator-result" onClick={onClick}>{icon}<span><strong>{label}</strong><small>{meta}</small></span></button>
      {fallback ? fallback.onClick ? (
        <button type="button" className="canvas-navigator-result-action" onClick={fallback.onClick}>{fallback.label}</button>
      ) : (
        <small className="canvas-navigator-result-action" role="status">{fallback.label}</small>
      ) : null}
    </div>
  );
}
