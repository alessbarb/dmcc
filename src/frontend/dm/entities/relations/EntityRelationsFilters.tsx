import { formatEntityType } from "@shared/i18n/index.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import type { EntityRelationshipFilters } from "./filterEntityNeighborhood.js";

export interface EntityRelationsFiltersProps {
  filters: EntityRelationshipFilters;
  onChange: (filters: EntityRelationshipFilters) => void;
  /** Every entity type present among the unfiltered neighbors — options stay
   *  stable regardless of what the current filter selection hides. */
  availableEntityTypes: string[];
}

const DIRECTIONS: EntityRelationshipFilters["direction"][] = ["all", "incoming", "outgoing"];

export function EntityRelationsFilters({ filters, onChange, availableEntityTypes }: EntityRelationsFiltersProps) {
  const { t, locale } = useTranslation();

  const directionLabel = (direction: EntityRelationshipFilters["direction"]) =>
    ({
      all: t("entityDetail.relationsGraph.filterDirectionAll"),
      incoming: t("entityDetail.relationsGraph.filterDirectionIncoming"),
      outgoing: t("entityDetail.relationsGraph.filterDirectionOutgoing"),
    })[direction];

  const toggleEntityType = (entityType: string) => {
    const next = filters.entityTypes.includes(entityType)
      ? filters.entityTypes.filter((type) => type !== entityType)
      : [...filters.entityTypes, entityType];
    onChange({ ...filters, entityTypes: next });
  };

  return (
    <div className="entity-relations-filters">
      <div role="group" aria-label={t("entityDetail.relationsGraph.filtersLabel")} className="entity-relations-filters__directions">
        {DIRECTIONS.map((direction) => (
          <button
            key={direction}
            type="button"
            className={`btn btn-sm ${filters.direction === direction ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onChange({ ...filters, direction })}
            aria-pressed={filters.direction === direction}
          >
            {directionLabel(direction)}
          </button>
        ))}
      </div>
      {availableEntityTypes.length > 1 && (
        <div className="entity-relations-filters__types">
          <button
            type="button"
            className={`btn btn-sm ${filters.entityTypes.length === 0 ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onChange({ ...filters, entityTypes: [] })}
            aria-pressed={filters.entityTypes.length === 0}
          >
            {t("entityDetail.relationsGraph.filterTypesAll")}
          </button>
          {availableEntityTypes.map((entityType) => (
            <button
              key={entityType}
              type="button"
              className={`btn btn-sm ${filters.entityTypes.includes(entityType) ? "btn-primary" : "btn-secondary"}`}
              onClick={() => toggleEntityType(entityType)}
              aria-pressed={filters.entityTypes.includes(entityType)}
            >
              {formatEntityType(entityType, locale)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
