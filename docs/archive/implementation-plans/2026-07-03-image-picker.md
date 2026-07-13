> Archived historical implementation plan.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Image Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every raw image URL `<input>` in the app with a thumbnail + pencil button that opens a catalog modal backed by local asset directories.

**Architecture:** A Fastify route scans `public/assets/{avatars,campaigns}/` at runtime and returns grouped paths. Two reusable React components — `ImagePickerButton` (thumbnail + pencil) and `ImagePickerModal` (catalog grid) — replace all 6 image URL inputs. No external URL entry; "Sin imagen" clears the field.

**Tech Stack:** TypeScript, React, Fastify, Vitest, existing CSS variables (`--border-color`, `--radius-sm`, `btn`, `modal-overlay`, `form-label`).

## Global Constraints

- No external URL entry anywhere in the UI.
- Catalog backed only by files under `public/assets/`.
- New subcategories appear automatically (no code change needed) when a new subfolder is added under `public/assets/avatars/` or `public/assets/campaigns/`.
- `PlayersPage` merges `imageUrl` + `avatarUrl` fields into a single picker; catalog selection writes to `imageUrl`; `avatarUrl` is left as-is (other code can still fall back to it).
- `ImagePickerButton` and `ImagePickerModal` live in `src/frontend/shared/components/`.
- Backend route at `GET /api/assets/catalog?type=avatars|campaigns`.
- All new tests go in `tests/frontend/imagePicker.test.ts` and `tests/backend/assetCatalog.test.ts`.
- Run full suite with `npm test` after each task.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/backend/server/routes/assetRoutes.ts` | Scan assets dir, return grouped catalog |
| Modify | `src/backend/server/createServer.ts` | Register assetRoutes with `assetsDir` |
| Create | `src/frontend/shared/components/ImagePickerModal.tsx` | Catalog grid modal |
| Create | `src/frontend/shared/components/ImagePickerButton.tsx` | Thumbnail + pencil trigger |
| Modify | `src/frontend/account/IdentityEditor.tsx` | Replace `avatarUrl` input |
| Modify | `src/frontend/dm/pages/PlayersPage.tsx` | Merge imageUrl+avatarUrl into single picker |
| Modify | `src/frontend/dm/entities/EntityCreateModal.tsx` | Replace `imageUrl` input |
| Modify | `src/frontend/dm/entities/EntityDetailModal.tsx` | Replace `imageUrl` input |
| Modify | `src/frontend/dm/canvas/components/CanvasInspector.tsx` | Replace `imageUrl` input |
| Modify | `src/frontend/App.tsx` | Replace `coverUrl` input |
| Create | `tests/backend/assetCatalog.test.ts` | Integration test for catalog route |
| Create | `tests/frontend/imagePicker.test.ts` | Source-level wiring tests |

---

### Task 1: Backend catalog route

**Files:**

- Create: `src/backend/server/routes/assetRoutes.ts`
- Modify: `src/backend/server/createServer.ts`
- Test: `tests/backend/assetCatalog.test.ts`

**Interfaces:**

- Produces: `GET /api/assets/catalog?type=avatars` → `{ groups: Record<string, string[]> }` where each value is an array of absolute URL paths like `"/assets/avatars/fantasy/aelar.png"`.
- `type` accepts `"avatars"` or `"campaigns"`.
- For `campaigns`, all files land in one group called `"all"` (flat directory).
- For `avatars`, `default-avatar.png` (root level) lands in group `"default"`, each subdirectory becomes its own group.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/backend/assetCatalog.test.ts
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withFakeAssets<T>(fn: (assetsDir: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), "dmcc-assets-"));
  const avatarsDir = join(root, "assets", "avatars", "fantasy");
  const campaignsDir = join(root, "assets", "campaigns");
  await mkdir(avatarsDir, { recursive: true });
  await mkdir(campaignsDir, { recursive: true });
  await writeFile(join(root, "assets", "avatars", "default-avatar.png"), "");
  await writeFile(join(root, "assets", "avatars", "fantasy", "aelar.png"), "");
  await writeFile(join(root, "assets", "campaigns", "default-campaign-cover.jpg"), "");
  try {
    return await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe("GET /api/assets/catalog", () => {
  it("returns avatar groups with default and named subfolders", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=avatars",
      });
      expect(response.statusCode).toBe(200);
      const body = response.json<{ groups: Record<string, string[]> }>();
      expect(body.groups["default"]).toContain("/assets/avatars/default-avatar.png");
      expect(body.groups["fantasy"]).toContain("/assets/avatars/fantasy/aelar.png");
    });
  });

  it("returns campaigns as flat 'all' group", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=campaigns",
      });
      expect(response.statusCode).toBe(200);
      const body = response.json<{ groups: Record<string, string[]> }>();
      expect(body.groups["all"]).toContain("/assets/campaigns/default-campaign-cover.jpg");
    });
  });

  it("returns 400 for unknown catalog type", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=unknown",
      });
      expect(response.statusCode).toBe(400);
    });
  });

  it("returns empty groups when assetsDir is undefined", async () => {
    const server = createServer({});
    const response = await server.inject({
      method: "GET",
      url: "/api/assets/catalog?type=avatars",
    });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ groups: Record<string, string[]> }>();
    expect(body.groups).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/backend/assetCatalog.test.ts
```

