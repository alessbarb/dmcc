import React, { useEffect } from "react";
import { Outlet, useParams, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCampaignStore } from "./stores/campaignStore.js";
import { ToastContainer } from "./components/ToastContainer.js";
import { useToast } from "./hooks/useToast.js";
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
} from "lucide-react";

export function CampaignShell() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const { selectCampaign, activeCampaignId, campaignState } = useCampaignStore();
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      selectCampaign(campaignId as any);
    }
  }, [campaignId]);

  const currentSegment = pathname.split("/")[3] ?? "";

  const NAV = [
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

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">{campaignState?.campaign?.title ?? "Campaña"}</div>
          <div className="sidebar-logo-subtitle">{campaignState?.campaign?.system ?? ""}</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ path, label, Icon }) => (
            <div
              key={path}
              className={`nav-item ${currentSegment === path ? "active" : ""}`}
              onClick={() => navigate({ to: `/campaigns/${campaignId}/${path}` })}
            >
              <Icon size={16} /> {label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Campaña activa</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate({ to: "/" })}
            >
              <ArrowLeft size={14} /> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div style={{ padding: "24px" }}>
          <Outlet />
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
