import React from "react";
import { Shield } from "lucide-react";
import { LanguagePill } from "../i18n/LanguageSelector.js";
import { useTranslation } from "../i18n/useTranslation.js";

export function PortalTopBar({ actions }: { actions?: React.ReactNode } = {}) {
  const { t } = useTranslation();

  return (
    <header className="portal-topbar">
      <div className="portal-topbar__brand">
        <Shield className="portal-topbar__brand-icon" size={18} />

        <span className="portal-topbar__brand-full">
          {t("landing.title1")} {t("landing.title2")}
        </span>

        <span
          className="portal-topbar__brand-short"
          aria-label={`${t("landing.title1")} ${t("landing.title2")}`}
        >
          DMCC
        </span>
      </div>

      <div className="portal-topbar__actions">
        {actions}
        <LanguagePill />
      </div>
    </header>
  );
}