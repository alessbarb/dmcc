import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock, FolderOpen, Plus, RotateCcw, Search, Settings, Shield, Trash2, Users, X } from "lucide-react";
import { CampaignTemplateLibrarySection } from "./CampaignTemplateLibrarySection.js";
import { DmHubFeaturedCampaign } from "./DmHubFeaturedCampaign.js";
import { paginate } from "./dmHubPagination.js";
import { pageSizeByDensity, useDmHubDensity } from "./useDmHubDensity.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import type { CampaignTemplateSummary } from "../../shared/stores/campaignStore.js";
import type { DmHubCampaign } from "./dmHubTypes.js";

type CampaignTarget = { campaignId: string; title: string; summary?: string; system?: string; coverUrl?: string };

interface DmHubCampaignsColumnProps {
  campaigns: DmHubCampaign[];
  filteredCampaigns: DmHubCampaign[];
  campaignTemplates: CampaignTemplateSummary[];
  loading: boolean;
  error: string | null;
  refreshCampaigns: () => void;
  landingSearchQuery: string;
  setLandingSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  campaignFilter: string;
  setCampaignFilter: React.Dispatch<React.SetStateAction<string>>;
  triggerMysticalTransition: (campaignId: string) => void;
  openEditModal: (campaign: CampaignTarget) => void;
  openDeleteModal: (campaignId: string, title: string) => void;
  onCreateCampaign: () => void;
  onExploreTemplates: () => void;
  onRestoreBackup: () => void;
  navigateToActiveSession: (campaignId: string) => void;
  navigateToCampaignTemplate: (templateId: string) => void;
  importingTemplateId: string | null;
  onImportTemplate: (templateId: string) => void;
}

function formatCampaignSystem(system?: string) {
  if (system === "dnd_5e") return "D&D 5e";
  if (system === "pathfinder_2e") return "Pathfinder 2e";
  if (system === "shadowdark") return "Shadowdark";
  return "Custom";
}

function selectFeaturedCampaign(campaigns: DmHubCampaign[]) {
  return [...campaigns].sort((left, right) => {
    const activeDelta = Number(Boolean(right.stats?.activeSession) || right.status === "active") - Number(Boolean(left.stats?.activeSession) || left.status === "active");
    if (activeDelta !== 0) return activeDelta;
    return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
  })[0] ?? null;
}

