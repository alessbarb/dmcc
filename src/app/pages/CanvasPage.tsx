import React, { useEffect, useState } from "react";
import { useCampaignStore } from "../stores/campaignStore.js";
import { ReactFlowProvider } from "reactflow";
import { CampaignCanvasFlow } from "../components/canvas/CampaignCanvasFlow.js";
import { CanvasPalette } from "../components/canvas/CanvasPalette.js";
import { CanvasInspector } from "../components/canvas/CanvasInspector.js";
import { Plus, Layout, Folder, Eye, EyeOff, Zap, Play, X, User, UserCheck, MapPin, Shield, HelpCircle, Key, Award, Film } from "lucide-react";
import type { InteractionMode } from "../components/canvas/CanvasToolbar.js";
import { EntityDetailModal } from "../components/EntityDetailModal.js";
import { useToast } from "../hooks/useToast.js";
import { useParams } from "@tanstack/react-router";

// Seeding logic for board templates
const seedCanvasTemplate = async (canvasId: string, template: string, _campaignId: string) => {
  const store = useCampaignStore.getState();
  const { createEntity, placeNodeOnCanvas, addEdgeToCanvas, updateCanvasNode } = store;
  
  if (template === "mystery") {
    const entitiesToCreate = [
      { entityType: "clue", title: "Incidente Inicial", summary: "El detonante de la investigación. ¿Qué ocurrió?" },
      { entityType: "npc", title: "Sospechoso Principal", subtitle: "Tiene una coartada dudosa", summary: "Un personaje clave en el misterio." },
      { entityType: "clue", title: "Pista Real", summary: "Una prueba irrefutable que apunta al sospechoso." },
      { entityType: "rumor", title: "Pista Falsa", summary: "Un rumor que intenta desviar la atención." },
      { entityType: "secret", title: "Secreto Central", summary: "El secreto que el sospechoso intenta ocultar a toda costa.", visibility: { kind: "dm_only" } },
      { entityType: "quest", title: "Revelación Final", summary: "La escena donde se confronta al culpable." },
      { entityType: "consequence", title: "Consecuencia Mayor", summary: "El impacto de resolver o fallar el misterio." }
    ];

    const createdIds: string[] = [];
    for (const ent of entitiesToCreate) {
      await createEntity({
        ...ent,
        status: "ready",
        importance: "normal",
        visibility: ent.visibility || { kind: "dm_only" }
      } as any);
      const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
      if (created) createdIds.push(created.entityId);
    }

    const coords = [
      { x: 100, y: 150 },
      { x: 300, y: 150 },
      { x: 500, y: 150 },
      { x: 300, y: 300 },
      { x: 500, y: 300 },
      { x: 700, y: 150 },
      { x: 700, y: 300 }
    ];

    for (let i = 0; i < createdIds.length; i++) {
      await placeNodeOnCanvas(canvasId, { kind: "entity", entityId: createdIds[i], x: coords[i].x, y: coords[i].y });
    }

    const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
    const placedNodes = updatedCanvas?.nodes || [];
    const findNodeIdByEntityId = (entId: string) => placedNodes.find((n: any) => n.entityId === entId)?.id;

    const connections = [
      { from: 0, to: 1, label: "apunta a" },
      { from: 0, to: 2, label: "revela" },
      { from: 1, to: 4, label: "oculta" },
      { from: 2, to: 4, label: "apunta a" },
      { from: 3, to: 1, label: "sospecha de" },
      { from: 4, to: 5, label: "desbloquea" },
      { from: 5, to: 6, label: "causa" }
    ];

    for (const conn of connections) {
      const sourceId = findNodeIdByEntityId(createdIds[conn.from]);
      const targetId = findNodeIdByEntityId(createdIds[conn.to]);
      if (sourceId && targetId) {
        await addEdgeToCanvas(canvasId, {
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          label: conn.label,
          status: "domain",
          visibility: "dm",
          style: "solid"
        });
      }
    }
  } else if (template === "faction") {
    const entities = [
      { entityType: "npc", title: "Líder de Facción", subtitle: "Dirige con mano de hierro" },
      { entityType: "npc", title: "Mano Derecha", subtitle: "Ejecuta los planes" },
      { entityType: "item", title: "Recurso Clave", summary: "Un artefacto o tesoro que les da poder." },
      { entityType: "secret", title: "Plan Oculto", summary: "Su objetivo secreto.", visibility: { kind: "dm_only" } },
      { entityType: "faction", title: "Facción Enemiga", subtitle: "Su gran rival" },
      { entityType: "quest", title: "Objetivo Principal", summary: "La misión para detenerlos o apoyarlos." }
    ];

    const createdIds: string[] = [];
    for (const ent of entities) {
      await createEntity({
        ...ent,
        status: "ready",
        importance: "normal",
        visibility: ent.visibility || { kind: "dm_only" }
      } as any);
      const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
      if (created) createdIds.push(created.entityId);
    }

    const coords = [
      { x: 300, y: 100 },
      { x: 300, y: 280 },
      { x: 100, y: 190 },
      { x: 500, y: 100 },
      { x: 100, y: 380 },
      { x: 500, y: 280 }
    ];

    await placeNodeOnCanvas(canvasId, { kind: "group", title: "Cuartel General", color: "purple", x: 80, y: 60, width: 320, height: 350 });

    const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
    const groupNode = updatedCanvas?.nodes?.find((n: any) => n.kind === "group" && n.title === "Cuartel General");
    if (groupNode) {
      await updateCanvasNode(canvasId, groupNode.id, { groupType: "faction" });
    }

    for (let i = 0; i < createdIds.length; i++) {
      const groupId = (i === 0 || i === 1) && groupNode ? groupNode.id : undefined;
      await placeNodeOnCanvas(canvasId, {
        kind: "entity",
        entityId: createdIds[i],
        x: coords[i].x,
        y: coords[i].y,
        groupId
      });
    }

    const placedNodes = useCampaignStore.getState().canvasesById[canvasId]?.nodes || [];
    const findNodeIdByEntityId = (entId: string) => placedNodes.find((n: any) => n.entityId === entId)?.id;

    const connections = [
      { from: 0, to: 1, label: "lidera" },
      { from: 0, to: 2, label: "custodia" },
      { from: 0, to: 3, label: "planea" },
      { from: 0, to: 4, label: "enemigo de" },
      { from: 3, to: 5, label: "desbloquea" }
    ];

    for (const conn of connections) {
      const sourceId = findNodeIdByEntityId(createdIds[conn.from]);
      const targetId = findNodeIdByEntityId(createdIds[conn.to]);
      if (sourceId && targetId) {
        await addEdgeToCanvas(canvasId, {
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          label: conn.label,
          status: "domain",
          visibility: "dm",
          style: "solid"
        });
      }
    }
  } else if (template === "city") {
    const entities = [
      { entityType: "location", title: "Plaza Mayor", subtitle: "Punto de encuentro público" },
      { entityType: "location", title: "Taberna Local", subtitle: "Rumores y contactos" },
      { entityType: "location", title: "Callejón Oscuro", subtitle: "Actividad criminal", visibility: { kind: "dm_only" } },
      { entityType: "npc", title: "Tabernero", subtitle: "Sabe todos los chismes" },
      { entityType: "faction", title: "Guardia de la Ciudad", subtitle: "Mantiene el orden" },
      { entityType: "rumor", title: "Rumor Callejero", summary: "Una pista sobre un robo inminente." }
    ];

    const createdIds: string[] = [];
    for (const ent of entities) {
      await createEntity({
        ...ent,
        status: "ready",
        importance: "normal",
        visibility: ent.visibility || { kind: "dm_only" }
      } as any);
      const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
      if (created) createdIds.push(created.entityId);
    }

    const coords = [
      { x: 150, y: 150 },
      { x: 400, y: 150 },
      { x: 650, y: 150 },
      { x: 400, y: 350 },
      { x: 150, y: 350 },
      { x: 650, y: 350 }
    ];

    await placeNodeOnCanvas(canvasId, { kind: "group", title: "Distrito Comercial", color: "green", x: 100, y: 100, width: 480, height: 420 });
    const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
    const groupNode = updatedCanvas?.nodes?.find((n: any) => n.kind === "group" && n.title === "Distrito Comercial");
    if (groupNode) {
      await updateCanvasNode(canvasId, groupNode.id, { groupType: "location" });
    }

    for (let i = 0; i < createdIds.length; i++) {
      const groupId = (i === 0 || i === 1 || i === 3) && groupNode ? groupNode.id : undefined;
      await placeNodeOnCanvas(canvasId, {
        kind: "entity",
        entityId: createdIds[i],
        x: coords[i].x,
        y: coords[i].y,
        groupId
      });
    }

    const placedNodes = useCampaignStore.getState().canvasesById[canvasId]?.nodes || [];
    const findNodeIdByEntityId = (entId: string) => placedNodes.find((n: any) => n.entityId === entId)?.id;

    const connections = [
      { from: 1, to: 3, label: "trabaja en" },
      { from: 4, to: 0, label: "patrulla" },
      { from: 3, to: 5, label: "conoce" },
      { from: 5, to: 2, label: "apunta a" }
    ];

    for (const conn of connections) {
      const sourceId = findNodeIdByEntityId(createdIds[conn.from]);
      const targetId = findNodeIdByEntityId(createdIds[conn.to]);
      if (sourceId && targetId) {
        await addEdgeToCanvas(canvasId, {
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          label: conn.label,
          status: "domain",
          visibility: "dm",
          style: "solid"
        });
      }
    }
  } else if (template === "session") {
    const entities = [
      { entityType: "scene", title: "Escena 1: Introducción", summary: "Los jugadores se reúnen y reciben el encargo." },
      { entityType: "scene", title: "Escena 2: Exploración", summary: "Investigan el lugar del incidente." },
      { entityType: "scene", title: "Escena 3: Combate", summary: "Encuentro con las criaturas." },
      { entityType: "scene", title: "Escena 4: Cierre", summary: "Resolución de la sesión." },
      { entityType: "consequence", title: "Consecuencia Inmediata", summary: "Qué cambia para la siguiente sesión." }
    ];

    const createdIds: string[] = [];
    for (const ent of entities) {
      await createEntity({
        ...ent,
        status: "ready",
        importance: "normal",
        visibility: { kind: "dm_only" }
      } as any);
      const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
      if (created) createdIds.push(created.entityId);
    }

    const coords = [
      { x: 100, y: 200 },
      { x: 300, y: 200 },
      { x: 500, y: 200 },
      { x: 700, y: 200 },
      { x: 900, y: 200 }
    ];

    for (let i = 0; i < createdIds.length; i++) {
      await placeNodeOnCanvas(canvasId, { kind: "entity", entityId: createdIds[i], x: coords[i].x, y: coords[i].y });
    }

    const placedNodes = useCampaignStore.getState().canvasesById[canvasId]?.nodes || [];
    const findNodeIdByEntityId = (entId: string) => placedNodes.find((n: any) => n.entityId === entId)?.id;

    for (let i = 0; i < createdIds.length - 1; i++) {
      const sourceId = findNodeIdByEntityId(createdIds[i]);
      const targetId = findNodeIdByEntityId(createdIds[i + 1]);
      if (sourceId && targetId) {
        await addEdgeToCanvas(canvasId, {
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          label: "siguiente",
          status: "domain",
          visibility: "dm",
          style: "solid"
        });
      }
    }
  } else if (template === "dungeon") {
    const entities = [
      { entityType: "location", title: "Entrada Inundada", subtitle: "Nivel 1 de la mazmorra" },
      { entityType: "encounter", title: "Sala de Trampa", summary: "Trampa de flechas oculta." },
      { entityType: "creature", title: "Guardias Orco", summary: "Dos orcos montando guardia." },
      { entityType: "item", title: "Cofre del Tesoro", summary: "Contiene oro y una gema brillante." },
      { entityType: "secret", title: "Pasadizo Secreto", summary: "Detrás del tapiz.", visibility: { kind: "dm_only" } },
      { entityType: "creature", title: "Jefe de la Mazmorra", subtitle: "El orco chamán" }
    ];

    const createdIds: string[] = [];
    for (const ent of entities) {
      await createEntity({
        ...ent,
        status: "ready",
        importance: "normal",
        visibility: ent.visibility || { kind: "dm_only" }
      } as any);
      const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
      if (created) createdIds.push(created.entityId);
    }

    const coords = [
      { x: 100, y: 150 },
      { x: 300, y: 150 },
      { x: 500, y: 150 },
      { x: 500, y: 320 },
      { x: 300, y: 320 },
      { x: 700, y: 150 }
    ];

    await placeNodeOnCanvas(canvasId, { kind: "group", title: "Ruinas Olvidadas", color: "blue", x: 80, y: 90, width: 720, height: 350 });
    const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
    const groupNode = updatedCanvas?.nodes?.find((n: any) => n.kind === "group" && n.title === "Ruinas Olvidadas");
    if (groupNode) {
      await updateCanvasNode(canvasId, groupNode.id, { groupType: "location" });
    }

    for (let i = 0; i < createdIds.length; i++) {
      const groupId = groupNode ? groupNode.id : undefined;
      await placeNodeOnCanvas(canvasId, {
        kind: "entity",
        entityId: createdIds[i],
        x: coords[i].x,
        y: coords[i].y,
        groupId
      });
    }

    const placedNodes = useCampaignStore.getState().canvasesById[canvasId]?.nodes || [];
    const findNodeIdByEntityId = (entId: string) => placedNodes.find((n: any) => n.entityId === entId)?.id;

    const connections = [
      { from: 0, to: 1, label: "conecta con" },
      { from: 1, to: 2, label: "conecta con" },
      { from: 2, to: 5, label: "custodia" },
      { from: 2, to: 3, label: "protege" },
      { from: 4, to: 3, label: "conduce a" }
    ];

    for (const conn of connections) {
      const sourceId = findNodeIdByEntityId(createdIds[conn.from]);
      const targetId = findNodeIdByEntityId(createdIds[conn.to]);
      if (sourceId && targetId) {
        await addEdgeToCanvas(canvasId, {
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          label: conn.label,
          status: "domain",
          visibility: "dm",
          style: "solid"
        });
      }
    }
  }
};

