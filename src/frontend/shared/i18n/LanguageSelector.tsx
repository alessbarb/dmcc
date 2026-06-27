import React from "react";
import { useTranslation } from "./useTranslation.js";
import { Languages } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
      <Languages className="w-5 h-5 text-indigo-400" />
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200">{t("settings.languageSectionTitle")}</div>
        <div className="text-xs text-slate-400">{t("settings.languageSectionSubtitle")}</div>
      </div>
      <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700/60">
        <button
          type="button"
          onClick={() => setLocale("es")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            locale === "es"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          {t("settings.languageEs")}
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            locale === "en"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          {t("settings.languageEn")}
        </button>
      </div>
    </div>
  );
}
