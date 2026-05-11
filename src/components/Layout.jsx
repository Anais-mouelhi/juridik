import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Search, FolderOpen, CheckSquare, Calendar,
  User, Scale, LogOut, MailSearch, Bell, Menu, X, Command
} from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/",              icon: LayoutDashboard, label: "Tableau de bord" },
  { path: "/search",        icon: Search,          label: "Recherche IA" },
  { path: "/analyse-mails", icon: MailSearch,      label: "Analyse de mails" },
  { path: "/dossiers",      icon: FolderOpen,      label: "Mes dossiers" },
  { path: "/taches",        icon: CheckSquare,     label: "Tâches" },
  { path: "/calendrier",    icon: Calendar,        label: "Calendrier" },
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

      {/* ── Slim white sidebar (desktop) ──────────────────────────── */}
      <aside className="hidden lg:flex flex-col items-center w-[58px] bg-white border-r border-[hsl(220,10%,90%)] py-3 gap-0.5 z-30 flex-shrink-0">
        {/* Logo */}
        <Link to="/" className="mb-4 flex items-center justify-center h-9 w-9 rounded-xl bg-[hsl(222,25%,10%)]">
          <Scale className="h-4 w-4 text-white" />
        </Link>

        {/* Nav icons */}
        <nav className="flex flex-col gap-0.5 flex-1 w-full px-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`relative group flex items-center justify-center h-9 w-9 rounded-xl mx-auto transition-all duration-150
                  ${isActive
                    ? "bg-[hsl(222,25%,10%)] text-white"
                    : "text-[hsl(220,8%,55%)] hover:bg-[hsl(220,10%,94%)] hover:text-[hsl(222,25%,10%)]"
                  }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-[hsl(222,25%,10%)] px-3 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-0.5 mt-auto w-full px-2">
          <Link
            to="/profil"
            title={user?.full_name || "Profil"}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-[hsl(42,90%,50%)] text-[hsl(222,25%,10%)] text-xs font-bold hover:brightness-105 transition-all"
          >
            {initials}
          </Link>
        </div>
      </aside>

      {/* ── Mobile overlay sidebar ─────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-60 bg-white h-full flex flex-col py-5 px-4 border-r border-border">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[hsl(222,25%,10%)] flex items-center justify-center">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-foreground">JurisIA</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive ? "bg-[hsl(222,25%,10%)] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-border">
              <button onClick={() => base44.auth.logout()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main column ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Topbar ────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-[hsl(220,10%,90%)] flex-shrink-0 z-20">
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors mr-1">
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[hsl(220,10%,96%)] border border-border rounded-lg px-3 py-1.5 flex-1 max-w-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Rechercher…</span>
            <div className="ml-auto flex items-center gap-1 flex-shrink-0">
              <kbd className="text-[10px] text-muted-foreground bg-white border border-border rounded px-1.5 py-0.5 font-mono">⌘</kbd>
              <kbd className="text-[10px] text-muted-foreground bg-white border border-border rounded px-1.5 py-0.5 font-mono">K</kbd>
            </div>
          </div>

          {/* Anonymisation badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1.5 text-xs font-medium flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
            Anonymisation locale active
          </div>

          <div className="flex-1" />

          {/* Bell */}
          <button className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0">
            <Bell className="h-4 w-4" />
          </button>

          {/* Avatar */}
          <Link to="/profil" className="flex items-center justify-center h-8 w-8 rounded-full bg-[hsl(222,25%,10%)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex-shrink-0">
            {initials}
          </Link>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-[hsl(0,0%,96%)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}