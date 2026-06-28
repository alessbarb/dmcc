import React, { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Sword, type LucideIcon } from "lucide-react";
import { fetchAuthStatus, lockDm } from "./shared/auth/authClient.js";
import { readIdentity } from "./shared/auth/localIdentity.js";
import { getDmSessionToken } from "./shared/auth/sessionCreds.js";
import type { AuthStatus } from "./shared/auth/authTypes.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "./shared/components/PortalTopBar.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";

export function SmartLanding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasDmSession, setHasDmSession] = useState(false);

  useEffect(() => {
    const init = async () => {
      readIdentity(); // ensure identity is initialized

      try {
        const authStatus = await fetchAuthStatus();
        setStatus(authStatus);

        const existingToken = getDmSessionToken();
        setHasDmSession(!!existingToken && authStatus.dmSessionValid);
      } catch {
        // Server unreachable — show landing anyway
      }

      setLoading(false);
    };

    void init();
  }, []);

  if (loading) {
    return (
      <div className="smart-landing-loading">
        {t("common.loading")}
      </div>
    );
  }

  const hasDm = hasDmSession;

  const handleDmNavigate = () => {
    if (hasDm) {
      navigate({ to: "/dm" });
    } else if (status?.dmPinConfigured) {
      navigate({ to: "/dm/unlock" });
    } else if (status?.localRequest) {
      navigate({ to: "/dm" });
    } else {
      navigate({ to: "/dm/setup" });
    }
  };

  const dmCtaLabel = hasDm
    ? t("landing.dmCtaOpen")
    : status?.dmPinConfigured
      ? t("landing.dmCtaUnlock")
      : t("landing.dmCtaSetup");

  const handleDmSignOut = async () => {
    await lockDm();
    setHasDmSession(false);
  };

  return (
    <div className="smart-landing">
      <div className="smart-landing__background" aria-hidden="true">
        <RpgPortalBackground />
      </div>

      <div className="smart-landing__glow" aria-hidden="true" />

      <PortalTopBar />

      <main className="smart-landing__main">
        <section className="smart-landing__hero" aria-labelledby="landing-title">
          <span className="landing-badge smart-landing__badge">
            {t("landing.badge")}
          </span>

          <h1 id="landing-title" className="landing-hero__title smart-landing__title">
            {t("landing.title1")}{" "}
            <span>{t("landing.title2")}</span>
          </h1>

          <p className="landing-hero__subtitle smart-landing__subtitle">
            {t("landing.subtitle")}
          </p>

          <div className="smart-landing__roles">
            <div className="smart-landing__dm-stack">
              <RoleCard
                variant="dm"
                icon={Shield}
                title={t("landing.dmTitle")}
                desc={t("landing.dmDesc")}
                cta={dmCtaLabel}
                onNavigate={handleDmNavigate}
              />

              {hasDm && (
                <button
                  type="button"
                  onClick={() => void handleDmSignOut()}
                  className="smart-landing__sign-out"
                >
                  {t("landing.dmSignOut")}
                </button>
              )}
            </div>

            <RoleCard
              variant="player"
              icon={Sword}
              title={t("landing.playerTitle")}
              desc={t("landing.playerDesc")}
              cta={t("landing.playerCta")}
              onNavigate={() => navigate({ to: "/player/join" })}
            />
          </div>
        </section>

        <footer className="smart-landing__footer">
          {t("landing.footer")}
        </footer>
      </main>
    </div>
  );
}

type RoleCardVariant = "dm" | "player";

interface RoleCardProps {
  variant: RoleCardVariant;
  icon: LucideIcon;
  title: string;
  desc: string;
  cta: string;
  onNavigate: () => void;
}

function RoleCard({ variant, icon: Icon, title, desc, cta, onNavigate }: RoleCardProps) {
  const [hovered, setHovered] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onNavigate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`smart-role-card smart-role-card--${variant}${hovered ? " smart-role-card--hovered" : ""}`}
    >
      <div className="smart-role-card__icon-wrapper">
        <Icon size={28} className="smart-role-card__icon" />
        <div className="smart-role-card__icon-glow" />
      </div>

      <div className="smart-role-card__copy">
        <h2 className="smart-role-card__title">
          {title}
        </h2>

        <p className="smart-role-card__desc">
          {desc}
        </p>
      </div>

      <button
        type="button"
        tabIndex={-1}
        className="smart-role-card__cta"
      >
        <Icon size={15} />
        {cta}
      </button>
    </div>
  );
}