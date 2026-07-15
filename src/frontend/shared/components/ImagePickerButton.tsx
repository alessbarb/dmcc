import { useState } from "react";
import { Crosshair, ImagePlus, Pencil, RotateCcw } from "lucide-react";
import { ImagePickerModal, type ImageCatalogType } from "./ImagePickerModal.js";
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
  const [hovered, setHovered] = useState(false);
  const rawDisplaySrc = value || defaultImage || "";
  const displaySrc = rawDisplaySrc ? stripImageFocalPoint(rawDisplaySrc) : "";
  const isCircle = shape === "circle";
  const isEntityPreview = catalog === "entities" && !isCircle;
  const focalPoint = parseImageFocalPoint(value) ?? DEFAULT_IMAGE_FOCAL_POINT;

  const handleSelect = (path: string) => {
    onChange(
      isEntityPreview && path
        ? withImageFocalPoint(path, DEFAULT_IMAGE_FOCAL_POINT)
        : path,
    );
    setOpen(false);
  };

  const handleSetFocalPoint = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!displaySrc) {
      setOpen(true);
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    onChange(withImageFocalPoint(value || displaySrc, { x, y }));
  };

  if (isEntityPreview) {
    return (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateRows: "minmax(180px, 1fr) auto",
            width: "min(100%, 460px)",
            minWidth: 0,
            overflow: "hidden",
            border: "1px solid var(--border-color, #444)",
            borderRadius: "var(--radius-md, 10px)",
            background: "var(--bg-elevated, #1e1e1e)",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.22)",
          }}
        >
          <button
            type="button"
            onClick={handleSetFocalPoint}
            aria-label={displaySrc ? "Marcar punto de interés" : "Seleccionar imagen"}
            title={displaySrc ? "Haz clic sobre el punto de interés" : "Seleccionar imagen"}
            style={{
              position: "relative",
              minHeight: "180px",
              overflow: "hidden",
              border: 0,
              background: "var(--bg-input, #111)",
              cursor: displaySrc ? "crosshair" : "pointer",
              padding: 0,
            }}
          >
            {displaySrc ? (
              <>
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
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: `${focalPoint.x * 100}%`,
                    top: `${focalPoint.y * 100}%`,
                    width: "30px",
                    height: "30px",
                    display: "grid",
                    placeItems: "center",
                    transform: "translate(-50%, -50%)",
                    border: "2px solid white",
                    borderRadius: "50%",
                    background: "rgba(5, 7, 14, 0.48)",
                    boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.5)",
                    pointerEvents: "none",
                  }}
                >
                  <Crosshair size={16} color="white" />
                </span>
                <span
                  style={{
                    position: "absolute",
                    inset: "auto 0 0",
                    padding: "26px 12px 10px",
                    color: "white",
                    fontSize: "0.78rem",
                    textAlign: "center",
                    background: "linear-gradient(to top, rgba(3, 5, 12, 0.82), transparent)",
                    pointerEvents: "none",
                  }}
                >
                  Haz clic sobre el punto que debe permanecer visible
                </span>
              </>
            ) : (
              <span
                style={{
                  minHeight: "180px",
                  display: "grid",
                  placeItems: "center",
                  gap: "8px",
                  color: "var(--text-muted, #888)",
                }}
              >
                <ImagePlus size={28} />
                <span>Seleccionar imagen</span>
              </span>
            )}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              padding: "10px 12px",
              borderTop: "1px solid var(--border-color, #444)",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: "0.76rem" }}>
              Foco: {Math.round(focalPoint.x * 100)}%, {Math.round(focalPoint.y * 100)}%
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {displaySrc && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onChange(withImageFocalPoint(value || displaySrc, DEFAULT_IMAGE_FOCAL_POINT))}
                  title="Restablecer foco"
                >
                  <RotateCcw size={14} /> Centrar
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setOpen(true)}
              >
                <Pencil size={14} /> {displaySrc ? "Cambiar imagen" : "Elegir imagen"}
              </button>
            </div>
          </div>
        </div>

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
    : { width: "120px", height: "72px", borderRadius: "var(--radius-sm, 6px)" };

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
          border: "2px solid var(--border-color, #444)",
          background: "var(--bg-elevated, #1e1e1e)",
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
              color: "var(--text-muted, #888)",
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