Expected: FAIL — route not found (404).

- [ ] **Step 3: Create `src/backend/server/routes/assetRoutes.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

function isImage(name: string): boolean {
  const dot = name.lastIndexOf(".");
  return dot !== -1 && IMAGE_EXTS.has(name.slice(dot).toLowerCase());
}

function scanAvatars(avatarsDir: string): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  let entries: string[];
  try {
    entries = readdirSync(avatarsDir);
  } catch {
    return groups;
  }
  for (const entry of entries) {
    const full = join(avatarsDir, entry);
    const stat = statSync(full);
    if (stat.isFile() && isImage(entry)) {
      (groups["default"] ??= []).push(`/assets/avatars/${entry}`);
    } else if (stat.isDirectory()) {
      const subEntries = readdirSync(full).filter(isImage);
      if (subEntries.length > 0) {
        groups[entry] = subEntries.map((f) => `/assets/avatars/${entry}/${f}`);
      }
    }
  }
  return groups;
}

function scanCampaigns(campaignsDir: string): Record<string, string[]> {
  let entries: string[];
  try {
    entries = readdirSync(campaignsDir).filter(isImage);
  } catch {
    return {};
  }
  if (entries.length === 0) return {};
  return { all: entries.map((f) => `/assets/campaigns/${f}`) };
}

export async function registerAssetRoutes(
  server: FastifyInstance,
  opts: { assetsDir?: string }
) {
  server.get<{ Querystring: { type?: string } }>("/api/assets/catalog", async (request, reply) => {
    const type = request.query.type;
    if (type !== "avatars" && type !== "campaigns") {
      return reply.status(400).send({ error: "type must be 'avatars' or 'campaigns'" });
    }
    if (!opts.assetsDir) {
      return { groups: {} };
    }
    const assetsSubdir = join(opts.assetsDir, "assets", type);
    const groups =
      type === "avatars"
        ? scanAvatars(assetsSubdir)
        : scanCampaigns(assetsSubdir);
    return { groups };
  });
}
```

- [ ] **Step 4: Wire route into `createServer.ts`**

At the top of `createServer.ts`, add the import:

```typescript
import { registerAssetRoutes } from "./routes/assetRoutes.js";
```

Find the `createServer` function signature. It accepts a `config` object. Add `assetsDir` to it:

```typescript
// Look for: export function createServer(config?: { dataDir?: string; ... })
// Add assetsDir to the config type and pass publicPath to the route:
```

After the `const hasBuiltSpa = Boolean(publicPath);` line and before or alongside other route registrations, add:

```typescript
server.register(registerAssetRoutes, { assetsDir: publicPath });
```

Also ensure `createServer` accepts `assetsDir` in its config for tests:

