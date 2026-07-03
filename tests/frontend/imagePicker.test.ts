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

  it("fetches catalog from /api/assets/catalog", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("/api/assets/catalog");
  });

  it("renders a 'Sin imagen' clear option", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("Sin imagen");
  });

  it("groups tabs render the group name", () => {
    const src = read("src/frontend/shared/components/ImagePickerModal.tsx");
    expect(src).toContain("Object.entries");
    expect(src).toContain("modal-overlay");
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

  it("renders ImagePickerModal on click", () => {
    const src = read("src/frontend/shared/components/ImagePickerButton.tsx");
    expect(src).toContain("ImagePickerModal");
    expect(src).toContain("setOpen");
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
  it("uses ImagePickerButton for imageUrl", () => {
    const src = read("src/frontend/dm/entities/EntityCreateModal.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain('placeholder="https://ejemplo.com/foto.jpg"');
  });
});

describe("EntityDetailModal wiring", () => {
  it("uses ImagePickerButton for imageUrl in edit form", () => {
    const src = read("src/frontend/dm/entities/EntityDetailModal.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain('placeholder="https://ejemplo.com/foto.jpg"');
  });
});

describe("CanvasInspector wiring", () => {
  it("uses ImagePickerButton for imageUrl", () => {
    const src = read("src/frontend/dm/canvas/components/CanvasInspector.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain("Imagen / Retrato (URL)");
  });
});
