> Archived historical implementation plan.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# PWA + Multi-Device UX — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make DMCC installable as a PWA and usable across desktop, tablet, and mobile without changing the local-first architecture.

**Architecture:** Vite builds the React SPA; `vite-plugin-pwa` injects a Workbox service worker that pre-caches the app shell (HTML/JS/CSS/images) so the shell loads offline. All `/api` requests remain network-only — if the Fastify server is down, the app shell loads but shows a connection-error state. No cloud, no new server code, no new data layer.

**Tech Stack:** `vite-plugin-pwa` + Workbox (auto via plugin), `workbox-window` (SW registration in React), `sharp` (icon PNG generation script, devDependency).

## Global Constraints

- Node ≥ 20, TypeScript 6, React 19, Vite 8
- App serves at `http://localhost:4877` (production) / `http://localhost:5173` (dev)
- All UI text in Spanish (es) — no new English-only strings
- No cloud, no external auth, no new API routes
- All new components must typecheck with `npm run typecheck:app`
- Tests: run with `npm test` (vitest), currently 78/78 passing — do not break
- CSS: vanilla CSS custom properties only (no Tailwind, no CSS-in-JS)
- Mobile breakpoint: `≤ 768px` (existing), Tablet breakpoint: `769px–1200px` (new)

---

## Task 1: App Icons

**Files:**

- Create: `public/icons/icon.svg`
- Create: `scripts/generate-icons.mjs`
- Create: `public/icons/icon-192.png` (generated)
- Create: `public/icons/icon-512.png` (generated)
- Create: `public/icons/apple-touch-icon.png` (generated, 180×180)

**Interfaces:**

- Produces: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png` — used by Task 2 manifest config

- [ ] **Step 1: Install sharp as devDependency**

```bash
npm install --save-dev sharp
```

Expected output: `added N packages`

- [ ] **Step 2: Create the SVG icon**

Create `public/icons/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(230,35%,10%)"/>
      <stop offset="100%" style="stop-color:hsl(230,35%,16%)"/>
    </linearGradient>
    <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(255,85%,65%)"/>
      <stop offset="100%" style="stop-color:hsl(175,85%,45%)"/>
    </linearGradient>
  </defs>
  <!-- Background rounded square -->
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <!-- D20 outline polygon -->
  <polygon
    points="256,60 380,148 380,308 300,420 212,420 132,308 132,148"
    fill="none" stroke="url(#icon)" stroke-width="18" stroke-linejoin="round"/>
  <!-- Center line details -->
  <line x1="256" y1="60" x2="300" y2="148" stroke="url(#icon)" stroke-width="10" opacity="0.6"/>
  <line x1="256" y1="60" x2="212" y2="148" stroke="url(#icon)" stroke-width="10" opacity="0.6"/>
  <line x1="132" y1="148" x2="212" y2="148" stroke="url(#icon)" stroke-width="10" opacity="0.6"/>
  <line x1="212" y1="148" x2="300" y2="148" stroke="url(#icon)" stroke-width="10" opacity="0.6"/>
  <line x1="300" y1="148" x2="380" y2="148" stroke="url(#icon)" stroke-width="10" opacity="0.6"/>
  <!-- Number 20 in center -->
  <text x="256" y="295" text-anchor="middle" font-family="system-ui,sans-serif"
    font-size="110" font-weight="800" fill="url(#icon)">20</text>
</svg>
```

- [ ] **Step 3: Create icon generation script**

Create `scripts/generate-icons.mjs`:

```js
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const svgBuf = readFileSync(join(root, "public/icons/icon.svg"));

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(join(root, "public/icons", name));
  console.log(`✓ public/icons/${name} (${size}×${size})`);
}
```

- [ ] **Step 4: Run the icon generation script**

```bash
node scripts/generate-icons.mjs
```

Expected output:

```
✓ public/icons/icon-192.png (192×192)
✓ public/icons/icon-512.png (512×512)
✓ public/icons/apple-touch-icon.png (180×180)
```

- [ ] **Step 5: Commit**

```bash
git add public/icons/ scripts/generate-icons.mjs
git commit -m "feat(pwa): add D20 app icons (SVG + PNG variants)"
```

---

## Task 2: PWA Plugin + Manifest

**Files:**

- Modify: `vite.config.ts`
- Modify: `index.html`
- Modify: `package.json` (add `gen:icons` script)

**Interfaces:**

- Consumes: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png` from Task 1
- Produces: `virtual:pwa-register/react` module available in frontend — used by Task 3

