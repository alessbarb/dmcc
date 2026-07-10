import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { normalizeImageCatalogGroups, normalizeImageCatalogResponse, type ImageCatalogGroups } from "./imageCatalog.js";

export type ImageCatalogType = "all" | "avatars" | "campaigns" | "entities";

interface ImagePickerModalProps {
  catalog: ImageCatalogType;
  value: string;
  onSelect: (path: string) => void;
  onClose: () => void;
}

function preloadImage(path: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = path;
  });
}

async function preloadCatalogImages(groups: ImageCatalogGroups): Promise<void> {
  const imagePaths = Array.from(new Set(Object.values(groups).flat()));
  await Promise.all(imagePaths.map(preloadImage));
}

export function ImagePickerModal({ catalog, value, onSelect, onClose }: ImagePickerModalProps) {
  const [groups, setGroups] = useState<ImageCatalogGroups>({});
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);
    fetch(`/api/assets/catalog?type=${catalog}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`No se pudo cargar el catálogo de imágenes (${r.status})`);
        }
        return r.json() as Promise<unknown>;
      })
      .then(async (response) => {
        const nextGroups = normalizeImageCatalogResponse(response);
        await preloadCatalogImages(nextGroups);

        if (cancelled) return;

        setGroups(nextGroups);
        const nextGroupNames = Object.entries(nextGroups).map(([group]) => group);
        setActiveGroup((prev) => (nextGroupNames.includes(prev) ? prev : nextGroupNames[0] ?? ""));
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== "AbortError" && !cancelled) {
          console.error("Failed to load image catalog:", err);
          setError(err instanceof Error ? err.message : "No se pudo cargar el catálogo de imágenes.");
          setGroups({});
          setActiveGroup("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [catalog]);

  const safeGroups = normalizeImageCatalogGroups(groups);
  const groupEntries = Object.entries(safeGroups);
  const groupNames = groupEntries.map(([group]) => group);
  const images = safeGroups[activeGroup] ?? [];
  const modalTitle = catalog === "campaigns" ? "Elegir portada" : "Elegir imagen";

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-container" style={{ maxWidth: "640px", width: "100%" }}>
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {groupNames.length > 1 && (
          <div style={{ display: "flex", gap: "8px", padding: "0 16px 12px", flexWrap: "wrap" }}>
            {groupEntries.map(([g]) => (
              <button
                type="button"
                key={g}
                className={`btn ${activeGroup === g ? "btn-primary" : "btn-secondary"}`}
                style={{ textTransform: "capitalize", fontSize: "13px", padding: "4px 12px" }}
                onClick={() => setActiveGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        <div className="modal-body">
          {loading ? (
            <p style={{ textAlign: "center", padding: "24px" }}>Preparando imágenes…</p>
          ) : error ? (
            <p role="alert" style={{ textAlign: "center", padding: "24px", color: "var(--color-danger, #f87171)" }}>
              {error}
            </p>
          ) : images.length === 0 ? (
            <p style={{ textAlign: "center", padding: "24px" }}>No hay imágenes disponibles en este catálogo.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                gap: "8px",
              }}
            >
              {images.map((path) => (
                <button
                  type="button"
                  key={path}
                  onClick={() => { onSelect(path); onClose(); }}
                  style={{
                    padding: 0,
                    border: value === path ? "2px solid var(--color-accent, #c5a028)" : "2px solid transparent",
                    borderRadius: "var(--radius-sm, 6px)",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "none",
                    aspectRatio: "1",
                  }}
                  title={path.split("/").pop()}
                >
                  <img
                    src={path}
                    alt={path.split("/").pop()}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { onSelect(""); onClose(); }}
          >
            Sin imagen
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
