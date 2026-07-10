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
    expect(src).toContain("zIndex: 2147483647");
  });

  it("supports the all catalog type for current and future asset catalogs", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain('export type ImageCatalogType = "all" | "avatars" | "campaigns" | "entities"');
  });

  it("detects mobile picker mode in JavaScript", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("MOBILE_PICKER_QUERY");
    expect(src).toContain("window.matchMedia(MOBILE_PICKER_QUERY)");
    expect(src).toContain("window.innerWidth <= 760");
    expect(src).toContain("const [isMobilePicker, setIsMobilePicker] = useState(getIsMobilePicker)");
  });

  it("fetches catalog from /api/assets/catalog", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("/api/assets/catalog");
  });

  it("uses a mobile two-step catalog browser", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain('type ImagePickerView = "groups" | "images"');
    expect(src).toContain('const [mobileView, setMobileView] = useState<ImagePickerView>("groups")');
    expect(src).toContain("function GroupBrowser");
    expect(src).toContain("onOpenGroup");
    expect(src).toContain("Volver a catálogos");
  });

  it("uses inline critical layout for the picker shell and scroll regions", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("const overlayStyle: CSSProperties");
    expect(src).toContain("const sheetBaseStyle: CSSProperties");
    expect(src).toContain("const scrollStyle: CSSProperties");
    expect(src).toContain('overflowY: "auto"');
    expect(src).toContain('WebkitOverflowScrolling: "touch"');
    expect(src).toContain('touchAction: "pan-y"');
  });

  it("renders stable two-column mobile grids with fixed tile heights", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("const mobileTileHeight = 168");
    expect(src).toContain('gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))"');
    expect(src).toContain("gridAutoRows: isMobile ? `${mobileTileHeight}px` : undefined");
    expect(src).toContain("height: isMobile ? mobileTileHeight : undefined");
    expect(src).toContain("isMobile={isMobilePicker}");
  });

  it("preloads only active group thumbnails before rendering that grid", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("function preloadImage");
    expect(src).toContain("new Image()");
    expect(src).toContain("async function preloadImagePaths");
    expect(src).toContain("const thumbnailPathsKey = images.map((image) => image.thumb).join");
    expect(src).toContain("preloadImagePaths(thumbnailPathsKey.split");
    expect(src).toContain("Preparando imágenes…");
    expect(src).not.toContain("await preloadCatalogImages(nextGroups)");
  });

  it("renders thumbnail images but selects original source paths", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("images: ImageCatalogItem[]");
    expect(src).toContain("key={image.src}");
    expect(src).toContain("onClick={() => { onSelect(image.src); onClose(); }}");
    expect(src).toContain("src={image.thumb}");
    expect(src).toContain("fetchPriority=\"low\"");
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
    expect(src).toContain('role={tone === "danger" ? "alert" : undefined}');
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

    expect(src).toContain('onClick={() => { onSelect(image.src); onClose(); }}');
    expect(src).toContain('onClick={() => { onSelect(""); onClose(); }}');
    expect(src).not.toMatch(/<button\b(?:(?!type="button")[\s\S])*onSelect/);
  });

  it("normalizes local groups before rendering tabs and images", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");

    expect(src).toContain("const safeGroups = normalizeImageCatalogGroups(groups)");
    expect(src).toContain("const images = safeGroups[activeGroup] ?? []");
    expect(src).not.toContain("Object.keys(groups)");
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

  it("keeps legacy string entries as original-backed thumbnail items", async () => {
    const { normalizeImageCatalogGroups, normalizeImageCatalogResponse } = await import("../../src/frontend/shared/components/imageCatalog.js");

    const expected = { heroes: [{ src: "/a.png", thumb: "/a.png", name: "a.png" }] };
    expect(normalizeImageCatalogResponse({ groups: { heroes: ["/a.png", null, 7], bad: null } })).toEqual(expected);
    expect(normalizeImageCatalogGroups({ heroes: ["/a.png", null, 7], bad: null })).toEqual(expected);
    expect(normalizeImageCatalogGroups(null)).toEqual({});
  });

  it("keeps thumbnail catalog objects and falls back safely", async () => {
    const { normalizeImageCatalogGroups } = await import("../../src/frontend/shared/components/imageCatalog.js");

    expect(normalizeImageCatalogGroups({
      heroes: [
        { src: "/a.png", thumb: "/assets/.thumbs/a.webp", name: "A" },
        { src: "/b.png" },
        { thumb: "/broken.webp" },
      ],
    })).toEqual({
      heroes: [
        { src: "/a.png", thumb: "/assets/.thumbs/a.webp", name: "A" },
        { src: "/b.png", thumb: "/b.png", name: "b.png" },
      ],
    });
  });
});
