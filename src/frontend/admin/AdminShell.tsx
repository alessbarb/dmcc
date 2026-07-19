import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, Users, Layers, Activity, FileText, ArrowLeft, LogOut, Mail, Megaphone, BookOpen, Dices } from "lucide-react";
import { logout } from "../shared/auth/authClient.js";

interface AdminShellProps {
  children: React.ReactNode;
}

function AdminNavLink({ to, exact, icon, label }: { to: string; exact?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      className="admin-shell__nav-link"
      activeProps={() => ({ className: "admin-shell__nav-link admin-shell__nav-link--active" })}
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
    <div className="admin-shell">
      {/* Sidebar navigation */}
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <div className="admin-shell__brand-mark">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="admin-shell__brand-title">DMCC ADMIN</h2>
            <span className="admin-shell__brand-subtitle">Platform Console</span>
          </div>
        </div>

        <nav className="admin-shell__nav">
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

        <div className="admin-shell__footer-actions">
          <button
            onClick={() => void navigate({ to: "/home" })}
            className="admin-shell__action admin-shell__action--portal"
          >
            <ArrowLeft size={16} />
            <span>Back to Portal</span>
          </button>

          <button
            onClick={() => { void handleLogout(); }}
            className="admin-shell__action admin-shell__action--signout"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <main className="admin-shell__main">
        {children}
      </main>
    </div>
  );
}