```typescript
// In the config destructuring at the top of createServer:
const assetsDir = config?.assetsDir;
// Then when registering assetRoutes:
server.register(registerAssetRoutes, { assetsDir: assetsDir ?? publicPath });
```

The exact diff depends on the current signature. Find it with `grep -n "export function createServer" src/backend/server/createServer.ts` and extend accordingly.

- [ ] **Step 5: Run tests**

```bash
npx vitest run tests/backend/assetCatalog.test.ts
```

Expected: all 4 PASS.

- [ ] **Step 6: Run full suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/backend/server/routes/assetRoutes.ts src/backend/server/createServer.ts tests/backend/assetCatalog.test.ts
git commit -m "feat(assets): add GET /api/assets/catalog route for image picker"
```

---

### Task 2: `ImagePickerModal` component

**Files:**

- Create: `src/frontend/shared/components/ImagePickerModal.tsx`
- Test: `tests/frontend/imagePicker.test.ts` (first assertions)

**Interfaces:**

- Consumes: `GET /api/assets/catalog?type=avatars|campaigns` → `{ groups: Record<string, string[]> }`
- Produces:

  ```typescript
  interface ImagePickerModalProps {
    catalog: "avatars" | "campaigns";
    value: string;          // currently selected path (may be empty)
    onSelect: (path: string) => void;  // called with "" to clear
    onClose: () => void;
  }
  export function ImagePickerModal(props: ImagePickerModalProps): JSX.Element
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// tests/frontend/imagePicker.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: FAIL — file not found.

- [ ] **Step 3: Create `src/frontend/shared/components/ImagePickerModal.tsx`**

```tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ImagePickerModalProps {
  catalog: "avatars" | "campaigns";
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
    setLoading(true);
    fetch(`/api/assets/catalog?type=${catalog}`)
      .then((r) => r.json() as Promise<{ groups: Groups }>)
      .then(({ groups: g }) => {
        setGroups(g);
        const keys = Object.keys(g);
        setActiveGroup((prev) => (keys.includes(prev) ? prev : keys[0] ?? ""));
      })
      .finally(() => setLoading(false));
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
            {catalog === "avatars" ? "Elegir avatar" : "Elegir portada"}
          </h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {groupNames.length > 1 && (
          <div style={{ display: "flex", gap: "8px", padding: "0 16px 12px", flexWrap: "wrap" }}>
            {groupNames.map((g) => (
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
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: all 4 ImagePickerModal assertions PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/shared/components/ImagePickerModal.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(ui): add ImagePickerModal catalog component"
```

---

### Task 3: `ImagePickerButton` component

**Files:**

- Create: `src/frontend/shared/components/ImagePickerButton.tsx`
- Modify: `tests/frontend/imagePicker.test.ts` (add assertions)

**Interfaces:**

- Consumes: `ImagePickerModal` (import from same directory)
- Produces:

  ```typescript
  interface ImagePickerButtonProps {
    value: string;
    onChange: (path: string) => void;
    catalog: "avatars" | "campaigns";
    defaultImage?: string;   // shown when value is empty
    shape?: "circle" | "rect";  // "circle" for avatars, "rect" for covers
  }
  export function ImagePickerButton(props: ImagePickerButtonProps): JSX.Element
  ```

- [ ] **Step 1: Add failing test assertions to `tests/frontend/imagePicker.test.ts`**

Append inside the existing file:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: ImagePickerButton assertions FAIL.

- [ ] **Step 3: Create `src/frontend/shared/components/ImagePickerButton.tsx`**

```tsx
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
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: all assertions PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/shared/components/ImagePickerButton.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(ui): add ImagePickerButton thumbnail+pencil component"
```

---

### Task 4: Wire into `IdentityEditor`

**Files:**

- Modify: `src/frontend/account/IdentityEditor.tsx`
- Modify: `tests/frontend/imagePicker.test.ts` (add wiring assertion)

**Interfaces:**

- Consumes: `ImagePickerButton` from `"../shared/components/ImagePickerButton.js"`
- The `avatarUrl` state variable already exists; pass it as `value` and its setter as `onChange`.

