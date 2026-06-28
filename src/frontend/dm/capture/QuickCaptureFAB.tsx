import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Zap } from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

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

export function QuickCaptureFAB({ campaignId: _campaignId }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<QuickEntityType>("note");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const { t } = useTranslation();

  // Get the createEntity action from the store (uses activeCampaignId internally)
  const createEntity = useCampaignStore((s) => s.createEntity);

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
      await createEntity({ title: name.trim(), entityType: type });
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
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="quick-capture-sheet__body">
              <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder={`${t("common.name")}...`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                maxLength={120}
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
                onClick={handleSave}
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
