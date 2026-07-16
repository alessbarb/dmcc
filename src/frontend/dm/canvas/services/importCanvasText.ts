import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { connectCanvasNodes } from "./connectCanvasNodes.js";
import type { CanvasNode } from "@core/domain/canvas/types.js";
import type { Entity } from "../../../shared/stores/campaignStore.js";

export const parseAndImportText = async (text: string, canvasId: string, _campaignId: string) => {
  const store = useCampaignStore.getState();
  const { createEntity, placeNodeOnCanvas, addEdgeToCanvas, createRelation } = store;
  
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const entitiesCreated: Record<string, string> = {};
  const nodesCreated: Record<string, string> = {};
  
  let currentGroupNodeId: string | undefined = undefined;
  let currentX = 100;
  let currentY = 150;
  
  for (const line of lines) {
    if (line.startsWith("#")) {
      const groupName = line.slice(1).trim();
      await placeNodeOnCanvas(canvasId, { kind: "group", title: groupName, color: "purple", x: currentX, y: currentY, width: 340, height: 240 });
      
      const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
      const groupNode = updatedCanvas?.nodes?.find((n: CanvasNode) => n.kind === "group" && n.title === groupName && n.x === currentX && n.y === currentY);
      currentGroupNodeId = groupNode?.id;
      
      currentX += 380;
      if (currentX > 1000) {
        currentX = 100;
        currentY += 280;
      }
    } else if (line.startsWith("[")) {
      const match = line.match(/^\[([^\]]+)\]\s*(.+)$/);
      if (match) {
        const typeStr = match[1].trim().toLowerCase();
        const nameStr = match[2].trim();
        
        const typeMapping: Record<string, string> = {
          pc: "player_character",
          pj: "player_character",
          npc: "npc",
          pnj: "npc",
          lugar: "location",
          location: "location",
          faction: "faction",
          faccion: "faction",
          quest: "quest",
          mision: "quest",
          clue: "clue",
          pista: "clue",
          secret: "secret",
          secreto: "secret",
          item: "item",
          objeto: "item",
          creature: "creature",
          criatura: "creature",
          scene: "scene",
          escena: "scene",
          consequence: "consequence",
          consecuencia: "consequence",
          rumor: "rumor",
        };
        
        const entityType = typeMapping[typeStr] || "note";
        
        if (entityType === "note") {
          await placeNodeOnCanvas(canvasId, { kind: "note", text: nameStr, color: "yellow", x: currentX + 50, y: currentY + 50, groupId: currentGroupNodeId });
          const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
          const noteNode = updatedCanvas?.nodes?.slice(-1)[0];
          if (noteNode) {
            nodesCreated[nameStr] = noteNode.id;
          }
        } else {
          const existing = store.campaignState?.entities?.find((e: Entity) => e.title.toLowerCase() === nameStr.toLowerCase() && !e.archived);
          let entityId = existing?.entityId;
          
          if (!entityId) {
            await createEntity({
              entityType,
              title: nameStr,
              status: "ready",
              importance: "normal",
              visibility: { kind: entityType === "secret" ? "dm_only" : "public" },
            });
            const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
            entityId = created?.entityId;
          }
          
          if (entityId) {
            entitiesCreated[nameStr] = entityId;
            await placeNodeOnCanvas(canvasId, { kind: "entity", entityId, x: currentX + 50, y: currentY + 50, groupId: currentGroupNodeId });
            
            const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
            const nodeObj = updatedCanvas?.nodes?.find((n: CanvasNode) => n.entityId === entityId);
            if (nodeObj) {
              nodesCreated[nameStr] = nodeObj.id;
            }
          }
        }
        
        currentY += 85;
        if (currentY > 600) {
          currentY = 150;
          currentX += 220;
        }
      }
    }
  }

  for (const line of lines) {
    if (line.includes("->")) {
      const parts = line.split("->").map(p => p.trim());
      if (parts.length >= 2) {
        const sourceName = parts[0];
        const relationLabel = parts[1];
        const targetName = parts[2] || parts[1];
        const finalLabel = parts[2] ? relationLabel : "relacionado con";

        const sourceNodeId = nodesCreated[sourceName] || useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => {
          const ent = n.entityId ? store.campaignState?.entities?.find((e: Entity) => e.entityId === n.entityId) : null;
          return ent && ent.title.toLowerCase() === sourceName.toLowerCase();
        })?.id;

        const targetNodeId = nodesCreated[targetName] || useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => {
          const ent = n.entityId ? store.campaignState?.entities?.find((e: Entity) => e.entityId === n.entityId) : null;
          return ent && ent.title.toLowerCase() === targetName.toLowerCase();
        })?.id;

        if (sourceNodeId && targetNodeId) {
          const sourceNode = useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => n.id === sourceNodeId);
          const targetNode = useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => n.id === targetNodeId);
          
          if (sourceNode?.entityId && targetNode?.entityId) {
            try {
              await connectCanvasNodes({
                canvasId,
                sourceNode: { id: sourceNodeId, entityId: sourceNode.entityId },
                targetNode: { id: targetNodeId, entityId: targetNode.entityId },
                edge: {
                  label: finalLabel,
                  status: "domain",
                  visibility: "dm",
                  style: "solid"
                },
                relation: {
                  relationType: finalLabel.replace(/\s+/g, "_"),
                  visibility: { kind: "dm_only" }
                },
                createRelation,
                addEdgeToCanvas,
              });
            } catch (err) {
              console.error("Relation creation failed during text import", err);
            }
          } else {
            await addEdgeToCanvas(canvasId, {
              sourceNodeId,
              targetNodeId,
              label: finalLabel,
              status: "draft",
              visibility: "dm",
              style: "solid"
            });
          }
        }
      }
    }
  }
};