- [ ] **Step 1: Install vite-plugin-pwa**

```bash
npm install --save-dev vite-plugin-pwa
```

- [ ] **Step 2: Update vite.config.ts**

Replace the existing `vite.config.ts` with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      manifest: {
        name: "DM Campaign Companion",
        short_name: "DMCC",
        description: "Motor de memoria narrativa para Dungeon Masters",
        theme_color: "hsl(230, 35%, 7%)",
        background_color: "hsl(230, 35%, 7%)",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        lang: "es",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  root: ".",
  resolve: {
    alias: {
      "@frontend": resolve(__dirname, "src/frontend"),
      "@backend": resolve(__dirname, "src/backend"),
      "@core": resolve(__dirname, "src/core"),
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[hash].js",
        chunkFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash][extname]",
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4877",
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: Update index.html**

Replace `index.html` with:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Motor de memoria narrativa para Dungeon Masters — gestiona entidades, relaciones y hechos de tus campañas." />
    <meta name="theme-color" content="hsl(230, 35%, 7%)" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="DMCC" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <title>DM Campaign Companion</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/frontend/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Add gen:icons script to package.json**

In `package.json` scripts section, add after the existing scripts:

```json
"gen:icons": "node scripts/generate-icons.mjs"
```

- [ ] **Step 5: Verify build produces manifest + SW**

```bash
npm run build 2>&1 | tail -20
ls dist/public/sw.js dist/public/manifest.webmanifest
```

Expected: both files exist.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts index.html package.json package-lock.json
git commit -m "feat(pwa): configure vite-plugin-pwa with Workbox, manifest, and apple meta tags"
```

---

## Task 3: SW Update Notification Banner

**Files:**

- Create: `src/frontend/shared/components/PwaUpdateBanner.tsx`
- Modify: `src/frontend/main.tsx`

**Interfaces:**

- Consumes: `virtual:pwa-register/react` (provided by vite-plugin-pwa after Task 2)
- Produces: `<PwaUpdateBanner />` component — self-contained, no props

- [ ] **Step 1: Add vite-plugin-pwa type declarations**

Create `src/frontend/vite-pwa.d.ts`:

```ts
/// <reference types="vite-plugin-pwa/client" />
```

- [ ] **Step 2: Create PwaUpdateBanner component**

Create `src/frontend/shared/components/PwaUpdateBanner.tsx`:

```tsx
import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(80px + env(safe-area-inset-bottom))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-hover)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        fontSize: "0.85rem",
        color: "var(--text-main)",
        whiteSpace: "nowrap",
      }}
    >
      <span>Nueva versión disponible</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: "var(--primary)",
          color: "var(--text-main)",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "5px 12px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.8rem",
        }}
      >
        Actualizar
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Mount PwaUpdateBanner in main.tsx**

