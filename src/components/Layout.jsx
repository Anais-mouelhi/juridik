import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Search, FolderOpen, CheckSquare, Calendar,
  User, Scale, LogOut, MailSearch, Bell, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/",               icon: LayoutDashboard, label: "Tableau de bord" },
  { path: "/search",         icon: Search,          label: "Recherche IA" },
  { path: "/analyse-mails",  icon: MailSearch,      label: "Analyse de mails" },
  { path: "/dossiers",       icon: FolderOpen,      label: "Mes dossiers" },
  { path: "/taches",         icon: CheckSquare,     label: "Tâches" },
  { path: "/calendrier",     icon: Calendar,        label: "Calendrier" },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const initials = user?.full_name
    ?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Icon sidebar (desktop) ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col items-center w-[60px] bg-[hsl(222,28%,10%)] border-r border-[hsl(222,24%,16%)] py-4 gap-1 z-30">
        {/* Logo mark */}
        <div className="mb-5 flex items-center justify-center h-9 w-9 rounded-xl bg-[hsl(42,85%,52%)]">
          <Scale className="h-4 w-4 text-[hsl(222,28%,8%)]" />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`relative group flex items-center justify-center h-9 w-9 rounded-xl mx-auto transition-all duration-150
                  ${isActive
                    ? "bg-[hsl(42,85%,52%)] text-[hsl(222,28%,8%)]"
                    : "text-[hsl(220,10%,52%)] hover:bg-[hsl(222,24%,16%)] hover:text-white"
                  }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-[hsl(222,28%,10%)] border border-[hsl(222,24%,20%)] px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: profile + logout */}
        <div className="flex flex-col items-center gap-2 mt-auto">
          <Link
            to="/profil"
            title={user?.full_name || "Profil"}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-[hsl(42,85%,52%)] text-[hsl(222,28%,8%)] text-xs font-bold hover:brightness-110 transition-all"
          >
            {initials}
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            title="Déconnexion"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-[hsl(220,10%,52%)] hover:bg-[hsl(222,24%,16%)] hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay sidebar ─────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 bg-[hsl(222,28%,10%)] h-full flex flex-col py-5 px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-[hsl(42,85%,52%)] flex items-center justify-center">
                  <Scale className="h-4 w-4 text-[hsl(222,28%,8%)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">JurisIA</p>
                  <p className="text-[10px] text-[hsl(220,10%,52%)]">Droit du travail</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-[hsl(220,10%,52%)] hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive
                        ? "bg-[hsl(42,85%,52%)] text-[hsl(222,28%,8%)]"
                        : "text-[hsl(220,10%,60%)] hover:bg-[hsl(222,24%,16%)] hover:text-white"
                      }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-[hsl(222,24%,16%)]">
              <button onClick={() => base44.auth.logout()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[hsl(220,10%,52%)] hover:text-white hover:bg-[hsl(222,24%,16%)] w-full transition-colors">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[hsl(222,28%,10%)] border-b border-[hsl(222,24%,16%)]">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="text-[hsl(220,10%,60%)] hover:text-white transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="h-7 w-7 rounded-lg bg-[hsl(42,85%,52%)] flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 text-[hsl(222,28%,8%)]" />
            </div>
            <span className="text-sm font-bold text-white">JurisIA</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[hsl(220,10%,60%)] hover:text-white transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <div className="h-8 w-8 rounded-full bg-[hsl(42,85%,52%)] flex items-center justify-center text-xs font-bold text-[hsl(222,28%,8%)]">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}