// Markdown structured text import parser
const parseAndImportText = async (text: string, canvasId: string, _campaignId: string) => {
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
      const groupNode = updatedCanvas?.nodes?.find((n: any) => n.kind === "group" && n.title === groupName && n.x === currentX && n.y === currentY);
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
          const existing = store.campaignState?.entities?.find((e: any) => e.title.toLowerCase() === nameStr.toLowerCase() && !e.archived);
          let entityId = existing?.entityId;
          
          if (!entityId) {
            await createEntity({
              entityType,
              title: nameStr,
              status: "ready",
              importance: "normal",
              visibility: { kind: entityType === "secret" ? "dm_only" : "public" }
            } as any);
            const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
            entityId = created?.entityId;
          }
          
          if (entityId) {
            entitiesCreated[nameStr] = entityId;
            await placeNodeOnCanvas(canvasId, { kind: "entity", entityId, x: currentX + 50, y: currentY + 50, groupId: currentGroupNodeId });
            
            const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
            const nodeObj = updatedCanvas?.nodes?.find((n: any) => n.entityId === entityId);
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

        const sourceNodeId = nodesCreated[sourceName] || useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: any) => {
          const ent = n.entityId ? store.campaignState?.entities?.find((e: any) => e.entityId === n.entityId) : null;
          return ent && ent.title.toLowerCase() === sourceName.toLowerCase();
        })?.id;

        const targetNodeId = nodesCreated[targetName] || useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: any) => {
          const ent = n.entityId ? store.campaignState?.entities?.find((e: any) => e.entityId === n.entityId) : null;
          return ent && ent.title.toLowerCase() === targetName.toLowerCase();
        })?.id;

        if (sourceNodeId && targetNodeId) {
          const sourceNode = useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: any) => n.id === sourceNodeId);
          const targetNode = useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: any) => n.id === targetNodeId);
          
          let relationshipId: string | undefined = undefined;
          if (sourceNode?.entityId && targetNode?.entityId) {
            try {
              relationshipId = await createRelation({
                sourceEntityId: sourceNode.entityId,
                targetEntityId: targetNode.entityId,
                relationType: finalLabel.replace(/\s+/g, "_"),
                visibility: { kind: "dm_only" }
              } as any);
            } catch (err) {
              console.error("Relation creation failed during text import", err);
            }
          }

          await addEdgeToCanvas(canvasId, {
            sourceNodeId,
            targetNodeId,
            label: finalLabel,
            status: relationshipId ? "domain" : "draft",
            relationshipId,
            visibility: "dm",
            style: "solid"
          });
        }
      }
    }
  }
};

