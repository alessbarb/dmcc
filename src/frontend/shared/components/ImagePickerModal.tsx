import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import {
  normalizeImageCatalogGroups,
  normalizeImageCatalogResponse,
  type ImageCatalogGroups,
  type ImageCatalogItem,
} from "./imageCatalog.js";
import "../styles/features/image-picker-modal.css";

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

function runImagePickerAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
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

function buildCatalogSections(groupEntries: Array<[string, ImageCatalogItem[]]>): CatalogGroupSection[] {
  const byCatalog = new Map<string, CatalogGroupSection>();

  for (const [key, items] of groupEntries) {
    const { catalog: catalogName, group } = splitGroupKey(key);
    const section = byCatalog.get(catalogName) ?? { catalog: catalogName, groups: [] };
    section.groups.push({ key, label: group, count: items.length });
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
        const errorName = err instanceof Error ? err.name : undefined;
        if (errorName !== "AbortError" && !cancelled) {
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
  const thumbnailPathsKey = images.map((image) => image.thumb).join("\n");
  const activeGroupLabel = activeGroup ? splitGroupKey(activeGroup) : null;
  const modalTitle = catalog === "campaigns" ? "Elegir portada" : "Elegir imagen";

  useEffect(() => {
    if (loadingCatalog || error || thumbnailPathsKey.length === 0) {
      setLoadingImages(false);
      return;
    }

    let cancelled = false;
    setLoadingImages(true);
    runImagePickerAction(
      preloadImagePaths(thumbnailPathsKey.split("\n").filter(Boolean)).finally(() => {
        if (!cancelled) setLoadingImages(false);
      }),
      "No se pudieron precargar las imágenes.",
    );

    return () => {
      cancelled = true;
    };
  }, [activeGroup, error, thumbnailPathsKey, loadingCatalog]);

  function openGroup(group: string) {
    setActiveGroup(group);
    setMobileView("images");
  }

  if (typeof document === "undefined") return null;

  const modal = (
    <div className={`image-picker-modal__overlay ${isMobilePicker ? "is-mobile" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`image-picker-modal__sheet ${isMobilePicker ? "is-mobile" : ""}`} role="dialog" aria-modal="true" aria-label={modalTitle}>
        <div className="image-picker-modal__header">
          <div className="image-picker-modal__heading">
            {isMobilePicker && mobileView === "images" && (
              <button type="button" className="btn btn-icon btn-secondary" onClick={() => setMobileView("groups")} aria-label="Volver a catálogos">
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="modal-title image-picker-modal__title">
              {isMobilePicker && mobileView === "images" && activeGroupLabel ? `${activeGroupLabel.catalog} · ${activeGroupLabel.group}` : modalTitle}
            </h2>
          </div>
          <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {!isMobilePicker && groupEntries.length > 1 && (
          <div className="image-picker-modal__catalog-tabs">
            {groupEntries.map(([group]) => (
              <button
                type="button"
                key={group}
                className={`btn ${activeGroup === group ? "btn-primary" : "btn-secondary"} image-picker-modal__catalog-tab`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        )}

        <div className="image-picker-modal__body">
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

        <div className="image-picker-modal__footer">
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
    <div className={`image-picker-modal__scroll image-picker-modal__message ${tone === "danger" ? "is-danger" : ""}`} role={tone === "danger" ? "alert" : undefined}>
      {text}
    </div>
  );
}

function GroupBrowser({ sections, onOpenGroup }: { sections: CatalogGroupSection[]; onOpenGroup: (group: string) => void }) {
  return (
    <div className="image-picker-modal__scroll image-picker-modal__groups">
      {sections.map((section) => (
        <section key={section.catalog}>
          <h3 className="image-picker-modal__group-title">
            {titleCase(section.catalog)}
          </h3>
          <div className="image-picker-modal__group-list">
            {section.groups.map((group) => (
              <button
                type="button"
                key={group.key}
                onClick={() => onOpenGroup(group.key)}
                className="image-picker-modal__group-button"
              >
                <span className="image-picker-modal__group-details">
                  <span className="image-picker-modal__group-label">{titleCase(group.label)}</span>
                  <span className="image-picker-modal__group-count">
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
  images: ImageCatalogItem[];
  value: string;
  onSelect: (path: string) => void;
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <div className={`image-picker-modal__scroll image-picker-modal__grid ${isMobile ? "is-mobile" : ""}`}>
      {images.map((image) => (
        <button
          type="button"
          key={image.src}
          onClick={() => { onSelect(image.src); onClose(); }}
          className={`image-picker-modal__tile ${value === image.src ? "is-selected" : ""}`}
          title={image.name}
        >
          <img
            src={image.thumb}
            alt={image.name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="image-picker-modal__image"
          />
        </button>
      ))}
    </div>
  );
}
