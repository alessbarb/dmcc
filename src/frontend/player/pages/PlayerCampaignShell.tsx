import { useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Flag,
  FileText,
  Home,
  LogOut,
  MessageCircle,
  Network,
  Plus,
  Shield,
  User,
} from "lucide-react";
import type { TranslationKey } from "@shared/i18n/types.js";
import { logout } from "../../shared/auth/authClient.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { MobileDock } from "../../shared/components/MobileDock.js";
import { buildPlayerMobileDockItems, type PlayerDockTab } from "../navigation/playerMobileDockItems.js";
import { usePlayerCampaignHome, type PlayerCampaignTab } from "./PlayerCampaignTabContent.js";

const TABS: Array<{ id: PlayerCampaignTab; labelKey: TranslationKey; Icon: React.ComponentType<{ size?: number }> }> = [
  { id: "overview", labelKey: "playerPortal.tabs.home", Icon: Home },
  { id: "recap", labelKey: "playerPortal.tabs.recap", Icon: BookOpen },
  { id: "character", labelKey: "playerPortal.tabs.character", Icon: User },
  { id: "memory", labelKey: "playerPortal.tabs.memory", Icon: Shield },
  { id: "constellation", labelKey: "playerPortal.tabs.constellation", Icon: Network },
  { id: "objectives", labelKey: "playerPortal.tabs.objectives", Icon: Flag },
  { id: "notes", labelKey: "playerPortal.tabs.notes", Icon: FileText },
];

export function PlayerCampaignShell() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const { home } = usePlayerCampaignHome(campaignId);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeTab = TABS.find((tab) => pathname.endsWith(`/${tab.id}`))?.id ?? "overview";
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tabRefs = useRef<Record<PlayerCampaignTab, HTMLAnchorElement | null>>({
    overview: null, recap: null, character: null, memory: null, constellation: null, objectives: null, notes: null,
  });

  const handleNavigationError = (navigationError: unknown) => {
    console.error("Player campaign navigation failed", navigationError);
  };

  const title = home?.campaign?.title ?? t("playerPortal.campaignFallback");

  useEffect(() => {
    headingRef.current?.focus();
  }, [campaignId]);

  const changeTabFromKeyboard = (event: React.KeyboardEvent<HTMLAnchorElement>, currentTab: PlayerCampaignTab) => {
    const currentIndex = TABS.findIndex((item) => item.id === currentTab);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % TABS.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;
    else return;
    event.preventDefault();
    const nextTab = TABS[nextIndex].id;
    tabRefs.current[nextTab]?.focus();
    tabRefs.current[nextTab]?.click();
  };

  const playerDockItems = buildPlayerMobileDockItems({
    t,
    openTab: (tab: PlayerDockTab) => {
      void navigate({ to: `/player/campaigns/$campaignId/${tab}`, params: { campaignId } }).catch(handleNavigationError);
    },
    openMessages: () => {
      void navigate({ to: "/player/campaigns/$campaignId/messages", params: { campaignId } }).catch(handleNavigationError);
    },
  });

  return (
    <div className="player-portal-shell">
      <header className="player-portal-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void navigate({ to: "/player" }).catch(handleNavigationError)}>
          {t("playerPortal.actions.portal")}
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: "0 0 3px", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>{t("playerPortal.title")}</p>
          <h1 ref={headingRef} tabIndex={-1} style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
        </div>
        <Link
          to="/player/campaigns/$campaignId/messages"
          params={{ campaignId }}
          className="btn btn-primary btn-sm player-portal-header__messages"
        >
          <MessageCircle size={15} /> {t("playerPortal.messaging.heading")}
        </Link>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void navigate({ to: "/player/join" }).catch(handleNavigationError)}>
          <Plus size={15} /> {t("playerPortal.actions.join")}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
          void logout()
            .then(() => window.location.assign("/"))
            .catch((logoutError: unknown) => console.error("Player logout failed", logoutError));
        }}>
          <LogOut size={15} /> {t("playerPortal.actions.signOut")}
        </button>
      </header>

      <div className="player-portal-nav" role="tablist" aria-label={t("playerPortal.tabs.ariaLabel")}>
        {TABS.map(({ id, labelKey, Icon }) => (
          <Link
            key={id}
            ref={(element) => { tabRefs.current[id] = element; }}
            to={`/player/campaigns/$campaignId/${id}`}
            params={{ campaignId }}
            className={`player-portal-nav__item ${activeTab === id ? "active" : ""}`}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`player-portal-panel-${id}`}
            id={`player-portal-tab-${id}`}
            tabIndex={0}
            onKeyDown={(event) => changeTabFromKeyboard(event, id)}
          >
            <Icon size={16} /> {t(labelKey)}
          </Link>
        ))}
      </div>

      <main className="player-portal-main" aria-labelledby={`player-portal-tab-${activeTab}`}>
        <section role="tabpanel" id={`player-portal-panel-${activeTab}`} aria-labelledby={`player-portal-tab-${activeTab}`} tabIndex={0}>
          <Outlet />
        </section>
      </main>
      <MobileDock
        items={playerDockItems}
        ariaLabel={t("playerPortal.tabs.ariaLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("playerPortal.title")}
        closeLabel={t("common.close")}
      />
    </div>
  );
}
