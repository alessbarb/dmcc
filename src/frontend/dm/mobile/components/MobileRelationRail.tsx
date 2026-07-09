import type { MobileRelationSummary } from "../types.js";

interface MobileRelationRailProps {
  relations: MobileRelationSummary[];
  onOpenEntity?: (entityId: string) => void;
  onOpenPath?: (entityId: string) => void;
}

export function MobileRelationRail({ relations, onOpenEntity, onOpenPath }: MobileRelationRailProps) {
  if (relations.length === 0) return <p className="mobile-relation-rail__empty">Sin relaciones cercanas.</p>;
  return (
    <section className="mobile-relation-rail" aria-label="Relaciones cercanas">
      <h2>Conectado con</h2>
      <div className="mobile-relation-rail__items">
        {relations.map((relation) => {
          const destinationId = relation.direction === "outgoing" ? relation.targetEntityId : relation.sourceEntityId;
          return (
            <article key={relation.id} className="mobile-relation-rail__item">
              <button type="button" onClick={() => onOpenEntity?.(destinationId)}>
                <span aria-hidden="true">{relation.direction === "outgoing" ? "→" : "←"}</span>
                <strong>{relation.targetTitle}</strong>
                <small>{relation.relationType}</small>
              </button>
              <button type="button" onClick={() => onOpenPath?.(destinationId)} aria-label={`Ver camino hacia ${relation.targetTitle}`}>Camino</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
