import type { LucideIcon } from "lucide-react";
import {
  BookOpen, Clock, RefreshCcw, AlertTriangle, HelpCircle, KeyRound, Sparkles,
  Users, GitPullRequest, GitFork, Link2,
} from "lucide-react";
import { entityThemeColor } from "@frontend/shared/theme/themeCssVariables.js";
import type { ThemeEntityType } from "@frontend/account/themeContract.js";
import type { SessionProjectionNodeKind } from "@core/domain/session/projection/sessionProjectionTypes.js";

export interface NarrativeNodeVisual {
  icon: LucideIcon;
  accent: string;
}

// §24/§28.1 node "families". Not every kind has an obvious existing ThemeEntityType tone
// (opening/revelation/context_entity/open_thread), so those pick the closest semantic fit
// rather than adding new theme tones just for this one graph.
const KIND_TONE: Record<SessionProjectionNodeKind, ThemeEntityType> = {
  opening: "quest",
  scene: "scene",
  decision_point: "decision",
  decision_made: "decision",
  clue: "clue",
  secret: "secret",
  revelation: "secret",
  context_entity: "reference",
  consequence: "consequence",
  front: "front",
  clock: "clock",
  open_thread: "rumor",
};

const KIND_ICON: Record<SessionProjectionNodeKind, LucideIcon> = {
  opening: BookOpen,
  scene: Users,
  decision_point: GitFork,
  decision_made: GitPullRequest,
  clue: HelpCircle,
  secret: KeyRound,
  revelation: Sparkles,
  context_entity: Link2,
  consequence: RefreshCcw,
  front: AlertTriangle,
  clock: Clock,
  open_thread: BookOpen,
};

export function getNarrativeNodeVisual(kind: SessionProjectionNodeKind): NarrativeNodeVisual {
  const colors = entityThemeColor(KIND_TONE[kind]);
  return { icon: KIND_ICON[kind], accent: colors.foreground };
}
