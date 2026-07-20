import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogOut, Shield, Sword, Wrench } from "lucide-react";
import { fetchSession, logout } from "../shared/auth/authClient.js";
import type { AuthUser, PlatformRole } from "../shared/auth/authTypes.js";
import { PortalTopBar } from "../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../shared/components/RpgPortalBackground.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import type { TranslationKey } from "@shared/i18n/types.js";
import "../shared/styles/landing.css";

type PortalDefinition = {
  id: PlatformRole;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  destination: "/dm" | "/player" | "/admin";
  icon: typeof Shield;
};

const PORTALS: PortalDefinition[] = [
  { id: "dm", titleKey: "accountHome.dmTitle", descriptionKey: "accountHome.dmDescription", destination: "/dm", icon: Shield },
  { id: "player", titleKey: "accountHome.playerTitle", descriptionKey: "accountHome.playerDescription", destination: "/player", icon: Sword },
  { id: "admin", titleKey: "accountHome.adminTitle", descriptionKey: "accountHome.adminDescription", destination: "/admin", icon: Wrench },
];

export function AccountHomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSession()
      .then((session) => setUser(session.user))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)));
  }, []);

  const roles = user?.roles ?? [];
  const availablePortals = PORTALS.filter((portal) => roles.includes(portal.id));
  const playerUnavailable = user !== null && !roles.includes("player");

  return (
    <div className="smart-landing">
      <div className="smart-landing__background" aria-hidden="true"><RpgPortalBackground /></div>
      <div className="smart-landing__glow" aria-hidden="true" />
      <PortalTopBar />
      <main className="smart-landing__main">
        <section className="smart-landing__hero" aria-labelledby="account-home-title">
          <span className="landing-badge smart-landing__badge">DMCC</span>
          <h1 id="account-home-title" className="landing-hero__title smart-landing__title gold-gradient-text">
            {user ? t("accountHome.greeting", { name: user.displayName ?? user.email ?? "" }) : t("accountHome.title")}
          </h1>
          <p className="landing-hero__subtitle smart-landing__subtitle">
            {t("accountHome.subtitle")}
          </p>

          {error && <div className="join-portal-error"><p role="alert">{error}</p></div>}
          {!user && !error && <div className="smart-landing-loading"><div className="loading-spinner-glow" /><span>{t("accountHome.loading")}</span></div>}

          {user && (
            <div className="smart-landing__grid smart-landing__grid--portals">
              {availablePortals.map((portal) => {
                const Icon = portal.icon;
                return (
                  <section key={portal.id} className={`smart-column-wrapper ${portal.id === "player" ? "player-theme" : "dm-theme"}`}>
                    <div className="column-header">
                      <Icon className="column-icon" size={22} />
                      <h2>{t(portal.titleKey)}</h2>
                    </div>
                    <div className="glass-card">
                      <div className="card-body">
                        <p className="card-desc">{t(portal.descriptionKey)}</p>
                        <button type="button" className="btn btn-primary btn-full" onClick={() => void navigate({ to: portal.destination })}>
                          {t("accountHome.enterBtn")} <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}

              {playerUnavailable && (
                <section className="smart-column-wrapper player-theme">
                  <div className="column-header"><Sword className="column-icon" size={22} /><h2>{t("accountHome.playerTitle")}</h2></div>
                  <div className="glass-card">
                    <div className="card-body">
                      <p className="card-desc">{t("accountHome.playerUnavailableDescription")}</p>
                      <button type="button" className="btn btn-secondary btn-full" onClick={() => void navigate({ to: "/player/join" })}>
                        {t("accountHome.joinWithInviteBtn")} <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          <div className="account-home__actions">
            <button type="button" className="btn btn-secondary" onClick={() => void navigate({ to: "/account" })}>{t("accountHome.manageAccountBtn")}</button>
            <button type="button" className="btn btn-secondary" onClick={() => void logout().then(() => window.location.assign("/"))}>
              <LogOut size={15} /> {t("accountHome.signOutBtn")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
