import type { DmPortalNote, DmPortalObjective, DmPortalPlayer, DmPortalProposal } from "../../../shared/api/playerPortalApi.js";

export interface DmInboxProposalItem {
  portalPlayer: DmPortalPlayer;
  proposal: DmPortalProposal;
}

export interface DmInboxQuestionItem {
  portalPlayer: DmPortalPlayer;
  objective: DmPortalObjective;
}

export interface DmInboxNoteItem {
  portalPlayer: DmPortalPlayer;
  note: DmPortalNote;
}

export interface DmInboxItems {
  proposals: DmInboxProposalItem[];
  questions: DmInboxQuestionItem[];
  notes: DmInboxNoteItem[];
  total: number;
}

export function collectDmInboxItems(portalPlayers: DmPortalPlayer[]): DmInboxItems {
  const proposals = portalPlayers.flatMap((portalPlayer) =>
    (portalPlayer.proposals ?? [])
      .filter((proposal) => proposal.status === "pending")
      .map((proposal) => ({ portalPlayer, proposal }))
  );
  const questions = portalPlayers.flatMap((portalPlayer) =>
    (portalPlayer.objectives ?? [])
      .filter((objective) => objective.status === "open" && objective.kind === "question_for_dm")
      .map((objective) => ({ portalPlayer, objective }))
  );
  const notes = portalPlayers.flatMap((portalPlayer) =>
    (portalPlayer.notes ?? []).map((note) => ({ portalPlayer, note }))
  );

  return { proposals, questions, notes, total: proposals.length + questions.length + notes.length };
}