// Narrative consistency check (Lint) auditor logic
const runNarrativeLint = (campaignState: any, activeCanvas: any) => {
  const issues: { id: string; type: "error" | "warning" | "info"; message: string; entityId?: string }[] = [];
  if (!campaignState || !activeCanvas) return issues;

  const entities = campaignState.entities.filter((e: any) => !e.archived);
  const relations = campaignState.relations.filter((r: any) => !r.archived);
  const canvasNodes = activeCanvas.nodes || [];
  const canvasEdges = activeCanvas.edges || [];

  // 1. Secretos sin pistas
  const secrets = entities.filter((e: any) => e.entityType === "secret");
  for (const secret of secrets) {
    const anchors = secret.metadata?.revelationAnchors || [];
    const hasAnchors = anchors.length > 0;
    const pointingClues = relations.filter(
      (r: any) => r.targetEntityId === secret.entityId &&
                  entities.find((e: any) => e.entityId === r.sourceEntityId)?.entityType === "clue"
    );
    const hasPointingClues = pointingClues.length > 0;
    
    if (!hasAnchors && !hasPointingClues) {
      issues.push({
        id: `secret-no-clues-${secret.entityId}`,
        type: "error",
        message: `El secreto 🔒 "${secret.title}" no tiene ninguna pista ni ancla asociada para ser revelado.`,
        entityId: secret.entityId
      });
    }
  }

  // 2. Pistas huérfanas
  const clues = entities.filter((e: any) => e.entityType === "clue");
  for (const clue of clues) {
    const isAnchor = secrets.some((s: any) => s.metadata?.revelationAnchors?.includes(clue.entityId));
    const hasOutgoing = relations.some((r: any) => r.sourceEntityId === clue.entityId);
    if (!isAnchor && !hasOutgoing) {
      issues.push({
        id: `clue-orphan-${clue.entityId}`,
        type: "warning",
        message: `La pista 🔎 "${clue.title}" está huérfana: no conduce a ningún secreto, misión o personaje.`,
        entityId: clue.entityId
      });
    }
  }

  // 3. NPCs importantes sin uso
  const importantNpcs = entities.filter(
    (e: any) => e.entityType === "npc" && (e.importance === "critical" || e.importance === "high")
  );
  for (const npc of importantNpcs) {
    const isConnected = relations.some(
      (r: any) => r.sourceEntityId === npc.entityId || r.targetEntityId === npc.entityId
    );
    if (!isConnected) {
      issues.push({
        id: `npc-unused-${npc.entityId}`,
        type: "warning",
        message: `El PNJ relevante 👤 "${npc.title}" no tiene conexiones con misiones o escenas.`,
        entityId: npc.entityId
      });
    }
  }

  // 4. Misiones sin cierre
  const quests = entities.filter((e: any) => e.entityType === "quest");
  for (const quest of quests) {
    const hasConnections = relations.some(
      (r: any) => r.sourceEntityId === quest.entityId || r.targetEntityId === quest.entityId
    );
    if (!hasConnections) {
      issues.push({
        id: `quest-no-end-${quest.entityId}`,
        type: "warning",
        message: `La misión ⚔️ "${quest.title}" no tiene conexiones de escena o consecuencias que la resuelvan.`,
        entityId: quest.entityId
      });
    }
  }

  // 5. Lugares vacíos
  const locationNodes = canvasNodes.filter((n: any) => n.kind === "entity" && entities.find((e: any) => e.entityId === n.entityId)?.entityType === "location");
  for (const locNode of locationNodes) {
    const locEntity = entities.find((e: any) => e.entityId === locNode.entityId);
    if (!locEntity) continue;
    const hasChildren = canvasNodes.some((n: any) => n.groupId === locNode.id);
    const hasEdges = canvasEdges.some((e: any) => e.sourceNodeId === locNode.id || e.targetNodeId === locNode.id);
    
    if (!hasChildren && !hasEdges) {
      issues.push({
        id: `location-empty-${locEntity.entityId}`,
        type: "info",
        message: `El lugar 🗺️ "${locEntity.title}" está vacío: no contiene personajes ni pistas en el canvas.`,
        entityId: locEntity.entityId
      });
    }
  }

  // 6. Relaciones privadas con fuga
  for (const rel of relations) {
    const source = entities.find((e: any) => e.entityId === rel.sourceEntityId);
    const target = entities.find((e: any) => e.entityId === rel.targetEntityId);
    if (source && target) {
      const relIsSecret = rel.visibility?.kind === "dm_only" || rel.visibility?.kind === "dm";
      const sourceIsPublic = source.visibility?.kind === "public";
      const targetIsPublic = target.visibility?.kind === "public";
      if (relIsSecret && sourceIsPublic && targetIsPublic) {
        issues.push({
          id: `relation-leak-${rel.relationId}`,
          type: "info",
          message: `La relación secreta entre "${source.title}" y "${target.title}" une dos entidades públicas.`,
        });
      }
    }
  }

  return issues;
};

