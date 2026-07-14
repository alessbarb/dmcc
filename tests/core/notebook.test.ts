import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import { hasNotebookCycle, getHierarchyDepthIfParentSet } from "../../src/core/domain/notebook/notebook.js";

describe("Notebook Domain & Commands", () => {
  it("detects parent-child cycles and hierarchy depth limits", () => {
    // 1. Cycle detection logic tests
    const notebooks = new Map<string, { parentNotebookId?: string | null }>();
    notebooks.set("nbk_root", { parentNotebookId: null });
    notebooks.set("nbk_child", { parentNotebookId: "nbk_root" });
    notebooks.set("nbk_grandchild", { parentNotebookId: "nbk_child" });

    // Cycle check: grandchild to grandchild -> cycle
    expect(hasNotebookCycle(notebooks, "nbk_grandchild", "nbk_grandchild")).toBe(true);
    // Cycle check: root to grandchild -> cycle if root's parent becomes grandchild
    expect(hasNotebookCycle(notebooks, "nbk_root", "nbk_grandchild")).toBe(true);
    // No cycle: child to root
    expect(hasNotebookCycle(notebooks, "nbk_child", "nbk_root")).toBe(false);

    // 2. Depth calculation tests
    const notebooksForDepth = new Map<string, { notebookId: string; parentNotebookId?: string | null }>();
    notebooksForDepth.set("nbk_root", { notebookId: "nbk_root", parentNotebookId: null });
    notebooksForDepth.set("nbk_child", { notebookId: "nbk_child", parentNotebookId: "nbk_root" });
    
    // Setting parent of nbk_grandchild to child -> max depth should be 3 (root -> child -> grandchild)
    expect(getHierarchyDepthIfParentSet(notebooksForDepth, "nbk_grandchild", "nbk_child")).toBe(3);

    // Setting parent of nbk_greatgrandchild to grandchild (when grandchild is child of child) -> max depth would be 4
    notebooksForDepth.set("nbk_grandchild", { notebookId: "nbk_grandchild", parentNotebookId: "nbk_child" });
    expect(getHierarchyDepthIfParentSet(notebooksForDepth, "nbk_greatgrandchild", "nbk_grandchild")).toBe(4);
  });

  it("handles CreateNotebook, UpdateNotebook, and ArchiveNotebook commands", () => {
    let state = createCampaignState("cmp_one");

    // Create a root notebook
    const result1 = handleCommand(state, {
      type: "CreateNotebook",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      notebookId: "nbk_folder1",
      title: "Folder 1",
      sortOrder: 0,
    });
    state = result1.state;
    expect(state.notebooks.get("nbk_folder1")?.title).toBe("Folder 1");
    expect(state.notebooks.get("nbk_folder1")?.parentNotebookId).toBeNull();

    // Create a child notebook
    const result2 = handleCommand(state, {
      type: "CreateNotebook",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      notebookId: "nbk_folder2",
      parentNotebookId: "nbk_folder1",
      title: "Folder 2",
      sortOrder: 1,
    });
    state = result2.state;
    expect(state.notebooks.get("nbk_folder2")?.parentNotebookId).toBe("nbk_folder1");

    // Create a grandchild notebook
    const result3 = handleCommand(state, {
      type: "CreateNotebook",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      notebookId: "nbk_folder3",
      parentNotebookId: "nbk_folder2",
      title: "Folder 3",
      sortOrder: 2,
    });
    state = result3.state;
    expect(state.notebooks.get("nbk_folder3")?.parentNotebookId).toBe("nbk_folder2");

    // Try to exceed depth limit 3 (create a 4th level notebook)
    expect(() => {
      handleCommand(state, {
        type: "CreateNotebook",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        notebookId: "nbk_folder4",
        parentNotebookId: "nbk_folder3",
        title: "Folder 4",
        sortOrder: 3,
      });
    }).toThrow("Notebook depth limit exceeded. Maximum depth is 3");

    // Update notebook
    const result4 = handleCommand(state, {
      type: "UpdateNotebook",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      notebookId: "nbk_folder2",
      title: "Updated Folder 2",
    });
    state = result4.state;
    expect(state.notebooks.get("nbk_folder2")?.title).toBe("Updated Folder 2");

    // Try to set parent causing a cycle
    expect(() => {
      handleCommand(state, {
        type: "UpdateNotebook",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        notebookId: "nbk_folder1",
        parentNotebookId: "nbk_folder3",
      });
    }).toThrow("Setting parent would create a cycle");

    // Archive notebook
    const result5 = handleCommand(state, {
      type: "ArchiveNotebook",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      notebookId: "nbk_folder3",
    });
    state = result5.state;
    expect(state.notebooks.get("nbk_folder3")?.archivedAt).not.toBeNull();
  });

  it("handles AddNotebookItem, RemoveNotebookItem, and ReorderNotebookItems commands", () => {
    let state = createCampaignState("cmp_one");
    
    // Setup notebook
    state.notebooks.set("nbk_one", {
      campaignId: "cmp_one",
      notebookId: "nbk_one",
      title: "Notebook One",
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Mock an entity in state
    state.entities.set("ent_npc1", {
      campaignId: "cmp_one",
      entityId: "ent_npc1",
      entityType: "npc",
      title: "NPC One",
      importance: "normal",
      status: "active",
      tags: [],
      tagIds: [],
      visibility: { kind: "public" },
      metadata: {},
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add item
    const result1 = handleCommand(state, {
      type: "AddNotebookItem",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      notebookItemId: "nbi_item1",
      notebookId: "nbk_one",
      targetType: "entity",
      targetId: "ent_npc1",
      sortOrder: 0,
    });
    state = result1.state;
    expect(state.notebookItems.get("nbi_item1")?.targetId).toBe("ent_npc1");

    // Try to add duplicate
    expect(() => {
      handleCommand(state, {
        type: "AddNotebookItem",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        notebookItemId: "nbi_item2",
        notebookId: "nbk_one",
        targetType: "entity",
        targetId: "ent_npc1",
        sortOrder: 1,
      });
    }).toThrow("is already in the notebook");

    // Try to add item targeting non-existent entity
    expect(() => {
      handleCommand(state, {
        type: "AddNotebookItem",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        notebookItemId: "nbi_item3",
        notebookId: "nbk_one",
        targetType: "entity",
        targetId: "ent_nonexistent",
        sortOrder: 2,
      });
    }).toThrow("Entity not found");

    // Remove item
    const result2 = handleCommand(state, {
      type: "RemoveNotebookItem",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      notebookItemId: "nbi_item1",
    });
    state = result2.state;
    expect(state.notebookItems.has("nbi_item1")).toBe(false);
  });
});
