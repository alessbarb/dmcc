import React from "react";
import { Shield } from "lucide-react";
import { LanguagePill } from "../i18n/LanguageSelector.js";
import { useTranslation } from "../i18n/useTranslation.js";

export function PortalTopBar({ actions }: { actions?: React.ReactNode } = {}) {
  const { t } = useTranslation();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 28px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background:
          "linear-gradient(180deg, hsla(230, 35%, 7%, 0.92) 0%, hsla(230, 35%, 7%, 0.72) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          fontWeight: 800,
          fontSize: "0.95rem",
          letterSpacing: "-0.015em",
          color: "var(--text-main)",
        }}
      >
        <Shield
          size={18}
          style={{
            color: "var(--accent, var(--primary))",
            filter: "drop-shadow(0 0 6px hsla(255,85%,65%,0.55))",
          }}
        />
        {t("landing.title1")} {t("landing.title2")}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {actions}
        <LanguagePill />
      </div>
    </header>
  );
}
