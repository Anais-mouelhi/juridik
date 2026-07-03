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

const BG = "linear-gradient(160deg, #F6F6F6 0%, #D8DFF8 100%)";
const glass = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.7)",
  borderRadius: 24,
  boxShadow: "0 8px 32px rgba(10,0,160,0.08)",
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
      <div style={{ width: 22, height: 22, border: "2px solid rgba(10,0,160,0.2)", borderTop: "2px solid #0A00A0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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
    <div style={{ padding: "28px 32px", background: BG, minHeight: "100%", boxSizing: "border-box" }}>

      {/* ── Hero header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#0A00A0", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, opacity: 0.7 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#000", margin: 0, letterSpacing: "-0.5px" }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 13, color: "#000", opacity: 0.5, marginTop: 4 }}>
            {urgentDossiers.length > 0
              ? <span style={{ color: "#0A00A0", fontWeight: 600, opacity: 0.9 }}>{urgentDossiers.length} dossier{urgentDossiers.length>1?'s':''} urgent{urgentDossiers.length>1?'s':''} · </span>
              : null}
            {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} · {dossiers.filter(d=>d.next_hearing).length} audience{dossiers.filter(d=>d.next_hearing).length !== 1 ? 's' : ''} planifiée{dossiers.filter(d=>d.next_hearing).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/search" style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#000", color: "#fff",
          borderRadius: 999, padding: "11px 20px", fontSize: 13, fontWeight: 600,
          textDecoration: "none", flexShrink: 0
        }}>
          <Zap size={14} />
          Nouvelle recherche IA
        </Link>
      </motion.div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { icon: FolderOpen,  label: "Dossiers actifs",   value: dossiers.length,   sub: `${urgentDossiers.length} urgent${urgentDossiers.length!==1?'s':''}`, href: "/dossiers",  accent: false },
          { icon: Search,      label: "Recherches IA",     value: searches.length,   sub: "Total effectuées",            href: "/search",    accent: false },
          { icon: CheckSquare, label: "Tâches en cours",   value: tasks.length,      sub: `${urgentTasks.length} urgente${urgentTasks.length!==1?'s':''}`, href: "/taches",    accent: false },
          { icon: Calendar,    label: "Audiences",         value: dossiers.filter(d=>d.next_hearing).length, sub: "Planifiées", href: "/calendrier", accent: true },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 + i * 0.07 }}>
            <Link to={s.href} style={{ textDecoration: "none" }}>
              <div style={{
                ...(s.accent ? { background: "#0A00A0", border: "1px solid transparent" } : glass),
                borderRadius: 24, padding: "18px 20px",
                cursor: "pointer", transition: "all 0.15s"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: s.accent ? "rgba(255,255,255,0.12)" : "rgba(10,0,160,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <s.icon size={16} color={s.accent ? "#fff" : "#0A00A0"} />
                  </div>
                  <ArrowUpRight size={13} color={s.accent ? "rgba(255,255,255,0.3)" : "rgba(10,0,160,0.3)"} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: s.accent ? "#fff" : "#000", margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: s.accent ? "rgba(255,255,255,0.8)" : "#000", marginTop: 5 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: s.accent ? "rgba(255,255,255,0.45)" : "#000", opacity: 0.5, marginTop: 2 }}>{s.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>

              {/* Recherche — dark card */}
              <Link to="/search" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "linear-gradient(135deg, #0A00A0 0%, #000000 100%)",
                  borderRadius: 24, padding: "20px", boxShadow: "0 8px 32px rgba(10,0,160,0.18)", cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Search size={16} color="#fff" />
                    </div>
                    <ArrowUpRight size={13} color="rgba(255,255,255,0.25)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Recherche jurisprudentielle</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>IA · Droit du travail</p>
                </div>
              </Link>

              {/* Analyse mails */}
              <Link to="/analyse-mails" style={{ textDecoration: "none" }}>
                <div style={{ ...glass, padding: "20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(10,0,160,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MailSearch size={16} color="#0A00A0" />
                    </div>
                    <ArrowUpRight size={13} color="rgba(10,0,160,0.3)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 3 }}>Analyse de mails</p>
                  <p style={{ fontSize: 11, color: "#000", opacity: 0.5 }}>Anonymisation RGPD</p>
                </div>
              </Link>

              {/* Dossiers */}
              <Link to="/dossiers" style={{ textDecoration: "none" }}>
                <div style={{ ...glass, padding: "20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(10,0,160,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FolderOpen size={16} color="#0A00A0" />
                    </div>
                    <ArrowUpRight size={13} color="rgba(10,0,160,0.3)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 3 }}>Mes dossiers</p>
                  <p style={{ fontSize: 11, color: "#000", opacity: 0.5 }}>{dossiers.length} dossier{dossiers.length!==1?'s':''}</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Dossiers récents */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
            <div style={{ ...glass, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(10,0,160,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FolderOpen size={14} color="#0A00A0" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Dossiers récents</span>
                </div>
                <Link to="/dossiers" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#0A00A0", fontWeight: 600, textDecoration: "none" }}>
                  Voir tout <ArrowRight size={12} />
                </Link>
              </div>
              {recentDossiers.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <FolderOpen size={28} color="rgba(10,0,160,0.2)" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13, color: "#000", opacity: 0.5 }}>Aucun dossier</p>
                  <Link to="/dossiers" style={{ fontSize: 12, color: "#0A00A0", fontWeight: 600 }}>Créer un dossier →</Link>
                </div>
              ) : recentDossiers.map((d, i) => {
                const sc = statusConfig[d.status] || statusConfig.en_cours;
                return (
                  <div key={d.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                    borderBottom: i < recentDossiers.length - 1 ? "1px solid rgba(10,0,160,0.05)" : "none",
                    transition: "background 0.12s", cursor: "pointer"
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: d.status === 'urgent' ? "#ef4444" : d.status === 'en_cours' ? "#f59e0b" : d.status === 'stable' ? "#22c55e" : "#9ca3af" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</p>
                      <p style={{ fontSize: 11, color: "#000", opacity: 0.5, margin: "1px 0 0" }}>{d.client}{d.type ? ` · ${d.type}` : ''}</p>
                    </div>
                    <span style={{
                      fontSize: 11, padding: "3px 9px", borderRadius: 999, fontWeight: 600, flexShrink: 0,
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.48 }}>
              <div style={{ ...glass, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(10,0,160,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={14} color="#0A00A0" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Recherches récentes</span>
                  </div>
                  <Link to="/search" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#0A00A0", fontWeight: 600, textDecoration: "none" }}>
                    Voir tout <ArrowRight size={12} />
                  </Link>
                </div>
                <div>
                  {searches.slice(0, 4).map((s, i) => (
                    <Link key={s.id} to={`/search?q=${encodeURIComponent(s.query)}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
                        borderBottom: i < 3 ? "1px solid rgba(10,0,160,0.05)" : "none"
                      }}>
                        <div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(10,0,160,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Search size={12} color="#0A00A0" />
                        </div>
                        <p style={{ fontSize: 13, color: "#000", flex: 1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.query}</p>
                        {s.results_count !== undefined && (
                          <span style={{ fontSize: 11, color: "#000", opacity: 0.5, flexShrink: 0 }}>{s.results_count} résultats</span>
                        )}
                        <ChevronRight size={12} color="rgba(10,0,160,0.3)" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT column */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.22 }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Upcoming hearings */}
          <div style={{ ...glass, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(10,0,160,0.07)" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#000", opacity: 0.4, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>Prochaines audiences</p>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ padding: "28px 18px", textAlign: "center" }}>
                <Calendar size={28} color="rgba(10,0,160,0.2)" style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: 12, color: "#000", opacity: 0.5, margin: 0 }}>Aucune audience planifiée</p>
              </div>
            ) : upcoming.map((d, i) => {
              const dateObj = d.next_hearing ? new Date(d.next_hearing) : null;
              const day = dateObj?.getDate();
              const mon = dateObj ? MONTHS_FR[dateObj.getMonth()] : '';
              const isFirst = i === 0;
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
                  background: isFirst ? "#0A00A0" : "transparent",
                  borderBottom: i < upcoming.length - 1 ? `1px solid ${isFirst ? "rgba(255,255,255,0.12)" : "rgba(10,0,160,0.05)"}` : "none"
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: isFirst ? "rgba(255,255,255,0.12)" : "rgba(10,0,160,0.06)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1, color: isFirst ? "#fff" : "#000" }}>{day}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: isFirst ? "#F6F6F6" : "#0A00A0", letterSpacing: "0.05em" }}>{mon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: isFirst ? "#fff" : "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</p>
                    <p style={{ fontSize: 11, color: isFirst ? "rgba(255,255,255,0.5)" : "#000", opacity: isFirst ? 1 : 0.5, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.client}</p>
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(10,0,160,0.07)" }}>
              <Link to="/calendrier" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#0A00A0", fontWeight: 600, textDecoration: "none" }}>
                Voir le calendrier <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Priority tasks */}
          <div style={{ ...glass, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(10,0,160,0.07)" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#000", opacity: 0.4, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>Tâches prioritaires</p>
              <Link to="/taches" style={{ display: "flex", alignItems: "center", color: "#0A00A0", textDecoration: "none" }}>
                <ArrowRight size={13} />
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div style={{ padding: "24px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#000", opacity: 0.5, margin: 0 }}>Aucune tâche</p>
              </div>
            ) : tasks.slice(0, 5).map((t, i) => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 18px",
                borderBottom: i < Math.min(tasks.length, 5) - 1 ? "1px solid rgba(10,0,160,0.05)" : "none"
              }}>
                {t.priority === 'urgent'
                  ? <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                  : <Clock size={14} color="#0A00A0" style={{ flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                  {t.dossier_name && <p style={{ fontSize: 11, color: "#000", opacity: 0.5, margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.dossier_name}</p>}
                </div>
                {t.due_date && <span style={{ fontSize: 10, color: "#000", opacity: 0.5, flexShrink: 0 }}>{t.due_date}</span>}
              </div>
            ))}
          </div>

          {/* Dossiers par statut */}
          {dossiers.length > 0 && (
            <div style={{ ...glass, padding: "16px 18px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#000", opacity: 0.4, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, margin: 0 }}>Répartition dossiers</p>
              {[
                { key: "urgent", label: "Urgents", count: dossiers.filter(d=>d.status==='urgent').length, color: "#ef4444" },
                { key: "en_cours", label: "En cours", count: dossiers.filter(d=>d.status==='en_cours').length, color: "#f59e0b" },
                { key: "stable", label: "Stables", count: dossiers.filter(d=>d.status==='stable').length, color: "#22c55e" },
                { key: "en_attente", label: "En attente", count: dossiers.filter(d=>d.status==='en_attente').length, color: "#9ca3af" },
              ].map(s => (
                <div key={s.key} style={{ marginBottom: 9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#000", opacity: 0.8, fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#0A00A0", fontWeight: 600 }}>{s.count}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(10,0,160,0.08)", borderRadius: 999, overflow: "hidden" }}>
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