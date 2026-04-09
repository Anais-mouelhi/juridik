import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Search, FolderOpen, CheckSquare, Calendar, User, Menu, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const sections = [
  {
    label: "PRINCIPAL",
    items: [
      { path: "/", label: "Tableau de bord", icon: LayoutDashboard },
      { path: "/search", label: "Recherche IA", icon: Search },
    ]
  },
  {
    label: "GESTION",
    items: [
      { path: "/dossiers", label: "Mes dossiers", icon: FolderOpen },
      { path: "/taches", label: "Tâches", icon: CheckSquare },
      { path: "/calendrier", label: "Calendrier", icon: Calendar },
    ]
  },
  {
    label: "COMPTE",
    items: [
      { path: "/profil", label: "Profil", icon: User },
    ]
  }
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-sidebar-foreground">Juris</span>
            <span className="text-sidebar-primary">IA</span>
          </span>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-sidebar-foreground/40 px-2 mb-2">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                        ${isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary'
                          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50'
                        }
                      `}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="px-4 pb-6 pt-4 border-t border-sidebar-border">
          <Link to="/profil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-semibold text-sidebar-primary-foreground flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.full_name || 'Utilisateur'}</p>
              <p className="text-[11px] text-sidebar-foreground truncate">{user?.email || ''}</p>
            </div>
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar">
          <button onClick={() => setMobileOpen(true)} className="text-sidebar-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-base font-bold">
            <span className="text-sidebar-foreground">Juris</span>
            <span className="text-sidebar-primary">IA</span>
          </span>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}