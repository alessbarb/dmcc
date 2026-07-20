import type { CampaignTemplateTemplateFile } from "./schemas.js";

function getDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  return Array.from(duplicates);
}

export function validateCampaignTemplateReferences(template: CampaignTemplateTemplateFile, label: string): string[] {
  const errors: string[] = [];

  const entityIds = new Set(template.entities.map((e) => e.entityId));
  const relationIds = new Set(template.relations.map((r) => r.relationId));
  const factIds = new Set(template.facts.map((f) => f.factId));

  // Top-level duplicates
  getDuplicates(template.entities.map((e) => e.entityId)).forEach((id) => {
    errors.push(`${label}.entities contiene un identificador duplicado: ${id}`);
  });
  getDuplicates(template.relations.map((r) => r.relationId)).forEach((id) => {
    errors.push(`${label}.relations contiene un identificador duplicado: ${id}`);
  });
  getDuplicates(template.facts.map((f) => f.factId)).forEach((id) => {
    errors.push(`${label}.facts contiene un identificador duplicado: ${id}`);
  });
  getDuplicates(template.sessions.map((s) => s.sessionId)).forEach((id) => {
    errors.push(`${label}.sessions contiene un identificador duplicado: ${id}`);
  });
  getDuplicates(template.canvases.map((c) => c.canvasId)).forEach((id) => {
    errors.push(`${label}.canvases contiene un identificador duplicado: ${id}`);
  });

  // Validate relationships
  for (const relation of template.relations) {
    const rid = relation.relationId;
    if (!entityIds.has(relation.sourceEntityId)) {
      errors.push(`${label}.relations[${rid}].sourceEntityId hace referencia a una entidad inexistente: ${relation.sourceEntityId}`);
    }
    if (!entityIds.has(relation.targetEntityId)) {
      errors.push(`${label}.relations[${rid}].targetEntityId hace referencia a una entidad inexistente: ${relation.targetEntityId}`);
    }
  }

  // Validate facts
  for (const fact of template.facts) {
    const fid = fact.factId;
    const related = fact.relatedEntityIds ?? [];
    for (const entityId of related) {
      if (!entityIds.has(entityId)) {
        errors.push(`${label}.facts[${fid}].relatedEntityIds hace referencia a una entidad inexistente: ${entityId}`);
      }
    }
  }

  // Validate sessions
  for (const session of template.sessions) {
    const sid = session.sessionId;
    const prep = session.prep;
    if (prep) {
      const sceneIds = prep.sceneIds ?? [];
      const involvedEntityIds = prep.involvedEntityIds ?? [];
      const availableClueIds = prep.availableClueIds ?? [];
      const secretsAtRiskIds = prep.secretsAtRiskIds ?? [];
      const expectedConsequenceIds = prep.expectedConsequenceIds ?? [];

      for (const id of sceneIds) {
        if (!entityIds.has(id)) {
          errors.push(`${label}.sessions[${sid}].prep.sceneIds hace referencia a una entidad inexistente: ${id}`);
        }
      }
      for (const id of involvedEntityIds) {
        if (!entityIds.has(id)) {
          errors.push(`${label}.sessions[${sid}].prep.involvedEntityIds hace referencia a una entidad inexistente: ${id}`);
        }
      }
      for (const id of availableClueIds) {
        if (!entityIds.has(id)) {
          errors.push(`${label}.sessions[${sid}].prep.availableClueIds hace referencia a una entidad inexistente: ${id}`);
        }
      }
      for (const id of secretsAtRiskIds) {
        if (!entityIds.has(id)) {
          errors.push(`${label}.sessions[${sid}].prep.secretsAtRiskIds hace referencia a una entidad inexistente: ${id}`);
        }
      }
      for (const id of expectedConsequenceIds) {
        if (!entityIds.has(id)) {
          errors.push(`${label}.sessions[${sid}].prep.expectedConsequenceIds hace referencia a una entidad inexistente: ${id}`);
        }
      }

      // Duplicates in session checklist
      const checklist = prep.checklist ?? [];
      getDuplicates(checklist.map((item) => item.id)).forEach((id) => {
        errors.push(`${label}.sessions[${sid}].prep.checklist contiene un identificador de item duplicado: ${id}`);
      });
    }
  }

  // Validate featured IDs from manifest/template
  const highlightEntityIds = template.highlightEntityIds ?? [];
  for (const id of highlightEntityIds) {
    if (!entityIds.has(id)) {
      errors.push(`${label}.highlightEntityIds hace referencia a una entidad inexistente: ${id}`);
    }
  }

  const featuredFactIds = template.featuredFactIds ?? [];
  for (const id of featuredFactIds) {
    if (!factIds.has(id)) {
      errors.push(`${label}.featuredFactIds hace referencia a un hecho inexistente: ${id}`);
    }
  }

  const featuredRelationIds = template.featuredRelationIds ?? [];
  for (const id of featuredRelationIds) {
    if (!relationIds.has(id)) {
      errors.push(`${label}.featuredRelationIds hace referencia a una relación inexistente: ${id}`);
    }
  }

  // Validate canvases
  for (const canvas of template.canvases) {
    const cid = canvas.canvasId;
    const nodes = canvas.nodes ?? [];
    const edges = canvas.edges ?? [];

    const nodeIds = new Set(nodes.map((n) => n.id));

    getDuplicates(nodes.map((n) => n.id)).forEach((id) => {
      errors.push(`${label}.canvases[${cid}].nodes contiene un nodo duplicado: ${id}`);
    });
    getDuplicates(edges.map((e) => e.id)).forEach((id) => {
      errors.push(`${label}.canvases[${cid}].edges contiene una arista duplicada: ${id}`);
    });

    for (const node of nodes) {
      if (node.entityId && !entityIds.has(node.entityId)) {
        errors.push(`${label}.canvases[${cid}].nodes[${node.id}].entityId hace referencia a una entidad inexistente: ${node.entityId}`);
      }
      if (node.factId && !factIds.has(node.factId)) {
        errors.push(`${label}.canvases[${cid}].nodes[${node.id}].factId hace referencia a un hecho inexistente: ${node.factId}`);
      }
    }

    for (const edge of edges) {
      if (!nodeIds.has(edge.sourceNodeId)) {
        errors.push(`${label}.canvases[${cid}].edges[${edge.id}].sourceNodeId hace referencia a un nodo inexistente: ${edge.sourceNodeId}`);
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        errors.push(`${label}.canvases[${cid}].edges[${edge.id}].targetNodeId hace referencia a un nodo inexistente: ${edge.targetNodeId}`);
      }
      if (edge.status === "domain" && edge.relationshipId && !relationIds.has(edge.relationshipId)) {
        errors.push(`${label}.canvases[${cid}].edges[${edge.id}].relationshipId hace referencia a una relación inexistente: ${edge.relationshipId}`);
      }
    }
  }

  return errors;
}
