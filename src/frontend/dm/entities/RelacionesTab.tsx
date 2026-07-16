import type { Entity, Relation, CampaignStateStore } from "../../shared/stores/campaignStore.js";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

export function RelacionesTab({
  entity,
  campaignState,
  relations,
}: {
  entity: Entity;
  campaignState: CampaignState;
  relations: Relation[];
}) {
  const entityRelations = relations.filter(
    (r) =>
      !r.archived &&
      (r.sourceEntityId === entity.entityId || r.targetEntityId === entity.entityId)
  );

  if (entityRelations.length === 0) {
    return (
      <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", padding: "8px 0" }}>
        Esta entidad no tiene relaciones registradas.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {entityRelations.map((r) => {
        const isSource = r.sourceEntityId === entity.entityId;
        const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
        const other = campaignState?.entities?.find(
          (e: Entity) => e.entityId === otherId
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
                  <strong>{other?.title ?? otherId}</strong>
                </>
              ) : (
                <>
                  <strong>{other?.title ?? otherId}</strong>{" "}
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
      })}
    </div>
  );
}
