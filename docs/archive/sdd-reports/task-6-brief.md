> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

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
