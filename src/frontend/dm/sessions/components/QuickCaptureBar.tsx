import { useRef, useState } from "react";
import { Terminal } from "lucide-react";
import { createId } from "@shared/ids.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";
import { parseQuickCapture } from "../capture/parseQuickCapture.js";

export function QuickCaptureBar({
  activeSession,
  createEntity,
  recordSessionEvent,
  addToast,
  onOpenCluePanel,
}: {
  campaignState: MaybeCampaignState;
  activeSession: Session;
  createEntity: CampaignStateStore["createEntity"];
  createRelation: CampaignStateStore["createRelation"];
  recordSessionEvent: CampaignStateStore["recordSessionEvent"];
  revealClue: CampaignStateStore["revealClue"];
  addToast: (msg: string, kind?: ToastKind) => void;
  onOpenCluePanel: () => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    const parsed = parseQuickCapture(value);
    if (parsed.kind === "unknown") {
      addToast(t("toasts.unknownCommand"), "error");
      return;
    }
    if (parsed.kind === "clue") {
      onOpenCluePanel();
      setValue("");
      return;
    }
    setBusy(true);
    const sessionId = activeSession?.sessionId;
    try {
      if (parsed.kind === "note") {
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "note",
          title: parsed.text.substring(0, 40) + (parsed.text.length > 40 ? "…" : ""),
          content: parsed.text,
          status: "active",
          createdInSessionId: sessionId,
        });
        await recordSessionEvent(sessionId, {
          type: "note_recorded",
          title: parsed.text.substring(0, 60) + (parsed.text.length > 60 ? "…" : ""),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.noteRecorded"), "success");
      } else if (parsed.kind === "npc") {
        if (!parsed.name) { addToast(t("toasts.npcNameRequired"), "error"); return; }
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "npc",
          title: parsed.name,
          subtitle: parsed.role,
          status: "known",
          importance: "normal",
          createdInSessionId: sessionId,
          metadata: { role: parsed.role },
        });
        await recordSessionEvent(sessionId, {
          type: "npc_met",
          title: t("sessionPage.quickNPCIntroduced", { name: parsed.name }),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.npcCreated", { name: parsed.name }), "success");
      } else if (parsed.kind === "decision") {
        if (!parsed.text) { addToast(t("toasts.decisionTextRequired"), "error"); return; }
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "decision",
          title: parsed.text.substring(0, 50) + (parsed.text.length > 50 ? "…" : ""),
          content: parsed.text,
          status: "made",
          createdInSessionId: sessionId,
          metadata: { decisionText: parsed.text, sessionId: sessionId || "sess_unknown", madeByCharacterIds: [] },
        });
        await recordSessionEvent(sessionId, {
          type: "decision_made",
          title: t("sessionPage.decisionPrefix", { text: parsed.text.substring(0, 50) }),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.noteRecorded"), "success");
      } else if (parsed.kind === "consequence") {
        if (!parsed.text) { addToast(t("toasts.consequenceTextRequired"), "error"); return; }
        const id = createId("ent");
        await createEntity({
          entityId: id,
          entityType: "consequence",
          title: parsed.text,
          status: "pending",
          importance: "normal",
          createdInSessionId: sessionId,
          metadata: {},
        });
        await recordSessionEvent(sessionId, {
          type: "consequence_created",
          title: t("sessionPage.consequencePrefix", { text: parsed.text }),
          relatedEntityIds: [id],
        });
        addToast(t("toasts.consequenceCreated"), "success");
      }
      setValue("");
      inputRef.current?.focus();
    } catch (err) {
      addToast(t("toasts.captureError", { error: errorMessage(err) }), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => {
      runSessionAction(handleSubmit(event), "No se pudo procesar la captura rápida.");
    }} aria-label={t("session.quickCaptureLabel")}>
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          padding: "10px 14px",
          backgroundColor: "var(--bg-input)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          transition: "border-color var(--transition-fast)",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)";
        }}
      >
        <Terminal size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("session.quickCapturePlaceholder")}
          disabled={busy}
          autoComplete="off"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "0.92rem",
            color: "var(--text-main)",
            fontFamily: "inherit",
          }}
        />
        {value.trim() && (
          <button
            type="submit"
            disabled={busy}
            style={{
              background: "var(--primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#fff",
              fontSize: "0.78rem",
              fontWeight: "700",
              padding: "4px 10px",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            {busy ? "…" : "↵"}
          </button>
        )}
      </div>
      <p
        style={{
          fontSize: "0.73rem",
          color: "var(--text-muted)",
          marginTop: "5px",
          paddingLeft: "4px",
          opacity: 0.7,
        }}
      >
        {t("sessionPage.quickCaptureHelp")}
      </p>
    </form>
  );
}
