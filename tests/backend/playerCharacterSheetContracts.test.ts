import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const routePath = new URL("../../src/backend/server/web/routes/playerCharacterSheetWebRoutes.ts", import.meta.url);
const registerPath = new URL("../../src/backend/server/web/registerWebRoutes.ts", import.meta.url);
const modalPath = new URL("../../src/frontend/dm/entities/PlayerCharacterDetailModal.tsx", import.meta.url);
const wrapperPath = new URL("../../src/frontend/dm/entities/EntityDetailModal.js", import.meta.url);
const bridgePath = new URL("../../src/frontend/dm/entities/EntityDetailModalBridge.jsx", import.meta.url);

describe("player character sheet synchronization contract", () => {
  it("exposes one sheet endpoint backed by the same state used by the player portal", async () => {
    const source = await readFile(routePath, "utf8");
    expect(source).toContain('"/api/campaigns/:campaignId/characters/:entityId/sheet"');
    expect(source).toContain("playerPortalStates");
    expect(source).toContain("playerPortalResources");
    expect(source).toContain('type: "player.portal.updated"');
    expect(source).toContain('role !== "dm" && role !== "co_dm"');
  });

  it("registers the character sheet routes", async () => {
    const source = await readFile(registerPath, "utf8");
    expect(source).toContain("registerPlayerCharacterSheetWebRoutes");
  });

  it("shows playable characters with entity metadata and live player state", async () => {
    const [modal, wrapper, bridge] = await Promise.all([
      readFile(modalPath, "utf8"),
      readFile(wrapperPath, "utf8"),
      readFile(bridgePath, "utf8"),
    ]);
    expect(wrapper).toContain("EntityDetailModalBridge");
    expect(bridge).toContain('entityType !== "player_character"');
    expect(modal).toContain("sheet?.status");
    expect(modal).toContain("metadata.className");
    expect(modal).toContain("Sin jugador vinculado");
    expect(modal).toContain("La ficha todavía no tiene datos básicos");
  });

  it("persists a focal point and offers a complete image view", async () => {
    const bridge = await readFile(bridgePath, "utf8");
    expect(bridge).toContain("parseImageFocalPoint");
    expect(bridge).toContain("withImageFocalPoint");
    expect(bridge).toContain("--entity-detail-image-position");
    expect(bridge).toContain("EntityImageReframeDialog");
    expect(bridge).toContain("Ajustar encuadre");
    expect(bridge).toContain("Ver imagen completa");

    const imageDialogStyles = readFileSync(
      new URL(
        "../../src/frontend/shared/components/entityImageReframeDialog.css",
        import.meta.url,
      ),
      "utf8",
    );

    expect(imageDialogStyles).toContain(
      ".entity-image-lightbox__stage img",
    );
    expect(imageDialogStyles).toContain("object-fit: contain");
  });
});