// §27.1 "Promover al mundo": only metadata-derived edges without a backing Relation are
// promotable. The three direct-relation rules (relation.direct-causes/-depends-on/-affected-by)
// already correspond to a real Relation record -- promoting those would create a duplicate, so
// they're deliberately absent from this map.
//
// relationType is chosen per rule id, not derived generically from the edge's own `kind` --
// front-uses-clock's "advances" edge kind has no matching built-in RelationType, and
// consequence-affects' "affects" kind would invert direction if reversed naively. Each mapping
// documents which endpoint (source/target) becomes which side of the created relation.
export const PROMOTABLE_INFERENCE_RULES: Record<string, { relationType: string }> = {
  // edge: origin --causes--> consequence. Relation: origin causes consequence (same direction).
  "entity.consequence-origin": { relationType: "causes" },
  // edge: consequence --affects--> affected entity. Relation: consequence affected_by... no --
  // modeled as consequence causes the entity to be affected_by it, source=consequence,
  // target=affected entity, same direction as the edge.
  "entity.consequence-affects": { relationType: "affected_by" },
  // edge: front --advances--> clock. Relation: front depends_on clock (its progress is gated by it).
  "entity.front-uses-clock": { relationType: "depends_on" },
};

export function isPromotableInferenceRule(ruleId: string): boolean {
  return ruleId in PROMOTABLE_INFERENCE_RULES;
}

export function relationTypeForPromotion(ruleId: string): string | undefined {
  return PROMOTABLE_INFERENCE_RULES[ruleId]?.relationType;
}
