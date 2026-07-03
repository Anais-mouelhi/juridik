import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Search, FolderOpen, CheckSquare, Calendar,
  LogOut, MailSearch, Bell, Menu, X
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
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", background: "#F0EEF6" }}>

      {/* ── Slim sidebar ── */}
      <aside style={{
        width: 58, minWidth: 58, height: "100vh",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 12, paddingBottom: 12, gap: 2, zIndex: 30, flexShrink: 0
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: 50, overflow: "hidden", background: "#000", marginBottom: 12
        }}>
          <img src="https://media.base44.com/images/public/6a4788f5f5d765f8a1df53f8/a3b22e944_BlueandWhiteGeometricModernCreativeLogo-4.png" alt="JurisIA" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, width: "100%", padding: "0 8px" }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} style={{ position: "relative" }} className="group">
                <Link to={item.path} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: 50, margin: "0 auto",
                  background: isActive ? "#1A1A1A" : "transparent",
                  color: isActive ? "#fff" : "#666",
                  transition: "all 0.15s",
                  textDecoration: "none"
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "#1A1A1A"; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666"; }}}
                >
                  <item.icon size={18} />
                </Link>
                {/* Tooltip */}
                <div style={{
                  position: "absolute", left: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)",
                  background: "#1A1A1A", color: "#fff", fontSize: 12, fontWeight: 600,
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
            background: "#1A1A1A", color: "#fff",
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
          background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
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
            background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 999, padding: "6px 12px", width: 220, flexShrink: 0
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
            width: 34, height: 34, borderRadius: 50, border: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#666"
          }}>
            <Bell size={15} />
          </button>

          {/* Avatar */}
          <Link to="/profil" style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#1A1A1A", color: "#fff",
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
            position: "relative", zIndex: 10, width: 220, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            height: "100%", display: "flex", flexDirection: "column", padding: "20px 16px",
            borderRight: "1px solid hsl(220,10%,90%)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src="https://media.base44.com/images/public/6a4788f5f5d765f8a1df53f8/a3b22e944_BlueandWhiteGeometricModernCreativeLogo-4.png" alt="JurisIA" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>JurisIA</span>
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
                    background: isActive ? "#1A1A1A" : "transparent",
                    color: isActive ? "#fff" : "#666", textDecoration: "none"
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