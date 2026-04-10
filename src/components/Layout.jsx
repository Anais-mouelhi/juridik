import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Search, FolderOpen, CheckSquare, Calendar, User, Menu, Scale, LogOut } from "lucide-react";
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
        fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-7 pb-7">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-serif font-semibold text-sm text-foreground leading-none">JurisIA</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">Droit du travail</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-5 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/60 px-3 mb-1.5 uppercase">
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
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150
                        ${isActive
                          ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
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

        {/* User + logout */}
        <div className="px-3 pb-5 pt-3 border-t border-sidebar-border space-y-1">
          <Link to="/profil" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-semibold text-primary-foreground flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.full_name || 'Utilisateur'}</p>
              <p className="text-[10px] text-sidebar-foreground truncate">{user?.email || ''}</p>
            </div>
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent w-full transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-foreground" />
            <span className="font-serif font-semibold text-sm text-foreground">JurisIA</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}