export function CanvasPage() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId/canvas" });
  const {
    campaignState,
    canvasesById,
    activeCanvasId,
    createCanvas,
    setActiveCanvasId,
    updateEntity,
    archiveEntity,
    selectCampaign,
    activeCampaignId,
    loading,
    removeNodeFromCanvas,
    updateCanvasNodesLayout,
    startSession,
    recordSessionEvent,
  } = useCampaignStore();

  const { addToast } = useToast();

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      selectCampaign(campaignId);
    }
  }, [campaignId, activeCampaignId, selectCampaign]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardKind, setNewBoardKind] = useState<any>("world");
  
  const [detailEntityId, setDetailEntityId] = useState<string | null>(null);

  const [interactionMode, setInteractionMode] = useState<InteractionMode>("select");
  const [isLocked, setIsLocked] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [publicOnly, setPublicOnly] = useState(false);

  // Toggles for Phase 2 & Second Wave
  const [isDirectionMode, setIsDirectionMode] = useState(false);
  const [isPlayerView, setIsPlayerView] = useState(false);
  const [mysteryFlowMode, setMysteryFlowMode] = useState(false);
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState(false);
  const [newBoardTemplate, setNewBoardTemplate] = useState("custom");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [isLintOpen, setIsLintOpen] = useState(false);
  const [density, setDensity] = useState<"compact" | "normal" | "detailed">("normal");
  const [relationsFilter, setRelationsFilter] = useState<"all" | "public" | "secret" | "selection">("all");
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  // Multi-selection
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [, setSelectedEdges] = useState<any[]>([]);
  const [bulkGroupId, setBulkGroupId] = useState<string>("");

  // Session Prep Dialog
  const [isSessionPrepOpen, setIsSessionPrepOpen] = useState(false);

  const selectedEntityLocal = detailEntityId && campaignState ? campaignState.entities.find((e: any) => e.entityId === detailEntityId) : null;
  const canvases = Object.values(canvasesById || {}).filter(c => !c.archived);
  const activeCanvas = activeCanvasId ? canvasesById[activeCanvasId] : null;
  const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");

  // Auto-select first canvas if none selected
  useEffect(() => {
    if (!activeCanvasId && canvases.length > 0) {
      setActiveCanvasId(canvases[0].id);
    }
  }, [canvases, activeCanvasId]);

  // Seed pending template if campaign was newly created from landing page
  useEffect(() => {
    if (activeCanvasId && campaignId) {
      const pendingTemplate = sessionStorage.getItem("dmcc_pending_seed_template");
      if (pendingTemplate && pendingTemplate !== "custom" && pendingTemplate !== "empty") {
        sessionStorage.removeItem("dmcc_pending_seed_template");
        setTimeout(async () => {
          addToast(`Inicializando plantilla de campaña: ${pendingTemplate}...`, "info");
          await seedCanvasTemplate(activeCanvasId, pendingTemplate, campaignId);
          addToast(`Campaña inicializada con plantilla de ${pendingTemplate === "mystery" ? "Misterio" : "Facciones"}`, "success");
        }, 300);
      }
    }
  }, [activeCanvasId, campaignId, addToast]);

  // Fullscreen escape monitor
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreenPresentation(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Alert anchors or orphans
  useEffect(() => {
    if (!campaignState || canvases.length === 0) return;

    const allNodes = canvases.flatMap((c: any) => c.nodes || []);
    const allEdges = canvases.flatMap((c: any) => c.edges || []);

    const orphanEntities = campaignState.entities.filter(
      (e: any) => !e.archived && !allNodes.some((n: any) => n.entityId === e.entityId)
    );
    const orphanRelations = campaignState.relations.filter(
      (r: any) => !r.archived && !allEdges.some((e: any) => e.relationshipId === r.relationId)
    );

    if (orphanEntities.length === 0 && orphanRelations.length === 0) return;

    const parts: string[] = [];
    if (orphanEntities.length > 0)
      parts.push(`${orphanEntities.length} entidad${orphanEntities.length > 1 ? "es" : ""}`);
    if (orphanRelations.length > 0)
      parts.push(`${orphanRelations.length} relación${orphanRelations.length > 1 ? "es" : ""}`);

    addToast(
      `${parts.join(" y ")} del lore no están en ningún tablero visual.`,
      "warning"
    );
  }, [activeCampaignId]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    
    await createCanvas(newBoardTitle, newBoardKind);
    
    const createdCanvasId = useCampaignStore.getState().activeCanvasId;
    const campaignId = useCampaignStore.getState().activeCampaignId;
    
    if (createdCanvasId && campaignId && newBoardTemplate !== "custom") {
      addToast(`Inicializando plantilla: ${newBoardTemplate}...`, "info");
      await seedCanvasTemplate(createdCanvasId, newBoardTemplate, campaignId);
      addToast(`Tablero inicializado con plantilla "${newBoardTemplate}"`, "success");
    }

    setNewBoardTitle("");
    setNewBoardTemplate("custom");
    setIsCreateBoardOpen(false);
  };

  const handleExport = async (format: "svg" | "png", viewMode: "dm" | "player") => {
    const originalPlayerView = isPlayerView;
    const originalDirectionMode = isDirectionMode;
    const originalMysteryFlowMode = mysteryFlowMode;

    if (viewMode === "player") {
      setIsPlayerView(true);
      setIsDirectionMode(false);
      setMysteryFlowMode(false);
    }
    
    // Wait for state propagate & React Flow DOM updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    const svgElement = document.querySelector('.react-flow__renderer svg') || document.querySelector('.react-flow svg');
    if (!svgElement) {
      addToast("No se pudo encontrar el lienzo del canvas para exportar.", "error");
      setIsPlayerView(originalPlayerView);
      setIsDirectionMode(originalDirectionMode);
      setMysteryFlowMode(originalMysteryFlowMode);
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      if (format === "svg") {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeCanvas?.title || 'canvas'}-${viewMode}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        addToast(`Canvas (${viewMode.toUpperCase()}) exportado como SVG vectorial.`, "success");
      } else {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          const canvasObj = document.createElement('canvas');
          const bbox = svgElement.getBoundingClientRect();
          const scale = 2;
          
          canvasObj.width = bbox.width * scale;
          canvasObj.height = bbox.height * scale;
          
          const ctx = canvasObj.getContext('2d');
          if (ctx) {
            ctx.fillStyle = "hsl(230, 28%, 10%)";
            ctx.fillRect(0, 0, canvasObj.width, canvasObj.height);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            
            canvasObj.toBlob((pngBlob) => {
              if (pngBlob) {
                const pngUrl = URL.createObjectURL(pngBlob);
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = `${activeCanvas?.title || 'canvas'}-${viewMode}.png`;
                link.click();
                URL.revokeObjectURL(pngUrl);
                addToast(`Canvas (${viewMode.toUpperCase()}) exportado como imagen PNG.`, "success");
              }
              URL.revokeObjectURL(url);
            }, 'image/png');
          }
        };
        img.src = url;
      }
    } catch (err: any) {
      addToast(`Error al exportar canvas: ${err.message}`, "error");
    } finally {
      setIsPlayerView(originalPlayerView);
      setIsDirectionMode(originalDirectionMode);
      setMysteryFlowMode(originalMysteryFlowMode);
    }
  };

  if (loading && canvases.length === 0) {
    return <div className="canvas-loading">Cargando tableros de campaña…</div>;
  }

  const isViewLocked = isPlayerView || isLocked;
  const isPublicView = isPlayerView || publicOnly;

  return (
    <div className="canvas-page-container">
      {/* Top toolbar */}
      <div className="canvas-header-bar">
        <div className="canvas-selector-group">
          <Folder size={16} className="text-muted" />
          <span className="canvas-selector-label">Tablero:</span>
          <select
            value={activeCanvasId || ""}
            onChange={(e) => {
              setActiveCanvasId(e.target.value || null);
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
              setSelectedNodes([]);
              setSelectedEdges([]);
            }}
            className="canvas-select"
            disabled={isPlayerView}
          >
            {canvases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.kind === "world" ? "Mundo" : c.kind === "session" ? "Sesión" : c.kind === "mystery" ? "Conspiración" : c.kind === "location" ? "Ubicaciones" : c.kind === "characters" ? "Relaciones" : "Personalizado"})
              </option>
            ))}
          </select>

          {!isPlayerView && (
            <button
              onClick={() => setIsCreateBoardOpen(true)}
              className="btn btn-secondary btn-sm btn-icon"
              title="Crear nuevo tablero"
            >
              <Plus size={14} /> Nuevo tablero
            </button>
          )}
        </div>

        {/* View toggles & Filters */}
        <div className="canvas-header-filters" style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "16px", borderLeft: "1px solid var(--border-color)", paddingLeft: "16px", flex: 1, width: "100%" }}>
          {/* Grupo 1: Modos principales */}
          <div className="canvas-toolbar-group">
            {/* Live Direction Toggle */}
            {activeSession && (
              <button
                type="button"
                className={`btn btn-sm btn-icon ${isDirectionMode ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  setIsDirectionMode(v => !v);
                }}
                title={isDirectionMode ? "Desactivar modo dirección en vivo" : "Activar modo dirección en vivo para controlar la sesión"}
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
              >
                <Zap size={12} />
                <span>{isDirectionMode ? "⚡ Dirigiendo" : "Dirigir partida"}</span>
              </button>
            )}

            {/* Fullscreen Presentation View Toggle */}
            <button
              type="button"
              className={`btn btn-sm btn-icon ${isFullscreenPresentation ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                if (isFullscreenPresentation) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  }
                  setIsFullscreenPresentation(false);
                } else {
                  const elem = document.querySelector(".canvas-page-container");
                  if (elem?.requestFullscreen) {
                    elem.requestFullscreen();
                  }
                  setIsFullscreenPresentation(true);
                  setIsPlayerView(true);
                  setIsDirectionMode(false);
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                  setSelectedNodes([]);
                  setSelectedEdges([]);
                }
              }}
              title={isFullscreenPresentation ? "Salir de presentación" : "Presentar en pantalla completa (Vista Jugador segura)"}
              style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
            >
              <Play size={12} />
              <span>{isFullscreenPresentation ? "Detener" : "Presentar"}</span>
            </button>
          </div>

          <div className="canvas-toolbar-divider" />

          {/* Grupo 2: Configuración de Vista */}
          <div className="canvas-toolbar-group">
            {/* Player/DM View Toggle (Only if not in Fullscreen) */}
            {!isFullscreenPresentation && (
              <button
                type="button"
                className={`btn btn-sm btn-icon ${isPlayerView ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  const nextView = !isPlayerView;
                  setIsPlayerView(nextView);
                  if (nextView) {
                    setIsDirectionMode(false);
                    setSelectedNodeId(null);
                    setSelectedEdgeId(null);
                    setSelectedNodes([]);
                    setSelectedEdges([]);
                  }
                }}
                title={isPlayerView ? "Volver a vista de DM" : "Activar vista de jugadores (Modo presentación)"}
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
              >
                {isPlayerView ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{isPlayerView ? "👁 Vista Jugadores" : "👁 Vista DM"}</span>
              </button>
            )}

            {/* Public / Private toggle (Only if not in Player View) */}
            {!isPlayerView && (
              <button
                type="button"
                className={`btn btn-sm btn-icon ${publicOnly ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setPublicOnly(v => !v)}
                title={publicOnly ? "Mostrando solo información pública" : "Mostrando todo (público y secretos)"}
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
              >
                {publicOnly ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{publicOnly ? "Solo público" : "Mostrar secretos"}</span>
              </button>
            )}

            {/* Mystery Flow Toggle */}
            {!isPlayerView && (
              <button
                type="button"
                className={`btn btn-sm btn-icon ${mysteryFlowMode ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setMysteryFlowMode(v => !v)}
                title={mysteryFlowMode ? "Desactivar Mystery Flow" : "Activar Mystery Flow para ver conexiones de investigación"}
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
              >
                <span>{mysteryFlowMode ? "🔍 Mystery Flow" : "Ver Misterio"}</span>
              </button>
            )}
          </div>

          <div className="canvas-toolbar-divider" />

          {/* Grupo 3: Filtros, Densidad y Relaciones */}
          <div className="canvas-toolbar-group">
            {/* Densidad Selector */}
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as any)}
              className="canvas-select"
              style={{ fontSize: "11px", padding: "2px 6px", height: "26px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)" }}
            >
              <option value="compact">🗜️ Densidad: Compacta</option>
              <option value="normal">📱 Densidad: Normal</option>
              <option value="detailed">📋 Densidad: Detallada</option>
            </select>

            {/* Relaciones Filter */}
            {!isPlayerView && (
              <select
                value={relationsFilter}
                onChange={(e) => setRelationsFilter(e.target.value as any)}
                className="canvas-select"
                style={{ fontSize: "11px", padding: "2px 6px", height: "26px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)" }}
                title="Filtrar las líneas de conexión"
              >
                <option value="all">🔗 Relaciones: Todas</option>
                <option value="public">🌐 Relaciones: Públicas</option>
                <option value="secret">🔴 Relaciones: Secretas</option>
                <option value="selection">🎯 Relaciones: Selección</option>
              </select>
            )}

            {/* Type Filter Select */}
            {!isPlayerView && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="canvas-select"
                style={{ fontSize: "11px", padding: "2px 6px", height: "26px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)" }}
              >
                <option value="all">Todos los tipos</option>
                <option value="npc">PNJs</option>
                <option value="location">Lugares</option>
                <option value="quest">Misiones</option>
                <option value="clue">Pistas</option>
                <option value="secret">Secretos</option>
                <option value="scene">Escenas</option>
                <option value="other">Otros</option>
              </select>
            )}
          </div>

          <div className="canvas-toolbar-divider" />

          {/* Grupo 4: Acciones Dropdown */}
          <div className="canvas-toolbar-group" style={{ position: "relative" }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary btn-icon"
              onClick={() => setIsActionsDropdownOpen(v => !v)}
              title="Acciones y exportaciones de Canvas"
              style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
            >
              <span>⚙️ Acciones ▼</span>
            </button>
            {isActionsDropdownOpen && (
              <div className="dropdown-menu" style={{ position: "absolute", top: "30px", right: 0, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", zIndex: 1000, minWidth: "180px", boxShadow: "var(--shadow-lg)", padding: "4px" }}>
                {!isPlayerView && (
                  <>
                    <button className="dropdown-item" onClick={() => { setIsImportOpen(true); setIsActionsDropdownOpen(false); }}>✏️ Importar por Texto</button>
                    <button className="dropdown-item" onClick={() => { setIsLintOpen(v => !v); setIsActionsDropdownOpen(false); }}>🧠 Analizar Lore (Lint)</button>
                    <button className="dropdown-item" onClick={() => { setIsLegendOpen(true); setIsActionsDropdownOpen(false); }}>📖 Ver Leyenda</button>
                    <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "4px 0" }} />
                  </>
                )}
                <div style={{ fontSize: "9px", padding: "4px 12px", color: "var(--text-muted)", fontWeight: "bold" }}>EXPORTACIONES</div>
                <button className="dropdown-item" onClick={() => { handleExport("svg", "dm"); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista DM</button>
                <button className="dropdown-item" onClick={() => { handleExport("svg", "player"); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista Jugador</button>
                <button className="dropdown-item" onClick={() => { handleExport("png", "dm"); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista DM</button>
                <button className="dropdown-item" onClick={() => { handleExport("png", "player"); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista Jugador</button>
              </div>
            )}
          </div>
        </div>

        {activeCanvas && (
          <div className="canvas-board-info" style={{ marginLeft: "auto" }}>
            <span
              className="badge badge-primary"
              title={activeCanvas.description || undefined}
              style={{ cursor: activeCanvas.description ? "help" : undefined }}
            >
              {activeCanvas.kind}
            </span>
          </div>
        )}
      </div>

      {/* Create Board Modal Overlay */}
      {isCreateBoardOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateBoardOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2>Crear nuevo tablero visual</h2>
              <button onClick={() => setIsCreateBoardOpen(false)} className="modal-close-btn"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label>Nombre del tablero</label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Ej. Bosque Sombrío, Conspiración del Culto..."
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Tablero</label>
                  <select
                    value={newBoardKind}
                    onChange={(e) => setNewBoardKind(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="world">Mapa del Mundo / Estructura General</option>
                    <option value="session">Preparación de Sesión (Escenas, encuentros)</option>
                    <option value="mystery">Mapa de Conspiración (Pistas, sospechosos)</option>
                    <option value="location">Ubicación / Mazmorra (Salas, trampas)</option>
                    <option value="characters">Personajes (Relaciones sociales, familias)</option>
                    <option value="custom">Tablero en blanco personalizado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Plantilla de inicio</label>
                  <select
                    value={newBoardTemplate}
                    onChange={(e) => setNewBoardTemplate(e.target.value)}
                    className="form-select"
                  >
                    <option value="custom">Ninguna (Tablero en blanco)</option>
                    <option value="mystery">🕵️ Misterio (Pistas, sospechosos y secretos)</option>
                    <option value="faction">🛡️ Facción (Líder, agentes y recursos)</option>
                    <option value="city">🏙️ Ciudad (Barrios, PNJ y rumores)</option>
                    <option value="session">🎬 Sesión (Línea de escenas secuenciales)</option>
                    <option value="dungeon">🏰 Mazmorra (Entrada, salas y monstruos)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateBoardOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Text Modal Overlay */}
      {isImportOpen && (
        <div className="modal-overlay" onClick={() => setIsImportOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>✏️ Importación rápida por texto</h2>
              <button onClick={() => setIsImportOpen(false)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                Escribe o pega texto estructurado. Usa <code># Grupo</code> para agrupar, <code>[Tipo] Nombre</code> para declarar entidades y <code>Origen -&gt; Relación -&gt; Destino</code> para enlazarlas.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`# Conspiración del Culto\n[NPC] Veradis el Inquisidor\n[Lugar] Sala del Oráculo\n[Pista] Profecía Rota\n[Secreto] El Oráculo es un Fraude\n\nVeradis el Inquisidor -> controla -> Sala del Oráculo\nProfecía Rota -> revela -> El Oráculo es un Fraude`}
                rows={10}
                className="form-textarea"
                style={{ fontFamily: "monospace", fontSize: "0.82rem", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)", padding: "10px" }}
              />
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Tipos de entidad: NPC (pnj), PC (pj), Lugar, Faccion, Pista, Secreto, Mision, Objeto, Criatura, Escena, Consecuencia, Rumor, Nota.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsImportOpen(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  if (!importText.trim()) return;
                  addToast("Importando elementos y relaciones...", "info");
                  try {
                    await parseAndImportText(importText, activeCanvas.id, activeCampaignId!);
                    addToast("Importación completada con éxito.", "success");
                    setIsImportOpen(false);
                    setImportText("");
                  } catch (err: any) {
                    addToast(`Error al importar: ${err.message}`, "error");
                  }
                }}
              >
                Importar al lienzo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend Modal Overlay */}
      {isLegendOpen && (
        <div className="modal-overlay" onClick={() => setIsLegendOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "320px" }}>
            <div className="modal-header">
              <h2>📖 Leyenda del Canvas</h2>
              <button onClick={() => setIsLegendOpen(false)} className="modal-close-btn" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", color: "var(--primary)" }}>VISIBILIDAD</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>🔒</span>
                <div><strong>Secreto DM</strong>: Visible solo para el DM.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>🕯</span>
                <div><strong>Parcial</strong>: Revelado parcialmente.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>👁</span>
                <div><strong>Revelado</strong>: Visible públicamente para jugadores.</div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", marginTop: "8px", color: "var(--primary)" }}>ENTIDADES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><UserCheck size={12} color="#3b82f6" /> <span>🎭 PNJ</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={12} color="#6366f1" /> <span>👤 PJ</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={12} color="#10b981" /> <span>📍 Lugar</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Shield size={12} color="#f59e0b" /> <span>🏛 Facción</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><HelpCircle size={12} color="#eab308" /> <span>🧩 Pista</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Key size={12} color="#ef4444" /> <span>🔑 Secreto</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Award size={12} color="#f97316" /> <span>🏆 Misión</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Film size={12} color="#64748b" /> <span>🎬 Escena</span></div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", marginTop: "8px", color: "var(--primary)" }}>RELACIONES</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <div style={{ width: "24px", height: "2px", backgroundColor: "#ef4444", borderStyle: "dashed" }} />
                <div><strong>Línea Roja Punteada</strong>: Secreto DM.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <div style={{ width: "24px", height: "2px", backgroundColor: "rgba(167, 139, 250, 0.6)", borderStyle: "dashed" }} />
                <div><strong>Línea Violeta Punteada</strong>: Ancla de secreto.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Exit Presentation Mode Button */}
      {isFullscreenPresentation && (
        <button
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            }
            setIsFullscreenPresentation(false);
          }}
          className="btn btn-primary"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 99999,
            boxShadow: "var(--shadow-lg)",
            fontSize: "12px",
            padding: "8px 12px",
            opacity: 0.8
          }}
        >
          ❌ Salir de Presentación
        </button>
      )}

      {/* Main workspace */}
      {activeCanvas ? (
        <div className="canvas-layout">
          {!isPlayerView && <CanvasPalette canvasId={activeCanvas.id} isDirectionMode={isDirectionMode} selectedNodeId={selectedNodeId} />}
          
          <div className="canvas-work-area">
            <ReactFlowProvider>
              <CampaignCanvasFlow
                canvasId={activeCanvas.id}
                canvas={activeCanvas}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onSelectNode={(nodeId) => {
                  if (isPlayerView) return;
                  setSelectedNodeId(nodeId);
                  setSelectedEdgeId(null);
                }}
                onSelectEdge={(edgeId) => {
                  if (isPlayerView) return;
                  setSelectedEdgeId(edgeId);
                  setSelectedNodeId(null);
                }}
                onClearSelection={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                }}
                interactionMode={interactionMode}
                isLocked={isViewLocked}
                showMinimap={showMinimap}
                onModeChange={setInteractionMode}
                onLockChange={setIsLocked}
                onMinimapToggle={() => setShowMinimap(v => !v)}
                typeFilter={typeFilter}
                publicOnly={isPublicView}
                onSelectionChange={(nodes, edges) => {
                  if (isPlayerView) return;
                  setSelectedNodes(nodes);
                  setSelectedEdges(edges);
                }}
                isDirectionMode={isDirectionMode}
                isPlayerView={isPlayerView}
                mysteryFlowMode={mysteryFlowMode}
                density={density}
                relationsFilter={relationsFilter}
              />
            </ReactFlowProvider>
          </div>

          {!isPlayerView && (selectedNodeId || selectedEdgeId) && (
            <CanvasInspector
              canvasId={activeCanvas.id}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onClose={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              onOpenDetail={(entityId) => {
                setDetailEntityId(entityId);
              }}
              addToast={addToast}
            />
          )}

          {/* Narrative Lint Drawer Panel */}
          {!isPlayerView && isLintOpen && (
            <div className="canvas-inspector canvas-lint-drawer">
              <div className="inspector-header">
                <h2>🧠 Consistencia Narrativa</h2>
                <button onClick={() => setIsLintOpen(false)} className="inspector-close-btn">
                  <X size={16} />
                </button>
              </div>
              <div className="inspector-content">
                {(() => {
                  const issues = runNarrativeLint(campaignState, activeCanvas);
                  if (issues.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        <span style={{ fontSize: "2rem" }}>✨</span>
                        <p style={{ marginTop: "10px", color: "var(--success)", fontWeight: "600" }}>¡Todo perfecto!</p>
                        <p style={{ fontSize: "0.85rem" }}>No se han detectado problemas de consistencia narrativa en tu canvas.</p>
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Se han encontrado <strong>{issues.length}</strong> detalles a revisar:
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
                        {issues.map((iss) => (
                          <div
                            key={iss.id}
                            style={{
                              padding: "10px",
                              borderRadius: "var(--radius-sm)",
                              borderLeft: `3px solid ${iss.type === "error" ? "var(--color-critical)" : iss.type === "warning" ? "var(--color-warning)" : "var(--primary)"}`,
                              backgroundColor: "var(--bg-input)",
                              fontSize: "0.82rem",
                              lineHeight: "1.4"
                            }}
                          >
                            <div style={{ fontWeight: "600", marginBottom: "4px", color: iss.type === "error" ? "var(--color-critical)" : iss.type === "warning" ? "var(--color-warning)" : "var(--text-main)" }}>
                              {iss.type === "error" ? "🚨 Crítico" : iss.type === "warning" ? "⚠️ Advertencia" : "💡 Sugerencia"}
                            </div>
                            <div>{iss.message}</div>
                            {iss.entityId && (
                              <button
                                onClick={() => {
                                  setSelectedNodeId(activeCanvas.nodes.find((n: any) => n.entityId === iss.entityId)?.id || null);
                                  setSelectedEdgeId(null);
                                }}
                                className="btn btn-link btn-xs"
                                style={{ padding: 0, marginTop: "6px", fontSize: "10px", color: "var(--primary)", border: "none", background: "transparent", cursor: "pointer" }}
                              >
                                Inspeccionar elemento
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Floating bulk actions bar */}
          {!isPlayerView && selectedNodes.length >= 2 && (
            <div className="canvas-multiselect-bar">
              <span className="canvas-multiselect-text">
                <strong>{selectedNodes.length}</strong> elementos seleccionados
              </span>
              <div className="canvas-multiselect-actions">
                {/* Assign group to all selected nodes */}
                {(() => {
                  const groups = activeCanvas?.nodes?.filter((n: any) => n.kind === "group") ?? [];
                  if (groups.length === 0) return null;
                  return (
                    <select
                      className="form-select"
                      style={{ fontSize: "12px", padding: "3px 6px", height: "28px" }}
                      value={bulkGroupId}
                      onChange={async (e) => {
                        const gid = (e.target.value && e.target.value !== "__none__") ? e.target.value : null;
                        setBulkGroupId(e.target.value);
                        const updates = selectedNodes.map((n: any) => ({
                          nodeId: n.id,
                          x: Math.round(n.position?.x ?? 0),
                          y: Math.round(n.position?.y ?? 0),
                          groupId: gid,
                          parentId: null,
                        }));
                        await updateCanvasNodesLayout(activeCanvas.id, updates);
                        addToast(`${selectedNodes.length} nodos asignados al grupo.`, "success");
                        setBulkGroupId("");
                      }}
                    >
                      <option value="">📁 Asignar grupo...</option>
                      <option value="__none__">Sin grupo</option>
                      {groups.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.title || "Grupo"}</option>
                      ))}
                    </select>
                  );
                })()}
                <button
                  onClick={() => setIsSessionPrepOpen(true)}
                  className="btn btn-primary btn-sm"
                  title="Preparar sesión con los elementos seleccionados"
                >
                  🚀 Preparar Sesión
                </button>
                <button
                  onClick={async () => {
                    const entities = selectedNodes.filter(n => n.type === 'entity');
                    if (entities.length === 0) return;
                    if (window.confirm(`¿Revelar a los jugadores las ${entities.length} entidades seleccionadas?`)) {
                      for (const node of entities) {
                        if (node.data.entityId) {
                          await updateEntity(node.data.entityId, { visibility: { kind: 'public' } });
                        }
                      }
                      addToast(`Se han revelado ${entities.length} entidades.`, "success");
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  disabled={selectedNodes.filter(n => n.type === 'entity').length === 0}
                >
                  👁 Revelar
                </button>
                <button
                  onClick={async () => {
                    const entities = selectedNodes.filter(n => n.type === 'entity');
                    if (entities.length === 0) return;
                    if (window.confirm(`¿Hacer secretas (solo DM) las ${entities.length} entidades seleccionadas?`)) {
                      for (const node of entities) {
                        if (node.data.entityId) {
                          await updateEntity(node.data.entityId, { visibility: { kind: 'dm_only' } });
                        }
                      }
                      addToast(`Se han marcado como secretas ${entities.length} entidades.`, "success");
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  disabled={selectedNodes.filter(n => n.type === 'entity').length === 0}
                >
                  🔒 Hacer Secreto
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm(`¿Quitar los ${selectedNodes.length} nodos seleccionados de este canvas? (Las entidades seguirán existiendo)`)) {
                      for (const node of selectedNodes) {
                        await removeNodeFromCanvas(activeCanvas.id, node.id);
                      }
                      setSelectedNodes([]);
                      setSelectedEdges([]);
                      addToast(`Se han quitado ${selectedNodes.length} nodos del canvas.`, "info");
                    }
                  }}
                  className="btn btn-secondary btn-sm text-warning"
                >
                  🗑 Quitar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="canvas-empty-state">
          <Layout size={48} className="text-muted" />
          <h2>No hay tableros en esta campaña</h2>
          <p>Crea tu primer canvas visual para empezar a estructurar la aventura.</p>
          <button className="btn btn-primary" onClick={() => setIsCreateBoardOpen(true)}>
            <Plus size={16} /> Crear tablero
          </button>
        </div>
      )}

      {/* Session Prep Dialog Overlay */}
      {isSessionPrepOpen && (
        <div className="modal-overlay" onClick={() => setIsSessionPrepOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2>🚀 Preparar Sesión desde Selección</h2>
              <button onClick={() => setIsSessionPrepOpen(false)} className="modal-close-btn"><X size={16} /></button>
            </div>
            {(() => {
              const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");
              const entNames = selectedNodes.map(n => n.data.title || n.data.text || "Elemento").filter(Boolean);
              
              return (
                <SessionPrepForm
                  activeSession={activeSession}
                  selectedCount={selectedNodes.length}
                  elementNames={entNames}
                  onSubmit={async (sessionTitle, targetMode) => {
                    const entIds = selectedNodes.filter(n => n.type === "entity").map(n => n.data.entityId);
                    
                    if (targetMode === "new") {
                      await startSession(sessionTitle);
                      const updatedStore = useCampaignStore.getState();
                      const newSession = updatedStore.campaignState?.sessions?.find((s: any) => s.status === "active");
                      if (newSession) {
                        await recordSessionEvent(newSession.sessionId, {
                          type: "scene_started",
                          title: `Preparación de Sesión`,
                          description: `Elementos preparados desde el Canvas: ${entNames.join(", ")}`,
                          relatedEntityIds: entIds,
                        });
                        addToast(`Sesión "${sessionTitle}" iniciada con la preparación del canvas.`, "success");
                      }
                    } else if (activeSession) {
                      await recordSessionEvent(activeSession.sessionId, {
                        type: "scene_started",
                        title: `Elementos cargados desde Canvas`,
                        description: `Elementos incorporados a la partida: ${entNames.join(", ")}`,
                        relatedEntityIds: entIds,
                      });
                      addToast("Elementos agregados a la sesión activa.", "success");
                    }
                    setIsSessionPrepOpen(false);
                    setSelectedNodes([]);
                    setSelectedEdges([]);
                  }}
                  onCancel={() => setIsSessionPrepOpen(false)}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Full details modal for entities */}
      {selectedEntityLocal && campaignState && (
        <EntityDetailModal
          selectedEntity={selectedEntityLocal}
          campaignState={campaignState}
          onClose={() => {
            setDetailEntityId(null);
          }}
          onEdit={async (entityId, updates) => {
            await updateEntity(entityId, updates);
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setDetailEntityId(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await updateEntity(entityId, { visibility });
          }}
          addToast={addToast}
        />
      )}
    </div>
  );
}

function SessionPrepForm({
  activeSession,
  selectedCount,
  elementNames,
  onSubmit,
  onCancel
}: {
  activeSession: any;
  selectedCount: number;
  elementNames: string[];
  onSubmit: (title: string, mode: "new" | "active") => Promise<void>;
  onCancel: () => void;
}) {
  const [sessionTitle, setSessionTitle] = useState(`Sesión`);
  const [targetMode, setTargetMode] = useState<"new" | "active">(activeSession ? "active" : "new");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(sessionTitle, targetMode);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dialog-form">
      <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p style={{ fontSize: "0.93rem" }}>
          Vas a preparar una sesión utilizando <strong>{selectedCount}</strong> elementos seleccionados:
        </p>
        <div style={{ maxHeight: "100px", overflowY: "auto", padding: "8px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
          {elementNames.join(", ")}
        </div>

        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
          {activeSession && (
            <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
              <input
                type="radio"
                name="sessionPrepMode"
                checked={targetMode === "active"}
                onChange={() => setTargetMode("active")}
                style={{ marginTop: "3px" }}
              />
              <div>
                <strong>Añadir a la sesión activa actual ({activeSession.title})</strong>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Registra un evento de preparación en la sesión en curso vinculando estas entidades.
                </div>
              </div>
            </label>
          )}

          <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
            <input
              type="radio"
              name="sessionPrepMode"
              checked={targetMode === "new"}
              onChange={() => setTargetMode("new")}
              style={{ marginTop: "3px" }}
            />
            <div>
              <strong>Iniciar nueva sesión con estos elementos</strong>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Inicia una nueva sesión y registra un evento de inicio con estas entidades preparadas.
              </div>
            </div>
          </label>
        </div>

        {targetMode === "new" && (
          <div className="form-group">
            <label>Título de la nueva sesión</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="form-input"
              required
              placeholder="Ej. Sesión 4: El reencuentro"
            />
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Procesando..." : targetMode === "new" ? "Iniciar y Preparar" : "Cargar en Sesión"}
        </button>
      </div>
    </form>
  );
}
