import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Search, FolderOpen, CheckSquare, Calendar,
  Scale, LogOut, MailSearch, Bell, Menu, X
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
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", background: "hsl(0,0%,96%)" }}>

      {/* ── Slim sidebar ── */}
      <aside style={{
        width: 58, minWidth: 58, height: "100vh",
        background: "#fff",
        borderRight: "1px solid hsl(220,10%,90%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 12, paddingBottom: 12, gap: 2, zIndex: 30, flexShrink: 0
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: 10, background: "hsl(222,25%,10%)", marginBottom: 12
        }}>
          <Scale size={16} color="#fff" />
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, width: "100%", padding: "0 8px" }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} style={{ position: "relative" }} className="group">
                <Link to={item.path} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: 10, margin: "0 auto",
                  background: isActive ? "hsl(222,25%,10%)" : "transparent",
                  color: isActive ? "#fff" : "hsl(220,8%,55%)",
                  transition: "all 0.15s",
                  textDecoration: "none"
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "hsl(220,10%,94%)"; e.currentTarget.style.color = "hsl(222,25%,10%)"; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "hsl(220,8%,55%)"; }}}
                >
                  <item.icon size={18} />
                </Link>
                {/* Tooltip */}
                <div style={{
                  position: "absolute", left: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)",
                  background: "hsl(222,25%,10%)", color: "#fff", fontSize: 12, fontWeight: 600,
                  padding: "6px 12px", borderRadius: 8, whiteSpace: "nowrap",
                  pointerEvents: "none", opacity: 0, transition: "opacity 0.15s", zIndex: 100,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }} className="group-hover-tooltip">
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Avatar bottom */}
        <div style={{ marginTop: "auto", padding: "0 8px" }}>
          <Link to="/profil" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: "50%",
            background: "hsl(42,90%,50%)", color: "hsl(222,25%,10%)",
            fontSize: 12, fontWeight: 700, textDecoration: "none"
          }}>
            {initials}
          </Link>
        </div>
      </aside>

      {/* ── Right side: topbar + content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 52, minHeight: 52,
          background: "#fff",
          borderBottom: "1px solid hsl(220,10%,90%)",
          display: "flex", alignItems: "center", gap: 12,
          padding: "0 20px", flexShrink: 0, zIndex: 20
        }}>
          {/* Mobile menu btn */}
          <button onClick={() => setMobileOpen(true)} style={{ display: "none" }}>
            <Menu size={18} />
          </button>

          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "hsl(220,10%,97%)", border: "1px solid hsl(220,10%,90%)",
            borderRadius: 8, padding: "6px 12px", width: 220, flexShrink: 0
          }}>
            <Search size={13} color="hsl(220,8%,55%)" />
            <span style={{ fontSize: 13, color: "hsl(220,8%,60%)", flex: 1 }}>Rechercher…</span>
            <div style={{ display: "flex", gap: 2 }}>
              <kbd style={{ fontSize: 10, background: "#fff", border: "1px solid hsl(220,10%,88%)", borderRadius: 4, padding: "1px 4px", color: "hsl(220,8%,55%)", fontFamily: "monospace" }}>⌘</kbd>
              <kbd style={{ fontSize: 10, background: "#fff", border: "1px solid hsl(220,10%,88%)", borderRadius: 4, padding: "1px 4px", color: "hsl(220,8%,55%)", fontFamily: "monospace" }}>K</kbd>
            </div>
          </div>

          {/* Green badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "hsl(142,60%,95%)", border: "1px solid hsl(142,60%,80%)",
            color: "hsl(142,60%,30%)", borderRadius: 999, padding: "5px 12px",
            fontSize: 12, fontWeight: 500, flexShrink: 0
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(142,60%,45%)", flexShrink: 0 }} />
            Anonymisation locale active
          </div>

          <div style={{ flex: 1 }} />

          {/* Bell */}
          <button style={{
            width: 34, height: 34, borderRadius: 8, border: "1px solid hsl(220,10%,90%)",
            background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "hsl(220,8%,55%)"
          }}>
            <Bell size={15} />
          </button>

          {/* Avatar */}
          <Link to="/profil" style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "hsl(222,25%,10%)", color: "#fff",
            fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none"
          }}>
            {initials}
          </Link>
        </header>

        {/* Page content — fills remaining height */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{
            position: "relative", zIndex: 10, width: 220, background: "#fff",
            height: "100%", display: "flex", flexDirection: "column", padding: "20px 16px",
            borderRight: "1px solid hsl(220,10%,90%)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "hsl(222,25%,10%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Scale size={15} color="#fff" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "hsl(222,25%,10%)" }}>JurisIA</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ color: "hsl(220,8%,55%)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                    background: isActive ? "hsl(222,25%,10%)" : "transparent",
                    color: isActive ? "#fff" : "hsl(220,8%,55%)", textDecoration: "none"
                  }}>
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid hsl(220,10%,90%)" }}>
              <button onClick={() => base44.auth.logout()} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10, fontSize: 13, width: "100%",
                color: "hsl(220,8%,55%)", background: "none", border: "none", cursor: "pointer"
              }}>
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}