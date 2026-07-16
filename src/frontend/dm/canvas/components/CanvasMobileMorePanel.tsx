import type { Dispatch, SetStateAction } from "react";
import { CalendarDays, Frame, Maximize2, Play, Shield, SlidersHorizontal, StickyNote, X, ZoomIn, ZoomOut } from "lucide-react";

interface CanvasMobileMorePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: () => void;
  onAddGroup: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  tablePrivacy: boolean;
  setTablePrivacy: Dispatch<SetStateAction<boolean>>;
  typeFilter: string;
  setTypeFilter: Dispatch<SetStateAction<string>>;
  onPrepareSession: () => void;
  isFullscreenPresentation: boolean;
  onTogglePresentation: () => void;
  onCreateBoard: () => void;
  onImport: () => void;
  onOpenLegend: () => void;
  onOpenLint: () => void;
}

export function CanvasMobileMorePanel({
  isOpen,
  onClose,
  onAddNote,
  onAddGroup,
  onFitView,
  onZoomIn,
  onZoomOut,
  tablePrivacy,
  setTablePrivacy,
  typeFilter,
  setTypeFilter,
  onPrepareSession,
  isFullscreenPresentation,
  onTogglePresentation,
  onCreateBoard,
  onImport,
  onOpenLegend,
  onOpenLint,
}: CanvasMobileMorePanelProps) {
  return (
    <div className={`canvas-mobile-more-panel ${isOpen ? "is-open" : ""}`} aria-label="Acciones secundarias del canvas">
      <div className="canvas-mobile-sheet-header">
        <span>Más acciones</span>
        <button type="button" className="canvas-mobile-sheet-close" onClick={onClose} aria-label="Cerrar panel de más acciones">
          <X size={16} />
        </button>
      </div>
      <div className="canvas-mobile-more-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAddNote}><StickyNote size={14} /> Nota rápida</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAddGroup}><Frame size={14} /> Grupo visual</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onFitView}><Maximize2 size={14} /> Ajustar vista</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onZoomIn}><ZoomIn size={14} /> Zoom +</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onZoomOut}><ZoomOut size={14} /> Zoom -</button>
        <button type="button" className={`btn btn-sm ${tablePrivacy ? "btn-primary" : "btn-secondary"}`} onClick={() => setTablePrivacy(value => !value)}><Shield size={14} /> Privacidad de mesa</button>
        <label className="canvas-mobile-more-field"><SlidersHorizontal size={14} /> Filtros<select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="canvas-select"><option value="all">Todos los tipos</option><option value="npc">PNJs</option><option value="location">Lugares</option><option value="quest">Misiones</option><option value="clue">Pistas</option><option value="secret">Secretos</option><option value="scene">Escenas</option><option value="other">Otros</option></select></label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onPrepareSession}><CalendarDays size={14} /> Preparar sesión</button>
        <button type="button" className={`btn btn-sm ${isFullscreenPresentation ? "btn-primary" : "btn-secondary"}`} onClick={onTogglePresentation}><Play size={14} /> Modo presentación</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCreateBoard}>Nuevo tablero</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onImport}>Importar texto</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenLegend}>Leyenda</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenLint}>Consistencia</button>
      </div>
    </div>
  );
}
