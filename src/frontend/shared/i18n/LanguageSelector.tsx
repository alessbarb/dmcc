import React from "react";
import { useTranslation } from "./useTranslation.js";
import { Languages } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="lang-selector">
      <div className="lang-selector__icon">
        <Languages size={18} />
      </div>
      <div className="lang-selector__label">
        <span className="lang-selector__title">{t("settings.languageSectionTitle")}</span>
        <span className="lang-selector__subtitle">{t("settings.languageSectionSubtitle")}</span>
      </div>
      <div className="lang-selector__toggle">
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`lang-selector__btn${locale === "en" ? " lang-selector__btn--active" : ""}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLocale("es")}
          className={`lang-selector__btn${locale === "es" ? " lang-selector__btn--active" : ""}`}
        >
          ES
        </button>
      </div>
    </div>
  );
}

export function LanguagePill() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="lang-pill">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`lang-pill__btn${locale === "en" ? " lang-pill__btn--active" : ""}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("es")}
        className={`lang-pill__btn${locale === "es" ? " lang-pill__btn--active" : ""}`}
      >
        ES
      </button>
    </div>
  );
}