- [ ] **Step 1: Add failing test**

Append to `tests/frontend/imagePicker.test.ts`:

```typescript
describe("IdentityEditor wiring", () => {
  it("uses ImagePickerButton instead of URL input for avatarUrl", () => {
    const src = read("src/frontend/account/IdentityEditor.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain('type="url"');
    expect(src).toContain('catalog="avatars"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: IdentityEditor wiring FAIL.

- [ ] **Step 3: Edit `src/frontend/account/IdentityEditor.tsx`**

Add import after the existing imports:

```typescript
import { ImagePickerButton } from "../shared/components/ImagePickerButton.js";
```

Replace lines 95–98 (the `avatarUrl` label + input block):

```tsx
// OLD:
<label>
  {t("account.identity.avatarUrl")}
  <input type="url" placeholder="https://…" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
</label>

// NEW:
<div className="form-group">
  <label className="form-label">{t("account.identity.avatarUrl")}</label>
  <ImagePickerButton
    value={avatarUrl}
    onChange={setAvatarUrl}
    catalog="avatars"
    defaultImage="/assets/avatars/default-avatar.png"
    shape="circle"
  />
</div>
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: IdentityEditor wiring PASS.

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/account/IdentityEditor.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(account): replace avatarUrl text input with ImagePickerButton"
```

---

### Task 5: Wire into `PlayersPage`

**Files:**

- Modify: `src/frontend/dm/pages/PlayersPage.tsx`
- Modify: `tests/frontend/imagePicker.test.ts` (add wiring assertion)

**Interfaces:**

- Consumes: `ImagePickerButton`
- The form currently has `imageUrl` and `avatarUrl` as separate fields. Merge into one picker that writes to `imageUrl`. Keep `avatarUrl` in form state (don't remove it — the store API still accepts it) but remove the separate input for it. Pass `playerForm.imageUrl || playerForm.avatarUrl` as the display value so existing local-path avatars still show.

- [ ] **Step 1: Add failing test**

```typescript
describe("PlayersPage wiring", () => {
  it("uses ImagePickerButton and removes separate imageUrl/avatarUrl inputs", () => {
    const src = read("src/frontend/dm/pages/PlayersPage.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).toContain('catalog="avatars"');
    expect(src).not.toContain('placeholder="https://example.com/avatar.png"');
    expect(src).not.toContain("Path del Avatar Local");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: PlayersPage wiring FAIL.

- [ ] **Step 3: Edit `src/frontend/dm/pages/PlayersPage.tsx`**

Add import at top:

```typescript
import { ImagePickerButton } from "../shared/components/ImagePickerButton.js";
```

_(adjust relative path: `../../shared/components/ImagePickerButton.js` — verify depth from `src/frontend/dm/pages/`)_

Find and replace the two `form-group` blocks for "URL de la Imagen" and "Path del Avatar Local" (lines ~453–479). Replace both with:

```tsx
<div className="form-group" style={{ marginBottom: 0 }}>
  <label className="form-label">Avatar del jugador</label>
  <ImagePickerButton
    value={playerForm.imageUrl || playerForm.avatarUrl || ""}
    onChange={(path) => setPlayerForm({ ...playerForm, imageUrl: path, avatarUrl: "" })}
    catalog="avatars"
    defaultImage="/assets/avatars/default-avatar.png"
    shape="circle"
  />
</div>
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: PlayersPage wiring PASS.

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/dm/pages/PlayersPage.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(players): replace imageUrl/avatarUrl inputs with ImagePickerButton"
```

---

### Task 6: Wire into `EntityCreateModal`

**Files:**

- Modify: `src/frontend/dm/entities/EntityCreateModal.tsx`
- Modify: `tests/frontend/imagePicker.test.ts`

**Interfaces:**

- Consumes: `ImagePickerButton`
- `entityForm.metadata?.imageUrl` is the value; setter: `setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, imageUrl: path } })`

- [ ] **Step 1: Add failing test**

```typescript
describe("EntityCreateModal wiring", () => {
  it("uses ImagePickerButton for imageUrl", () => {
    const src = read("src/frontend/dm/entities/EntityCreateModal.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain('placeholder="https://ejemplo.com/foto.jpg"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

- [ ] **Step 3: Edit `src/frontend/dm/entities/EntityCreateModal.tsx`**

Add import:

```typescript
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";
```

_(from `src/frontend/dm/entities/` → `../../shared/components/`)_

Find lines ~272–291 (the `form-group` with "URL de la Imagen (PNJ, Entornos, etc.)"). Replace entirely:

```tsx
<div className="form-group">
  <label className="form-label">Imagen</label>
  <ImagePickerButton
    value={entityForm.metadata?.imageUrl || ""}
    onChange={(path) =>
      setEntityForm({
        ...entityForm,
        metadata: { ...entityForm.metadata, imageUrl: path || undefined },
      })
    }
    catalog="avatars"
    defaultImage="/assets/entities/default_npc.png"
    shape="circle"
  />
</div>
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

Expected: EntityCreateModal wiring PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/dm/entities/EntityCreateModal.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(entities): replace imageUrl input with ImagePickerButton in EntityCreateModal"
```

---

### Task 7: Wire into `EntityDetailModal`

**Files:**

- Modify: `src/frontend/dm/entities/EntityDetailModal.tsx`
- Modify: `tests/frontend/imagePicker.test.ts`

**Interfaces:**

- Consumes: `ImagePickerButton`
- Value: `editEntityForm.metadata?.imageUrl ?? entity.metadata?.imageUrl ?? ""`
- Setter: `setEditEntityForm({ ...editEntityForm, metadata: { ...(editEntityForm.metadata ?? entity.metadata ?? {}), imageUrl: path || undefined } })`

- [ ] **Step 1: Add failing test**

```typescript
describe("EntityDetailModal wiring", () => {
  it("uses ImagePickerButton for imageUrl in edit form", () => {
    const src = read("src/frontend/dm/entities/EntityDetailModal.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain('placeholder="https://ejemplo.com/foto.jpg"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

- [ ] **Step 3: Edit `src/frontend/dm/entities/EntityDetailModal.tsx`**

Add import:

```typescript
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";
```

Find lines ~600–614 (the `form-group` with "URL de la Imagen"). Replace:

```tsx
<div className="form-group" style={{ marginBottom: 0 }}>
  <label className="form-label">Imagen</label>
  <ImagePickerButton
    value={editEntityForm.metadata?.imageUrl ?? entity.metadata?.imageUrl ?? ""}
    onChange={(path) =>
      setEditEntityForm({
        ...editEntityForm,
        metadata: {
          ...(editEntityForm.metadata ?? entity.metadata ?? {}),
          imageUrl: path || undefined,
        },
      })
    }
    catalog="avatars"
    shape="circle"
  />
</div>
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/frontend/imagePicker.test.ts && npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/dm/entities/EntityDetailModal.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(entities): replace imageUrl input with ImagePickerButton in EntityDetailModal"
```

---

### Task 8: Wire into `CanvasInspector`

**Files:**

- Modify: `src/frontend/dm/canvas/components/CanvasInspector.tsx`
- Modify: `tests/frontend/imagePicker.test.ts`

**Interfaces:**

- Consumes: `ImagePickerButton`
- State variable `imageUrl` and `setImageUrl` already exist (line 64).
- The `onBlur` save logic at line 142 fires when `imageUrl` changes; call it when picker selects an image.

- [ ] **Step 1: Add failing test**

```typescript
describe("CanvasInspector wiring", () => {
  it("uses ImagePickerButton for imageUrl", () => {
    const src = read("src/frontend/dm/canvas/components/CanvasInspector.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).not.toContain("Imagen / Retrato (URL)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

- [ ] **Step 3: Edit `src/frontend/dm/canvas/components/CanvasInspector.tsx`**

Add import:

```typescript
import { ImagePickerButton } from "../../../shared/components/ImagePickerButton.js";
```

_(from `src/frontend/dm/canvas/components/` → `../../../shared/components/`)_

Find lines ~571–583 (the `form-group` with "Imagen / Retrato (URL)"). The existing flow is: `input onBlur → handleImageUrlBlur`. With the picker, selection is immediate. Replace:

```tsx
<div className="form-group">
  <label>Imagen / Retrato</label>
  <ImagePickerButton
    value={imageUrl}
    onChange={(path) => {
      setImageUrl(path);
      const current = (entity.metadata?.imageUrl as string) || "";
      if (path !== current) {
        void updateEntity(entity.entityId, {
          metadata: { ...entity.metadata, imageUrl: path || undefined },
        });
      }
    }}
    catalog="avatars"
    shape="circle"
  />
</div>
```

Note: `updateEntity` is the function already called inside `handleImageUrlBlur` — verify the actual function name in the file before editing (`grep -n "updateEntity\|handleImageUrlBlur" src/frontend/dm/canvas/components/CanvasInspector.tsx`).

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/frontend/imagePicker.test.ts && npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/dm/canvas/components/CanvasInspector.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(canvas): replace imageUrl input with ImagePickerButton in CanvasInspector"
```

---

### Task 9: Wire into `App.tsx` (campaign cover)

**Files:**

- Modify: `src/frontend/App.tsx`
- Modify: `tests/frontend/imagePicker.test.ts`

**Interfaces:**

- Consumes: `ImagePickerButton`
- State `editCoverUrl` and `setEditCoverUrl` already exist (line 92).
- Shape: `"rect"` (landscape cover art).
- Default: `"/assets/campaigns/default-campaign-cover.jpg"`.

- [ ] **Step 1: Add failing test**

```typescript
describe("App campaign cover wiring", () => {
  it("uses ImagePickerButton for campaign coverUrl", () => {
    const src = read("src/frontend/App.tsx");
    expect(src).toContain("ImagePickerButton");
    expect(src).toContain('catalog="campaigns"');
    expect(src).not.toContain("editCoverUrl} onChange={(e) => setEditCoverUrl");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/frontend/imagePicker.test.ts
```

- [ ] **Step 3: Edit `src/frontend/App.tsx`**

Add import near other shared component imports:

```typescript
import { ImagePickerButton } from "./shared/components/ImagePickerButton.js";
```

Find the input at line ~1066 (inside the campaign edit modal):

```tsx
// OLD — something like:
<input className="form-input" value={editCoverUrl} onChange={(e) => setEditCoverUrl(e.target.value)} />

// NEW:
<div className="form-group">
  <label className="form-label">Portada de campaña</label>
  <ImagePickerButton
    value={editCoverUrl}
    onChange={setEditCoverUrl}
    catalog="campaigns"
    defaultImage="/assets/campaigns/default-campaign-cover.jpg"
    shape="rect"
  />
</div>
```

- [ ] **Step 4: Run full suite**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/App.tsx tests/frontend/imagePicker.test.ts
git commit -m "feat(campaigns): replace coverUrl input with ImagePickerButton"
```

---

## Self-Review

**Spec coverage:**

- ✅ 6 URL inputs replaced (IdentityEditor, PlayersPage ×2→1, EntityCreateModal, EntityDetailModal, CanvasInspector, App)
- ✅ No external URL entry
- ✅ "Sin imagen" clears the field
- ✅ Catalog auto-discovers new subcategories
- ✅ Campaigns: flat catalog, avatars: grouped by subfolder
- ✅ Backend route handles missing `assetsDir` gracefully (empty catalog in test env)

**Placeholder scan:** None found.

**Type consistency:** `ImagePickerButton` props (`value: string`, `onChange: (path: string) => void`, `catalog: "avatars" | "campaigns"`) used consistently across all 6 wiring tasks. `ImagePickerModal` `onSelect: (path: string) => void` matches internal call `onSelect(path)` and clear call `onSelect("")`.

**Gap check:** CanvasInspector uses `updateEntity` — implementer must verify actual function name before editing (step 3 note). The `handleEditConfirm` in `App.tsx` already does `editCoverUrl.trim() || undefined` which handles the empty string from "Sin imagen" correctly.
