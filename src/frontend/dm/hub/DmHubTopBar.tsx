import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, UserPlus, UserRound } from "lucide-react";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

interface DmHubTopBarProps {
  dmProfile: { displayName?: string; email?: string; avatarUrl?: string } | null;
  dmDisplayName: string;
  onAddDm: () => void;
  onSwitchDm: () => void;
  onOpenAccount: () => void;
  onSignOut: () => void;
}

export function DmHubTopBar({
  dmProfile,
  dmDisplayName,
  onAddDm,
  onSwitchDm,
  onOpenAccount,
  onSignOut,
}: DmHubTopBarProps) {
  const { t } = useTranslation();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeDropdown = () => setIsUserDropdownOpen(false);

  return (
    <PortalTopBar actions={
      <div className="dm-hub-topbar-actions">
        <button type="button" className="dm-topbar-ghost-btn" onClick={onAddDm}>
          <UserPlus size={13} />
          {t("nav.addDm")}
        </button>
        <button type="button" className="dm-topbar-ghost-btn" onClick={onSwitchDm}>
          <UserRound size={13} />
          {t("nav.switchDm")}
        </button>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="dm-topbar-ghost-btn dm-topbar-user-btn"
            onClick={() => setIsUserDropdownOpen((open) => !open)}
          >
            <UserRound size={13} />
            <span>{dmDisplayName}</span>
            <ChevronDown size={11} style={{ opacity: 0.6 }} />
          </button>
          {isUserDropdownOpen && (
            <div className="dm-user-dropdown animate-fade-in">
              <div className="dm-user-dropdown__header">
                <p className="dm-user-dropdown__name">{dmDisplayName}</p>
                <p className="dm-user-dropdown__email">{dmProfile?.email}</p>
              </div>
              <button
                type="button"
                className="dm-user-dropdown__item"
                onClick={() => { closeDropdown(); onOpenAccount(); }}
              >
                <Settings size={13} />
                Gestionar cuenta
              </button>
              <div className="dm-user-dropdown__divider" />
              <button
                type="button"
                className="dm-user-dropdown__item dm-user-dropdown__item--danger"
                onClick={() => { closeDropdown(); onSignOut(); }}
              >
                <LogOut size={13} />
                {t("nav.signOut")}
              </button>
            </div>
          )}
        </div>
      </div>
    } />
  );
}
