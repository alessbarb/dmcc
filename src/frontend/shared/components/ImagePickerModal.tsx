import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { normalizeImageCatalogGroups, normalizeImageCatalogResponse, type ImageCatalogGroups } from "./imageCatalog.js";

export type ImageCatalogType = "all" | "avatars" | "campaigns" | "entities";
type ImagePickerView = "groups" | "images";

interface ImagePickerModalProps {
  catalog: ImageCatalogType;
  value: string;
  onSelect: (path: string) => void;
  onClose: () => void;
}

interface CatalogGroupSection {
  catalog: string;
  groups: Array<{ key: string; label: string; count: number }>;
}

const CATALOG_PRIORITY = ["entities", "avatars", "locations", "items", "monsters", "scenes", "factions", "campaigns"];

function preloadImage(path: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = path;
  });
}

async function preloadImagePaths(paths: string[]): Promise<void> {
  const imagePaths = Array.from(new Set(paths));
  await Promise.all(imagePaths.map(preloadImage));
}

function splitGroupKey(groupKey: string): { catalog: string; group: string } {
  const [catalog, group] = groupKey.split(" · ");
  return {
    catalog: catalog || "assets",
    group: group || groupKey,
  };
}

function titleCase(value: string): string {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function sortCatalogs(a: string, b: string): number {
  const ai = CATALOG_PRIORITY.indexOf(a);
  const bi = CATALOG_PRIORITY.indexOf(b);
  if (ai !== -1 || bi !== -1) {
    return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi);
  }
  return a.localeCompare(b);
}

function buildCatalogSections(groupEntries: Array<[string, string[]]>): CatalogGroupSection[] {
  const byCatalog = new Map<string, CatalogGroupSection>();

  for (const [key, paths] of groupEntries) {
    const { catalog: catalogName, group } = splitGroupKey(key);
    const section = byCatalog.get(catalogName) ?? { catalog: catalogName, groups: [] };
    section.groups.push({ key, label: group, count: paths.length });
    byCatalog.set(catalogName, section);
  }

  return Array.from(byCatalog.values())
    .sort((a, b) => sortCatalogs(a.catalog, b.catalog))
    .map((section) => ({
      ...section,
      groups: section.groups.sort((a, b) => a.label.localeCompare(b.label)),
    }));
}

