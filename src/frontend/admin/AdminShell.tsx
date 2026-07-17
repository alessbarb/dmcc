import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, Users, Layers, Activity, FileText, ArrowLeft, LogOut, Mail, Megaphone, BookOpen, Dices } from "lucide-react";
import { logout } from "../shared/auth/authClient.js";

interface AdminShellProps {
  children: React.ReactNode;
}

const navLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 14px",
  borderRadius: "8px",
  textDecoration: "none",
  color: "inherit",
  fontSize: "0.85rem",
  fontWeight: 500,
};

const navLinkActiveStyle: React.CSSProperties = {
  ...navLinkStyle,
  backgroundColor: "color-mix(in srgb, var(--theme-text-on-media) 5%, transparent)",
  borderLeft: "3px solid var(--theme-accents-primary-foreground)",
  paddingLeft: "11px",
  color: "var(--theme-accents-primary-foreground)",
};

function AdminNavLink({ to, exact, icon, label }: { to: string; exact?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      style={navLinkStyle}
      activeProps={() => ({ style: navLinkActiveStyle })}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      void navigate({ to: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--theme-surfaces-canvas)", color: "var(--theme-text-primary)" }}>
      {/* Sidebar navigation */}
      <aside style={{
        width: "260px",
        backgroundColor: "var(--theme-surfaces-base)",
        borderRight: "1px solid var(--theme-borders-default)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", padding: "0 8px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "color-mix(in srgb, var(--theme-accents-primary-foreground) 10%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--theme-accents-primary-foreground)",
          }}>
            <Shield size={18} style={{ color: "var(--theme-accents-primary-foreground)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, letterSpacing: "0.05em" }}>DMCC ADMIN</h2>
            <span style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)" }}>Platform Console</span>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <AdminNavLink to="/admin" exact icon={<Activity size={16} />} label="Dashboard Overview" />
          <AdminNavLink to="/admin/campaigns" icon={<Layers size={16} />} label="Campaigns & Trash" />
          <AdminNavLink to="/admin/users" icon={<Users size={16} />} label="User Management" />
          <AdminNavLink to="/admin/invitations" icon={<Mail size={16} />} label="Invitations" />
          <AdminNavLink to="/admin/purge" icon={<Shield size={16} />} label="Purge Queue" />
          <AdminNavLink to="/admin/announcements" icon={<Megaphone size={16} />} label="Announcements" />
          <AdminNavLink to="/admin/campaign-templates" icon={<BookOpen size={16} />} label="Campaign Templates" />
          <AdminNavLink to="/admin/game-systems" icon={<Dices size={16} />} label="Game Systems" />
          <AdminNavLink to="/admin/audit" icon={<FileText size={16} />} label="Audit Logs" />
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto", borderTop: "1px solid var(--theme-borders-default)", paddingTop: "16px" }}>
          <button
            onClick={() => void navigate({ to: "/home" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              color: "var(--theme-text-secondary)",
              fontSize: "0.85rem",
              width: "100%",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Portal</span>
          </button>

          <button
            onClick={() => { void handleLogout(); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              color: "var(--theme-feedback-danger-foreground)",
              fontSize: "0.85rem",
              width: "100%",
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", maxHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
