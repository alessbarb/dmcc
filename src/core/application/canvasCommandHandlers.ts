import { createId } from "@shared/ids.js";
import type { CanvasNode } from "../domain/canvas/types.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";

type CanvasCommandType =
  | "CreateCanvas"
  | "UpdateCanvas"
  | "ArchiveCanvas"
  | "PlaceNodeOnCanvas"
  | "UpdateCanvasNode"
  | "UpdateCanvasNodesLayout"
  | "RemoveNodeFromCanvas"
  | "AddEdgeToCanvas"
  | "UpdateCanvasEdge"
  | "RemoveEdgeFromCanvas";

type CanvasCommand = Extract<Command, { type: CanvasCommandType }>;

function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
}

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  return {
    eventId: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    campaignId,
    type,
    actorId,
    occurredAt: new Date().toISOString(),
    payload,
  } as StoredEvent<TPayload>;
}

export function handleCanvasCommand(state: CampaignState, command: CanvasCommand): CommandResult {
  switch (command.type) {
case "CreateCanvas": {
  const canvasId = command.canvasId ?? createId("cvs");
  const templateNodes = command.template ? createCanvasTemplateNodes(command.campaignId, canvasId, command.kind) : [];
  const canvas = {
    id: canvasId,
    campaignId: command.campaignId,
    title: command.title,
    kind: command.kind,
    description: command.description,
    nodes: templateNodes,
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const canvases = new Map(state.canvases || new Map());
  canvases.set(canvasId, canvas);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasCreated", canvas));
}
case "UpdateCanvas": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot update archived canvas");
  const updated = {
    ...canvas,
    ...(command.title !== undefined && { title: command.title }),
    ...(command.description !== undefined && { description: command.description }),
    ...(command.viewport !== undefined && { viewport: command.viewport }),
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updated);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasUpdated", {
      canvasId: command.canvasId,
      title: command.title,
      viewport: command.viewport,
      description: command.description,
    }));
}
case "ArchiveCanvas": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Canvas is already archived");
  const updated = {
    ...canvas,
    archived: true,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updated);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasArchived", {
      canvasId: command.canvasId,
    }));
}
case "PlaceNodeOnCanvas": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot place node on archived canvas");
  
  const node = command.node;
  const nodeId = node.id ?? createId("cvn");
  
  if (node.kind === "entity") {
    if (!node.entityId) throw new Error("Entity node must specify entityId");
    const entity = state.entities.get(node.entityId);
    if (!entity || entity.archived) {
      throw new Error(`Entity not found or archived: ${node.entityId}`);
    }
  }

  if (node.kind === "fact") {
    if (!node.factId) throw new Error("Fact node must specify factId");
    const fact = state.facts.get(node.factId);
    if (!fact || fact.archived) {
      throw new Error(`Fact not found or archived: ${node.factId}`);
    }
  }

  const canvasNode = {
    id: nodeId,
    campaignId: command.campaignId,
    canvasId: command.canvasId,
    kind: node.kind,
    entityId: node.entityId,
    factId: node.factId,
    text: node.text,
    title: node.title,
    color: node.color,
    groupId: node.groupId,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    collapsed: node.collapsed ?? false,
    zIndex: node.zIndex ?? 1,
    status: node.status ?? "draft",
    visibility: node.visibility ?? "dm",
    metadata: node.metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = {
    ...canvas,
    nodes: [...canvas.nodes, canvasNode],
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updated);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodePlaced", {
      canvasId: command.canvasId,
      node: canvasNode,
    }));
}
case "UpdateCanvasNode": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot update node on archived canvas");

  const nodeIndex = canvas.nodes.findIndex((n) => n.id === command.nodeId);
  if (nodeIndex === -1) throw new Error(`Node not found: ${command.nodeId}`);

  const existingNode = canvas.nodes[nodeIndex];
  const updatedNode = {
    ...existingNode,
    ...command.updates,
    updatedAt: new Date().toISOString(),
  };

  const nodes = [...canvas.nodes];
  nodes[nodeIndex] = updatedNode;

  const updatedCanvas = {
    ...canvas,
    nodes,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updatedCanvas);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodeUpdated", {
      canvasId: command.canvasId,
      nodeId: command.nodeId,
      updates: command.updates,
    }));
}
case "UpdateCanvasNodesLayout": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot update layout on archived canvas");

  const nodes = canvas.nodes.map((n) => {
    const update = command.nodeUpdates.find((up) => up.nodeId === n.id);
    if (update) {
      return {
        ...n,
        x: update.x,
        y: update.y,
        ...(update.width !== undefined && { width: update.width }),
        ...(update.height !== undefined && { height: update.height }),
        ...(update.parentId !== undefined && { parentId: update.parentId ?? undefined }),
        ...(update.groupId !== undefined && { groupId: update.groupId ?? undefined }),
        updatedAt: new Date().toISOString(),
      };
    }
    return n;
  });

  const updatedCanvas = {
    ...canvas,
    nodes,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updatedCanvas);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodesLayoutUpdated", {
      canvasId: command.canvasId,
      nodeUpdates: command.nodeUpdates,
    }));
}
case "RemoveNodeFromCanvas": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot remove node from archived canvas");

  const nodeExists = canvas.nodes.some((n) => n.id === command.nodeId);
  if (!nodeExists) throw new Error(`Node not found: ${command.nodeId}`);

  const nodes = canvas.nodes.filter((n) => n.id !== command.nodeId);
  const edges = canvas.edges.filter((e) => e.sourceNodeId !== command.nodeId && e.targetNodeId !== command.nodeId);

  const updatedCanvas = {
    ...canvas,
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updatedCanvas);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodeRemoved", {
      canvasId: command.canvasId,
      nodeId: command.nodeId,
    }));
}
case "AddEdgeToCanvas": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot add edge to archived canvas");

  const { edge } = command;
  const edgeId = edge.id ?? createId("cve");

  const sourceExists = canvas.nodes.some((n) => n.id === edge.sourceNodeId);
  const targetExists = canvas.nodes.some((n) => n.id === edge.targetNodeId);
  if (!sourceExists || !targetExists) {
    throw new Error("Edge source or target node not found on canvas");
  }

  if (edge.status === "domain") {
    if (!edge.relationshipId) throw new Error("Domain edge must specify relationshipId");
    const rel = state.relations.get(edge.relationshipId);
    if (!rel || rel.archived) throw new Error(`Relation not found or archived: ${edge.relationshipId}`);
  }

  const canvasEdge = {
    id: edgeId,
    campaignId: command.campaignId,
    canvasId: command.canvasId,
    sourceNodeId: edge.sourceNodeId,
    targetNodeId: edge.targetNodeId,
    relationshipId: edge.relationshipId,
    label: edge.label,
    status: edge.status,
    visibility: edge.visibility ?? "dm",
    style: edge.style ?? "solid",
    metadata: edge.metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedCanvas = {
    ...canvas,
    edges: [...canvas.edges, canvasEdge],
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updatedCanvas);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasEdgeAdded", {
      canvasId: command.canvasId,
      edge: canvasEdge,
    }));
}
case "UpdateCanvasEdge": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot update edge on archived canvas");

  const edgeIndex = canvas.edges.findIndex((e) => e.id === command.edgeId);
  if (edgeIndex === -1) throw new Error(`Edge not found: ${command.edgeId}`);

  const existingEdge = canvas.edges[edgeIndex];
  const updatedEdge = {
    ...existingEdge,
    ...command.updates,
    updatedAt: new Date().toISOString(),
  };

  const edges = [...canvas.edges];
  edges[edgeIndex] = updatedEdge;

  const updatedCanvas = {
    ...canvas,
    edges,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updatedCanvas);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasEdgeUpdated", {
      canvasId: command.canvasId,
      edgeId: command.edgeId,
      updates: command.updates,
    }));
}
case "RemoveEdgeFromCanvas": {
  const canvases = new Map(state.canvases || new Map());
  const canvas = canvases.get(command.canvasId);
  if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
  if (canvas.archived) throw new Error("Cannot remove edge from archived canvas");

  const edgeExists = canvas.edges.some((e) => e.id === command.edgeId);
  if (!edgeExists) throw new Error(`Edge not found: ${command.edgeId}`);

  const edges = canvas.edges.filter((e) => e.id !== command.edgeId);

  const updatedCanvas = {
    ...canvas,
    edges,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(command.canvasId, updatedCanvas);
  return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasEdgeRemoved", {
      canvasId: command.canvasId,
      edgeId: command.edgeId,
    }));
}
  }
  throw new Error("Unsupported canvas command");
}