Read current `src/frontend/main.tsx` then update to import and render `<PwaUpdateBanner />` alongside the router. The component is self-contained — mount it as a sibling of `<RouterProvider>` inside the root `<React.StrictMode>`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.js";
import { I18nProvider } from "./shared/i18n/I18nProvider.js";
import { PwaUpdateBanner } from "./shared/components/PwaUpdateBanner.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <RouterProvider router={router} />
      <PwaUpdateBanner />
    </I18nProvider>
  </React.StrictMode>
);
```

- [ ] **Step 4: Run typecheck to verify**

```bash
npm run typecheck:app
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/shared/components/PwaUpdateBanner.tsx src/frontend/main.tsx src/frontend/vite-pwa.d.ts
git commit -m "feat(pwa): add SW update notification banner"
```

---

## Task 4: Tablet Form-Factor CSS (769px–1200px)

**Files:**

- Modify: `src/frontend/shared/styles/index.css`

**Goal:** On touch devices and tablets (769–1200px), auto-collapse the sidebar, increase touch target sizes, and add a tablet-specific content layout.

**Interfaces:**

- Produces: CSS variables `--tablet-sidebar-width: 52px`, `--touch-target-min: 44px` available for JS reads if needed

- [ ] **Step 1: Read the end of index.css to find the right insertion point**

```bash
wc -l src/frontend/shared/styles/index.css
tail -30 src/frontend/shared/styles/index.css
```

Note the line number — append the tablet section after the last `}` in the file.

- [ ] **Step 2: Append tablet CSS section**

Append to the end of `src/frontend/shared/styles/index.css`:

```css
/* ─────────────────────────────────────────────────────────────
   Tablet form-factor (769px–1200px)
   Touch-first: sidebar auto-collapsed, larger targets.
   ───────────────────────────────────────────────────────────── */

:root {
  --touch-target-min: 44px;
}

@media (min-width: 769px) and (max-width: 1200px) {
  /* Sidebar always collapsed on tablet */
  .sidebar {
    width: 52px !important;
    min-width: 52px !important;
  }

  .sidebar-header {
    padding: 16px 8px !important;
    overflow: hidden !important;
  }

  .sidebar-logo,
  .sidebar-logo-subtitle {
    display: none !important;
  }

  .sidebar-nav {
    padding: 12px 6px !important;
  }

  .nav-item {
    padding: 10px !important;
    justify-content: center !important;
    gap: 0 !important;
    min-height: var(--touch-target-min) !important;
  }

  .nav-item span {
    display: none !important;
  }

  .sidebar-footer {
    padding: 12px 8px !important;
  }

  /* Content body: slightly more breathing room on medium screens */
  .content-body {
    padding: 20px 20px 72px !important;
  }

  /* Buttons: larger tap targets */
  .btn {
    min-height: var(--touch-target-min);
    padding: 10px 16px;
  }

  /* Cards: no lift animation on touch (avoids stuck :hover states) */
  .card:hover {
    transform: none !important;
  }
}

/* Touch devices at any width: enlarge interactive elements */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: var(--touch-target-min);
  }

  .nav-item {
    min-height: var(--touch-target-min);
  }

  /* Prevent double-tap zoom on buttons */
  .btn,
  .nav-item,
  [role="button"] {
    touch-action: manipulation;
  }

  /* Remove hover card lift on touch */
  .card:hover {
    transform: none !important;
    box-shadow: var(--shadow-md) !important;
  }
}
```

- [ ] **Step 3: Verify no regression at mobile breakpoint**

```bash
npm run typecheck:app
```

Expected: 0 errors (CSS changes don't affect TS typecheck but ensures no JS was accidentally modified).

- [ ] **Step 4: Commit**

```bash
git add src/frontend/shared/styles/index.css
git commit -m "feat(pwa): tablet CSS — auto-collapsed sidebar, touch targets, hover suppression"
```

---

## Task 5: Quick Capture FAB (Mobile / Tablet)

**Files:**

- Create: `src/frontend/dm/capture/QuickCaptureFAB.tsx`
- Modify: `src/frontend/dm/layouts/CampaignShell.tsx`

**Goal:** Floating action button visible on mobile/tablet (≤1200px, touch devices). Opens a bottom sheet for fast entity creation: name + type + save. No new API routes — calls the existing `POST /api/campaigns/:campaignId/entities` endpoint that the campaign store already wraps.

**Interfaces:**

- Consumes: `useCampaignStore()` → `{ activeCampaignId, createEntity }` (already exists in store)
- Consumes: `useToast()` from `../../shared/hooks/useToast.js`
- Consumes: `useTranslation()` from `../../shared/i18n/useTranslation.js`
- Produces: `<QuickCaptureFAB campaignId={string} />` — self-contained

- [ ] **Step 1: Read campaignStore to confirm createEntity signature**

```bash
grep -n "createEntity\|addEntity\|POST.*entities" src/frontend/shared/stores/campaignStore.ts | head -20
```

Note the exact function name and params.

- [ ] **Step 2: Read the i18n translation keys for entity types**

```bash
grep -n "EntityType\|entity_type\|entityType" src/frontend/shared/i18n/useTranslation.ts | head -20
grep -rn "npc\|quest\|clue\|location\|note" src/frontend/shared/i18n/ | grep '"' | head -30
```

Note the translation key pattern for entity type labels.

- [ ] **Step 3: Create QuickCaptureFAB**

Create `src/frontend/dm/capture/QuickCaptureFAB.tsx`:

```tsx
import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Zap } from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";

