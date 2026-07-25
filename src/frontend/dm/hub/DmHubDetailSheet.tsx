import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export interface DmHubDetailSheetProps { open: boolean; title: string; onClose: () => void; returnFocusRef: React.RefObject<HTMLElement | null>; children: React.ReactNode; }
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function DmHubDetailSheet({ open, title, onClose, returnFocusRef, children }: DmHubDetailSheetProps) {
  const { t } = useTranslation(); const sheetRef = useRef<HTMLDivElement>(null);
  const requestClose = useCallback(() => { onClose(); returnFocusRef.current?.focus(); }, [onClose, returnFocusRef]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { requestClose(); return; } if (event.key !== "Tab" || !sheetRef.current) return; const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)); if (!focusable.length) return; const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } };
    window.addEventListener("keydown", handleKeyDown); return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [open, requestClose]);
  if (!open) return null;
  return <div className="dm-hub-detail-sheet-backdrop" role="presentation" onMouseDown={requestClose}><section ref={sheetRef} className="dm-hub-detail-sheet" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><header className="dm-hub-detail-sheet__header"><h2>{title}</h2><button type="button" className="dm-hub-detail-sheet__close" onClick={requestClose} aria-label={t("landing.closeDetail")}><X size={18} /></button></header><div className="dm-hub-detail-sheet__body">{children}</div></section></div>;
}
