import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("ImagePickerModal", () => {
  it("exports ImagePickerModal with required props", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("export function ImagePickerModal");
    expect(src).toContain("catalog:");
    expect(src).toContain("onSelect");
    expect(src).toContain("onClose");
  });

  it("renders through a document.body portal above parent modals", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain('import { createPortal } from "react-dom"');
    expect(src).toContain("return createPortal(modal, document.body)");
    expect(src).toContain("z-index: 2147483647");
  });

  it("supports the all catalog type for current and future asset catalogs", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain('export type ImageCatalogType = "all" | "avatars" | "campaigns" | "entities"');
  });

  it("fetches catalog from /api/assets/catalog", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("/api/assets/catalog");
  });

  it("uses a mobile two-step catalog browser", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain('type ImagePickerView = "groups" | "images"');
    expect(src).toContain('const [mobileView, setMobileView] = useState<ImagePickerView>("groups")');
    expect(src).toContain("openMobileGroup");
    expect(src).toContain("Volver a catálogos");
    expect(src).toContain("image-picker-group-list");
    expect(src).toContain("image-picker-mobile-only");
  });

  it("uses a bottom-sheet style responsive layout for mobile and touch devices", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("@media (max-width: 640px), (hover: none) and (pointer: coarse)");
    expect(src).toContain("height: min(88dvh, 720px)");
    expect(src).toContain("border-radius: 18px 18px 0 0");
    expect(src).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(src).toContain("-webkit-overflow-scrolling: touch");
  });

  it("forces internal scroll regions for mobile catalog and image grids", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("image-picker-scroll-region");
    expect(src).toContain("overflow-y: auto !important");
    expect(src).toContain("overscroll-behavior: contain");
    expect(src).toContain("touch-action: pan-y");
    expect(src).toContain('className="image-picker-scroll-region image-picker-group-list"');
    expect(src).toContain('className="image-picker-scroll-region image-picker-grid"');
  });

  it("preloads only active group thumbnails before rendering that grid", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("function preloadImage");
    expect(src).toContain("new Image()");
    expect(src).toContain("async function preloadImagePaths");
    expect(src).toContain("preloadImagePaths(imagePaths)");
    expect(src).toContain("Preparando imágenes…");
    expect(src).not.toContain("await preloadCatalogImages(nextGroups)");
  });

  it("renders lazy decoded thumbnails", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain('loading="lazy"');
    expect(src).toContain('decoding="async"');
  });

  it("renders a helpful error and empty-catalog state", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("No se pudo cargar el catálogo de imágenes");
    expect(src).toContain("No hay catálogos de imágenes disponibles.");
    expect(src).toContain("No hay imágenes disponibles en este catálogo.");
    expect(src).toContain('role="alert"');
  });

  it("renders a 'Sin imagen' clear option", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("Sin imagen");
  });

  it("declares every modal button as type=\"button\" to avoid parent form submits", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    const buttonTags = src.match(/<button\b[\s\S]*?>/g) ?? [];

    expect(buttonTags.length).toBeGreaterThanOrEqual(5);
    expect(buttonTags.every((tag) => tag.includes('type="button"'))).toBe(true);
  });

  it("selects an image through onSelect before closing without submit-capable buttons", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");

    expect(src).toContain('onClick={() => { onSelect(path); onClose(); }}');
    expect(src).toContain('onClick={() => { onSelect(""); onClose(); }}');
    expect(src).not.toMatch(/<button\b(?:(?!type="button")[\s\S])*onSelect/);
  });

  it("groups tabs render the group name on desktop", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("groupEntries.map");
    expect(src).toContain("image-picker-desktop-only");
    expect(src).toContain("modal-overlay");
  });

  it("normalizes local groups before rendering tabs and images", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");

    expect(src).toContain("const safeGroups = normalizeImageCatalogGroups(groups)");
    expect(src).toContain("const images = safeGroups[activeGroup] ?? []");
    expect(src).not.toContain("Object.keys(groups)");
    expect(src).not.toContain("Object.entries(groups)");
    expect(src).not.toContain("Object.keys(nextGroups)");
  });
});