function createCanvasTemplateNodes(campaignId: string, canvasId: string, kind: string): CanvasNode[] {
  if (kind === "custom") return [];
  const now = new Date().toISOString();
  const labels: Record<string, { title: string; note: string; groups: string[] }> = {
    world: {
      title: "Cómo usar este tablero de mundo",
      note: "Coloca aquí regiones, facciones, amenazas, misiones y secretos. Empieza añadiendo entidades existentes o crea una entidad rápida.",
      groups: ["Lugares", "Facciones", "Amenazas", "Misiones"],
    },
    characters: {
      title: "Cómo usar este tablero de personajes",
      note: "Organiza PNJs, personajes, familias y facciones. Conecta dos entidades para crear una relación real de campaña.",
      groups: ["Aliados", "Rivales", "Facciones", "Secretos"],
    },
    mystery: {
      title: "Cómo usar este tablero de misterio",
      note: "Agrupa sospechosos, pistas, secretos y revelaciones. Usa líneas visuales para hipótesis y relaciones reales para canon confirmado.",
      groups: ["Sospechosos", "Pistas", "Secretos", "Revelaciones"],
    },
    location: {
      title: "Cómo usar este tablero de localización",
      note: "Divide la localización en zonas, encuentros, pistas y complicaciones. No se genera lore automático: añade solo lo que necesites.",
      groups: ["Zonas", "Encuentros", "Pistas", "Complicaciones"],
    },
    session: {
      title: "Cómo usar este tablero de sesión",
      note: "Prepara escenas, PNJs, pistas, decisiones y consecuencias para la próxima sesión.",
      groups: ["Escenas", "PNJs", "Pistas", "Consecuencias"],
    },
  };
  const template = labels[kind] || labels.world;
  const note = {
    id: createId("cvn"),
    campaignId,
    canvasId,
    kind: "note" as const,
    title: template.title,
    text: template.note,
    color: "yellow" as const,
    x: -360,
    y: -260,
    width: 300,
    height: 160,
    collapsed: false,
    zIndex: 2,
    status: "draft" as const,
    visibility: "dm" as const,
    metadata: { template: true, role: "instructions" },
    createdAt: now,
    updatedAt: now,
  };
  const groups = template.groups.map((title, index) => ({
    id: createId("cvn"),
    campaignId,
    canvasId,
    kind: "group" as const,
    title,
    color: (["blue", "green", "purple", "pink"] as const)[index % 4],
    x: -360 + (index % 2) * 380,
    y: -40 + Math.floor(index / 2) * 260,
    width: 320,
    height: 200,
    collapsed: false,
    zIndex: 1,
    status: "draft" as const,
    visibility: "dm" as const,
    metadata: { template: true, role: "suggested-space" },
    createdAt: now,
    updatedAt: now,
  }));
  return [note, ...groups];
}

