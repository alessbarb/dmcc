import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Shield,
  Layers,
  Network,
  Database,
  Lock,
  LayoutGrid,
  Users,
  Map,
  Clock,
  ChevronDown,
  Eye,
  EyeOff,
  Scroll,
  Wifi,
} from "lucide-react";
import { fetchAuthStatus } from "./shared/auth/authClient.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { SiteFooter } from "./institutional/SiteFooter.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";

// ─── App Preview Mock ────────────────────────────────────────────────────────

function AppPreviewMock() {
  return (
    <div className="rl-preview-frame" aria-hidden="true">
      <div className="rl-preview-sidebar">
        <div className="rl-preview-sidebar__logo">⚔</div>
        <div className="rl-preview-sidebar__nav">
          <div className="rl-preview-sidebar__item rl-preview-sidebar__item--active"><LayoutGrid size={13} /></div>
          <div className="rl-preview-sidebar__item"><Users size={13} /></div>
          <div className="rl-preview-sidebar__item"><Map size={13} /></div>
          <div className="rl-preview-sidebar__item"><Clock size={13} /></div>
          <div className="rl-preview-sidebar__item"><Layers size={13} /></div>
        </div>
      </div>
      <div className="rl-preview-main">
        <div className="rl-preview-topbar">
          <span className="rl-preview-topbar__title">Oracle: La Triple Eclipse</span>
          <div className="rl-preview-topbar__dots">
            <span className="rl-preview-dot rl-preview-dot--red" />
            <span className="rl-preview-dot rl-preview-dot--amber" />
            <span className="rl-preview-dot rl-preview-dot--green" />
          </div>
        </div>
        <div className="rl-preview-body">
          <div className="rl-preview-cover" style={{ backgroundImage: "url(/assets/campaigns/premade-oracle-triple-eclipse.jpg)" }}>
            <div className="rl-preview-cover__overlay" />
            <span className="rl-preview-cover__title">Oracle: La Triple Eclipse</span>
            <span className="rl-preview-cover__badge"><span className="rl-preview-pulse" />Sesión activa</span>
          </div>
          <div className="rl-preview-stats">
            <div className="rl-preview-stat"><Users size={10} /><strong>109</strong><small>entidades</small></div>
            <div className="rl-preview-stat"><Network size={10} /><strong>228</strong><small>relaciones</small></div>
            <div className="rl-preview-stat"><Database size={10} /><strong>25</strong><small>hechos</small></div>
          </div>
          <div className="rl-preview-tags">
            <span className="rl-preview-tag rl-preview-tag--purple">Secreto oculto</span>
            <span className="rl-preview-tag rl-preview-tag--amber">Pista sin revelar</span>
            <span className="rl-preview-tag rl-preview-tag--blue">Facción activa</span>
            <span className="rl-preview-tag rl-preview-tag--green">Sesión preparada</span>
          </div>
          <div className="rl-preview-alert">
            <Shield size={10} />
            <span>Qué toca ahora: prepara la escena con las pistas pendientes</span>
          </div>
        </div>
      </div>
      <div className="rl-preview-fade" />
    </div>
  );
}

// ─── Feature Illustrations ───────────────────────────────────────────────────

function CanvasIllustration() {
  return (
    <div className="rl-illus rl-illus-canvas">
      <svg className="rl-illus-canvas__svg" viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="90" y1="80" x2="170" y2="130" stroke="hsl(38 66% 62% / 0.35)" strokeWidth="1.5" strokeDasharray="5 4"/>
        <line x1="250" y1="70" x2="170" y2="130" stroke="hsl(270 52% 70% / 0.35)" strokeWidth="1.5" strokeDasharray="5 4"/>
        <line x1="170" y1="130" x2="90" y2="200" stroke="hsl(158 52% 58% / 0.35)" strokeWidth="1.5" strokeDasharray="5 4"/>
        <line x1="170" y1="130" x2="270" y2="195" stroke="hsl(24 84% 65% / 0.35)" strokeWidth="1.5" strokeDasharray="5 4"/>
        <line x1="90" y1="200" x2="270" y2="195" stroke="hsl(38 66% 62% / 0.2)" strokeWidth="1" strokeDasharray="3 6"/>
        <text x="120" y="100" fill="hsl(32 12% 52%)" fontSize="9" fontFamily="system-ui">conoce</text>
        <text x="195" y="95" fill="hsl(32 12% 52%)" fontSize="9" fontFamily="system-ui">oculta</text>
        <text x="95" y="175" fill="hsl(32 12% 52%)" fontSize="9" fontFamily="system-ui">dirige</text>
        <text x="215" y="175" fill="hsl(32 12% 52%)" fontSize="9" fontFamily="system-ui">causa</text>
      </svg>
      <div className="rl-cn-node rl-cn-node--npc" style={{ top: '22%', left: '16%' }}>
        <Users size={11} /><span>Ragnar</span>
      </div>
      <div className="rl-cn-node rl-cn-node--secret" style={{ top: '16%', right: '14%' }}>
        <Lock size={11} /><span>El Pacto</span>
      </div>
      <div className="rl-cn-node rl-cn-node--faction" style={{ top: '42%', left: '42%' }}>
        <Shield size={11} /><span>El Gremio</span>
      </div>
      <div className="rl-cn-node rl-cn-node--location" style={{ bottom: '22%', left: '16%' }}>
        <Map size={11} /><span>Torre Norte</span>
      </div>
      <div className="rl-cn-node rl-cn-node--quest" style={{ bottom: '16%', right: '12%' }}>
        <Scroll size={11} /><span>La Herejía</span>
      </div>
    </div>
  );
}

