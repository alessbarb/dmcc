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
          style={{
            display: "grid",
            gridTemplateRows: "minmax(180px, 1fr) auto",
            width: "min(100%, 460px)",
            minWidth: 0,
            overflow: "hidden",
            border: "1px solid var(--theme-borders-default, #444)",
            borderRadius: "var(--theme-shapes-radius-medium, 10px)",
            background: "var(--theme-surfaces-raised)",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.22)",
          }}
        >
          <div
            style={{
              position: "relative",
              minHeight: "180px",
              overflow: "hidden",
              background: "var(--theme-surfaces-interactive, #111)",
            }}
          >
            {displaySrc ? (
              <img
                src={displaySrc}
                alt="Previsualización de la entidad"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "180px",
                  maxHeight: "260px",
                  objectFit: "cover",
                  objectPosition: imageFocalPointToObjectPosition(focalPoint),
                  display: "block",
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                style={{
                  width: "100%",
                  minHeight: "180px",
                  display: "grid",
                  placeItems: "center",
                  gap: "8px",
                  border: 0,
                  color: "var(--theme-text-secondary, #888)",
                  background: "transparent",
                  cursor: "pointer",
                }}
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

  const containerStyle: React.CSSProperties = isCircle
    ? { width: "72px", height: "72px", borderRadius: "50%" }
    : { width: "120px", height: "72px", borderRadius: "var(--theme-shapes-radius-small, 6px)" };

  return (
    <>
      <button
        type="button"
        style={{
          position: "relative",
          display: "inline-block",
          flexShrink: 0,
          ...containerStyle,
          overflow: "hidden",
          border: "2px solid var(--theme-borders-default, #444)",
          background: "var(--theme-surfaces-raised)",
          cursor: "pointer",
          padding: 0,
          appearance: "none",
        }}
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
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--theme-text-secondary, #888)",
              fontSize: "11px",
              textAlign: "center",
              padding: "4px",
            }}
          >
            Sin imagen
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s",
          }}
        >
          <Pencil size={18} color="#fff" />
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
