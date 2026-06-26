import React, { useEffect, useState } from "react";
import { Outlet, useParams, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCampaignStore } from "./stores/campaignStore.js";
import { ToastContainer } from "./components/ToastContainer.js";
import { useToast } from "./hooks/useToast.js";
import { EntityCreateModal } from "./components/EntityCreateModal.js";
import { RelationCreateModal } from "./components/RelationCreateModal.js";
import { AppFooter } from "./components/AppFooter.js";
import {
  Shield,
  Activity,
  GitFork,
  List,
  Settings,
  Play,
  Search,
  User,
  Layers,
  BookOpen,
  ArrowLeft,
  Plus,
  MapPin,
  Flag,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type PageMeta = {
  title: string;
  eyebrow: string;
  description: string;
};

const PAGE_META: Record<string, PageMeta> = {
  canvas: {
    title: "Campaign Canvas",
    eyebrow: "Mesa visual de trabajo",
    description: "Dibuja tu aventura: coloca NPCs, lugares y pistas, y arrastra conexiones para tejer la trama.",
  },
  dashboard: {
    title: "Panel del DM",
    eyebrow: "Centro de mando",
    description: "Resumen operativo de la campaña, alertas y preparación de la próxima sesión.",
  },
  "what-now": {
    title: "¿Qué toca?",
    eyebrow: "Siguiente mejor acción",
    description: "Prioriza escenas, pistas, consecuencias y decisiones que necesitan atención.",
  },
  session: {
    title: "Sesión",
    eyebrow: "Mesa en curso",
    description: "Inicia, registra, revela pistas y cierra la sesión con trazabilidad.",
  },
  entities: {
    title: "Entidades narrativas",
    eyebrow: "Archivo vivo",
    description: "Personajes, lugares, pistas, secretos, misiones y piezas de campaña.",
  },
  graph: {
    title: "Grafo narrativo",
    eyebrow: "Relaciones y secretos",
    description: "Explora conexiones, visibilidad y cadenas narrativas entre nodos clave.",
  },
  timeline: {
    title: "Línea temporal",
    eyebrow: "Historial de campaña",
    description: "Audita eventos, sesiones, cambios y revelaciones en orden cronológico.",
  },
  boards: {
    title: "Tableros",
    eyebrow: "Seguimiento visual",
    description: "Organiza misiones, pistas, PNJs y frentes por estado narrativo.",
  },
  players: {
    title: "Jugadores y personajes",
    eyebrow: "Mesa y reparto",
    description: "Gestiona jugadores, personajes y acceso visible para la mesa.",
  },
  search: {
    title: "Búsqueda",
    eyebrow: "Consulta rápida",
    description: "Encuentra entidades, hechos y notas de campaña sin romper el ritmo.",
  },
  settings: {
    title: "Ajustes y exportación",
    eyebrow: "Administración",
    description: "Configura campaña, exportaciones, copias y opciones de acceso local.",
  },
};

export function CampaignShell() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const {
    selectCampaign,
    activeCampaignId,
    campaignState,
    isEntityModalOpen,
    setIsEntityModalOpen,
    isRelationModalOpen,
    setIsRelationModalOpen,
    startSession
  } = useCampaignStore();
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const role = sessionStorage.getItem("dmcc_role");

  useEffect(() => {
    if (role === "player") {
      navigate({ to: `/campaigns/${campaignId}/player-portal` });
    }
  }, [campaignId, role]);

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      selectCampaign(campaignId as any);
    }
  }, [campaignId]);

  const currentSegment = pathname.split("/")[3] ?? "";

  const NAV = [
    { path: "canvas", label: "Canvas", Icon: LayoutGrid },
    { path: "dashboard", label: "Panel del DM", Icon: Shield },
    { path: "what-now", label: "¿Qué toca?", Icon: BookOpen },
    { path: "session", label: "Sesión", Icon: Play },
    { path: "entities", label: "Entidades", Icon: Layers },
    { path: "graph", label: "Grafo", Icon: GitFork },
    { path: "timeline", label: "Línea temporal", Icon: List },
    { path: "boards", label: "Tableros", Icon: Activity },
    { path: "players", label: "Jugadores", Icon: User },
    { path: "search", label: "Búsqueda", Icon: Search },
    { path: "settings", label: "Ajustes", Icon: Settings },
  ];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("dmcc-sidebar-collapsed") === "1"
  );
  const toggleSidebar = () => {
    setSidebarCollapsed(v => {
      const next = !v;
      localStorage.setItem("dmcc-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const activeSession = campaignState?.sessions?.find(s => s.status === "active");

  const pageMeta = PAGE_META[currentSegment] ?? {
    title: currentSegment || "Campaña",
    eyebrow: "Archivo de campaña",
    description: "Gestiona la memoria narrativa y el estado actual de la campaña.",
  };

  const currentLocation = campaignState?.campaign?.currentLocationId
    ? campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentLocationId)
    : null;

  const currentQuest = campaignState?.campaign?.currentQuestId
    ? campaignState.entities.find(e => e.entityId === campaignState.campaign?.currentQuestId)
    : null;

  const handleNavClick = (path: string) => {
    navigate({ to: `/campaigns/${campaignId}/${path}` });
  };

  return (
    <div className={`app-container ${currentSegment === "canvas" ? "app-container--canvas" : ""}`}>
      {/* Sidebar Navigation */}
      <aside
        className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}
        style={{ width: sidebarCollapsed ? "52px" : "260px", transition: "width 0.2s ease" }}
      >
        <div className="sidebar-header" style={{ padding: sidebarCollapsed ? "16px 8px" : undefined, overflow: "hidden" }}>
          {!sidebarCollapsed && (
            <>
              <div className="sidebar-logo">{campaignState?.campaign?.title ?? "Campaña"}</div>
              <div className="sidebar-logo-subtitle">{campaignState?.campaign?.system ?? ""}</div>
            </>
          )}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              marginTop: sidebarCollapsed ? 0 : "10px",
              width: "100%",
              justifyContent: sidebarCollapsed ? "center" : "flex-end",
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav" style={{ padding: sidebarCollapsed ? "12px 6px" : undefined }}>
          {NAV.map(({ path, label, Icon }) => (
            <div
              key={path}
              className={`nav-item ${currentSegment === path ? "active" : ""}`}
              onClick={() => handleNavClick(path)}
              title={sidebarCollapsed ? label : undefined}
              style={sidebarCollapsed ? { padding: "10px", justifyContent: "center", gap: 0 } : undefined}
            >
              <Icon size={16} />
              {!sidebarCollapsed && <span>{label}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: sidebarCollapsed ? "12px 8px" : undefined }}>
          {sidebarCollapsed ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate({ to: "/" })}
              title="Salir"
              style={{ width: "100%", padding: "6px", justifyContent: "center" }}
            >
              <ArrowLeft size={14} />
            </button>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Campaña activa</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate({ to: "/" })}
              >
                <ArrowLeft size={14} /> Salir
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`main-content ${currentSegment === "canvas" ? "main-content--canvas" : ""}`}>
        {currentSegment !== "canvas" && (
          <header className="content-header">
            <div className="page-heading">
              <span className="page-eyebrow">{pageMeta.eyebrow}</span>
              <div className="page-title-row">
                <h1 className="page-title">{pageMeta.title}</h1>
                {campaignState?.campaign?.system && (
                  <span className="page-system-pill">{campaignState.campaign.system}</span>
                )}
              </div>
              <p className="page-description">{pageMeta.description}</p>

              {(currentLocation || currentQuest) && (
                <div className="page-context" aria-label="Contexto actual de campaña">
                  {currentLocation && (
                    <span className="context-chip">
                      <MapPin size={14} /> Ubicación: {currentLocation.title}
                    </span>
                  )}
                  {currentQuest && (
                    <span className="context-chip context-chip--primary">
                      <Flag size={14} /> Misión: {currentQuest.title}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="top-bar-actions header-actions">
              {activeSession ? (
                <span className="badge badge-success" style={{ padding: "8px 12px" }}>
                  Sesión #{activeSession.number || 1} activa: “{activeSession.title}”
                </span>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => startSession(`Sesión ${(campaignState?.sessions ?? []).length + 1}`)}
                >
                  <Play size={14} /> Iniciar nueva sesión
                </button>
              )}

              <button className="btn btn-secondary btn-sm" onClick={() => setIsEntityModalOpen(true)}>
                <Plus size={14} /> Nueva entidad
              </button>
            </div>
          </header>
        )}

        {currentSegment === "canvas" ? (
          <Outlet />
        ) : (
          <div className="content-body">
            <Outlet />
          </div>
        )}
      </main>

      {currentSegment !== "canvas" && <AppFooter />}

      {/* Modals */}
      <EntityCreateModal isOpen={isEntityModalOpen} onClose={() => setIsEntityModalOpen(false)} />
      <RelationCreateModal isOpen={isRelationModalOpen} onClose={() => setIsRelationModalOpen(false)} />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
