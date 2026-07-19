import { useState, useRef, useEffect } from "react";
import { Plus, X, Zap, Play } from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { useNavigate } from "@tanstack/react-router";

type QuickEntityType = "npc" | "location" | "quest" | "clue" | "note" | "item";

const QUICK_TYPES: { type: QuickEntityType; emoji: string }[] = [
  { type: "npc", emoji: "🧙" },
  { type: "location", emoji: "📍" },
  { type: "quest", emoji: "⚔️" },
  { type: "clue", emoji: "🔍" },
  { type: "note", emoji: "📝" },
  { type: "item", emoji: "💎" },
];

type Props = { campaignId: string };

function runQuickCaptureAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

export function QuickCaptureFAB({ campaignId: _campaignId }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<QuickEntityType>("note");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get the createEntity action from the store (uses activeCampaignId internally)
  const createEntity = useCampaignStore((s) => s.createEntity);
  const activeSession = useCampaignStore((s) => s.campaignState?.sessions?.find((session) => session.status === "active"));

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setName("");
      setType("note");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const trimmed = name.trim();
      await createEntity({
        title: trimmed.substring(0, type === "note" ? 60 : 120),
        entityType: type,
        content: type === "note" ? trimmed : undefined,
        summary: type !== "note" ? trimmed : undefined,
        status: type === "clue" ? "prepared" : "active",
        createdInSessionId: activeSession?.sessionId,
      });
      addToast(t("toasts.success"), "success");
      setOpen(false);
    } catch {
      addToast(t("toasts.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const captureLabel = t("session.quickCaptureLabel");

  return (
    <>
      {/* FAB button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={captureLabel}
        className="quick-capture-fab"
      >
        <Plus size={22} />
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <div
          className="quick-capture-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="quick-capture-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={captureLabel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-capture-sheet__header">
              <span className="quick-capture-sheet__title">
                <Zap size={14} /> {captureLabel}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("common.close")}
                className="quick-capture-sheet__close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="quick-capture-sheet__body">
              <textarea
                ref={inputRef}
                className="form-textarea"
                placeholder={t("session.quickCaptureLongPlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") void handleSave();
                }}
                maxLength={500}
                className="form-textarea quick-capture-sheet__textarea"
              />

              <div className="quick-capture-type-grid">
                {QUICK_TYPES.map(({ type: qt, emoji }) => (
                  <button
                    key={qt}
                    type="button"
                    onClick={() => setType(qt)}
                    className={`quick-capture-type-btn ${type === qt ? "active" : ""}`}
                  >
                    <span>{emoji}</span>
                    <span>{t(`domain.entityTypes.${qt}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="quick-capture-sheet__footer">
              {activeSession && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setOpen(false);
                    runQuickCaptureAction(
                      navigate({ to: `/campaigns/${_campaignId}/sessions/${activeSession.sessionId}` }),
                      "No se pudo abrir la sesión activa.",
                    );
                  }}
                >
                  <Play size={14} /> {t("session.openActiveSession")}
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  runQuickCaptureAction(handleSave(), "No se pudo crear la captura rápida.");
                }}
                disabled={!name.trim() || saving}
              >
                {saving ? t("common.saving") : t("common.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
