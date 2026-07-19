import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { formatEntityType, formatRelationType } from "@shared/i18n/index.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import type { EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";

export interface EntityRelationsListProps {
  neighborhood: EntityRelationshipNeighborhood;
  onNavigateEntity: (entityId: string) => void;
}

/**
 * Plain, keyboard-and-screen-reader-friendly alternative to the graph canvas:
 * every neighbor is a native, tabbable `<button>`, no pointer-driven pan/zoom
 * required. Shares the same (already filtered) neighborhood as the canvas,
 * so both views always agree on what's visible.
 */
export function EntityRelationsList({ neighborhood, onNavigateEntity }: EntityRelationsListProps) {
  const { t, locale } = useTranslation();

  if (neighborhood.neighbors.length === 0) {
    return (
      <p className="entity-relations-list-empty">
        {t("entityDetail.relationsGraph.listEmpty")}
      </p>
    );
  }

  const connectionByNeighborId = new Map(
    neighborhood.connections.map((connection) => {
      const neighborId = connection.entityAId === neighborhood.center.entityId ? connection.entityBId : connection.entityAId;
      return [neighborId, connection] as const;
    }),
  );

  return (
    <ul
      className="entity-relations-list"
      aria-label={t("entityDetail.tabsRelations")}
    >
      {neighborhood.neighbors.map((neighbor) => {
        const connection = connectionByNeighborId.get(neighbor.entityId);
        const relations = connection?.relations ?? [];

        return (
          <li key={neighbor.entityId}>
            <button
              type="button"
              onClick={() => onNavigateEntity(neighbor.entityId)}
              className="entity-relations-list__item"
            >
              <span className="entity-relations-list__title">
                {neighbor.title}
                <span className="entity-relations-list__type">
                  {formatEntityType(neighbor.entityType, locale)}
                </span>
              </span>
              <span className="entity-relations-list__relations">
                {relations.map((relation) => (
                  <span
                    key={relation.relationId}
                    className="entity-relations-list__relation"
                  >
                    {relation.orientationFromCenter === "self" ? (
                      <ArrowLeftRight size={12} />
                    ) : (
                      <ArrowRight size={12} />
                    )}
                    {formatRelationType(relation.relationType, locale)}
                  </span>
                ))}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
