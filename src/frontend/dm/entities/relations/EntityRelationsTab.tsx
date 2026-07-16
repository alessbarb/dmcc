import { ChevronLeft } from "lucide-react";
import type { CampaignStateStore, Entity, Relation } from "../../../shared/stores/campaignStore.js";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

function getRelationsArray(relations: unknown): Relation[] {
  if (!relations) return [];
  if (Array.isArray(relations)) return relations;
  if (relations instanceof Map) return Array.from(relations.values());
  if (typeof relations === "object") return Object.values(relations);
  return [];
}

export interface EntityRelationsTabProps {
  entity: Entity;
  campaignState: CampaignState;
  onNavigateEntity?: (entityId: string) => void;
  canGoBack?: boolean;
  onBack?: () => void;
}

export function EntityRelationsTab({ entity, campaignState, onNavigateEntity, canGoBack, onBack }: EntityRelationsTabProps) {
  const relations = getRelationsArray(campaignState?.relations).filter(
    (r) =>
      !r.archived &&
      (r.sourceEntityId === entity.entityId || r.targetEntityId === entity.entityId)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

      {relations.length === 0 ? (
        <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", padding: "8px 0" }}>
          Esta entidad no tiene relaciones registradas.
        </p>
      ) : (
        relations.map((r) => {
          const isSource = r.sourceEntityId === entity.entityId;
          const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
          const other = campaignState?.entities?.find((e: Entity) => e.entityId === otherId && !e.archived);
          const otherLabel = other?.title ?? otherId;

          const OtherEntityLabel = () =>
            other && onNavigateEntity ? (
              <button
                type="button"
                onClick={() => onNavigateEntity(other.entityId)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  fontWeight: 700,
                  color: "var(--color-primary, hsl(210, 80%, 55%))",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {otherLabel}
              </button>
            ) : (
              <strong>{otherLabel}</strong>
            );

          return (
            <div
              key={r.relationId}
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
              <div>
                {isSource ? (
                  <>
                    <strong>Esta entidad</strong>{" "}
                    <span
                      style={{
                        padding: "1px 7px",
                        borderRadius: "var(--theme-shapes-radius-small)",
                        backgroundColor: "hsl(210, 60%, 20%)",
                        color: "hsl(210, 80%, 70%)",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                      }}
                    >
                      {r.relationType}
                    </span>{" "}
                    <OtherEntityLabel />
                  </>
                ) : (
                  <>
                    <OtherEntityLabel />{" "}
                    <span
                      style={{
                        padding: "1px 7px",
                        borderRadius: "var(--theme-shapes-radius-small)",
                        backgroundColor: "hsl(210, 60%, 20%)",
                        color: "hsl(210, 80%, 70%)",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                      }}
                    >
                      {r.relationType}
                    </span>{" "}
                    <strong>esta entidad</strong>
                  </>
                )}
              </div>
              {r.description && (
                <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.82rem", margin: 0 }}>
                  {r.description}
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
