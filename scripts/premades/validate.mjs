#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const args = process.argv.slice(2);
const dirArgIndex = args.indexOf("--dir");
const premadeDir = resolve(dirArgIndex >= 0 && args[dirArgIndex + 1] ? args[dirArgIndex + 1] : "public/premades");

const knownEntityReferenceKeys = ["sceneIds", "involvedEntityIds", "availableClueIds", "secretsAtRiskIds", "expectedConsequenceIds"];
const allowedLocales = new Set(["en", "es", "fr", "de", "it", "pt"]);

function isRecord(value) { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function requireArray(value, label, errors) { if (!Array.isArray(value)) { errors.push(`${label} must be an array`); return []; } return value; }
function requireString(value, label, errors) { if (typeof value !== "string" || value.trim().length === 0) { errors.push(`${label} must be a non-empty string`); return ""; } return value.trim(); }

function safePremadePath(file, label, errors) {
  const fileName = requireString(file, label, errors);
  if (!fileName) return null;
  const resolvedDir = resolve(premadeDir);
  const resolvedFile = resolve(resolvedDir, fileName);
  const allowedPrefix = `${resolvedDir}${sep}`;
  if (resolvedFile === resolvedDir || !resolvedFile.startsWith(allowedPrefix)) {
    errors.push(`${label} resolves outside premades directory: ${fileName}`);
    return null;
  }
  return resolvedFile;
}

async function readJson(filePath, errors, label) {
  try { return JSON.parse(await readFile(filePath, "utf8")); }
  catch (err) { errors.push(`${label} cannot be read as JSON: ${err?.message ?? "unknown error"}`); return null; }
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
    if (seen.has(id)) errors.push(`${label} contains duplicated id ${id}`);
    seen.add(id);
  }
  return seen;
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
  }

  for (const relation of relations) {
    const relationId = requireString(relation?.relationId, `${templateLabel}.relations[].relationId`, errors);
    const sourceEntityId = requireString(relation?.sourceEntityId, `${templateLabel}.relations[${relationId || "?"}].sourceEntityId`, errors);
    const targetEntityId = requireString(relation?.targetEntityId, `${templateLabel}.relations[${relationId || "?"}].targetEntityId`, errors);
    requireString(relation?.relationType, `${templateLabel}.relations[${relationId || "?"}].relationType`, errors);
    if (sourceEntityId && !entityIds.has(sourceEntityId)) errors.push(`${templateLabel}.relations[${relationId}].sourceEntityId references missing entity ${sourceEntityId}`);
    if (targetEntityId && !entityIds.has(targetEntityId)) errors.push(`${templateLabel}.relations[${relationId}].targetEntityId references missing entity ${targetEntityId}`);
  }

  for (const fact of facts) {
    const factId = requireString(fact?.factId, `${templateLabel}.facts[].factId`, errors);
    for (const entityId of Array.isArray(fact?.relatedEntityIds) ? fact.relatedEntityIds : []) {
      if (!entityIds.has(entityId)) errors.push(`${templateLabel}.facts[${factId}].relatedEntityIds references missing entity ${entityId}`);
    }
  }

  for (const session of sessions) {
    const sessionId = requireString(session?.sessionId, `${templateLabel}.sessions[].sessionId`, errors);
    const prep = isRecord(session?.prep) ? session.prep : {};
    for (const key of knownEntityReferenceKeys) {
      for (const entityId of Array.isArray(prep[key]) ? prep[key] : []) {
        if (!entityIds.has(entityId)) errors.push(`${templateLabel}.sessions[${sessionId}].prep.${key} references missing entity ${entityId}`);
      }
    }
  }

  for (const entityId of Array.isArray(template.highlightEntityIds) ? template.highlightEntityIds : []) {
    if (!entityIds.has(entityId)) errors.push(`${templateLabel}.highlightEntityIds references missing entity ${entityId}`);
  }
  for (const factId of Array.isArray(template.featuredFactIds) ? template.featuredFactIds : []) {
    if (!factIds.has(factId)) errors.push(`${templateLabel}.featuredFactIds references missing fact ${factId}`);
  }
  for (const relationId of Array.isArray(template.featuredRelationIds) ? template.featuredRelationIds : []) {
    if (!relationIds.has(relationId)) errors.push(`${templateLabel}.featuredRelationIds references missing relation ${relationId}`);
  }

  for (const canvas of canvases) {
    const canvasId = requireString(canvas?.canvasId, `${templateLabel}.canvases[].canvasId`, errors);
    const nodes = requireArray(canvas?.nodes ?? [], `${templateLabel}.canvases[${canvasId || "?"}].nodes`, errors);
    const edges = requireArray(canvas?.edges ?? [], `${templateLabel}.canvases[${canvasId || "?"}].edges`, errors);
    const nodeIds = addDuplicateErrors(nodes, (node) => typeof node?.id === "string" ? node.id : "", `${templateLabel}.canvases[${canvasId}].nodes`, errors);
    for (const node of nodes) {
      const nodeId = requireString(node?.id, `${templateLabel}.canvases[${canvasId}].nodes[].id`, errors);
      if (typeof node?.entityId === "string" && !entityIds.has(node.entityId)) errors.push(`${templateLabel}.canvases[${canvasId}].nodes[${nodeId}].entityId references missing entity ${node.entityId}`);
      if (typeof node?.factId === "string" && !factIds.has(node.factId)) errors.push(`${templateLabel}.canvases[${canvasId}].nodes[${nodeId}].factId references missing fact ${node.factId}`);
    }
    for (const edge of edges) {
      const edgeId = requireString(edge?.id, `${templateLabel}.canvases[${canvasId}].edges[].id`, errors);
      if (!nodeIds.has(edge?.sourceNodeId)) errors.push(`${templateLabel}.canvases[${canvasId}].edges[${edgeId}].sourceNodeId references missing node ${edge?.sourceNodeId ?? "missing"}`);
      if (!nodeIds.has(edge?.targetNodeId)) errors.push(`${templateLabel}.canvases[${canvasId}].edges[${edgeId}].targetNodeId references missing node ${edge?.targetNodeId ?? "missing"}`);
      if (edge?.status === "domain") {
        const relationshipId = requireString(edge.relationshipId, `${templateLabel}.canvases[${canvasId}].edges[${edgeId}].relationshipId`, errors);
        if (relationshipId && !relationIds.has(relationshipId)) errors.push(`${templateLabel}.canvases[${canvasId}].edges[${edgeId}].relationshipId references missing relation ${relationshipId}`);
      }
    }
  }

  return { entityIds, relationIds, factIds, sessionIds: new Set(sessions.map((s) => s.sessionId).filter(Boolean)), canvasIds: new Set(canvases.map((c) => c.canvasId).filter(Boolean)) };
}

