import type { TFunction } from "i18next";
import { GraphNodeSearch } from "./GraphNodeSearch.js";
import type { GraphSearchItem } from "./GraphNodeSearch.js";

export type FilterPreset = "todos" | "nextSession" | "criticalClues" | "unrevealedSecrets" | "misiones" | "personajes" | "secretos" | "lugares" | "facciones" | "consecuencias";
export type GraphViewMode = "all" | "dm_only" | "players";
export type GraphLabelsMode = "auto" | "all" | "minimal";

export const GRAPH_FILTER_PRESETS: FilterPreset[] = [
  "todos",
  "nextSession",
  "criticalClues",
  "unrevealedSecrets",
  "misiones",
  "personajes",
  "secretos",
  "lugares",
  "facciones",
  "consecuencias",
];

export interface GraphFiltersProps {
  graphSearchItems: GraphSearchItem[];
  onSelectNode: (nodeId: string) => void;
  preset: FilterPreset;
  onPresetChange: (preset: FilterPreset) => void;
  viewMode: GraphViewMode;
  onViewModeChange: (mode: GraphViewMode) => void;
  labelsMode: GraphLabelsMode;
  onLabelsModeChange: (mode: GraphLabelsMode) => void;
  t: TFunction;
}

export function GraphFilters({
  graphSearchItems,
  onSelectNode,
  preset,
  onPresetChange,
  viewMode,
  onViewModeChange,
  labelsMode,
  onLabelsModeChange,
  t,
}: GraphFiltersProps) {
  return (
    <div className="graph-page-filters">
      <GraphNodeSearch items={graphSearchItems} onSelectNode={onSelectNode} />

      <div className="graph-filter-chip-cloud">
        <span className="graph-filter-label">Filtro:</span>
        {GRAPH_FILTER_PRESETS.map((filterPreset) => (
          <button
            key={filterPreset}
            className={`btn btn-sm ${preset === filterPreset ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onPresetChange(filterPreset)}
          >
            {t(`graph.presets.${filterPreset}`)}
          </button>
        ))}

        <span className="graph-filter-label">Vista:</span>
        {(["all", "dm_only", "players"] as GraphViewMode[]).map((mode) => (
          <button
            key={mode}
            className={`btn btn-sm ${viewMode === mode ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onViewModeChange(mode)}
          >
            {mode === "all" ? "Todo" : mode === "dm_only" ? "Solo DM" : "Solo jugadores"}
          </button>
        ))}

        <span className="graph-filter-label">Etiquetas:</span>
        {(["auto", "all", "minimal"] as GraphLabelsMode[]).map((mode) => (
          <button
            key={mode}
            className={`btn btn-sm ${labelsMode === mode ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onLabelsModeChange(mode)}
          >
            {t(`graph.labels.${mode}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
