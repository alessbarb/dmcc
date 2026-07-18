import React, { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface ContextMenuProps {
  buttonLabel: string;
  items: ContextMenuItem[];
  align?: "start" | "end";
}

export function nextMenuIndex(current: number, direction: 1 | -1, enabled: boolean[]): number {
  if (!enabled.some(Boolean)) return -1;
  let candidate = current;
  for (let visited = 0; visited < enabled.length; visited += 1) {
    candidate = (candidate + direction + enabled.length) % enabled.length;
    if (enabled[candidate]) return candidate;
  }
  return current;
}

export function ContextMenu({ buttonLabel, items, align = "end" }: ContextMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const closeAndRestoreFocus = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const firstEnabled = items.findIndex((item) => !item.disabled);
    requestAnimationFrame(() => itemRefs.current[firstEnabled]?.focus());

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [items, open]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRestoreFocus();
      return;
    }

    const current = document.activeElement instanceof HTMLButtonElement ? itemRefs.current.indexOf(document.activeElement) : -1;
    const enabled = items.map((item) => !item.disabled);
    let next = -1;
    if (event.key === "ArrowDown") next = nextMenuIndex(current, 1, enabled);
    if (event.key === "ArrowUp") next = nextMenuIndex(current, -1, enabled);
    if (event.key === "Home") next = enabled.findIndex(Boolean);
    if (event.key === "End") next = enabled.lastIndexOf(true);
    if (next >= 0) {
      event.preventDefault();
      itemRefs.current[next]?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className="context-menu"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={handleMenuKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="context-menu__trigger"
        aria-label={buttonLabel}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>
      {open ? (
        <div id={menuId} className={`context-menu__panel context-menu__panel--${align}`} role="menu">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                ref={(element) => { itemRefs.current[index] = element; }}
                type="button"
                role="menuitem"
                className={`context-menu__item${item.destructive ? " context-menu__item--destructive" : ""}`}
                disabled={item.disabled}
                tabIndex={index === 0 ? 0 : -1}
                onClick={() => {
                  item.onSelect();
                  closeAndRestoreFocus();
                }}
              >
                {Icon ? <Icon size={16} aria-hidden={true} /> : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
