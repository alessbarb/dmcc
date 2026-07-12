import React, { useEffect, useState } from "react";
import { MoreHorizontal, X } from "lucide-react";

export interface MobileDockItem {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  onSelect: () => void;
}

interface MobileDockProps {
  items: MobileDockItem[];
  activeId?: string | null;
  ariaLabel: string;
  moreLabel: string;
  sheetLabel: string;
}

export function MobileDock({
  items,
  activeId = null,
  ariaLabel,
  moreLabel,
  sheetLabel,
}: MobileDockProps) {
  const [open, setOpen] = useState(false);
  const directItems = items.slice(0, 3);
  const overflowItems = items.slice(3);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const select = (item: MobileDockItem) => {
    setOpen(false);
    item.onSelect();
  };

  return (
    <>
      {open && (
        <div className="campaign-mobile-nav-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="campaign-mobile-nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={sheetLabel}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="campaign-mobile-nav-sheet__header">
              <strong>{sheetLabel}</strong>
              <button
                type="button"
                className="campaign-mobile-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="campaign-mobile-nav-sheet__body">
              <div className="campaign-mobile-nav-sheet__grid">
                {overflowItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`campaign-mobile-nav-sheet__item ${activeId === item.id ? "active" : ""}`}
                    onClick={() => select(item)}
                    aria-current={activeId === item.id ? "page" : undefined}
                  >
                    <item.Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <nav className="campaign-mobile-bottom-nav" aria-label={ariaLabel}>
        {directItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`campaign-mobile-bottom-nav__item ${activeId === item.id ? "active" : ""}`}
            onClick={() => select(item)}
            aria-current={activeId === item.id ? "page" : undefined}
          >
            <item.Icon size={19} />
            <span>{item.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`campaign-mobile-bottom-nav__item ${open ? "active" : ""}`}
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <MoreHorizontal size={19} />
          <span>{moreLabel}</span>
        </button>
      </nav>
    </>
  );
}
