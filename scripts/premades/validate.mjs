#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";

const args = process.argv.slice(2);
const dirArgIndex = args.indexOf("--dir");
const premadeDir = resolve(dirArgIndex >= 0 && args[dirArgIndex + 1] ? args[dirArgIndex + 1] : "public/premades");

const allowedSystems = new Set(["generic_fantasy_d20", "dnd_srd_5_2_1", "custom"]);
const allowedDifficulties = new Set(["starter", "medium", "advanced"]);
const knownEntityReferenceKeys = [
  "sceneIds",
  "involvedEntityIds",
  "availableClueIds",
  "secretsAtRiskIds",
  "expectedConsequenceIds",
];

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, label, errors) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${label} must be a non-empty string`);
    return "";
  }
  return value.trim();
}

function requireArray(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return [];
  }
  return value;
}

function computeStats(template) {
  return {
    entities: Array.isArray(template.entities) ? template.entities.length : 0,
    relations: Array.isArray(template.relations) ? template.relations.length : 0,
    facts: Array.isArray(template.facts) ? template.facts.length : 0,
    preparedSessions: Array.isArray(template.sessions) ? template.sessions.length : 0,
  };
}

function compareStats(actual, expected, label, errors) {
  for (const key of Object.keys(expected)) {
    if (!actual || actual[key] !== expected[key]) {
      errors.push(`${label}.stats.${key} is ${actual?.[key] ?? "missing"}, expected ${expected[key]}`);
    }
  }
}

function addDuplicateErrors(items, getId, label, errors) {
  const seen = new Set();
  for (const item of items) {
    const id = getId(item);
    if (!id) continue;
    if (seen.has(id)) {
      errors.push(`${label} contains duplicated id ${id}`);
    }
    seen.add(id);
  }
  return seen;
}

function safeTemplatePath(file, errors) {
  const fileName = requireString(file, "manifest template file", errors);
  if (!fileName) return null;
  if (fileName !== basename(fileName)) {
    errors.push(`template file must stay inside premades directory: ${fileName}`);
    return null;
  }

  const resolvedDir = resolve(premadeDir);
  const resolvedFile = resolve(resolvedDir, fileName);
  const allowedPrefix = `${resolvedDir}${sep}`;
  if (resolvedFile === resolvedDir || !resolvedFile.startsWith(allowedPrefix)) {
    errors.push(`template file resolves outside premades directory: ${fileName}`);
    return null;
  }
  return resolvedFile;
}

async function readJson(filePath, errors, label) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (err) {
    errors.push(`${label} cannot be read as JSON: ${err?.message ?? "unknown error"}`);
    return null;
  }
}

function validateTemplateReferences(template, templateLabel, errors) {
  const entities = requireArray(template.entities, `${templateLabel}.entities`, errors);
  const relations = requireArray(template.relations, `${templateLabel}.relations`, errors);
  const facts = requireArray(template.facts, `${templateLabel}.facts`, errors);
  const sessions = requireArray(template.sessions, `${templateLabel}.sessions`, errors);
  const canvases = requireArray(template.canvases, `${templateLabel}.canvases`, errors);

  const entityIds = addDuplicateErrors(entities, (entity) => typeof entity?.entityId === "string" ? entity.entityId : "", `${templateLabel}.entities`, errors);
  const relationIds = addDuplicateErrors(relations, (relation) => typeof relation?.relationId === "string" ? relation.relationId : "", `${templateLabel}.relations`, errors);
  const factIds = addDuplicateErrors(facts, (fact) => typeof fact?.factId === "string" ? fact.factId : "", `${templateLabel}.facts`, errors);
  addDuplicateErrors(sessions, (session) => typeof session?.sessionId === "string" ? session.sessionId : "", `${templateLabel}.sessions`, errors);
  addDuplicateErrors(canvases, (canvas) => typeof canvas?.canvasId === "string" ? canvas.canvasId : "", `${templateLabel}.canvases`, errors);

  for (const entity of entities) {
    requireString(entity?.entityId, `${templateLabel}.entities[].entityId`, errors);
    requireString(entity?.entityType, `${templateLabel}.entities[${entity?.entityId ?? "?"}].entityType`, errors);
    requireString(entity?.title, `${templateLabel}.entities[${entity?.entityId ?? "?"}].title`, errors);
  }

  for (const relation of relations) {
    const relationId = requireString(relation?.relationId, `${templateLabel}.relations[].relationId`, errors);
    const sourceEntityId = requireString(relation?.sourceEntityId, `${templateLabel}.relations[${relationId || "?"}].sourceEntityId`, errors);
    const targetEntityId = requireString(relation?.targetEntityId, `${templateLabel}.relations[${relationId || "?"}].targetEntityId`, errors);
    requireString(relation?.relationType, `${templateLabel}.relations[${relationId || "?"}].relationType`, errors);
    if (sourceEntityId && !entityIds.has(sourceEntityId)) {
      errors.push(`${templateLabel}.relations[${relationId}].sourceEntityId references missing entity ${sourceEntityId}`);
    }
    if (targetEntityId && !entityIds.has(targetEntityId)) {
      errors.push(`${templateLabel}.relations[${relationId}].targetEntityId references missing entity ${targetEntityId}`);
    }
  }

  for (const fact of facts) {
    const factId = requireString(fact?.factId, `${templateLabel}.facts[].factId`, errors);
    requireString(fact?.statement, `${templateLabel}.facts[${factId || "?"}].statement`, errors);
    for (const entityId of Array.isArray(fact?.relatedEntityIds) ? fact.relatedEntityIds : []) {
      if (!entityIds.has(entityId)) {
        errors.push(`${templateLabel}.facts[${factId}].relatedEntityIds references missing entity ${entityId}`);
      }
    }
  }

  for (const session of sessions) {
    const sessionId = requireString(session?.sessionId, `${templateLabel}.sessions[].sessionId`, errors);
    requireString(session?.title, `${templateLabel}.sessions[${sessionId || "?"}].title`, errors);
    const prep = isRecord(session?.prep) ? session.prep : {};
    for (const key of knownEntityReferenceKeys) {
      for (const entityId of Array.isArray(prep[key]) ? prep[key] : []) {
        if (!entityIds.has(entityId)) {
          errors.push(`${templateLabel}.sessions[${sessionId}].prep.${key} references missing entity ${entityId}`);
        }
      }
    }
  }

  for (const entityId of Array.isArray(template.highlightEntityIds) ? template.highlightEntityIds : []) {
    if (!entityIds.has(entityId)) {
      errors.push(`${templateLabel}.highlightEntityIds references missing entity ${entityId}`);
    }
  }

  for (const factId of Array.isArray(template.featuredFactIds) ? template.featuredFactIds : []) {
    if (!factIds.has(factId)) {
      errors.push(`${templateLabel}.featuredFactIds references missing fact ${factId}`);
    }
  }

  for (const relationId of Array.isArray(template.featuredRelationIds) ? template.featuredRelationIds : []) {
    if (!relationIds.has(relationId)) {
      errors.push(`${templateLabel}.featuredRelationIds references missing relation ${relationId}`);
    }
  }

  if (isRecord(template.quickStart)) {
    requireString(template.quickStart.title, `${templateLabel}.quickStart.title`, errors);
    requireArray(template.quickStart.steps, `${templateLabel}.quickStart.steps`, errors);
  }

  for (const canvas of canvases) {
    const canvasId = requireString(canvas?.canvasId, `${templateLabel}.canvases[].canvasId`, errors);
    requireString(canvas?.title, `${templateLabel}.canvases[${canvasId || "?"}].title`, errors);
    const nodes = requireArray(canvas?.nodes ?? [], `${templateLabel}.canvases[${canvasId || "?"}].nodes`, errors);
    const edges = requireArray(canvas?.edges ?? [], `${templateLabel}.canvases[${canvasId || "?"}].edges`, errors);
    const nodeIds = addDuplicateErrors(nodes, (node) => typeof node?.id === "string" ? node.id : "", `${templateLabel}.canvases[${canvasId}].nodes`, errors);

    for (const node of nodes) {
      const nodeId = requireString(node?.id, `${templateLabel}.canvases[${canvasId}].nodes[].id`, errors);
      if (typeof node?.entityId === "string" && !entityIds.has(node.entityId)) {
        errors.push(`${templateLabel}.canvases[${canvasId}].nodes[${nodeId}].entityId references missing entity ${node.entityId}`);
      }
      if (typeof node?.factId === "string" && !factIds.has(node.factId)) {
        errors.push(`${templateLabel}.canvases[${canvasId}].nodes[${nodeId}].factId references missing fact ${node.factId}`);
      }
    }

    for (const edge of edges) {
      const edgeId = requireString(edge?.id, `${templateLabel}.canvases[${canvasId}].edges[].id`, errors);
      if (!nodeIds.has(edge?.sourceNodeId)) {
        errors.push(`${templateLabel}.canvases[${canvasId}].edges[${edgeId}].sourceNodeId references missing node ${edge?.sourceNodeId ?? "missing"}`);
      }
      if (!nodeIds.has(edge?.targetNodeId)) {
        errors.push(`${templateLabel}.canvases[${canvasId}].edges[${edgeId}].targetNodeId references missing node ${edge?.targetNodeId ?? "missing"}`);
      }
      if (edge?.status === "domain") {
        const relationshipId = requireString(edge.relationshipId, `${templateLabel}.canvases[${canvasId}].edges[${edgeId}].relationshipId`, errors);
        if (relationshipId && !relationIds.has(relationshipId)) {
          errors.push(`${templateLabel}.canvases[${canvasId}].edges[${edgeId}].relationshipId references missing relation ${relationshipId}`);
        }
      }
    }
  }

  return { entityIds, relationIds, factIds };
}

async function main() {
  const errors = [];
  const manifestPath = resolve(premadeDir, "manifest.json");

  if (!existsSync(manifestPath)) {
    errors.push(`manifest not found: ${manifestPath}`);
  }

  const manifest = existsSync(manifestPath) ? await readJson(manifestPath, errors, "manifest") : null;
  if (!isRecord(manifest)) {
    errors.push("manifest must be a JSON object");
  }

  const templates = isRecord(manifest) ? requireArray(manifest.templates, "manifest.templates", errors) : [];
  addDuplicateErrors(templates, (template) => typeof template?.templateId === "string" ? template.templateId : "", "manifest.templates", errors);

  for (const summary of templates) {
    const templateId = requireString(summary?.templateId, "manifest.templates[].templateId", errors);
    const label = templateId ? `template:${templateId}` : "template:?";
    requireString(summary?.version, `${label}.version`, errors);
    requireString(summary?.title, `${label}.title`, errors);
    requireString(summary?.description, `${label}.description`, errors);
    requireString(summary?.locale, `${label}.locale`, errors);
    if (!allowedSystems.has(summary?.system)) {
      errors.push(`${label}.system is invalid: ${summary?.system ?? "missing"}`);
    }
    if (!allowedDifficulties.has(summary?.difficulty)) {
      errors.push(`${label}.difficulty is invalid: ${summary?.difficulty ?? "missing"}`);
    }

    const templatePath = safeTemplatePath(summary?.file, errors);
    if (!templatePath || !existsSync(templatePath)) {
      errors.push(`${label}.file not found: ${summary?.file ?? "missing"}`);
      continue;
    }

    const template = await readJson(templatePath, errors, label);
    if (!isRecord(template)) {
      errors.push(`${label} must be a JSON object`);
      continue;
    }

    if (template.templateId !== templateId) {
      errors.push(`${label}.templateId is ${template.templateId ?? "missing"}, expected ${templateId}`);
    }

    const templateVersion = typeof template.templateVersion === "string" ? template.templateVersion : template.version;
    if (typeof summary.version === "string" && templateVersion !== summary.version) {
      errors.push(`${label}.version mismatch: manifest=${summary.version}, template=${templateVersion ?? "missing"}`);
    }

    const expectedStats = computeStats(template);
    compareStats(summary.stats, expectedStats, `manifest.templates[${templateId}]`, errors);
    compareStats(template.stats, expectedStats, label, errors);
    validateTemplateReferences(template, label, errors);
  }

  if (errors.length > 0) {
    console.error("❌ Premade campaign validation failed:");
    for (const error of errors) {
      console.error(` - ${error}`);
    }
    process.exit(1);
  }

  console.log(`✓ Premade campaign library valid (${templates.length} templates) — ${premadeDir}`);
}

await main();