function validateLocaleOverlay(locale, overlay, ids, label, errors) {
  if (!isRecord(overlay)) { errors.push(`${label} must be an object`); return; }
  if (overlay.locale !== locale) errors.push(`${label}.locale must be ${locale}`);
  if (overlay.entities && isRecord(overlay.entities)) {
    for (const id of Object.keys(overlay.entities)) if (!ids.entityIds.has(id)) errors.push(`${label}.entities references missing entity ${id}`);
  }
  if (overlay.relations && isRecord(overlay.relations)) {
    for (const id of Object.keys(overlay.relations)) if (!ids.relationIds.has(id)) errors.push(`${label}.relations references missing relation ${id}`);
  }
  if (overlay.facts && isRecord(overlay.facts)) {
    for (const id of Object.keys(overlay.facts)) if (!ids.factIds.has(id)) errors.push(`${label}.facts references missing fact ${id}`);
  }
  if (overlay.sessions && isRecord(overlay.sessions)) {
    for (const id of Object.keys(overlay.sessions)) if (!ids.sessionIds.has(id)) errors.push(`${label}.sessions references missing session ${id}`);
  }
  if (overlay.canvases && isRecord(overlay.canvases)) {
    for (const id of Object.keys(overlay.canvases)) if (!ids.canvasIds.has(id)) errors.push(`${label}.canvases references missing canvas ${id}`);
  }
}

