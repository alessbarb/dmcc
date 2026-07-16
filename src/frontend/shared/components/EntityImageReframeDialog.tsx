import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Move, RotateCcw, X } from "lucide-react";
import { stripImageFocalPoint } from "../images/imageFocalPoint.js";
import "./entityImageReframeDialog.css";

interface EntityImageReframeDialogProps {
  imageUrl: string;
  title: string;
  initialX: number;
  initialY: number;
  onCancel: () => void;
  onSave: (focusX: number, focusY: number) => void | Promise<void>;
}

interface DragState {
  pointerId: number;
  clientX: number;
  clientY: number;
  focusX: number;
  focusY: number;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function EntityImageReframeDialog({
  imageUrl,
  title,
  initialX,
  initialY,
  onCancel,
  onSave,
}: EntityImageReframeDialogProps) {
  const [focusX, setFocusX] = useState(() => clampPercent(initialX));
  const [focusY, setFocusY] = useState(() => clampPercent(initialY));
  const [isDragging, setIsDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const detailPreviewImageRef = useRef<HTMLImageElement>(null);
  const cardPreviewImageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragState | null>(null);

  /*
   * Dentro del editor el estado local es la única fuente de verdad.
   * Retiramos #dmcc-focus= para impedir que el aplicador global fuerce
   * el encuadre persistido con !important durante el arrastre.
   */
  const previewImageUrl = stripImageFocalPoint(imageUrl);

  useEffect(() => {
    const objectPosition = `${focusX}% ${focusY}%`;

    /*
     * applyStoredImageFocalPoint puede haber dejado un object-position inline
     * con !important. React no puede sustituir esa prioridad mediante la prop
     * style, así que ambas previsualizaciones se actualizan explícitamente.
     */
    detailPreviewImageRef.current?.style.setProperty(
      "object-position",
      objectPosition,
      "important",
    );

    cardPreviewImageRef.current?.style.setProperty(
      "object-position",
      objectPosition,
      "important",
    );
  }, [focusX, focusY, previewImageUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      focusX,
      focusY,
    };

    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    const drag = dragRef.current;

    if (!frame || !drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const bounds = frame.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const deltaX = event.clientX - drag.clientX;
    const deltaY = event.clientY - drag.clientY;

    /*
     * Al arrastrar la imagen hacia la derecha, reducimos object-position X.
     * De esta forma la imagen se comporta como una superficie desplazable,
     * no como un selector abstracto de coordenadas.
     */
    setFocusX(clampPercent(drag.focusX - (deltaX / bounds.width) * 100));
    setFocusY(clampPercent(drag.focusY - (deltaY / bounds.height) * 100));
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      dragRef.current &&
      dragRef.current.pointerId === event.pointerId &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setIsDragging(false);
  };

  const reset = () => {
    setFocusX(50);
    setFocusY(42);
  };

  return createPortal(
    <div
      className="entity-reframe-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        className="entity-reframe-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-reframe-title"
      >
        <header className="entity-reframe-dialog__header">
          <div>
            <h2 id="entity-reframe-title">Reencuadrar imagen</h2>
            <p>
              Arrastra la imagen para ajustar la cabecera. A la derecha puedes
              comprobar cómo se adapta el mismo foco al listado.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onCancel}
            aria-label="Cerrar"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="entity-reframe-dialog__body">
          <section className="entity-reframe-surface">
            <div className="entity-reframe-surface__heading">
              <div>
                <span>Cabecera de detalle</span>
                <p>
                  Arrastra la imagen para ajustar el encuadre principal.
                </p>
              </div>
            </div>

            <div
              ref={frameRef}
              className={`entity-reframe-frame${isDragging ? " entity-reframe-frame--dragging" : ""}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
            >
              <img
                ref={detailPreviewImageRef}
                src={previewImageUrl}
                alt={`Encuadre de ${title}`}
                draggable={false}

              />

              <div className="entity-reframe-frame__hint" aria-hidden="true">
                <Move size={17} />
                Arrastra para reencuadrar
              </div>
            </div>
          </section>

          <aside className="entity-reframe-card-preview">
            <div className="entity-reframe-surface__heading">
              <div>
                <span>Recorte aproximado del listado</span>
                <p>
                  La tarjeta es más alta y muestra más imagen que la cabecera.
                </p>
              </div>
            </div>

            <div className="entity-reframe-card-preview__frame">
              <img
                ref={cardPreviewImageRef}
                src={previewImageUrl}
                alt={`Recorte de listado de ${title}`}
                draggable={false}
              />

              <div
                className="entity-reframe-card-preview__fade"
                aria-hidden="true"
              />
            </div>

            <p className="entity-reframe-card-preview__notice">
              Este recorte es orientativo. El mismo foco se aplica al
              listado real.
            </p>
          </aside>
        </div>

        <footer className="entity-reframe-dialog__footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={reset}
          >
            <RotateCcw size={15} />
            Restablecer
          </button>

          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void onSave(focusX, focusY)}
            >
              Guardar encuadre
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
