import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Expand, Focus, RotateCcw, X } from "lucide-react";
// @ts-ignore -- Vite supports explicit TSX imports in source modules.
import { EntityDetailModal as StandardEntityDetailModal } from "./EntityDetailModal.tsx";
// @ts-ignore -- Vite supports explicit TSX imports in source modules.
import { PlayerCharacterDetailModal } from "./PlayerCharacterDetailModal.tsx";
import "./playerCharacterDetail.css";
import "./entityDetailHeroActions.css";

function clampFocus(value, fallback = 50) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : fallback;
}

function resolveEntityImage(entity) {
  const metadata = entity?.metadata ?? {};
  const candidates = [metadata.imageUrl, metadata.avatarUrl, metadata.portraitUrl, metadata.coverUrl];
  return candidates.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? null;
}

function ImageFocusDialog({ imageUrl, title, initialX, initialY, onCancel, onSave }) {
  const [focusX, setFocusX] = useState(initialX);
  const [focusY, setFocusY] = useState(initialY);
  const previewRef = useRef(null);

  const updateFromPointer = (event) => {
    const bounds = previewRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setFocusX(clampFocus(((event.clientX - bounds.left) / bounds.width) * 100));
    setFocusY(clampFocus(((event.clientY - bounds.top) / bounds.height) * 100));
  };

  return createPortal(
    <div className="entity-image-dialog-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section className="entity-image-dialog" role="dialog" aria-modal="true" aria-labelledby="entity-image-focus-title">
        <header>
          <div>
            <h2 id="entity-image-focus-title">Ajustar encuadre</h2>
            <p>Haz clic o arrastra el punto hasta el motivo principal de la imagen.</p>
          </div>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onCancel} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div
          ref={previewRef}
          className="entity-image-focus-preview"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event);
          }}
        >
          <img src={imageUrl} alt={title} style={{ objectPosition: `${focusX}% ${focusY}%` }} />
          <span className="entity-image-focus-target" style={{ left: `${focusX}%`, top: `${focusY}%` }} aria-hidden="true" />
        </div>

        <div className="entity-image-focus-sliders">
          <label>
            Horizontal
            <input type="range" min="0" max="100" value={focusX} onChange={(event) => setFocusX(Number(event.target.value))} />
          </label>
          <label>
            Vertical
            <input type="range" min="0" max="100" value={focusY} onChange={(event) => setFocusY(Number(event.target.value))} />
          </label>
        </div>

        <footer>
          <button type="button" className="btn btn-secondary" onClick={() => { setFocusX(50); setFocusY(50); }}>
            <RotateCcw size={15} /> Centrar
          </button>
          <div>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={() => onSave(focusX, focusY)}>Guardar encuadre</button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function FullImageDialog({ imageUrl, title, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="entity-image-lightbox" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Cerrar imagen">
        <X size={20} />
      </button>
      <img src={imageUrl} alt={title} />
    </div>,
    document.body,
  );
}

function StandardEntityDetailWithImageFocus(props) {
  const rootRef = useRef(null);
  const metadata = props.selectedEntity?.metadata ?? {};
  const [focusX, setFocusX] = useState(() => clampFocus(metadata.imageFocusX));
  const [focusY, setFocusY] = useState(() => clampFocus(metadata.imageFocusY));
  const [heroElement, setHeroElement] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = useMemo(() => resolveEntityImage(props.selectedEntity), [props.selectedEntity]);

  useEffect(() => {
    setFocusX(clampFocus(metadata.imageFocusX));
    setFocusY(clampFocus(metadata.imageFocusY));
  }, [metadata.imageFocusX, metadata.imageFocusY, props.selectedEntity?.entityId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const hero = root.querySelector(".modal-content > div:first-child");
    const image = hero?.querySelector("img");
    if (!hero || !image) return undefined;

    setHeroElement(hero);
    image.style.objectPosition = `${focusX}% ${focusY}%`;
    image.classList.add("entity-detail-hero-image");

    const openImage = () => {
      if (imageUrl) setIsExpanded(true);
    };
    image.addEventListener("click", openImage);
    return () => image.removeEventListener("click", openImage);
  }, [focusX, focusY, imageUrl]);

  const saveFocus = async (nextX, nextY) => {
    await props.onEdit(props.selectedEntity.entityId, {
      metadata: {
        ...metadata,
        imageFocusX: Math.round(nextX),
        imageFocusY: Math.round(nextY),
      },
    });
    setFocusX(nextX);
    setFocusY(nextY);
    setIsAdjusting(false);
  };

  const stopHeroActionEvent = (event) => {
    event.stopPropagation();
  };

  return (
    <div ref={rootRef} className="entity-detail-focus-shell">
      <StandardEntityDetailModal {...props} />
      {heroElement && createPortal(
        <div
          className="entity-image-hero-actions"
          role="toolbar"
          aria-label="Acciones de la imagen y del modal"
          onPointerDown={stopHeroActionEvent}
          onMouseDown={stopHeroActionEvent}
          onClick={stopHeroActionEvent}
        >
          {imageUrl && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsAdjusting(true)}
                aria-label="Ajustar encuadre"
                title="Ajustar encuadre"
              >
                <Focus size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsExpanded(true)}
                aria-label="Ver imagen completa"
                title="Ver imagen completa"
              >
                <Expand size={16} />
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={props.onClose}
            aria-label="Cerrar entidad"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>,
        heroElement,
      )}
      {isAdjusting && imageUrl && (
        <ImageFocusDialog
          imageUrl={imageUrl}
          title={props.selectedEntity.title}
          initialX={focusX}
          initialY={focusY}
          onCancel={() => setIsAdjusting(false)}
          onSave={(nextX, nextY) => void saveFocus(nextX, nextY)}
        />
      )}
      {isExpanded && imageUrl && (
        <FullImageDialog imageUrl={imageUrl} title={props.selectedEntity.title} onClose={() => setIsExpanded(false)} />
      )}
    </div>
  );
}

export function EntityDetailModalBridge(props) {
  const [showStandardModal, setShowStandardModal] = useState(false);

  if (props.selectedEntity?.entityType !== "player_character" || showStandardModal) {
    return <StandardEntityDetailWithImageFocus {...props} />;
  }

  return (
    <PlayerCharacterDetailModal
      {...props}
      onOpenLegacy={() => setShowStandardModal(true)}
    />
  );
}
