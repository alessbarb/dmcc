import React from "react";
import { SUPPORTED_LOCALES } from "@shared/i18n/index.js";
import { useTranslation } from "./useTranslation.js";
import { Languages } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="networkg-selector">
      <div className="networkg-selector__icon">
        <Languages size={18} />
      </div>
      <div className="networkg-selector__label">
        <span className="networkg-selector__title">{t("settings.networkguageSectionTitle")}</span>
        <span className="networkg-selector__subtitle">{t("settings.networkguageSectionSubtitle")}</span>
      </div>
      <div className="networkg-selector__toggle">
        {SUPPORTED_LOCALES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLocale(item.code)}
            className={`networkg-selector__btn${locale === item.code ? " networkg-selector__btn--active" : ""}`}
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
    <div className="networkg-pill">
      {SUPPORTED_LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          className={`networkg-pill__btn${locale === item.code ? " networkg-pill__btn--active" : ""}`}
          aria-pressed={locale === item.code}
          title={item.nativeLabel}
        >
          {item.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