function MemoryIllustration() {
  return (
    <div className="rl-illus rl-illus-memory">
      <div className="rl-mem-card rl-mem-card--canon">
        <div className="rl-mem-card__badge badge--canon">Canon</div>
        <p className="rl-mem-card__text">Ragnar fue expulsado del Gremio en el año 483.</p>
        <div className="rl-mem-card__meta"><Clock size={9} /> Sesión 3 · revelado</div>
      </div>
      <div className="rl-mem-card rl-mem-card--secret">
        <div className="rl-mem-card__badge badge--secret">Secreto DM</div>
        <p className="rl-mem-card__text">El grimorio está oculto en la Torre Norte, nivel 3.</p>
        <div className="rl-mem-card__meta"><EyeOff size={9} /> Solo visible para el DM</div>
      </div>
      <div className="rl-mem-card rl-mem-card--rumor">
        <div className="rl-mem-card__badge badge--rumor">Rumor</div>
        <p className="rl-mem-card__text">Se dice que el mercader vende mapas falsos.</p>
        <div className="rl-mem-card__meta"><Eye size={9} /> Fuente: PNJ Mira · no verificado</div>
      </div>
    </div>
  );
}

function LanIllustration() {
  return (
    <div className="rl-illus rl-illus-lan">
      <div className="rl-lan-dm">
        <div className="rl-lan-dm__icon"><Shield size={20} /></div>
        <span>DM</span>
        <div className="rl-lan-pulse" />
      </div>
      <div className="rl-lan-players">
        <div className="rl-lan-player rl-lan-player--connected">
          <div className="rl-lan-player__avatar">Z</div>
          <span>Zara</span>
          <div className="rl-lan-player__status status--online"><Wifi size={9} /></div>
        </div>
        <div className="rl-lan-player rl-lan-player--connected">
          <div className="rl-lan-player__avatar">B</div>
          <span>Borin</span>
          <div className="rl-lan-player__status status--online"><Wifi size={9} /></div>
        </div>
        <div className="rl-lan-player rl-lan-player--offline">
          <div className="rl-lan-player__avatar">L</div>
          <span>Lirael</span>
          <div className="rl-lan-player__status status--offline"><Wifi size={9} /></div>
        </div>
      </div>
      <div className="rl-lan-visibility">
        <div className="rl-lan-vis-row vis--visible">
          <Eye size={10} /><span>El Tabernero · PNJ</span>
        </div>
        <div className="rl-lan-vis-row vis--hidden">
          <EyeOff size={10} /><span>El Pacto · Secreto</span>
        </div>
        <div className="rl-lan-vis-row vis--visible">
          <Eye size={10} /><span>Misión Principal · Quest</span>
        </div>
        <div className="rl-lan-vis-row vis--hidden">
          <EyeOff size={10} /><span>Torre Norte · Ubicación</span>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Copy ───────────────────────────────────────────────────────────

const LANDING_COPY = {
  heroSubtitle:
    "Dirige campañas de rol sin perder personajes, pistas, secretos ni consecuencias. DMCC convierte tu campaña en una memoria viva.",
  heroPrimaryCta: "Ver campaña de ejemplo",
  heroSecondaryCta: "Crear mi campaña",
  heroFine: "Organización clara · Exportable · Sin suscripción obligatoria.",
  painTitle: "Dirigir una campaña no falla por falta de imaginación",
  painBody:
    "Falla cuando olvidas quién prometió qué, qué pista encontró el grupo, qué PNJ mentía, qué facción movía los hilos o qué secreto todavía no debía revelarse.",
  painAnswer: "DMCC guarda esa memoria por ti, para que puedas centrarte en dirigir.",
} as const;

// ─── Main Component ──────────────────────────────────────────────────────────

export function MainLanding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchAuthStatus()
      .then((status) => {
        if (status.sessionValid) void navigate({ to: "/portal" });
        else setReady(true);
      })
      .catch(() => setReady(true));
  }, [navigate]);

  useEffect(() => {
    if (!ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Number((entry.target as HTMLElement).dataset.delay ?? 0);
            const activate = () => entry.target.classList.add("rl-animate--visible");
            if (delay > 0) setTimeout(activate, delay);
            else activate();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".rl-animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);

  if (!ready) {
    return (
      <div className="smart-landing-loading">
        <div className="loading-spinner-glow" />
      </div>
    );
  }

  return (
    <div className="rl-root">

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="rl-nav">
        <div className="rl-nav__logo">
          <Shield size={16} />
          <span>DMCC</span>
        </div>
        <div className="rl-nav__actions">
          <button className="rl-nav__login" onClick={() => navigate({ to: "/login" })}>
            Iniciar sesión
          </button>
          <button className="btn btn-gold btn-sm" onClick={() => navigate({ to: "/register" })}>
            Empezar
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="rl-hero">
        <div className="rl-hero__bg" aria-hidden="true">
          <div className="rl-hero__scenic" />
          <RpgPortalBackground />
          <div className="rl-hero__spotlight" />
          <div className="rl-hero__bg-vignette" />
        </div>

        <div className="rl-hero__content">
          <h1 className="rl-hero__title">
            {t("landing.narrativeHeading")}
          </h1>

          <p className="rl-hero__subtitle">
            {LANDING_COPY.heroSubtitle}
          </p>

          <div className="rl-hero__ctas">
            <button
              className="rl-cta-primary"
              onClick={() =>
                navigate({
                  to: "/premades/$templateId",
                  params: { templateId: "oracle-triple-eclipse" },
                })
              }
            >
              <span className="rl-cta-primary__shimmer" />
              <span className="rl-cta-primary__text">{LANDING_COPY.heroPrimaryCta}</span>
            </button>
            <button className="rl-cta-secondary" onClick={() => navigate({ to: "/register" })}>
              {LANDING_COPY.heroSecondaryCta}
            </button>
          </div>

          <p className="rl-hero__fine">
            {LANDING_COPY.heroFine}
          </p>
        </div>

        <div className="rl-preview-wrapper">
          <AppPreviewMock />
        </div>

        <div className="rl-scroll-cue" aria-hidden="true">
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ── Pain ────────────────────────────────────────── */}
      <section className="rl-pain">
        <div className="rl-pain__inner">
          <h2 className="rl-pain__heading rl-animate rl-animate--from-bottom" data-delay="0">
            {LANDING_COPY.painTitle}
          </h2>
          <p className="rl-pain__body rl-animate rl-animate--from-bottom" data-delay="130">
            {LANDING_COPY.painBody}
          </p>
          <p className="rl-pain__answer rl-animate rl-animate--pop" data-delay="300">
            {LANDING_COPY.painAnswer}
          </p>
        </div>
      </section>

      {/* ── Audience ────────────────────────────────────── */}
      <section className="rl-audience">
        <div className="rl-audience__inner">
          <p className="rl-features__eyebrow rl-animate rl-animate--from-bottom" data-delay="0">
            Para campañas que crecen
          </p>
          <h2 className="rl-audience__heading rl-animate rl-animate--from-bottom" data-delay="120">
            Hecho para DMs que dirigen mundos vivos
          </h2>
          <p className="rl-audience__body rl-animate rl-animate--from-bottom" data-delay="240">
            DMCC está pensado para campañas largas, mesas sandbox y mundos donde la investigación,
            la política, las facciones, los misterios y las consecuencias se entrelazan sesión tras
            sesión. Mantén cada decisión conectada al mundo, recuerda qué cambió y deja que tus
            jugadores sientan que sus acciones importan.
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="rl-showcase">

        <div className="rl-showcase__header">
          <p className="rl-features__eyebrow rl-animate rl-animate--from-bottom" data-delay="0">Cómo funciona</p>
          <h2 className="rl-showcase__heading rl-animate rl-animate--from-bottom" data-delay="110">
            Todo lo que necesitas para dirigir, recordar y revelar
          </h2>
          <p className="rl-showcase__lead rl-animate rl-animate--from-bottom" data-delay="230">
            DMCC organiza la información de tu campaña como un mundo conectado.
            No es una libreta. No es una wiki. Es un centro de mando para Directores de Juego.
          </p>
        </div>

        {/* Block 1: Canvas */}
        <div className="rl-block">
          <div className="rl-block__text rl-animate rl-animate--from-left" data-delay="0">
            <div className="rl-feature-icon rl-feature-icon--purple"><Layers size={22} /></div>
            <h3 className="rl-block__title">Ve tu campaña como una red viva</h3>
            <p className="rl-block__desc">
              Conecta personajes, facciones, lugares, secretos y pistas en un mapa visual
              que evoluciona con cada sesión. Descubre relaciones ocultas, prepara escenas
              con contexto y mantén claro quién sabe qué y qué consecuencias siguen pendientes.
            </p>
          </div>
          <div className="rl-block__illus rl-animate rl-animate--from-right" data-delay="180">
            <CanvasIllustration />
          </div>
        </div>

        {/* Block 2: Memory */}
        <div className="rl-block rl-block--reversed">
          <div className="rl-block__illus rl-animate rl-animate--from-left" data-delay="180">
            <MemoryIllustration />
          </div>
          <div className="rl-block__text rl-animate rl-animate--from-right" data-delay="0">
            <div className="rl-feature-icon rl-feature-icon--gold"><Database size={22} /></div>
            <h3 className="rl-block__title">Nunca pierdas la memoria de tu mundo</h3>
            <p className="rl-block__desc">
              Cada hecho importante queda registrado: lo que es canon, lo que solo sabe el DM,
              lo que los jugadores creen, los rumores, las mentiras y las teorías.
              Cuando la campaña crece, DMCC te ayuda a recordar sin rebuscar entre notas dispersas.
            </p>
          </div>
        </div>

        {/* Block 3: Player Portal */}
        <div className="rl-block">
          <div className="rl-block__text rl-animate rl-animate--from-left" data-delay="0">
            <div className="rl-feature-icon rl-feature-icon--teal"><Network size={22} /></div>
            <h3 className="rl-block__title">Comparte solo lo que deben saber</h3>
            <p className="rl-block__desc">
              Da a tus jugadores acceso a un portal propio, filtrado por permisos.
              Tú decides qué información es pública, qué sigue oculta y qué detalles
              pertenecen solo al Director de Juego desde un enlace personal.
            </p>
          </div>
          <div className="rl-block__illus rl-animate rl-animate--from-right" data-delay="180">
            <LanIllustration />
          </div>
        </div>

      </section>

      {/* ── Ownership ───────────────────────────────────── */}
      <section className="rl-local">
        <div className="rl-local__inner">
          <div className="rl-local__icon rl-animate rl-animate--drop" data-delay="0" aria-hidden="true">
            <Lock size={28} />
          </div>
          <h2 className="rl-local__heading rl-animate rl-animate--from-bottom" data-delay="100">
            Tu campaña es tuya
          </h2>
          <p className="rl-local__body rl-animate rl-animate--from-bottom" data-delay="220">
            DMCC te ayuda a mantener el control narrativo de tu campaña: organiza memoria,
            permisos, portales y exportaciones sin convertir tu mesa en una herramienta cerrada.
            Dirige mundos largos con continuidad, claridad y una visión completa de lo que importa.
          </p>
          <div className="rl-local__pills" aria-hidden="true">
            <span className="rl-local__pill rl-animate rl-animate--pop" data-delay="340">Control narrativo</span>
            <span className="rl-local__pill rl-animate rl-animate--pop" data-delay="410">Sin límite artificial de campañas</span>
            <span className="rl-local__pill rl-animate rl-animate--pop" data-delay="480">Exportable en cualquier momento</span>
            <span className="rl-local__pill rl-animate rl-animate--pop" data-delay="550">Pensado para campañas largas</span>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="rl-final-cta">
        <div className="rl-final-cta__inner">
          <h2 className="rl-final-cta__heading rl-animate rl-animate--from-bottom" data-delay="0">
            Empieza tu primera campaña
          </h2>
          <p className="rl-final-cta__sub rl-animate rl-animate--from-bottom" data-delay="140">
            Crea tu mundo, importa una aventura preparada o empieza desde cero.
          </p>
          <div className="rl-final-cta__buttons rl-animate rl-animate--pop" data-delay="280">
            <button className="rl-cta-primary" onClick={() => navigate({ to: "/register" })}>
              <span className="rl-cta-primary__shimmer" />
              <span className="rl-cta-primary__text">Crear primera campaña</span>
            </button>
            <button className="rl-cta-secondary" onClick={() => navigate({ to: "/login" })}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <SiteFooter />

    </div>
  );
}
