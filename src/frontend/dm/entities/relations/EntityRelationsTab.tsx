import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { CampaignStateStore, Entity } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import { buildEntityNeighborhood } from "./entityRelationshipNeighborhood.js";
import { RelationshipGraphCanvas } from "./RelationshipGraphCanvas.js";
import "./relationshipGraph.css";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

export interface EntityRelationsTabProps {
  entity: Entity;
  campaignState: CampaignState;
  onNavigateEntity?: (entityId: string) => void;
  canGoBack?: boolean;
  onBack?: () => void;
}

export function EntityRelationsTab({ entity, campaignState, onNavigateEntity, canGoBack, onBack }: EntityRelationsTabProps) {
  const { locale } = useTranslation();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const neighborhood = useMemo(
    () => buildEntityNeighborhood(entity, campaignState?.entities ?? [], campaignState?.relations ?? []),
    [entity, campaignState?.entities, campaignState?.relations],
  );

  const selectedConnection = neighborhood.connections.find((c) => c.connectionId === selectedConnectionId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {canGoBack && onBack && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ alignSelf: "flex-start" }}
        >
          <ChevronLeft size={14} /> Volver
        </button>
      )}

      {neighborhood.neighbors.length === 0 ? (
        <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", padding: "8px 0" }}>
          Esta entidad no tiene relaciones registradas.
        </p>
      ) : (
        <>
          <RelationshipGraphCanvas
            neighborhood={neighborhood}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={setSelectedConnectionId}
            onNavigateEntity={(entityId) => {
              setSelectedConnectionId(null);
              onNavigateEntity?.(entityId);
            }}
          />

          {selectedConnection ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {selectedConnection.relations.map((relation) => (
                <div
                  key={relation.relationId}
                  style={{
                    fontSize: "0.85rem",
                    padding: "10px 12px",
                    backgroundColor: "var(--theme-surfaces-interactive)",
                    borderRadius: "var(--theme-shapes-radius-small)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <strong>{formatRelationType(relation.relationType, locale)}</strong>
                  {relation.description && (
                    <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.82rem", margin: 0 }}>
                      {relation.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.82rem", margin: 0 }}>
              Pulsa una arista para ver el detalle de la relación.
            </p>
          )}
        </>
      )}

      {neighborhood.missingEntityRelations.length > 0 && (
        <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.78rem", margin: 0 }}>
          {neighborhood.missingEntityRelations.length === 1
            ? "1 relación apunta a una entidad no disponible."
            : `${neighborhood.missingEntityRelations.length} relaciones apuntan a entidades no disponibles.`}
        </p>
      )}
    </div>
  );
}
