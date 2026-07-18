import { z } from "zod";
import {
  entityIdSchema,
  storyStepIdSchema,
  objectiveIdSchema,
  sessionPlanItemIdSchema,
  sessionPlanContentLinkIdSchema,
  sessionPlanTransitionIdSchema,
  sessionPlanBindingIdSchema,
  sessionPlanGoalIdSchema,
  sessionPlanChecklistItemIdSchema,
} from "@shared/schemas.js";

export const sessionPlanStateSchema = z.enum(["draft", "ready"]);
export type SessionPlanState = z.infer<typeof sessionPlanStateSchema>;

export const sessionPlanGoalSchema = z.object({
  id: sessionPlanGoalIdSchema,
  text: z.string().min(1, "Goal text must not be empty"),
  completed: z.boolean().default(false),
  order: z.number().int().min(0),
});
export type SessionPlanGoal = z.infer<typeof sessionPlanGoalSchema>;

export const sessionPlanChecklistItemSchema = z.object({
  id: sessionPlanChecklistItemIdSchema,
  text: z.string().min(1, "Checklist item text must not be empty"),
  checked: z.boolean().default(false),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  order: z.number().int().min(0),
});
export type SessionPlanChecklistItem = z.infer<typeof sessionPlanChecklistItemSchema>;

export const sessionPlannedSceneSchema = z.object({
  id: sessionPlanItemIdSchema,
  kind: z.literal("scene"),
  sceneEntityId: entityIdSchema,
  order: z.number().int().min(0),
  titleOverride: z.string().optional(),
  notes: z.string().optional(),
});
export type SessionPlannedScene = z.infer<typeof sessionPlannedSceneSchema>;

export const sessionDecisionPointSchema = z.object({
  id: sessionPlanItemIdSchema,
  kind: z.literal("decision_point"),
  title: z.string().min(1, "Decision point title must not be empty"),
  prompt: z.string().optional(),
  order: z.number().int().min(0),
  notes: z.string().optional(),
});
export type SessionDecisionPoint = z.infer<typeof sessionDecisionPointSchema>;

export const sessionFlowItemSchema = z.discriminatedUnion("kind", [
  sessionPlannedSceneSchema,
  sessionDecisionPointSchema,
]);
export type SessionFlowItem = z.infer<typeof sessionFlowItemSchema>;

export const sessionPlanContentRoleSchema = z.enum([
  "available_clue",
  "secret_at_risk",
  "expected_consequence",
  "involved_entity",
  "front_in_play",
  "clock_in_play",
]);
export type SessionPlanContentRole = z.infer<typeof sessionPlanContentRoleSchema>;

export const sessionPlanContentLinkSchema = z.object({
  id: sessionPlanContentLinkIdSchema,
  entityId: entityIdSchema,
  role: sessionPlanContentRoleSchema,
  anchorFlowItemId: sessionPlanItemIdSchema.optional(),
  order: z.number().int().min(0),
  notes: z.string().optional(),
});
export type SessionPlanContentLink = z.infer<typeof sessionPlanContentLinkSchema>;

export const sessionPlanTransitionKindSchema = z.enum(["next", "alternative", "conditional"]);
export type SessionPlanTransitionKind = z.infer<typeof sessionPlanTransitionKindSchema>;

export const sessionPlanTransitionSchema = z.object({
  id: sessionPlanTransitionIdSchema,
  sourceItemId: sessionPlanItemIdSchema,
  targetItemId: sessionPlanItemIdSchema,
  kind: sessionPlanTransitionKindSchema,
  label: z.string().optional(),
  condition: z.string().optional(),
  order: z.number().int().min(0),
});
export type SessionPlanTransition = z.infer<typeof sessionPlanTransitionSchema>;

export const sessionStoryStepBindingSchema = z.object({
  id: sessionPlanBindingIdSchema,
  kind: z.literal("story_step"),
  storyStepId: storyStepIdSchema,
  anchorFlowItemId: sessionPlanItemIdSchema.optional(),
  order: z.number().int().min(0),
});
export type SessionStoryStepBinding = z.infer<typeof sessionStoryStepBindingSchema>;

export const sessionObjectiveBindingSchema = z.object({
  id: sessionPlanBindingIdSchema,
  kind: z.literal("objective"),
  objectiveId: objectiveIdSchema,
  goalId: sessionPlanGoalIdSchema,
  anchorFlowItemId: sessionPlanItemIdSchema.optional(),
  order: z.number().int().min(0),
});
export type SessionObjectiveBinding = z.infer<typeof sessionObjectiveBindingSchema>;

export const sessionPlanBindingSchema = z.discriminatedUnion("kind", [
  sessionStoryStepBindingSchema,
  sessionObjectiveBindingSchema,
]);
export type SessionPlanBinding = z.infer<typeof sessionPlanBindingSchema>;

export const sessionPlanSchema = z.object({
  version: z.literal(2),
  revision: z.number().int().min(0),
  state: sessionPlanStateSchema,

  summary: z.string().optional(),
  openingPrompt: z.string().optional(),

  goals: z.array(sessionPlanGoalSchema).default([]),
  checklist: z.array(sessionPlanChecklistItemSchema).default([]),

  flowItems: z.array(sessionFlowItemSchema).default([]),
  contentLinks: z.array(sessionPlanContentLinkSchema).default([]),
  transitions: z.array(sessionPlanTransitionSchema).default([]),
  bindings: z.array(sessionPlanBindingSchema).default([]),

  privateNotes: z.string().optional(),
});
export type SessionPlan = z.infer<typeof sessionPlanSchema>;

export function createEmptySessionPlan(): SessionPlan {
  return {
    version: 2,
    revision: 0,
    state: "draft",
    goals: [],
    checklist: [],
    flowItems: [],
    contentLinks: [],
    transitions: [],
    bindings: [],
  };
}
