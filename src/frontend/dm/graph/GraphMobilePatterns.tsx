import type { ReactNode } from "react";
import { Filter, Layers, Maximize, Network, X } from "lucide-react";

export type GraphMobilePanel = "filters" | "legend" | "details" | null;

type GraphMobileFabProps = {
  onCreateRelation: () => void;
  onOpenFilters: () => void;
  onOpenLegend: () => void;
  onFit: () => void;
};

export function GraphMobileFab({ onCreateRelation, onOpenFilters, onOpenLegend, onFit }: GraphMobileFabProps) {
  return (
    <div className="graph-mobile-fab-stack" aria-label="Acciones rápidas del grafo">
      <button type="button" className="graph-mobile-mini-fab" onClick={onFit} aria-label="Ajustar grafo a pantalla">
        <Maximize size={16} />
      </button>
      <button type="button" className="graph-mobile-mini-fab" onClick={onOpenLegend} aria-label="Abrir leyenda del grafo">
        <Layers size={16} />
      </button>
      <button type="button" className="graph-mobile-mini-fab" onClick={onOpenFilters} aria-label="Abrir filtros del grafo">
        <Filter size={16} />
      </button>
      <button type="button" className="graph-mobile-main-fab" onClick={onCreateRelation} aria-label="Crear nueva relación">
        <Network size={20} />
      </button>
    </div>
  );
}

type GraphMobileSheetProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function GraphMobileSheet({ title, open, onClose, children }: GraphMobileSheetProps) {
  if (!open) return null;
  return (
    <>
      <button type="button" className="graph-mobile-sheet-backdrop" onClick={onClose} aria-label={`Cerrar ${title}`} />
      <section className="graph-mobile-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <header className="graph-mobile-sheet__header">
          <strong>{title}</strong>
          <button type="button" onClick={onClose} aria-label={`Cerrar ${title}`}>
            <X size={16} />
          </button>
        </header>
        <div className="graph-mobile-sheet__body">
          {children}
        </div>
      </section>
    </>
  );
}

export function GraphMobileTouchHint() {
  return (
    <div className="graph-mobile-touch-hint">
      <span>Explorar grafo</span>
      <small>Arrastra con un dedo · pellizca para zoom · toca un nodo</small>
    </div>
  );
}