export function ImagePickerModal({ catalog, value, onSelect, onClose }: ImagePickerModalProps) {
  const [groups, setGroups] = useState<ImageCatalogGroups>({});
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [mobileView, setMobileView] = useState<ImagePickerView>("groups");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoadingCatalog(true);
    setLoadingImages(false);
    setError(null);
    setMobileView("groups");

    fetch(`/api/assets/catalog?type=${catalog}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`No se pudo cargar el catálogo de imágenes (${r.status})`);
        }
        return r.json() as Promise<unknown>;
      })
      .then((response) => {
        if (cancelled) return;

        const nextGroups = normalizeImageCatalogResponse(response);
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
        if (!cancelled) setLoadingCatalog(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [catalog]);

  const safeGroups = normalizeImageCatalogGroups(groups);
  const groupEntries = Object.entries(safeGroups);
  const groupSections = useMemo(() => buildCatalogSections(groupEntries), [groupEntries]);
  const groupNames = groupEntries.map(([group]) => group);
  const images = safeGroups[activeGroup] ?? [];
  const imagePathsKey = images.join("\n");
  const activeGroupLabel = activeGroup ? splitGroupKey(activeGroup) : null;
  const modalTitle = catalog === "campaigns" ? "Elegir portada" : "Elegir imagen";

  useEffect(() => {
    if (loadingCatalog || error || imagePathsKey.length === 0) {
      setLoadingImages(false);
      return;
    }

    let cancelled = false;
    const imagePaths = imagePathsKey.split("\n").filter(Boolean);
    setLoadingImages(true);
    preloadImagePaths(imagePaths).finally(() => {
      if (!cancelled) setLoadingImages(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeGroup, error, imagePathsKey, loadingCatalog]);

  function openMobileGroup(group: string) {
    setActiveGroup(group);
    setMobileView("images");
  }

  return (
    <div
      className="modal-overlay image-picker-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        .image-picker-modal {
          max-width: 640px;
          width: 100%;
          max-height: calc(100dvh - 48px);
          display: flex;
          flex-direction: column;
        }

        .image-picker-header,
        .image-picker-footer,
        .image-picker-tabs {
          flex: 0 0 auto;
        }

        .image-picker-body {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .image-picker-desktop-only {
          display: block;
        }

        .image-picker-mobile-only {
          display: none;
        }

        .image-picker-tabs {
          display: flex;
          gap: 8px;
          padding: 0 16px 12px;
          flex-wrap: wrap;
        }

        .image-picker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 8px;
        }

        .image-picker-group-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .image-picker-section-title {
          margin: 0 0 8px;
          color: var(--text-muted, #a8a29e);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .image-picker-group-button {
          width: 100%;
          min-height: 56px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid var(--border-color, rgba(255,255,255,0.14));
          border-radius: var(--radius-sm, 8px);
          background: var(--bg-elevated, rgba(255,255,255,0.04));
          color: var(--text-main, #f5f5f4);
          cursor: pointer;
          text-align: left;
        }

        .image-picker-group-button:hover {
          border-color: var(--color-accent, #c5a028);
        }

        .image-picker-image-button {
          padding: 0;
          border-radius: var(--radius-sm, 6px);
          overflow: hidden;
          cursor: pointer;
          background: none;
          aspect-ratio: 1;
        }

        @media (max-width: 640px) {
          .image-picker-overlay {
            align-items: flex-end;
          }

          .image-picker-modal {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            max-width: none;
            height: min(88dvh, 720px);
            max-height: 88dvh;
            border-radius: 18px 18px 0 0;
          }

          .image-picker-desktop-only {
            display: none;
          }

          .image-picker-mobile-only {
            display: block;
          }

          .image-picker-body {
            padding-bottom: 8px;
          }

          .image-picker-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
        }
      `}</style>

      <div className="modal-container image-picker-modal">
        <div className="modal-header image-picker-header">
          <h2 className="modal-title">
            <span className="image-picker-desktop-only">{modalTitle}</span>
            <span className="image-picker-mobile-only">
              {mobileView === "images" && activeGroupLabel ? `${activeGroupLabel.catalog} · ${activeGroupLabel.group}` : modalTitle}
            </span>
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {mobileView === "images" && (
              <button
                type="button"
                className="btn btn-icon btn-secondary image-picker-mobile-only"
                onClick={() => setMobileView("groups")}
                aria-label="Volver a catálogos"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Cerrar">
              <X size={16} />
            </button>
          </div>
        </div>

        {groupNames.length > 1 && (
          <div className="image-picker-tabs image-picker-desktop-only">
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

        <div className="modal-body image-picker-body">
          {loadingCatalog ? (
            <p style={{ textAlign: "center", padding: "24px" }}>Preparando catálogo…</p>
          ) : error ? (
            <p role="alert" style={{ textAlign: "center", padding: "24px", color: "var(--color-danger, #f87171)" }}>
              {error}
            </p>
          ) : groupEntries.length === 0 ? (
            <p style={{ textAlign: "center", padding: "24px" }}>No hay catálogos de imágenes disponibles.</p>
          ) : (
            <>
              <div className="image-picker-mobile-only">
                {mobileView === "groups" ? (
                  <div className="image-picker-group-list">
                    {groupSections.map((section) => (
                      <section key={section.catalog}>
                        <h3 className="image-picker-section-title">{titleCase(section.catalog)}</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {section.groups.map((group) => (
                            <button
                              type="button"
                              key={group.key}
                              className="image-picker-group-button"
                              onClick={() => openMobileGroup(group.key)}
                            >
                              <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                                <span style={{ display: "block", fontWeight: 800 }}>{titleCase(group.label)}</span>
                                <span style={{ display: "block", marginTop: "2px", color: "var(--text-muted, #a8a29e)", fontSize: "0.8rem" }}>
                                  {group.count} {group.count === 1 ? "imagen" : "imágenes"}
                                </span>
                              </span>
                              <ChevronRight size={16} />
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : loadingImages ? (
                  <p style={{ textAlign: "center", padding: "24px" }}>Preparando imágenes…</p>
                ) : images.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "24px" }}>No hay imágenes disponibles en este catálogo.</p>
                ) : (
                  <ImageGrid images={images} value={value} onSelect={onSelect} onClose={onClose} />
                )}
              </div>

              <div className="image-picker-desktop-only">
                {loadingImages ? (
                  <p style={{ textAlign: "center", padding: "24px" }}>Preparando imágenes…</p>
                ) : images.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "24px" }}>No hay imágenes disponibles en este catálogo.</p>
                ) : (
                  <ImageGrid images={images} value={value} onSelect={onSelect} onClose={onClose} />
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer image-picker-footer">
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

function ImageGrid({ images, value, onSelect, onClose }: {
  images: string[];
  value: string;
  onSelect: (path: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="image-picker-grid">
      {images.map((path) => (
        <button
          type="button"
          key={path}
          className="image-picker-image-button"
          onClick={() => { onSelect(path); onClose(); }}
          style={{
            border: value === path ? "2px solid var(--color-accent, #c5a028)" : "2px solid transparent",
          }}
          title={path.split("/").pop()}
        >
          <img
            src={path}
            alt={path.split("/").pop()}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </button>
      ))}
    </div>
  );
}
