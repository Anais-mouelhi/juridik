import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Search, FolderOpen, CheckSquare, Calendar, ArrowRight,
  AlertCircle, Clock, ArrowUpRight, MailSearch, Scale,
  TrendingUp, BookOpen, ChevronRight, Zap
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  urgent:    { label: "Urgent",     dot: "bg-red-500",   bar: "bg-red-500",   text: "text-red-600",   badge: "bg-red-50 text-red-600 border-red-200" },
  en_cours:  { label: "En cours",   dot: "bg-amber-400", bar: "bg-amber-400", text: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  stable:    { label: "Stable",     dot: "bg-green-500", bar: "bg-green-500", text: "text-green-600", badge: "bg-green-50 text-green-700 border-green-200" },
  en_attente:{ label: "En attente", dot: "bg-gray-400",  bar: "bg-gray-400",  text: "text-gray-500",  badge: "bg-gray-50 text-gray-500 border-gray-200" },
};

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const BG = "linear-gradient(160deg, #F8F8FB 0%, #E0D8F0 100%)";
const INK = "#1A1A1A";
const SUB = "#666";
const LINE = "rgba(0,0,0,0.06)";
const glass = {
  background: "rgba(255,255,255,0.4)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: 28,
  boxShadow: "0 20px 50px -12px rgba(120,100,200,0.22), inset 0 1px 0 0 rgba(255,255,255,0.5)",
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searches, setSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Dossier.list('-created_date', 50),
      base44.entities.Task.filter({ completed: false }, '-created_date', 50),
      base44.entities.SearchHistory.list('-created_date', 50),
    ]).then(([me, d, t, s]) => {
      setUser(me); setDossiers(d); setTasks(t); setSearches(s); setIsLoading(false);
    });
  }, []);

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: BG }}>
      <div style={{ width: 22, height: 22, border: "2px solid rgba(0,0,0,0.1)", borderTop: `2px solid ${INK}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const urgentDossiers = dossiers.filter(d => d.status === 'urgent');
  const upcoming = dossiers.filter(d => d.next_hearing).sort((a,b) => a.next_hearing > b.next_hearing ? 1 : -1).slice(0, 6);
  const urgentTasks = tasks.filter(t => t.priority === 'urgent').slice(0, 3);
  const recentDossiers = dossiers.slice(0, 6);
  const firstName = user?.full_name?.split(' ')[0] || 'Maître';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div style={{ padding: "30px 34px", background: BG, minHeight: "100%", boxSizing: "border-box", position: "relative", overflowX: "hidden" }}>
      {/* aurora orbs */}
      <div style={{ position: "absolute", top: -90, left: -70, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,192,255,0.5) 0%, transparent 70%)", filter: "blur(45px)", pointerEvents: "none", zIndex: -1 }} />
      <div style={{ position: "absolute", bottom: 40, right: -70, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(207,252,120,0.25) 0%, transparent 70%)", filter: "blur(55px)", pointerEvents: "none", zIndex: -1 }} />
      <div style={{ position: "absolute", top: 220, right: 30, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,170,230,0.4) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: -1 }} />
      <div style={{ position: "absolute", top: 300, left: 140, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,192,255,0.45) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none", zIndex: -1 }} />
      <div style={{ position: "absolute", top: 560, right: 180, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(207,252,120,0.32) 0%, transparent 70%)", filter: "blur(55px)", pointerEvents: "none", zIndex: -1 }} />

      {/* ── Hero header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: SUB, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, opacity: 0.8 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: "#000", margin: 0, letterSpacing: "-0.6px", lineHeight: 1.1 }}>
            {greeting}, <span style={{ background: "linear-gradient(120deg, #6C5CE7 0%, #1A1A1A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{firstName}</span> 👋
          </h1>
          <p style={{ fontSize: 14, color: SUB, marginTop: 8, margin: 0 }}>
            {urgentDossiers.length > 0
              ? <span style={{ color: INK, fontWeight: 600 }}>{urgentDossiers.length} dossier{urgentDossiers.length>1?'s':''} urgent{urgentDossiers.length>1?'s':''} · </span>
              : null}
            {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} · {dossiers.filter(d=>d.next_hearing).length} audience{dossiers.filter(d=>d.next_hearing).length !== 1 ? 's' : ''} planifiée{dossiers.filter(d=>d.next_hearing).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/search" style={{
          display: "flex", alignItems: "center", gap: 8,
          background: INK, color: "#fff",
          borderRadius: 999, padding: "12px 22px", fontSize: 13, fontWeight: 600,
          textDecoration: "none", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.18)"
        }}>
          <Zap size={15} />
          Nouvelle recherche IA
        </Link>
      </motion.div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }}>
        {[
          { icon: FolderOpen,  label: "Dossiers actifs",   value: dossiers.length,   sub: `${urgentDossiers.length} urgent${urgentDossiers.length!==1?'s':''}`, href: "/dossiers" },
          { icon: Search,      label: "Recherches IA",     value: searches.length,   sub: "Total effectuées",            href: "/search" },
          { icon: CheckSquare, label: "Tâches en cours",   value: tasks.length,      sub: `${urgentTasks.length} urgente${urgentTasks.length!==1?'s':''}`, href: "/taches" },
          { icon: Calendar,    label: "Audiences",         value: dossiers.filter(d=>d.next_hearing).length, sub: "Planifiées", href: "/calendrier" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.05 + i * 0.07 }}>
            <Link to={s.href} style={{ textDecoration: "none" }}>
              <div className="lift" style={{ ...glass, padding: "20px 22px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={17} color={INK} />
                  </div>
                  <ArrowUpRight size={13} color="rgba(0,0,0,0.25)" />
                </div>
                <p style={{ fontSize: 30, fontWeight: 800, color: "#000", margin: 0, lineHeight: 1, letterSpacing: "-0.5px" }}>{s.value}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: INK, marginTop: 6, margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: SUB, marginTop: 2, margin: 0 }}>{s.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>

        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>

              {/* Recherche — dark card */}
              <Link to="/search" style={{ textDecoration: "none" }}>
                <div className="lift" style={{
                  background: "linear-gradient(135deg, #1A1A1A 0%, #2B2740 100%)", borderRadius: 28, padding: "22px",
                  boxShadow: "0 20px 50px -12px rgba(0,0,0,0.4)", cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 13, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Search size={17} color="#fff" />
                    </div>
                    <ArrowUpRight size={13} color="rgba(255,255,255,0.25)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3, margin: 0 }}>Recherche jurisprudentielle</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>IA · Droit du travail</p>
                </div>
              </Link>

              {/* Analyse mails */}
              <Link to="/analyse-mails" style={{ textDecoration: "none" }}>
                <div className="lift" style={{ ...glass, padding: "22px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 13, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MailSearch size={17} color={INK} />
                    </div>
                    <ArrowUpRight size={13} color="rgba(0,0,0,0.25)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 3, margin: 0 }}>Analyse de mails</p>
                  <p style={{ fontSize: 11, color: SUB, margin: 0 }}>Anonymisation RGPD</p>
                </div>
              </Link>

              {/* Dossiers */}
              <Link to="/dossiers" style={{ textDecoration: "none" }}>
                <div className="lift" style={{ ...glass, padding: "22px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 13, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FolderOpen size={17} color={INK} />
                    </div>
                    <ArrowUpRight size={13} color="rgba(0,0,0,0.25)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 3, margin: 0 }}>Mes dossiers</p>
                  <p style={{ fontSize: 11, color: SUB, margin: 0 }}>{dossiers.length} dossier{dossiers.length!==1?'s':''}</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Dossiers récents */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.4 }}>
            <div style={{ ...glass, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 22px", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FolderOpen size={15} color={INK} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Dossiers récents</span>
                </div>
                <Link to="/dossiers" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: INK, fontWeight: 600, textDecoration: "none" }}>
                  Voir tout <ArrowRight size={12} />
                </Link>
              </div>
              {recentDossiers.length === 0 ? (
                <div style={{ padding: "34px 22px", textAlign: "center" }}>
                  <FolderOpen size={28} color="rgba(0,0,0,0.2)" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13, color: SUB, margin: 0 }}>Aucun dossier</p>
                  <Link to="/dossiers" style={{ fontSize: 12, color: INK, fontWeight: 600 }}>Créer un dossier →</Link>
                </div>
              ) : recentDossiers.map((d, i) => {
                const sc = statusConfig[d.status] || statusConfig.en_cours;
                return (
                  <div key={d.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "13px 22px",
                    borderBottom: i < recentDossiers.length - 1 ? `1px solid ${LINE}` : "none",
                    transition: "background 0.12s", cursor: "pointer"
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: d.status === 'urgent' ? "#ef4444" : d.status === 'en_cours' ? "#f59e0b" : d.status === 'stable' ? "#22c55e" : "#9ca3af" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</p>
                      <p style={{ fontSize: 11, color: SUB, margin: "1px 0 0" }}>{d.client}{d.type ? ` · ${d.type}` : ''}</p>
                    </div>
                    <span style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 600, flexShrink: 0,
                      background: d.status === 'urgent' ? "#fef2f2" : d.status === 'en_cours' ? "#fffbeb" : d.status === 'stable' ? "#f0fdf4" : "#f9fafb",
                      color: d.status === 'urgent' ? "#dc2626" : d.status === 'en_cours' ? "#d97706" : d.status === 'stable' ? "#16a34a" : "#6b7280",
                      border: `1px solid ${d.status === 'urgent' ? "#fecaca" : d.status === 'en_cours' ? "#fde68a" : d.status === 'stable' ? "#bbf7d0" : "#e5e7eb"}`
                    }}>{sc.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent searches */}
          {searches.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.48 }}>
              <div style={{ ...glass, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 22px", borderBottom: `1px solid ${LINE}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={15} color={INK} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Recherches récentes</span>
                  </div>
                  <Link to="/search" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: INK, fontWeight: 600, textDecoration: "none" }}>
                    Voir tout <ArrowRight size={12} />
                  </Link>
                </div>
                <div>
                  {searches.slice(0, 4).map((s, i) => (
                    <Link key={s.id} to={`/search?q=${encodeURIComponent(s.query)}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "11px 22px",
                        borderBottom: i < 3 ? `1px solid ${LINE}` : "none"
                      }}>
                        <div style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Search size={13} color={INK} />
                        </div>
                        <p style={{ fontSize: 13, color: "#000", flex: 1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.query}</p>
                        {s.results_count !== undefined && (
                          <span style={{ fontSize: 11, color: SUB, flexShrink: 0 }}>{s.results_count} résultats</span>
                        )}
                        <ChevronRight size={12} color="rgba(0,0,0,0.25)" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT column */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.22 }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Upcoming hearings */}
          <div style={{ ...glass, overflow: "hidden" }}>
            <div style={{ padding: "15px 20px", borderBottom: `1px solid ${LINE}` }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: SUB, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, opacity: 0.8 }}>Prochaines audiences</p>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center" }}>
                <Calendar size={28} color="rgba(0,0,0,0.2)" style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: 12, color: SUB, margin: 0 }}>Aucune audience planifiée</p>
              </div>
            ) : upcoming.map((d, i) => {
              const dateObj = d.next_hearing ? new Date(d.next_hearing) : null;
              const day = dateObj?.getDate();
              const mon = dateObj ? MONTHS_FR[dateObj.getMonth()] : '';
              const isFirst = i === 0;
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 20px",
                  background: isFirst ? INK : "transparent",
                  borderBottom: i < upcoming.length - 1 ? `1px solid ${isFirst ? "rgba(255,255,255,0.1)" : LINE}` : "none"
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    background: isFirst ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1, color: isFirst ? "#fff" : "#000" }}>{day}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: isFirst ? "#C4C0FF" : SUB, letterSpacing: "0.05em" }}>{mon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: isFirst ? "#fff" : "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</p>
                    <p style={{ fontSize: 11, color: isFirst ? "rgba(255,255,255,0.5)" : SUB, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.client}</p>
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "11px 20px", borderTop: `1px solid ${LINE}` }}>
              <Link to="/calendrier" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: INK, fontWeight: 600, textDecoration: "none" }}>
                Voir le calendrier <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Priority tasks */}
          <div style={{ ...glass, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", borderBottom: `1px solid ${LINE}` }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: SUB, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, opacity: 0.8 }}>Tâches prioritaires</p>
              <Link to="/taches" style={{ display: "flex", alignItems: "center", color: INK, textDecoration: "none" }}>
                <ArrowRight size={13} />
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div style={{ padding: "26px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: SUB, margin: 0 }}>Aucune tâche</p>
              </div>
            ) : tasks.slice(0, 5).map((t, i) => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 20px",
                borderBottom: i < Math.min(tasks.length, 5) - 1 ? `1px solid ${LINE}` : "none"
              }}>
                {t.priority === 'urgent'
                  ? <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                  : <Clock size={14} color={SUB} style={{ flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                  {t.dossier_name && <p style={{ fontSize: 11, color: SUB, margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.dossier_name}</p>}
                </div>
                {t.due_date && <span style={{ fontSize: 10, color: SUB, flexShrink: 0 }}>{t.due_date}</span>}
              </div>
            ))}
          </div>

          {/* Dossiers par statut */}
          {dossiers.length > 0 && (
            <div style={{ ...glass, padding: "17px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: SUB, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 13, margin: 0, opacity: 0.8 }}>Répartition dossiers</p>
              {[
                { key: "urgent", label: "Urgents", count: dossiers.filter(d=>d.status==='urgent').length, color: "#ef4444" },
                { key: "en_cours", label: "En cours", count: dossiers.filter(d=>d.status==='en_cours').length, color: "#f59e0b" },
                { key: "stable", label: "Stables", count: dossiers.filter(d=>d.status==='stable').length, color: "#22c55e" },
                { key: "en_attente", label: "En attente", count: dossiers.filter(d=>d.status==='en_attente').length, color: "#9ca3af" },
              ].map(s => (
                <div key={s.key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: INK, fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: INK, fontWeight: 700 }}>{s.count}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${dossiers.length ? (s.count/dossiers.length)*100 : 0}%`, background: s.color, borderRadius: 999, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}