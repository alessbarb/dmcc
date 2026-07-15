import React, { useEffect, useRef, useState } from "react";
import {
  Book,
  Footprints,
  HelpCircle,
  Info,
  Package,
  Search,
  Shield,
  Sparkles,
  Swords,
  Wand,
} from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { apiFetch, readApiError } from "../../shared/api/apiClient.js";
import { RULE_CATEGORY_IDS } from "@shared/rules/categories.js";
import "./rulesPage.css";

interface RuleEntry {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  content: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  [RULE_CATEGORY_IDS.gameplay]: <Footprints size={16} />,
  [RULE_CATEGORY_IDS.characterCreation]: <Book size={16} />,
  [RULE_CATEGORY_IDS.classes]: <Shield size={16} />,
  [RULE_CATEGORY_IDS.origins]: <Sparkles size={16} />,
  [RULE_CATEGORY_IDS.feats]: <Sparkles size={16} />,
  [RULE_CATEGORY_IDS.equipment]: <Package size={16} />,
  [RULE_CATEGORY_IDS.spellcasting]: <Wand size={16} />,
  [RULE_CATEGORY_IDS.spells]: <Wand size={16} />,
  [RULE_CATEGORY_IDS.glossary]: <HelpCircle size={16} />,
  [RULE_CATEGORY_IDS.toolbox]: <Package size={16} />,
  [RULE_CATEGORY_IDS.magicItems]: <Sparkles size={16} />,
  [RULE_CATEGORY_IDS.monsters]: <Swords size={16} />,
  [RULE_CATEGORY_IDS.animalsAndBeasts]: <Swords size={16} />,
};

export function RulesPage() {
  const { t } = useTranslation();
  const initialParameters = useRef(new URLSearchParams(window.location.search));
  const targetRuleId = initialParameters.current.get("ruleId");
  const requestedCategory = initialParameters.current.get("category");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    requestedCategory || RULE_CATEGORY_IDS.glossary,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [rules, setRules] = useState<RuleEntry[]>([]);
  const [selectedRule, setSelectedRule] = useState<RuleEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await apiFetch("/api/rules/categories", {
          init: { signal: controller.signal },
        });
        if (!response.ok) throw new Error(await readApiError(response, "Unable to load rule categories"));
        const data = await response.json();
        if (controller.signal.aborted) return;
        const nextCategories = Array.isArray(data.categories) ? data.categories : [];
        setCategories(nextCategories);
        setSelectedCategory((current) => {
          if (nextCategories.includes(current)) return current;
          if (nextCategories.includes(RULE_CATEGORY_IDS.glossary)) return RULE_CATEGORY_IDS.glossary;
          return nextCategories[0] ?? "";
        });
      } catch (loadError: any) {
        if (controller.signal.aborted || loadError?.name === "AbortError") return;
        setError(loadError?.message ?? String(loadError));
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        const parameters = new URLSearchParams();
        parameters.set("category", selectedCategory);
        if (searchQuery.trim()) parameters.set("q", searchQuery.trim());

        try {
          const response = await apiFetch(`/api/rules/search?${parameters.toString()}`, {
            init: { signal: controller.signal },
          });
          if (!response.ok) throw new Error(await readApiError(response, "Unable to search rules"));
          const data = await response.json();
          if (controller.signal.aborted) return;
          const nextRules: RuleEntry[] = Array.isArray(data.results) ? data.results : [];
          setRules(nextRules);
          setTotalCount(Number(data.total ?? nextRules.length));
          setSelectedRule((current) => {
            const contextualRule = targetRuleId
              ? nextRules.find((rule) => rule.id === targetRuleId)
              : null;
            if (contextualRule) return contextualRule;
            const retainedRule = current
              ? nextRules.find((rule) => rule.id === current.id)
              : null;
            return retainedRule ?? nextRules[0] ?? null;
          });
        } catch (searchError: any) {
          if (controller.signal.aborted || searchError?.name === "AbortError") return;
          setError(searchError?.message ?? String(searchError));
          setRules([]);
          setSelectedRule(null);
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      })();
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, selectedCategory, targetRuleId]);

  useEffect(() => {
    if (!targetRuleId || selectedRule?.id !== targetRuleId) return;
    window.history.replaceState(null, "", window.location.pathname);
  }, [selectedRule, targetRuleId]);

  return (
    <div className="rules-page">
      <div className="rules-layout">
        <aside className="rules-sidebar card" aria-label={t("rules.category")}>
          <label htmlFor="rules-search" className="rules-page__field">
            <span className="form-label">{t("rules.searchInRules")}</span>
            <span className="rules-page__search">
              <Search size={16} aria-hidden="true" />
              <input
                id="rules-search"
                type="search"
                className="form-input"
                placeholder={t("rules.searchInRules")}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </span>
          </label>

          <label htmlFor="rules-category" className="rules-page__field">
            <span className="form-label">{t("rules.category")}</span>
            <select
              id="rules-category"
              className="form-select"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <div className="rules-list" role="listbox" aria-label={t("rules.selectRule")}>
            {loading ? (
              <div className="rules-page__list-state" aria-live="polite">
                {t("rules.loadingRules")}
              </div>
            ) : rules.length === 0 ? (
              <div className="rules-page__list-state">{t("rules.noMatches")}</div>
            ) : (
              rules.map((rule) => {
                const active = selectedRule?.id === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => setSelectedRule(rule)}
                    className="rules-list__item"
                  >
                    <span className="rules-page__item-title">
                      {CATEGORY_ICONS[rule.category] || <Book size={14} />}
                      {rule.title}
                    </span>
                    {rule.subtitle && (
                      <span className="rules-page__item-subtitle">{rule.subtitle}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="rules-page__count" aria-live="polite">
            {t("rules.entriesInCategory", { count: totalCount })}
          </div>
        </aside>

        <main className="rules-detail card" tabIndex={-1}>
          {error && <p role="alert" className="rules-page__error">{error}</p>}
          {selectedRule ? (
            <article className="rules-page__article" aria-labelledby="selected-rule-title">
              <header className="rules-page__article-header">
                <span className="rules-page__category">
                  {CATEGORY_ICONS[selectedRule.category] || <Book size={12} />}
                  {selectedRule.category}
                </span>
                <h2 id="selected-rule-title">{selectedRule.title}</h2>
                {selectedRule.subtitle && (
                  <p className="rules-page__subtitle">{selectedRule.subtitle}</p>
                )}
              </header>
              <div className="rules-page__content">{selectedRule.content}</div>
            </article>
          ) : (
            <div className="rules-detail__empty">
              <Info size={48} aria-hidden="true" />
              <div>{t("rules.selectRule")}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
