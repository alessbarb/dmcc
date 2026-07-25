import { useState } from "react";
import { Clock, FileText, LayoutGrid, Map, MoreHorizontal, Plus, RotateCcw, Settings, Sparkles, Users } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export interface DmHubQuickActionsProps {
  onCreateCampaign: () => void;
  onCanvas: () => void;
  onNpcs: () => void;
  onFocusTemplates: () => void;
  onRules: () => void;
  onMap: () => void;
  onTimeline: () => void;
  onSettings: () => void;
  onRestoreBackup: () => void;
  onlySecondary?: boolean;
}

export function DmHubQuickActions({
  onCreateCampaign, onCanvas, onNpcs, onFocusTemplates, onRules, onMap, onTimeline, onSettings, onRestoreBackup, onlySecondary = false,
}: DmHubQuickActionsProps) {
  const { t } = useTranslation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primary = [
    { icon: <Plus size={16} />, label: t("landing.createCampaignLabel"), action: onCreateCampaign, primary: true },
    { icon: <LayoutGrid size={16} />, label: t("landing.quickActionCanvas"), action: onCanvas },
    { icon: <Users size={16} />, label: t("landing.quickActionNpcs"), action: onNpcs },
  ];
  const secondary = [
    { icon: <Sparkles size={16} />, label: t("landing.quickActionTemplates"), action: onFocusTemplates },
    { icon: <FileText size={16} />, label: t("landing.rulesLabel"), action: onRules },
    { icon: <Map size={16} />, label: t("landing.quickActionMap"), action: onMap },
    { icon: <Clock size={16} />, label: t("landing.timelineLabel"), action: onTimeline },
    { icon: <Settings size={16} />, label: t("landing.settingsLabel"), action: onSettings },
    { icon: <RotateCcw size={16} />, label: t("landing.quickActionRestore"), action: onRestoreBackup },
  ];

  return (
    <nav className="dm-hub-quick-actions" aria-label={t("landing.quickActionsTitle")} data-dm-hub-panel="quick-actions">
      {!onlySecondary && primary.map((item) => (
        <button key={item.label} type="button" className={`dm-hub-quick-actions__btn${item.primary ? " dm-hub-quick-actions__btn--primary" : ""}`} onClick={item.action}>
          {item.icon}<span>{item.label}</span>
        </button>
      ))}
      <div className="dm-hub-quick-actions__secondary">
        {secondary.map((item) => <button key={item.label} type="button" className="dm-hub-quick-actions__btn" onClick={item.action}>{item.icon}<span>{item.label}</span></button>)}
      </div>
      <div className="dm-hub-quick-actions__more">
        <button type="button" className="dm-hub-quick-actions__btn" onClick={() => setIsMoreOpen((open) => !open)} aria-expanded={isMoreOpen} aria-haspopup="menu">
          <MoreHorizontal size={16} /><span>{t("landing.moreActions")}</span>
        </button>
        {isMoreOpen && <div className="dm-hub-quick-actions__more-menu" role="menu">
          {secondary.map((item) => <button key={item.label} type="button" role="menuitem" className="dm-hub-quick-actions__more-item" onClick={() => { setIsMoreOpen(false); item.action(); }}>{item.icon}<span>{item.label}</span></button>)}
        </div>}
      </div>
    </nav>
  );
}
