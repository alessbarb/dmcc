import { ArrowUpRight, Eye, Sparkles } from "lucide-react";
import type { I18nContextType } from "../../shared/i18n/I18nContext.js";
import type { CampaignTemplateSummary } from "../../shared/stores/campaignStore.js";
import { markdownToPlainText } from "../../shared/utils/markdownText.js";
import "../../shared/styles/features/campaign-template.css";

interface CampaignTemplateLibrarySectionProps {
  templates: CampaignTemplateSummary[];
  campaigns: Array<{ metadata?: Record<string, unknown> }>;
  loading: boolean;
  importingTemplateId: string | null;
  t: I18nContextType["t"];
  onExplore: (templateId: string) => void;
  onImport: (templateId: string) => void;
  compact?: boolean;
  pageSize?: number;
}

export function CampaignTemplateLibrarySection({
  templates,
  campaigns,
  loading,
  importingTemplateId,
  t,
  onExplore,
  onImport,
  compact = false,
  pageSize,
}: CampaignTemplateLibrarySectionProps) {
  if (compact) {
    const visible = templates.slice(0, pageSize ?? 6);
    return (
      <div id="dm-hub-template-strip" tabIndex={-1} className="dm-hub-template-strip" data-dm-hub-panel="templates">
        <div className="dm-hub-template-strip__header"><Sparkles size={15} /><h3>{t("landing.templateStripTitle")}</h3></div>
        {templates.length === 0 ? <p className="dm-muted-text">{t("landing.campaignTemplateEmpty")}</p> : (
          <div className="dm-hub-template-strip__row" data-dm-hub-scroll="templates">
            {visible.map((template) => <button key={template.templateId} type="button" className="dm-hub-template-chip" onClick={() => onExplore(template.templateId)}><div className="dm-hub-template-chip__cover" style={{ backgroundImage: `url(${template.title.toLowerCase().includes("phandalin") ? "/assets/campaigns/premade-phandalin.jpg" : "/assets/campaigns/campaign-template-oracle.jpg"})` }} /><h4 className="dm-hub-template-chip__title">{template.title}</h4><span className="dm-hub-template-chip__difficulty">{template.difficulty}</span><span className="dm-hub-template-chip__action">{t("landing.campaignTemplateExploreButton")} <ArrowUpRight size={11} /></span></button>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <section id="campaign-template-library-section" className="dm-panel">
      <div className="dm-panel__header">
        <div className="dm-panel__title-group">
          <Sparkles size={17} className="dm-campaign-template-library__icon" />
          <h2 className="dm-panel__title">{t("landing.templateStripTitle")}</h2>
        </div>
      </div>
      <p className="dm-muted-text dm-campaign-template-library__description">
        {t("landing.campaignTemplateDescription")}
      </p>
      {templates.length === 0 ? (
        <p className="dm-muted-text">{t("landing.campaignTemplateEmpty")}</p>
      ) : (
        <div className="dm-campaign-templates-grid">
          {templates.map((template) => {
            const copies = campaigns.filter((campaign) => campaign.metadata?.createdFromTemplateId === template.templateId);
            return (
              <article key={template.templateId} className="dm-campaign-template-card">
                <div className="dm-campaign-template-card__header">
                  <div>
                    <h3 className="dm-campaign-template-card__title">{template.title}</h3>
                    <p className="dm-campaign-template-card__subtitle">{template.subtitle}</p>
                  </div>
                  <span className="dm-campaign-template-card__version">v{template.version}</span>
                </div>
                <p className="dm-campaign-template-card__desc">{markdownToPlainText(template.description)}</p>
                <div className="dm-campaign-template-card__meta">
                  <span>{t("landing.campaignTemplateDifficulty", { difficulty: template.difficulty })}</span>
                  {copies.length > 0 && (
                    <span className="dm-campaign-template-card__copies">
                      {t("landing.campaignTemplateExistingCopies", { count: String(copies.length) })}
                    </span>
                  )}
                  <span>{t("landing.campaignTemplateStats", {
                    entities: String(template.stats.entities),
                    sessions: String(template.stats.preparedSessions),
                  })}</span>
                </div>
                <div className="dm-campaign-template-card__tags">
                  {template.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="dm-tag">{tag}</span>
                  ))}
                </div>
                <div className="dm-campaign-template-card__actions">
                  <button
                    type="button"
                    onClick={() => onExplore(template.templateId)}
                    className="btn btn-secondary btn-sm dm-campaign-template-card__action"
                  >
                    <Eye size={12} />
                    {t("landing.campaignTemplateExploreButton")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onImport(template.templateId)}
                    disabled={loading || importingTemplateId === template.templateId}
                    className="btn btn-primary btn-sm dm-campaign-template-card__action"
                  >
                    {importingTemplateId === template.templateId ? "…" : t("landing.campaignTemplateImportButton")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
