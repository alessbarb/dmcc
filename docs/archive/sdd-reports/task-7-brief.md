> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

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
