import { useState } from "react";
import { ImagePlus, Move, Pencil } from "lucide-react";
import { ImagePickerModal, type ImageCatalogType } from "./ImagePickerModal.js";
import { EntityImageReframeDialog } from "./EntityImageReframeDialog.js";
import {
  DEFAULT_IMAGE_FOCAL_POINT,
  imageFocalPointToObjectPosition,
  parseImageFocalPoint,
  stripImageFocalPoint,
  withImageFocalPoint,
} from "../images/imageFocalPoint.js";

interface ImagePickerButtonProps {
  value: string;
  onChange: (path: string) => void;
  catalog: ImageCatalogType;
  defaultImage?: string;
  shape?: "circle" | "rect";
}

export function ImagePickerButton({
  value,
  onChange,
  catalog,
  defaultImage,
  shape = "circle",
}: ImagePickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [reframing, setReframing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const rawDisplaySrc = value || defaultImage || "";
  const displaySrc = rawDisplaySrc ? stripImageFocalPoint(rawDisplaySrc) : "";
  const isCircle = shape === "circle";
  const isEntityPreview = catalog === "entities";
  const focalPoint = parseImageFocalPoint(value) ?? DEFAULT_IMAGE_FOCAL_POINT;

  const handleSelect = (path: string) => {
    onChange(
      isEntityPreview && path
        ? withImageFocalPoint(path, DEFAULT_IMAGE_FOCAL_POINT)
        : path,
    );
    setOpen(false);
  };

  if (isEntityPreview) {
    const saveReframe = (nextX: number, nextY: number) => {
      onChange(
        withImageFocalPoint(
          value || displaySrc,
          {
            x: nextX / 100,
            y: nextY / 100,
          },
        ),
      );
      setReframing(false);
    };

    return (
      <>
        <div
          className="image-picker-button__entity-editor"
        >
          <div className="image-picker-button__entity-preview">
            {displaySrc ? (
              <img
                src={displaySrc}
                alt="Previsualización de la entidad"
                className="image-picker-button__entity-image"
                style={{ "--image-focal-point": imageFocalPointToObjectPosition(focalPoint) } as React.CSSProperties}
              />
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="image-picker-button__empty-entity"
              >
                <ImagePlus size={28} />
                <span>Seleccionar imagen</span>
              </button>
            )}
          </div>

          <div className="entity-image-editor-actions">
            {displaySrc && (
              <button
                type="button"
                className="btn btn-secondary entity-image-editor-action"
                onClick={() => setReframing(true)}
              >
                <Move size={15} />
                <span>Reencuadrar</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary entity-image-editor-action"
              onClick={() => setOpen(true)}
            >
              <Pencil size={15} />
              <span>
                {displaySrc ? "Cambiar imagen" : "Elegir imagen"}
              </span>
            </button>
          </div>
        </div>

        {reframing && displaySrc && (
          <EntityImageReframeDialog
            imageUrl={displaySrc}
            title="Imagen de la entidad"
            initialX={focalPoint.x * 100}
            initialY={focalPoint.y * 100}
            onCancel={() => setReframing(false)}
            onSave={saveReframe}
          />
        )}

        {open && (
          <ImagePickerModal
            catalog={catalog}
            value={stripImageFocalPoint(value)}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`image-picker-button ${isCircle ? "image-picker-button--circle" : "image-picker-button--rect"}`}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Cambiar imagen"
        aria-label="Cambiar imagen"
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="Imagen seleccionada"
            className="image-picker-button__image"
          />
        ) : (
          <div className="image-picker-button__empty">
            Sin imagen
          </div>
        )}
        <div className={`image-picker-button__hover ${hovered ? "is-visible" : ""}`}>
          <Pencil size={18} />
        </div>
      </button>
      {open && (
        <ImagePickerModal
          catalog={catalog}
          value={value}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
