import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
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
const MOBILE_PICKER_QUERY = "(max-width: 760px), (hover: none) and (pointer: coarse)";

function preloadImage(path: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = path;
  });
}

async function preloadImagePaths(paths: string[]): Promise<void> {
  await Promise.all(Array.from(new Set(paths)).map(preloadImage));
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

function getIsMobilePicker(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 760 || window.matchMedia(MOBILE_PICKER_QUERY).matches;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483647,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0, 0, 0, 0.78)",
  backdropFilter: "blur(4px)",
  overflow: "hidden",
};

const sheetBaseStyle: CSSProperties = {
  background: "var(--bg-card, #151922)",
  color: "var(--text-main, #f5f5f4)",
  border: "1px solid var(--border-color, rgba(255,255,255,0.14))",
  boxShadow: "var(--shadow-lg, 0 22px 70px rgba(0,0,0,0.55))",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 16px",
  borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.14))",
};

const bodyStyle: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "hidden",
  padding: 16,
};

const scrollStyle: CSSProperties = {
  height: "100%",
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  touchAction: "pan-y",
};

const footerStyle: CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "12px 16px",
  borderTop: "1px solid var(--border-color, rgba(255,255,255,0.14))",
};

export function ImagePickerModal({ catalog, value, onSelect, onClose }: ImagePickerModalProps) {
  const [groups, setGroups] = useState<ImageCatalogGroups>({});
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [mobileView, setMobileView] = useState<ImagePickerView>("groups");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobilePicker, setIsMobilePicker] = useState(getIsMobilePicker);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(MOBILE_PICKER_QUERY);
    const update = () => setIsMobilePicker(getIsMobilePicker());
    update();
    mediaQuery.addEventListener("change", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoadingCatalog(true);
    setLoadingImages(false);
    setError(null);
    setMobileView("groups");

    fetch(`/api/assets/catalog?type=${catalog}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`No se pudo cargar el catálogo de imágenes (${r.status})`);
        return r.json() as Promise<unknown>;
      })
      .then((response) => {
        if (cancelled) return;
        const nextGroups = normalizeImageCatalogResponse(response);
        setGroups(nextGroups);
        const nextGroupNames = Object.keys(nextGroups);
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
    setLoadingImages(true);
    preloadImagePaths(imagePathsKey.split("\n").filter(Boolean)).finally(() => {
      if (!cancelled) setLoadingImages(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeGroup, error, imagePathsKey, loadingCatalog]);

  function openGroup(group: string) {
    setActiveGroup(group);
    setMobileView("images");
  }

  if (typeof document === "undefined") return null;

  const sheetStyle: CSSProperties = isMobilePicker
    ? {
        ...sheetBaseStyle,
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100dvw",
        height: "88dvh",
        maxHeight: "88svh",
        borderRadius: "18px 18px 0 0",
      }
    : {
        ...sheetBaseStyle,
        width: "min(640px, calc(100dvw - 32px))",
        maxHeight: "calc(100dvh - 48px)",
        borderRadius: "var(--radius-lg, 16px)",
      };

  const modal = (
    <div style={{ ...overlayStyle, alignItems: isMobilePicker ? "flex-end" : "center" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle} role="dialog" aria-modal="true" aria-label={modalTitle}>
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {isMobilePicker && mobileView === "images" && (
              <button type="button" className="btn btn-icon btn-secondary" onClick={() => setMobileView("groups")} aria-label="Volver a catálogos">
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="modal-title" style={{ margin: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isMobilePicker && mobileView === "images" && activeGroupLabel ? `${activeGroupLabel.catalog} · ${activeGroupLabel.group}` : modalTitle}
            </h2>
          </div>
          <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {!isMobilePicker && groupEntries.length > 1 && (
          <div style={{ flex: "0 0 auto", display: "flex", gap: 8, padding: "12px 16px", flexWrap: "wrap", borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.14))" }}>
            {groupEntries.map(([group]) => (
              <button
                type="button"
                key={group}
                className={`btn ${activeGroup === group ? "btn-primary" : "btn-secondary"}`}
                style={{ textTransform: "capitalize", fontSize: 13, padding: "4px 12px" }}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        )}

        <div style={bodyStyle}>
          {loadingCatalog ? (
            <CenteredMessage text="Preparando catálogo…" />
          ) : error ? (
            <CenteredMessage text={error} tone="danger" />
          ) : groupEntries.length === 0 ? (
            <CenteredMessage text="No hay catálogos de imágenes disponibles." />
          ) : isMobilePicker && mobileView === "groups" ? (
            <GroupBrowser sections={groupSections} onOpenGroup={openGroup} />
          ) : loadingImages ? (
            <CenteredMessage text="Preparando imágenes…" />
          ) : images.length === 0 ? (
            <CenteredMessage text="No hay imágenes disponibles en este catálogo." />
          ) : (
            <ImageGrid images={images} value={value} onSelect={onSelect} onClose={onClose} isMobile={isMobilePicker} />
          )}
        </div>

        <div style={footerStyle}>
          <button type="button" className="btn btn-secondary" onClick={() => { onSelect(""); onClose(); }}>
            Sin imagen
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function CenteredMessage({ text, tone }: { text: string; tone?: "danger" }) {
  return (
    <div style={{ ...scrollStyle, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: tone === "danger" ? "var(--color-danger, #f87171)" : undefined }} role={tone === "danger" ? "alert" : undefined}>
      {text}
    </div>
  );
}

function GroupBrowser({ sections, onOpenGroup }: { sections: CatalogGroupSection[]; onOpenGroup: (group: string) => void }) {
  return (
    <div style={{ ...scrollStyle, display: "flex", flexDirection: "column", gap: 16 }}>
      {sections.map((section) => (
        <section key={section.catalog}>
          <h3 style={{ margin: "0 0 8px", color: "var(--text-muted, #a8a29e)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {titleCase(section.catalog)}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {section.groups.map((group) => (
              <button
                type="button"
                key={group.key}
                onClick={() => onOpenGroup(group.key)}
                style={{
                  width: "100%",
                  minHeight: 56,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  border: "1px solid var(--border-color, rgba(255,255,255,0.14))",
                  borderRadius: "var(--radius-sm, 8px)",
                  background: "var(--bg-elevated, rgba(255,255,255,0.04))",
                  color: "var(--text-main, #f5f5f4)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 800 }}>{titleCase(group.label)}</span>
                  <span style={{ display: "block", marginTop: 2, color: "var(--text-muted, #a8a29e)", fontSize: "0.8rem" }}>
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
  );
}

function ImageGrid({ images, value, onSelect, onClose, isMobile }: {
  images: string[];
  value: string;
  onSelect: (path: string) => void;
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        ...scrollStyle,
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(3, minmax(0, 1fr))" : "repeat(auto-fill, minmax(72px, 1fr))",
        gap: isMobile ? 10 : 8,
        alignContent: "start",
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
            aspectRatio: "1 / 1",
            minWidth: 0,
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