export function DmHubCampaignsColumn({
  campaigns, filteredCampaigns, campaignTemplates, loading, error, refreshCampaigns, landingSearchQuery,
  setLandingSearchQuery, campaignFilter, setCampaignFilter, triggerMysticalTransition, openEditModal, openDeleteModal,
  onCreateCampaign, onExploreTemplates, onRestoreBackup, navigateToCampaignTemplate, importingTemplateId, onImportTemplate,
  navigateToActiveSession,
}: DmHubCampaignsColumnProps) {
  const { t } = useTranslation();
  const density = useDmHubDensity();
  const [page, setPage] = useState(0);
  const featuredCampaign = landingSearchQuery.trim() || campaignFilter !== "all" ? null : selectFeaturedCampaign(campaigns);
  const listCampaigns = featuredCampaign ? filteredCampaigns.filter((campaign) => campaign.campaignId !== featuredCampaign.campaignId) : filteredCampaigns;
  const { pageItems, pageCount, clampedPage } = paginate(listCampaigns, page, pageSizeByDensity[density]);

  useEffect(() => setPage(0), [landingSearchQuery, campaignFilter]);

  return (
    <section id="dm-campaigns-section" className="dm-panel dm-panel--campaigns dm-panel--ornamented-standard" data-dm-hub-panel="campaigns">
      <div className="dm-panel__header dm-panel__header--campaigns">
        <div className="dm-panel__title-group"><FolderOpen size={17} className="dm-hub-campaigns__icon" /><h2 className="dm-panel__title">{t("landing.campaignsSectionTitle")} <span className="dm-panel__count">({campaigns.length})</span></h2><button type="button" className="dm-campaigns-create-btn" onClick={onCreateCampaign} aria-label={t("landing.createCampaignLabel")} title={t("landing.createCampaignLabel")}><Plus size={14} /></button></div>
        <div className="dm-panel__controls">
          <div className="dm-search-wrapper"><Search size={13} className="dm-search-icon" /><input type="text" className="dm-search-input" placeholder={t("landing.searchCampaignPlaceholder")} value={landingSearchQuery} onChange={(e) => setLandingSearchQuery(e.target.value)} />{landingSearchQuery && <button type="button" className="dm-search-clear" onClick={() => setLandingSearchQuery("")} aria-label={t("landing.clearSearch")}><X size={11} /></button>}</div>
          <select className="dm-filter-select" value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)} aria-label={t("landing.campaignFilterLabel")}>
            <option value="all">{t("landing.filterAll")}</option><option value="active">{t("landing.filterActive")}</option><option value="paused">{t("landing.filterPaused")}</option>
          </select>
        </div>
      </div>

      {loading ? <p className="dm-muted-text">{t("landing.loadingCampaigns")}</p> : error ? (
        <div className="dm-empty-state dm-empty-state--error"><AlertTriangle size={22} className="icon-critical" /><p>{t("landing.errorTitle")}</p><span>{error}</span><button className="btn btn-secondary btn-sm" type="button" onClick={refreshCampaigns}>{t("landing.retryButton")}</button></div>
      ) : campaigns.length === 0 ? (
        <div className="dm-empty-state empty-state--ornamented"><Shield size={32} className="dm-empty-state__icon" /><p className="dm-empty-state__title">{t("landing.noCampaignsYet")}</p><span className="dm-empty-state__description">{t("landing.noCampaignsDescription")}</span><div className="dm-empty-state__actions"><button className="btn btn-gold btn-sm" type="button" onClick={onCreateCampaign}><Plus size={14} /> {t("landing.createCampaignLabel")}</button><button className="btn btn-secondary btn-sm" type="button" onClick={onExploreTemplates}>{t("landing.exploreTemplates")}</button><button className="btn btn-secondary btn-sm" type="button" onClick={onRestoreBackup}><RotateCcw size={14} /> {t("landing.restoreBackup")}</button></div></div>
      ) : (
        <>
          {featuredCampaign && <DmHubFeaturedCampaign campaign={featuredCampaign} onOpen={() => triggerMysticalTransition(featuredCampaign.campaignId)} onPrepare={() => navigateToActiveSession(featuredCampaign.campaignId)} />}
          <div className="dm-campaigns-list" data-dm-hub-panel="campaigns-list">
            {pageItems.map((c) => {
              const isActive = Boolean(c.stats?.activeSession) || c.status === "active";
              const lastUpdated = c.updatedAt ? t("landing.daysAgo", { count: String(Math.max(1, Math.floor((Date.now() - new Date(c.updatedAt).getTime()) / 86400000))) }) : t("landing.noActivityRecorded");
              return <div key={c.campaignId} className="dm-campaign-row">
                <div className="dm-campaign-row__cover" style={{ backgroundImage: `url(${c.coverUrl || "/assets/campaigns/default-campaign-cover.jpg"})` }} aria-hidden="true" />
                <button type="button" className="dm-campaign-row__main" onClick={() => triggerMysticalTransition(c.campaignId)}><span className="dm-campaign-row__title">{c.title}</span>{c.summary && <span className="dm-campaign-row__narrative">{c.summary}</span>}<span className="dm-campaign-row__meta">{formatCampaignSystem(c.system)} · {lastUpdated}</span><span className="dm-campaign-row__stats"><Users size={11} /> {c.stats?.playersCount ?? 0} · <Clock size={11} /> {c.stats?.sessionsCount ?? 0}</span></button>
                <span className={`dm-badge dm-badge--${isActive ? "active" : "paused"}`}>{isActive ? t("landing.statusActive") : t("landing.statusPaused")}</span>
                <div className="dm-campaign-row__actions"><button type="button" className="dm-campaign-row__action" onClick={() => openEditModal(c)} aria-label={t("campaignExtra.edit")}><Settings size={13} /></button><button type="button" className="dm-campaign-row__action dm-campaign-row__action--danger" onClick={() => openDeleteModal(c.campaignId, c.title)} aria-label={t("campaignExtra.delete")}><Trash2 size={13} /></button></div>
              </div>;
            })}
          </div>
          {pageCount > 1 && <div className="dm-hub-pagination"><button type="button" aria-label={t("landing.previousPage")} disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>‹</button><span>{t("landing.pageIndicator", { current: String(clampedPage + 1), total: String(pageCount) })}</span><button type="button" aria-label={t("landing.nextPage")} disabled={clampedPage === pageCount - 1} onClick={() => setPage((p) => p + 1)}>›</button></div>}
        </>
      )}
      <CampaignTemplateLibrarySection templates={campaignTemplates} campaigns={campaigns} loading={loading} importingTemplateId={importingTemplateId} t={t} onExplore={navigateToCampaignTemplate} onImport={onImportTemplate} compact pageSize={pageSizeByDensity[density]} />
    </section>
  );
}
