import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Expand, Focus, X } from "lucide-react";
// @ts-ignore -- Vite supports explicit TSX imports in source modules.
import { EntityDetailModal as StandardEntityDetailModal } from "./EntityDetailModal.tsx";
// @ts-ignore -- Vite supports explicit TSX imports in source modules.
import { PlayerCharacterDetailModal } from "./PlayerCharacterDetailModal.tsx";
import { EntityImageReframeDialog } from "../../shared/components/EntityImageReframeDialog.js";
import {
  DEFAULT_IMAGE_FOCAL_POINT,
  parseImageFocalPoint,
  withImageFocalPoint,
} from "../../shared/images/imageFocalPoint.js";
import "./playerCharacterDetail.css";
import "./entityDetailHeroActions.css";

function resolveEntityImage(entity) {
  const metadata = entity?.metadata ?? {};
  const candidates = [metadata.imageUrl, metadata.avatarUrl, metadata.portraitUrl, metadata.coverUrl];
  return candidates.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? null;
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
    <div
      className="entity-image-lightbox"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="entity-image-lightbox__stage"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <img src={imageUrl} alt={title} />

        <button
          type="button"
          className="btn btn-secondary btn-icon entity-image-lightbox__close"
          onClick={onClose}
          aria-label="Cerrar imagen"
          title="Cerrar imagen"
        >
          <X size={20} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

function StandardEntityDetailWithImageFocus(props) {
  const rootRef = useRef(null);
  const metadata = props.selectedEntity?.metadata ?? {};
  const imageUrl = useMemo(
    () => resolveEntityImage(props.selectedEntity),
    [props.selectedEntity],
  );
  const storedFocus = useMemo(
    () => parseImageFocalPoint(imageUrl) ?? DEFAULT_IMAGE_FOCAL_POINT,
    [imageUrl],
  );
  const [focusX, setFocusX] = useState(() => storedFocus.x * 100);
  const [focusY, setFocusY] = useState(() => storedFocus.y * 100);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setFocusX(storedFocus.x * 100);
    setFocusY(storedFocus.y * 100);
  }, [
    storedFocus.x,
    storedFocus.y,
    props.selectedEntity?.entityId,
  ]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const image = root.querySelector(
      ".modal-content > div:first-child > img",
    );
    if (!image) return undefined;

    image.style.setProperty(
      "--entity-detail-image-position",
      `${focusX}% ${focusY}%`,
    );
    image.classList.add("entity-detail-hero-image");

    const openImage = () => {
      if (imageUrl) setIsExpanded(true);
    };
    image.addEventListener("click", openImage);
    return () => image.removeEventListener("click", openImage);
  }, [focusX, focusY, imageUrl]);

  const saveFocus = async (nextX, nextY) => {
    if (!imageUrl) return;

    const {
      imageFocusX,
      imageFocusY,
      ...metadataWithoutLegacyFocus
    } = metadata;

    // Estos campos pertenecen al sistema anterior. Se leen únicamente
    // para omitirlos al guardar la metadata normalizada.
    void imageFocusX;
    void imageFocusY;

    await props.onEdit(props.selectedEntity.entityId, {
      metadata: {
        ...metadataWithoutLegacyFocus,
        imageUrl: withImageFocalPoint(imageUrl, {
          x: nextX / 100,
          y: nextY / 100,
        }),
      },
    });

    setFocusX(nextX);
    setFocusY(nextY);
    setIsAdjusting(false);
  };

  return (
    <div ref={rootRef} className="entity-detail-focus-shell">
      <StandardEntityDetailModal
        {...props}
        heroActions={imageUrl ? (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsAdjusting(true);
              }}
              aria-label="Ajustar encuadre"
              title="Ajustar encuadre"
            >
              <Focus size={16} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsExpanded(true);
              }}
              aria-label="Ver imagen completa"
              title="Ver imagen completa"
            >
              <Expand size={16} />
            </button>
          </>
        ) : null}
      />
      {isAdjusting && imageUrl && (
        <EntityImageReframeDialog
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