describe("ImagePickerButton", () => {
  it("exports ImagePickerButton with required props", () => {
    const src = read("src/frontend/shared/components/ImagePickerButton.tsx");
    expect(src).toContain("export function ImagePickerButton");
    expect(src).toContain("onChange");
    expect(src).toContain("catalog:");
    expect(src).toContain("defaultImage");
  });

  it("uses the shared ImageCatalogType", () => {
    const src = read("src/frontend/shared/components/ImagePickerButton.tsx");
    expect(src).toContain("type ImageCatalogType");
    expect(src).toContain("catalog: ImageCatalogType");
  });

  it("renders ImagePickerModal on click", () => {
    const src = read("src/frontend/shared/components/ImagePickerButton.tsx");
    expect(src).toContain("ImagePickerModal");
    expect(src).toContain("setOpen");
  });

  it("wires modal selection to onChange", () => {
    const src = read("src/frontend/shared/components/ImagePickerButton.tsx");
    expect(src).toContain("onSelect={onChange}");
  });

  it("uses Pencil icon as edit trigger", () => {
    const src = read("src/frontend/shared/components/ImagePickerButton.tsx");
    expect(src).toContain("Pencil");
  });
});

describe("IdentityEditor wiring", () => {
  it("uses ImagePickerButton instead of URL input for avatarUrl", () => {
    const src = read("src/frontend/account/IdentityEditor.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain('type="url"');
    expect(src).toContain('catalog="avatars"');
  });
});

describe("PlayersPage wiring", () => {
  it("uses ImagePickerButton and removes separate imageUrl/avatarUrl inputs", () => {
    const src = read("src/frontend/dm/pages/PlayersPage.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).toContain('catalog="avatars"');
    expect(src).not.toContain('placeholder="https://example.com/avatar.png"');
    expect(src).not.toContain("Path del Avatar Local");
  });
});

describe("EntityCreateModal wiring", () => {
  it("uses ImagePickerButton for imageUrl with entities catalog", () => {
    const src = read("src/frontend/dm/entities/EntityCreateModal.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).toContain('catalog="entities"');
    expect(src).not.toContain('placeholder="https://ejemplo.com/foto.jpg"');
  });
});

describe("EntityDetailModal wiring", () => {
  it("uses ImagePickerButton for imageUrl in edit form with entities catalog", () => {
    const src = read("src/frontend/dm/entities/EntityDetailModal.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).toContain('catalog="entities"');
    expect(src).not.toContain('placeholder="https://ejemplo.com/foto.jpg"');
  });
});

describe("CanvasInspector wiring", () => {
  it("uses ImagePickerButton for imageUrl with entities catalog", () => {
    const src = read("src/frontend/dm/canvas/components/CanvasInspector.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).toContain('catalog="entities"');
    expect(src).not.toContain("Imagen / Retrato (URL)");
  });
});

describe("App campaign cover wiring", () => {
  it("uses ImagePickerButton for campaign coverUrl", () => {
    const src = read("src/frontend/App.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).toContain('catalog="campaigns"');
    expect(src).not.toContain("editCoverUrl} onChange={(e) => setEditCoverUrl");
  });
});

describe("image catalog normalization", () => {
  it("returns an empty catalog when groups is missing or null", async () => {
    const { normalizeImageCatalogResponse } = await import("../../src/frontend/shared/components/imageCatalog.js");

    expect(normalizeImageCatalogResponse({})).toEqual({});
    expect(normalizeImageCatalogResponse({ groups: null })).toEqual({});
  });

  it("keeps only array groups and string image paths", async () => {
    const { normalizeImageCatalogGroups, normalizeImageCatalogResponse } = await import("../../src/frontend/shared/components/imageCatalog.js");

    const expected = { heroes: ["/a.png"] };
    expect(normalizeImageCatalogResponse({ groups: { heroes: ["/a.png", null, 7], bad: null } })).toEqual(expected);
    expect(normalizeImageCatalogGroups({ heroes: ["/a.png", null, 7], bad: null })).toEqual(expected);
    expect(normalizeImageCatalogGroups(null)).toEqual({});
  });
});
