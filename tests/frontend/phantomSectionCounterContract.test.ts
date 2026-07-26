import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// A2 (UX audit 2026-07-26): a shared "*-section-eyebrow" kicker style was
// reused to render a bare count (e.g. `<p class="session-section-eyebrow">
// {preparedSessions.length}</p>`) directly above a section heading that
// already names the thing being counted. The eyebrow style itself is a
// small uppercase kicker meant for short labels, not standalone numbers —
// so it read as a floating, unitless digit ("8" over "Sesiones
// preparadas"). Fixed by folding the count into the heading itself
// instead of a second, disconnected element.
const BARE_COUNT_EYEBROW = /<p className="(?:session|people)-section-eyebrow">\{[^}]*\.length[^}]*\}<\/p>/;

const files = [
  "src/frontend/dm/sessions/SessionsIndexPage.tsx",
  "src/frontend/dm/sessions/components/StoryThreadsPanel.tsx",
  "src/frontend/dm/people/knowledge/PlayerKnowledgeView.tsx",
];

describe("phantom section-counter contract", () => {
  for (const file of files) {
    it(`${file} does not render a bare count in a *-section-eyebrow element`, () => {
      const content = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(content).not.toMatch(BARE_COUNT_EYEBROW);
    });
  }
});
