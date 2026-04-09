import { Outlet, Link, useLocation } from "react-router-dom";
import { Scale, Search, BookMarked, History, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Vue d'ensemble", icon: Scale },
  { path: "/search", label: "Recherche", icon: Search },
  { path: "/saved", label: "Sauvegardées", icon: BookMarked },
  { path: "/history", label: "Historique", icon: History },
  { path: "/settings", label: "Paramètres", icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — slim icon + label column */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-background border-r border-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:w-52
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-7 pb-6">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-serif font-semibold text-sm text-foreground leading-none">JurisIA</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">Droit du travail</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-6 mt-4">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-foreground" />
            <span className="font-serif font-semibold text-sm">JurisIA</span>
          </div>
          <div className="w-10" />
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}