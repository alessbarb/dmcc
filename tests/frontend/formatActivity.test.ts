import { describe, expect, it } from "vitest";
import { formatActivity } from "../../src/frontend/shared/presentation/formatActivity.js";

describe("formatActivity frontend presenter", () => {
  it("formats campaign.created and other core activities utilizing getActivityVisualConfig fallback", () => {
    // campaign.created (core activity)
    const resultEs = formatActivity({ type: "campaign.created", occurredAt: new Date().toISOString(), data: { title: "Campaña de Prueba" } }, "es");
    expect(resultEs).toBe('Campaña "Campaña de Prueba" inicializada.');

    const resultEn = formatActivity({ type: "campaign.created", occurredAt: new Date().toISOString(), data: { title: "Test Campaign" } }, "en");
    expect(resultEn).toBe('Campaign "Test Campaign" initialized.');
  });

  it("formats notebook.created and other new activities", () => {
    // notebook.created
    const resultEs = formatActivity({ type: "notebook.created", occurredAt: new Date().toISOString(), data: { title: "Bitácora" } }, "es");
    expect(resultEs).toBe('Cuaderno "Bitácora" creado.');

    const resultEn = formatActivity({ type: "notebook.created", occurredAt: new Date().toISOString(), data: { title: "Logbook" } }, "en");
    expect(resultEn).toBe('Notebook "Logbook" created.');
  });

  it("formats legacy activity types defined in formatActivity directly or via i18n keys", () => {
    // story_step_created (legacy / specific translations)
    const resultEs = formatActivity({ type: "story_step_created", occurredAt: new Date().toISOString() }, "es");
    expect(resultEs).toBe("Se creó un paso narrativo");

    const resultEn = formatActivity({ type: "story_step_created", occurredAt: new Date().toISOString() }, "en");
    expect(resultEn).toBe("Story step created");
  });

  it("reverts to default activity recorded fallback when type is completely unknown", () => {
    const resultEs = formatActivity({ type: "unknown.type", occurredAt: new Date().toISOString() }, "es");
    expect(resultEs).toBe("Actividad registrada");

    const resultEn = formatActivity({ type: "unknown.type", occurredAt: new Date().toISOString() }, "en");
    expect(resultEn).toBe("Activity recorded");
  });
});
