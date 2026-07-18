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
      <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", padding: "8px 0" }}>
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
      style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}
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
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "flex-start",
                padding: "10px 12px",
                backgroundColor: "var(--theme-surfaces-interactive)",
                border: "none",
                borderRadius: "var(--theme-shapes-radius-small)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.88rem" }}>
                {neighbor.title}
                <span style={{ fontWeight: 400, color: "var(--theme-text-secondary)", fontSize: "0.76rem" }}>
                  {formatEntityType(neighbor.entityType, locale)}
                </span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {relations.map((relation) => (
                  <span
                    key={relation.relationId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.78rem",
                      color: "var(--theme-text-secondary)",
                    }}
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
