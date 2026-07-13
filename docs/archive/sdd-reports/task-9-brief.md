> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

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
