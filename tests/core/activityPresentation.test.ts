import { describe, it, expect } from "vitest";
import { getActivityVisualConfig } from "../../src/core/projections/activity/activityPresentation.js";

describe("activityPresentation", () => {
  it("provides correct visual config for notebook events", () => {
    // notebook.created
    const createdConfig = getActivityVisualConfig("notebook.created", { title: "Mi Cuaderno" }, "es");
    expect(createdConfig.label).toBe("Cuaderno");
    expect(createdConfig.icon).toBe("BookOpen");
    expect(createdConfig.description).toBe('Cuaderno "Mi Cuaderno" creado.');

    const createdConfigEn = getActivityVisualConfig("notebook.created", { title: "My Notebook" }, "en");
    expect(createdConfigEn.description).toBe('Notebook "My Notebook" created.');

    // notebook.archived
    const archivedConfig = getActivityVisualConfig("notebook.archived", {}, "es");
    expect(archivedConfig.icon).toBe("Archive");
    expect(archivedConfig.description).toBe("Cuaderno archivado.");
  });

  it("provides correct visual config for story thread events", () => {
    const threadConfig = getActivityVisualConfig("story_thread.created", { title: "La guarida de los trasgos" }, "es");
    expect(threadConfig.label).toBe("Hilo narrativo");
    expect(threadConfig.description).toBe('Hilo narrativo "La guarida de los trasgos" iniciado.');
  });

  it("provides correct visual config for story step events", () => {
    // story_step.created
    const stepConfig = getActivityVisualConfig("story_step.created", { title: "Encontrar la llave" }, "es");
    expect(stepConfig.label).toBe("Paso narrativo");
    expect(stepConfig.description).toBe('Paso narrativo "Encontrar la llave" creado.');

    // story_step.reconciled - resolved as planned
    const recConfigPlanned = getActivityVisualConfig(
      "story_step.reconciled",
      { status: "resolved", resolutionKind: "as_planned" },
      "es"
    );
    expect(recConfigPlanned.description).toBe("Paso narrativo resuelto (según lo planificado).");

    // story_step.reconciled - resolved with changes
    const recConfigChanges = getActivityVisualConfig(
      "story_step.reconciled",
      { status: "resolved", resolutionKind: "changed" },
      "en"
    );
    expect(recConfigChanges.description).toBe("Story step resolved (with changes).");

    // story_step.reconciled - discarded
    const recConfigDiscarded = getActivityVisualConfig(
      "story_step.reconciled",
      { status: "discarded" },
      "es"
    );
    expect(recConfigDiscarded.description).toBe("Paso narrativo descartado.");
  });
});
