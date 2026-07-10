import { Plus } from "lucide-react";

type GraphHeaderProps = {
  visibleNodeCount: number;
  visibleLinkCount: number;
  onCreateRelation: () => void;
};

export function GraphHeader({ visibleNodeCount, visibleLinkCount, onCreateRelation }: GraphHeaderProps) {
  return (
    <div className="graph-page-header">
      <div>
        <h2>Grafo narrativo</h2>
        <p>
          {visibleNodeCount} nodos · {visibleLinkCount} relaciones visibles
        </p>
      </div>
      <button className="btn btn-secondary btn-sm graph-page-header__action" onClick={onCreateRelation}>
        <Plus size={16} /> Nueva relación
      </button>
    </div>
  );
}
