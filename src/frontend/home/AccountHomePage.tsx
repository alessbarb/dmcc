import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogOut, Shield, Sword, Wrench } from "lucide-react";
import { fetchSession, logout } from "../shared/auth/authClient.js";
import type { AuthUser, PlatformRole } from "../shared/auth/authTypes.js";
import { PortalTopBar } from "../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../shared/components/RpgPortalBackground.js";

type PortalDefinition = {
  id: PlatformRole;
  title: string;
  description: string;
  destination: "/dm" | "/player" | "/admin";
  icon: typeof Shield;
};

const PORTALS: PortalDefinition[] = [
  {
    id: "dm",
    title: "Director de juego",
    description: "Prepara, organiza y dirige todas tus campañas desde un único espacio.",
    destination: "/dm",
    icon: Shield,
  },
  {
    id: "player",
    title: "Jugador",
    description: "Consulta tus campañas, personajes, objetivos, recuerdos y mensajes.",
    destination: "/player",
    icon: Sword,
  },
  {
    id: "admin",
    title: "Administración",
    description: "Gestiona usuarios, campañas y operaciones de la plataforma.",
    destination: "/admin",
    icon: Wrench,
  },
];

export function AccountHomePage() {
  const navigate = useNavigate();
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
    <div className="smart-landing" style={{ minHeight: "100vh" }}>
      <div className="smart-landing__background" aria-hidden="true"><RpgPortalBackground /></div>
      <div className="smart-landing__glow" aria-hidden="true" />
      <PortalTopBar />
      <main className="smart-landing__main">
        <section className="smart-landing__hero" aria-labelledby="account-home-title">
          <span className="landing-badge smart-landing__badge">Cuenta DMCC</span>
          <h1 id="account-home-title" className="landing-hero__title smart-landing__title gold-gradient-text">
            {user ? `Hola, ${user.displayName ?? user.email ?? "aventurero"}` : "Tus portales"}
          </h1>
          <p className="landing-hero__subtitle smart-landing__subtitle">
            Elige el contexto en el que quieres trabajar. Tu cuenta y tu sesión son siempre las mismas.
          </p>

          {error && <div className="join-portal-error"><p role="alert">{error}</p></div>}
          {!user && !error && <div className="smart-landing-loading"><div className="loading-spinner-glow" /><span>Cargando cuenta…</span></div>}

          {user && (
            <div className="smart-landing__grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {availablePortals.map((portal) => {
                const Icon = portal.icon;
                return (
                  <section key={portal.id} className={`smart-column-wrapper ${portal.id === "player" ? "player-theme" : "dm-theme"}`}>
                    <div className="column-header">
                      <Icon className="column-icon" size={22} />
                      <h2>{portal.title}</h2>
                    </div>
                    <div className="glass-card">
                      <div className="card-body">
                        <p className="card-desc">{portal.description}</p>
                        <button type="button" className="btn btn-primary btn-full" onClick={() => void navigate({ to: portal.destination })}>
                          Entrar <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}

              {playerUnavailable && (
                <section className="smart-column-wrapper player-theme">
                  <div className="column-header"><Sword className="column-icon" size={22} /><h2>Jugador</h2></div>
                  <div className="glass-card">
                    <div className="card-body">
                      <p className="card-desc">El acceso de jugador se obtiene mediante una invitación a campaña.</p>
                      <button type="button" className="btn btn-secondary btn-full" onClick={() => void navigate({ to: "/player/join" })}>
                        Introducir invitación <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={() => void navigate({ to: "/account" })}>Gestionar cuenta</button>
            <button type="button" className="btn btn-secondary" onClick={() => void logout().then(() => window.location.assign("/"))}>
              <LogOut size={15} /> Cerrar sesión
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
