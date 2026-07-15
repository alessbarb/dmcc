import { useState } from "react";
import { ImagePlus, Pencil } from "lucide-react";
import { ImagePickerModal, type ImageCatalogType } from "./ImagePickerModal.js";

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
  const displaySrc = value || defaultImage || "";
  const isEntityPreview = catalog === "entities";
  const isCircle = shape === "circle" && !isEntityPreview;

  const containerStyle: React.CSSProperties = isEntityPreview
    ? {
        width: "100%",
        minWidth: 0,
        maxWidth: "420px",
        height: "clamp(160px, 22vw, 220px)",
        borderRadius: "var(--radius-md, 10px)",
      }
    : isCircle
      ? { width: "72px", height: "72px", borderRadius: "50%" }
      : { width: "120px", height: "72px", borderRadius: "var(--radius-sm, 6px)" };

  return (
    <>
      <button
        type="button"
        style={{
          position: "relative",
          display: isEntityPreview ? "block" : "inline-block",
          flexShrink: 0,
          ...containerStyle,
          overflow: "hidden",
          border: "1px solid color-mix(in srgb, var(--secondary, #d6a85f) 42%, var(--border-color, #444))",
          background: "var(--bg-elevated, #1e1e1e)",
          boxShadow: isEntityPreview ? "0 12px 28px rgba(0, 0, 0, 0.24)" : undefined,
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
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              transform: hovered && isEntityPreview ? "scale(1.025)" : "scale(1)",
              transition: "transform 180ms ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--text-muted, #888)",
              fontSize: isEntityPreview ? "0.85rem" : "11px",
              textAlign: "center",
              padding: isEntityPreview ? "18px" : "4px",
              background: isEntityPreview
                ? "linear-gradient(145deg, color-mix(in srgb, var(--secondary, #d6a85f) 8%, transparent), transparent 58%)"
                : undefined,
            }}
          >
            {isEntityPreview && <ImagePlus size={28} aria-hidden="true" />}
            <span>Sin imagen</span>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: isEntityPreview ? "auto 0 0" : 0,
            minHeight: isEntityPreview ? "48px" : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: isEntityPreview ? "10px 14px" : 0,
            background: isEntityPreview
              ? "linear-gradient(to top, rgba(3, 5, 12, 0.94), rgba(3, 5, 12, 0.68), transparent)"
              : "rgba(0,0,0,0.45)",
            color: "#fff",
            opacity: isEntityPreview ? (hovered ? 1 : 0.92) : hovered ? 1 : 0,
            transition: "opacity 0.15s",
            fontSize: "0.82rem",
            fontWeight: 700,
          }}
        >
          <Pencil size={isEntityPreview ? 15 : 18} aria-hidden="true" />
          {isEntityPreview && <span>{displaySrc ? "Cambiar imagen" : "Seleccionar imagen"}</span>}
        </div>
      </button>

      {open && (
        <ImagePickerModal
          catalog={catalog}
          value={value}
          onSelect={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
