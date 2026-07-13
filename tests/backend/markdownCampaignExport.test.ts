import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { writeMarkdownCampaignExport } from "../../src/backend/server/export/markdownCampaignExport.js";

const now = "2026-07-13T12:00:00.000Z";

let exportRoot: string | null = null;

afterEach(async () => {
  if (exportRoot) {
    await rm(exportRoot, { recursive: true, force: true });
    exportRoot = null;
  }
});

describe("markdown campaign export", () => {
  it("exports Canvas as part of the DM booklet and downloadable markdown bundle", async () => {
    exportRoot = await mkdtemp(join(tmpdir(), "dmcc-markdown-export-"));

    const state = {
      campaignId: "cmp_canvas_export",
      campaign: {
        campaignId: "cmp_canvas_export",
        title: "La Ciudad Bajo la Lluvia",
        system: "custom" as const,
        summary: "Una campaña de secretos urbanos.",
        status: "active" as const,
        settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 10 },
        metadata: {},
        archived: false,
      },
      players: new Map(),
      invitations: new Map(),
      lastSequence: 0,
      entities: new Map([
        [
          "ent_oracle",
          {
            entityId: "ent_oracle",
            campaignId: "cmp_canvas_export",
            title: "El Oráculo de Cristal",
            entityType: "npc" as const,
            summary: "Custodia la memoria de la ciudad.",
            status: "",
            importance: "normal" as const,
            visibility: { kind: "public" as const },
            tags: [],
            tagIds: [],
            metadata: {},
            archived: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
      ]),
      relations: new Map(),
      facts: new Map(),
      sessions: new Map(),
      sessionEvents: new Map(),
      tags: new Map(),
      attachments: new Map(),
      canvases: new Map([
        [
          "cvs_city",
          {
            id: "cvs_city",
            canvasId: "cvs_city",
            campaignId: "cmp_canvas_export",
            title: "Trama de la ciudad",
            kind: "mystery" as const,
            description: "Mapa visual de sospechas, escenas y revelaciones.",
            archived: false,
            viewport: { x: 0, y: 0, zoom: 1 },
            nodes: [
              {
                id: "node_oracle",
                canvasId: "cvs_city",
                campaignId: "cmp_canvas_export",
                kind: "entity" as const,
                entityId: "ent_oracle",
                x: 120,
                y: 80,
                createdAt: now,
                updatedAt: now,
              },
            ],
            edges: [],
            createdAt: now,
            updatedAt: now,
          },
        ],
      ]),
    };

    const result = await writeMarkdownCampaignExport({
      state,
      events: [],
      exportDir: exportRoot,
      campaignId: state.campaignId,
      exportId: "exp_canvas_product",
    });

    const primaryMarkdown = await readFile(join(exportRoot, result.primaryFile), "utf8");
    const canvasMarkdown = await readFile(join(exportRoot, "06 Canvas y grafo.md"), "utf8");

    expect(result.downloadUrl).toBe("/api/campaigns/cmp_canvas_export/exports/exp_canvas_product/download");
    expect(primaryMarkdown).toContain("## 3. Estructura Narrativa (según Canvas)");
    expect(primaryMarkdown).toContain("### Tablero: Trama de la ciudad");
    expect(primaryMarkdown).toContain("El Oráculo de Cristal");
    expect(canvasMarkdown).toContain("# Canvas y grafo");
    expect(canvasMarkdown).toContain("## Trama de la ciudad");
    expect(canvasMarkdown).toContain("Nodos: 1");
    expect(canvasMarkdown).toContain("entity: El Oráculo de Cristal (120, 80)");
  });
});