async function main() {
  const errors = [];
  const manifestPath = resolve(premadeDir, "manifest.json");
  if (!existsSync(manifestPath)) errors.push(`manifest not found: ${manifestPath}`);
  const manifest = existsSync(manifestPath) ? await readJson(manifestPath, errors, "manifest") : null;

  if (!isRecord(manifest) || !Array.isArray(manifest.templates)) {
    errors.push("manifest must contain a templates array");
  } else {
    const seenTemplateIds = new Set();
    const schemaVersion = typeof manifest.schemaVersion === "number" ? manifest.schemaVersion : 1;
    const defaultLocale = typeof manifest.defaultLocale === "string" ? manifest.defaultLocale : "en";
    if (schemaVersion === 2 && !allowedLocales.has(defaultLocale)) errors.push(`manifest.defaultLocale is unsupported: ${defaultLocale}`);

    for (const entry of manifest.templates) {
      if (!isRecord(entry)) { errors.push("manifest.templates[] must be an object"); continue; }
      const templateId = requireString(entry.templateId, "manifest.templates[].templateId", errors);
      if (templateId && seenTemplateIds.has(templateId)) errors.push(`manifest contains duplicated templateId ${templateId}`);
      seenTemplateIds.add(templateId);

      const templateFile = schemaVersion === 2 ? entry.templateFile : entry.file;
      const templatePath = safePremadePath(templateFile, `${templateId}.templateFile`, errors);
      if (!templatePath) continue;
      const template = await readJson(templatePath, errors, `${templateId}.template`);
      if (!isRecord(template)) continue;
      if (template.templateId !== templateId) errors.push(`${templateId}.template.templateId does not match manifest entry`);

      const stats = computeStats(template);
      compareStats(template.stats, stats, `${templateId}.template`, errors);
      compareStats(entry.stats, stats, `${templateId}.manifest`, errors);
      const ids = validateTemplateReferences(template, `${templateId}.template`, errors);

      if (schemaVersion === 2) {
        if (!isRecord(entry.locales)) {
          errors.push(`${templateId}.locales must be an object`);
          continue;
        }
        const availableLocales = Array.isArray(entry.availableLocales) ? entry.availableLocales : Object.keys(entry.locales);
        for (const locale of availableLocales) {
          if (!allowedLocales.has(locale)) errors.push(`${templateId}.availableLocales contains unsupported locale ${locale}`);
          if (typeof entry.locales[locale] !== "string") errors.push(`${templateId}.locales.${locale} is missing`);
        }
        const defaultEntryLocale = typeof entry.defaultLocale === "string" ? entry.defaultLocale : defaultLocale;
        if (!entry.locales[defaultEntryLocale]) errors.push(`${templateId}.locales is missing default locale ${defaultEntryLocale}`);
        for (const [locale, file] of Object.entries(entry.locales)) {
          const localePath = safePremadePath(file, `${templateId}.locales.${locale}`, errors);
          if (!localePath) continue;
          const overlay = await readJson(localePath, errors, `${templateId}.locales.${locale}`);
          validateLocaleOverlay(locale, overlay, ids, `${templateId}.locales.${locale}`, errors);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error("❌ Premade campaign library invalid:");
    for (const error of errors) console.error(` - ${error}`);
    process.exit(1);
  }

  console.log(`✓ Premade campaign library valid (${manifest.templates.length} templates) — ${premadeDir}`);
}

await main().catch((err) => {
  console.error(`❌ Premade validation failed: ${err?.message ?? "unknown error"}`);
  process.exit(1);
});
