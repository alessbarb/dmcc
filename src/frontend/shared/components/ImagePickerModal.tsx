import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ImagePickerModalProps {
  catalog: "avatars" | "campaigns" | "entities";
  value: string;
  onSelect: (path: string) => void;
  onClose: () => void;
}

type Groups = Record<string, string[]>;

export function ImagePickerModal({ catalog, value, onSelect, onClose }: ImagePickerModalProps) {
  const [groups, setGroups] = useState<Groups>({});
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/assets/catalog?type=${catalog}`, { signal: controller.signal })
      .then((r) => r.json() as Promise<{ groups: Groups }>)
      .then(({ groups: g }) => {
        setGroups(g);
        const keys = Object.keys(g);
        setActiveGroup((prev) => (keys.includes(prev) ? prev : keys[0] ?? ""));
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== "AbortError") {
          console.error("Failed to load image catalog:", err);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [catalog]);

  const groupNames = Object.keys(groups);
  const images = groups[activeGroup] ?? [];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-container" style={{ maxWidth: "640px", width: "100%" }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {catalog === "avatars" || catalog === "entities" ? "Elegir imagen" : "Elegir portada"}
          </h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {groupNames.length > 1 && (
          <div style={{ display: "flex", gap: "8px", padding: "0 16px 12px", flexWrap: "wrap" }}>
            {Object.entries(groups).map(([g]) => (
              <button
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
            <p style={{ textAlign: "center", padding: "24px" }}>Cargando…</p>
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
            className="btn btn-secondary"
            onClick={() => { onSelect(""); onClose(); }}
          >
            Sin imagen
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
