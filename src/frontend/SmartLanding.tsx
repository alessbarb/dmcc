import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Sword } from "lucide-react";
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-muted)" }}>
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
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--bg-main)", overflowX: "hidden" }}>

      {/* Fixed background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.6 }}>
        <RpgPortalBackground />
      </div>
      <div className="join-portal-radial-glow" style={{ position: "fixed", zIndex: 1, pointerEvents: "none" }} />

      <PortalTopBar />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "calc(100vh - 57px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px 80px",
          textAlign: "center",
        }}
      >
        <span className="landing-badge" style={{ marginBottom: "20px" }}>
          {t("landing.badge")}
        </span>

        <h1 className="landing-hero__title" style={{ textAlign: "center" }}>
          {t("landing.title1")}{" "}
          <span>{t("landing.title2")}</span>
        </h1>

        <p className="landing-hero__subtitle" style={{ textAlign: "center", margin: "16px auto 0", maxWidth: "480px" }}>
          {t("landing.subtitle")}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
            marginTop: "52px",
            width: "100%",
            maxWidth: "740px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: "1 1 300px", maxWidth: "360px", minWidth: "260px" }}>
            <DmRoleCard label={dmCtaLabel} title={t("landing.dmTitle")} desc={t("landing.dmDesc")} onNavigate={handleDmNavigate} />
            {hasDm && (
              <button
                type="button"
                onClick={() => void handleDmSignOut()}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.78rem", padding: "4px 8px", opacity: 0.7, textDecoration: "underline", textDecorationStyle: "dotted" }}
              >
                {t("landing.dmSignOut")}
              </button>
            )}
          </div>
          <PlayerRoleCard title={t("landing.playerTitle")} desc={t("landing.playerDesc")} cta={t("landing.playerCta")} onNavigate={() => navigate({ to: "/player/join" })} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "20px 24px 32px", color: "var(--text-muted)", fontSize: "0.72rem", letterSpacing: "0.04em", opacity: 0.55 }}>
        {t("landing.footer")}
      </footer>
    </div>
  );
}

/* ── DM Role Card ─────────────────────────────────────────── */

function DmRoleCard({ label, title, desc, onNavigate }: { label: string; title: string; desc: string; onNavigate: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => e.key === "Enter" && onNavigate()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 300px",
        maxWidth: "360px",
        minWidth: "260px",
        background: "rgba(8, 11, 20, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: hovered ? "1px solid hsla(255,85%,65%,0.35)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: "var(--radius-lg)",
        padding: "32px 28px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        textAlign: "center",
        transition: "border-color 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: hovered ? "0 0 30px hsla(255,85%,65%,0.25), 0 20px 40px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.35)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        outline: "none",
      }}
    >
      <div
        className="join-portal-icon-wrapper"
        style={{
          width: "68px",
          height: "68px",
          borderRadius: "50%",
          background: hovered ? "hsla(255,85%,65%,0.14)" : "rgba(255,255,255,0.04)",
          border: hovered ? "1px solid hsla(255,85%,65%,0.4)" : "1px solid rgba(255,255,255,0.1)",
          marginBottom: "4px",
          position: "relative",
        }}
      >
        <Shield size={28} className="join-portal-icon" style={{ color: "var(--primary)", filter: "drop-shadow(0 0 10px hsla(255,85%,65%,0.6))" }} />
        <div className="join-portal-icon-glow" style={{ background: "radial-gradient(circle, hsla(255,85%,65%,0.35) 0%, transparent 70%)", opacity: hovered ? 1 : 0.6 }} />
      </div>

      <div>
        <div style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "var(--text-main)", marginBottom: "6px" }}>{title}</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "240px" }}>{desc}</div>
      </div>

      <button
        tabIndex={-1}
        style={{
          width: "100%",
          padding: "11px 20px",
          marginTop: "4px",
          fontWeight: 700,
          fontSize: "0.9rem",
          letterSpacing: "-0.01em",
          borderRadius: "var(--radius-md)",
          background: "linear-gradient(135deg, var(--primary), hsla(255,85%,72%,1))",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: hovered ? "0 6px 20px hsla(255,85%,65%,0.45)" : "0 4px 12px hsla(255,85%,65%,0.25)",
          transition: "box-shadow 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        <Shield size={15} />
        {label}
      </button>
    </div>
  );
}

/* ── Player Role Card ─────────────────────────────────────── */

function PlayerRoleCard({ title, desc, cta, onNavigate }: { title: string; desc: string; cta: string; onNavigate: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => e.key === "Enter" && onNavigate()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 260px",
        maxWidth: "320px",
        minWidth: "240px",
        background: "rgba(8, 11, 20, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: hovered ? "1px solid hsla(175,85%,45%,0.4)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: "var(--radius-lg)",
        padding: "32px 28px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        textAlign: "center",
        transition: "border-color 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: hovered ? "0 0 30px hsla(175,85%,45%,0.2), 0 20px 40px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        outline: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "68px",
          height: "68px",
          borderRadius: "50%",
          background: hovered ? "hsla(175,85%,45%,0.14)" : "rgba(255,255,255,0.04)",
          border: hovered ? "1px solid hsla(175,85%,45%,0.4)" : "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "4px",
          transition: "background 0.25s, border-color 0.25s",
        }}
      >
        <Sword size={28} style={{ color: "var(--secondary)", filter: hovered ? "drop-shadow(0 0 12px hsla(175,85%,45%,0.7))" : "drop-shadow(0 0 6px hsla(175,85%,45%,0.4))", transition: "filter 0.25s", zIndex: 2, position: "relative" }} />
        <div style={{ position: "absolute", inset: "-10px", borderRadius: "50%", background: "radial-gradient(circle, hsla(175,85%,45%,0.3) 0%, transparent 70%)", filter: "blur(4px)", zIndex: 1, animation: "iconPulse 3s ease-in-out infinite", opacity: hovered ? 1 : 0.55, transition: "opacity 0.25s" }} />
      </div>

      <div>
        <div style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "var(--text-main)", marginBottom: "6px" }}>{title}</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "220px" }}>{desc}</div>
      </div>

      <button
        tabIndex={-1}
        style={{
          width: "100%",
          padding: "11px 20px",
          marginTop: "4px",
          fontWeight: 700,
          fontSize: "0.9rem",
          letterSpacing: "-0.01em",
          borderRadius: "var(--radius-md)",
          background: hovered ? "hsla(175,85%,45%,0.12)" : "transparent",
          color: "var(--secondary)",
          border: "1.5px solid hsla(175,85%,45%,0.5)",
          cursor: "pointer",
          boxShadow: hovered ? "0 4px 16px hsla(175,85%,45%,0.2)" : "none",
          transition: "background 0.2s, box-shadow 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        <Sword size={15} />
        {cta}
      </button>
    </div>
  );
}