type QuickEntityType = "npc" | "location" | "quest" | "clue" | "note" | "item";

const QUICK_TYPES: { type: QuickEntityType; label: string; emoji: string }[] = [
  { type: "npc", label: "PNJ", emoji: "🧙" },
  { type: "location", label: "Lugar", emoji: "📍" },
  { type: "quest", label: "Misión", emoji: "⚔️" },
  { type: "clue", label: "Pista", emoji: "🔍" },
  { type: "note", label: "Nota", emoji: "📝" },
  { type: "item", label: "Objeto", emoji: "💎" },
];

type Props = { campaignId: string };

export function QuickCaptureFAB({ campaignId }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<QuickEntityType>("note");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Get the createEntity action from the store
  const createEntity = useCampaignStore((s) => s.createEntity);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setName("");
      setType("note");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createEntity(campaignId, { title: name.trim(), entityType: type });
      addToast({ type: "success", message: `${name.trim()} creado` });
      setOpen(false);
    } catch {
      addToast({ type: "error", message: "Error al crear la entidad" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* FAB button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Captura rápida"
        className="quick-capture-fab"
      >
        <Plus size={22} />
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <div
          className="quick-capture-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="quick-capture-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Captura rápida"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-capture-sheet__header">
              <span className="quick-capture-sheet__title">
                <Zap size={14} /> Captura rápida
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="quick-capture-sheet__body">
              <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder="Nombre..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                maxLength={120}
              />

              <div className="quick-capture-type-grid">
                {QUICK_TYPES.map(({ type: t, label, emoji }) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`quick-capture-type-btn ${type === t ? "active" : ""}`}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="quick-capture-sheet__footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!name.trim() || saving}
              >
                {saving ? "Guardando…" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Add QuickCaptureFAB CSS**

Append to `src/frontend/shared/styles/index.css` (after the tablet section from Task 4):

```css
/* ─────────────────────────────────────────────────────────────
   Quick Capture FAB
   ───────────────────────────────────────────────────────────── */

.quick-capture-fab {
  display: none; /* hidden on desktop */
  position: fixed;
  right: 16px;
  bottom: calc(var(--campaign-mobile-bottom-nav-height, 74px) + 16px + env(safe-area-inset-bottom));
  z-index: 200;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--text-main);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-primary), var(--shadow-lg);
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.quick-capture-fab:active {
  transform: scale(0.93);
}

@media (max-width: 1200px), (hover: none) and (pointer: coarse) {
  .quick-capture-fab {
    display: flex;
  }
}

.quick-capture-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.quick-capture-sheet {
  width: 100%;
  max-width: 520px;
  background: var(--bg-card);
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.quick-capture-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-color);
}

.quick-capture-sheet__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.quick-capture-sheet__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-capture-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quick-capture-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  min-height: var(--touch-target-min);
  touch-action: manipulation;
}

.quick-capture-type-btn.active {
  background: var(--primary-light);
  border-color: hsla(255, 85%, 65%, 0.4);
  color: var(--text-main);
}

.quick-capture-sheet__footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-color);
}
```

- [ ] **Step 5: Mount QuickCaptureFAB in CampaignShell**

In `src/frontend/dm/layouts/CampaignShell.tsx`, import and render the FAB inside the outer `div` (after the `<ToastContainer>` line, before the `mystical-portal-overlay` div):

```tsx
import { QuickCaptureFAB } from "../capture/QuickCaptureFAB.js";

// Inside the JSX, after <ToastContainer toasts={toasts} onRemove={removeToast} />:
{campaignId && <QuickCaptureFAB campaignId={campaignId} />}
```

- [ ] **Step 6: Verify store has createEntity**

```bash
grep -n "createEntity" src/frontend/shared/stores/campaignStore.ts | head -10
```

If the store uses a different name (e.g., `addEntity`), adjust the import in `QuickCaptureFAB.tsx` to match.

- [ ] **Step 7: Typecheck**

```bash
npm run typecheck:app
```

Expected: 0 errors.

- [ ] **Step 8: Run tests**

```bash
npm test
```

Expected: 78 tests passing (FAB has no unit tests — it's pure UI; E2E covers it implicitly).

- [ ] **Step 9: Commit**

```bash
git add src/frontend/dm/capture/QuickCaptureFAB.tsx src/frontend/dm/layouts/CampaignShell.tsx src/frontend/shared/styles/index.css
git commit -m "feat(pwa): quick capture FAB — mobile/tablet bottom sheet for fast entity creation"
```

---

## Task 6: Update CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

Replace the "Project" section and add a new "Multi-Device Strategy" section. Changes:

1. In the **Project** section, change `"local-first web app"` → `"local-first, PWA-enabled web app"`
2. Remove `"No AI, no cloud, no external DB."` → replace with `"No AI, no cloud sync, no external DB. Data lives in local files. PWA-enabled for installability and offline shell."`
3. Add a new section `## Multi-Device Strategy` after `## Status`:

```markdown
## Multi-Device Strategy

DMCC supports three usage contexts without changing the local-first architecture:

| Context | Device | Priority |
|---|---|---|
| Preparación | Desktop / laptop | Dense info, multi-panel, sidebar |
| Dirección (en mesa) | Tablet (769–1200px) | Touch targets, collapsed sidebar, quick capture |
| Inspiración / captura | Móvil (≤768px) | Bottom nav, quick capture FAB, minimal UI |

### Phase 1 (implemented)
- **PWA**: `vite-plugin-pwa` + Workbox; app shell cached offline; `/api` network-only.
- **Icons**: D20 SVG + PNG variants (192, 512, 180); generated by `npm run gen:icons`.
- **Tablet CSS**: sidebar auto-collapses at 769–1200px; touch targets ≥ 44px; hover effects suppressed.
- **Quick Capture FAB**: floating `+` button on mobile/tablet; bottom sheet → create entity in one tap.
- **SW update banner**: prompts user to refresh when a new version is cached.

### Phase 2 (future — evaluate after Phase 1 usage)
- LAN sync: DM laptop as host, tablet joins via LAN access code (already specced in LAN Mode section).
- Vault export/import for cross-device transfer without LAN.
- Cloud sync (optional): event stream upload to S3/R2 — evaluate only if LAN mode is insufficient.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md — PWA phase 1 strategy and multi-device contexts"
```

---

## Self-Review

### Spec coverage

- ✅ PWA installable: manifest + icons + SW (Tasks 1–2)
- ✅ Offline app shell: Workbox pre-cache (Task 2)
- ✅ `/api` remains network-only: Workbox runtime cache config (Task 2)
- ✅ SW update flow: banner component (Task 3)
- ✅ Tablet form-factor: sidebar collapse + touch targets (Task 4)
- ✅ Mobile quick capture: FAB + bottom sheet (Task 5)
- ✅ Architecture unchanged: no new server routes, no cloud, same data layer
- ✅ CLAUDE.md updated (Task 6)

### Placeholder scan

- No TBDs found. All code blocks are complete and reference real types.

### Type consistency

- `QuickCaptureFAB` uses `useCampaignStore((s) => s.createEntity)` — Step 6 verifies the exact name before commit.
- `useRegisterSW` returns `{ needRefresh: [boolean, Setter], updateServiceWorker: fn }` — this is the vite-plugin-pwa API shape.
- `PwaUpdateBanner` uses array destructuring: `const { needRefresh: [needRefresh], updateServiceWorker }` — correct for `useRegisterSW`.
