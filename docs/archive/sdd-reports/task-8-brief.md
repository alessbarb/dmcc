> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

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
