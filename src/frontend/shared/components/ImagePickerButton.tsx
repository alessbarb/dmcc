import { useState } from "react";
import { Pencil } from "lucide-react";
import { ImagePickerModal } from "./ImagePickerModal.js";

interface ImagePickerButtonProps {
  value: string;
  onChange: (path: string) => void;
  catalog: "avatars" | "campaigns";
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
  const displaySrc = value || defaultImage || "";
  const isCircle = shape === "circle";

  const containerStyle: React.CSSProperties = isCircle
    ? { width: "72px", height: "72px", borderRadius: "50%" }
    : { width: "120px", height: "72px", borderRadius: "var(--radius-sm, 6px)" };

  return (
    <>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          flexShrink: 0,
          ...containerStyle,
          overflow: "hidden",
          border: "2px solid var(--border-color, #444)",
          background: "var(--bg-elevated, #1e1e1e)",
          cursor: "pointer",
        }}
        onClick={() => setOpen(true)}
        title="Cambiar imagen"
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
            opacity: 0,
            transition: "opacity 0.15s",
          }}
          className="image-picker-overlay"
        >
          <Pencil size={18} color="#fff" />
        </div>
        <style>{`
          div:hover > .image-picker-overlay { opacity: 1 !important; }
        `}</style>
      </div>
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
