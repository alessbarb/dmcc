import React from "react";
import { SUPPORTED_LOCALES } from "@shared/i18n/index.js";
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
        {SUPPORTED_LOCALES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLocale(item.code)}
            className={`lang-selector__btn${locale === item.code ? " lang-selector__btn--active" : ""}`}
            aria-pressed={locale === item.code}
            title={item.nativeLabel}
          >
            {item.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LanguagePill() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="lang-pill">
      {SUPPORTED_LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          className={`lang-pill__btn${locale === item.code ? " lang-pill__btn--active" : ""}`}
          aria-pressed={locale === item.code}
          title={item.nativeLabel}
        >
          {item.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
