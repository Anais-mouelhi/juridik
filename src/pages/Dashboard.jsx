import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Search, FolderOpen, CheckSquare, Calendar, ArrowRight,
  AlertCircle, Clock, ArrowUpRight, MailSearch
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  urgent:    { label: "Urgent",    color: "bg-red-50 text-red-600 border-red-200",         dot: "bg-red-500" },
  en_cours:  { label: "En cours",  color: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400" },
  stable:    { label: "Stable",    color: "bg-green-50 text-green-600 border-green-200",   dot: "bg-green-500" },
  en_attente:{ label: "En attente",color: "bg-gray-50 text-gray-500 border-gray-200",      dot: "bg-gray-400" },
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
      base44.entities.Dossier.list('-created_date', 20),
      base44.entities.Task.filter({ completed: false }, '-created_date', 20),
      base44.entities.SearchHistory.list('-created_date', 50),
    ]).then(([me, d, t, s]) => {
      setUser(me); setDossiers(d); setTasks(t); setSearches(s); setIsLoading(false);
    });
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
    </div>
  );

  const urgentCount   = dossiers.filter(d => d.status === 'urgent').length;
  const todayTasks    = tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0]);
  const upcoming      = dossiers.filter(d => d.next_hearing).sort((a,b) => a.next_hearing > b.next_hearing ? 1 : -1).slice(0, 5);

  const stats = [
    { icon: FolderOpen,  label: "Dossiers actifs",    value: dossiers.length,                           sub: `${urgentCount} urgent${urgentCount !== 1 ? 's' : ''}`, href: "/dossiers" },
    { icon: Search,      label: "Recherches IA",       value: searches.length,                           sub: "Total effectuées",                                      href: "/search" },
    { icon: CheckSquare, label: "Tâches en cours",     value: tasks.length,                              sub: `${todayTasks.length} aujourd'hui`,                      href: "/taches" },
    { icon: Calendar,    label: "Audiences",           value: dossiers.filter(d=>d.next_hearing).length, sub: "Planifiées",                                            href: "/calendrier" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-1">Tableau de bord</p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Bonjour, {user?.full_name?.split(' ')[0] || 'Maître'} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {urgentCount > 0 ? `${urgentCount} dossier${urgentCount>1?'s':''} urgent${urgentCount>1?'s':''} · ` : ''}
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} en attente · {dossiers.filter(d=>d.next_hearing).length} audience{dossiers.filter(d=>d.next_hearing).length !== 1 ? 's' : ''} planifiée{dossiers.filter(d=>d.next_hearing).length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Main layout: left content + right upcoming panel */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">

        {/* LEFT */}
        <div className="space-y-5">

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.06 + i * 0.06 }}
              >
                <Link to={s.href}>
                  <div className="bg-white rounded-xl border border-border p-4 card-shadow hover:border-[hsl(42,90%,50%)]/50 hover:card-shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-7 w-7 rounded-lg bg-[hsl(220,10%,96%)] flex items-center justify-center group-hover:bg-[hsl(42,90%,50%)]/12 transition-colors">
                        <s.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[hsl(42,90%,50%)] transition-colors" />
                      </div>
                      <ArrowUpRight className="h-3 w-3 text-border group-hover:text-muted-foreground transition-colors" />
                    </div>
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs font-medium text-foreground/80 mt-0.5 leading-tight">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.28 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <Link to="/search">
                <div className="bg-[hsl(222,25%,10%)] rounded-xl p-5 group hover:brightness-110 transition-all card-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">Recherche jurisprudentielle IA</p>
                  <p className="text-xs text-white/45 mt-1">Droit du travail</p>
                </div>
              </Link>

              <Link to="/analyse-mails">
                <div className="bg-white rounded-xl border border-border p-5 group hover:border-[hsl(42,90%,50%)]/50 hover:card-shadow-md transition-all card-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-8 w-8 rounded-lg bg-[hsl(220,10%,96%)] flex items-center justify-center group-hover:bg-[hsl(42,90%,50%)]/12 transition-colors">
                      <MailSearch className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(42,90%,50%)] transition-colors" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-border group-hover:text-muted-foreground transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">Analyse de mails</p>
                  <p className="text-xs text-muted-foreground mt-1">Anonymisation RGPD</p>
                </div>
              </Link>

              <Link to="/dossiers">
                <div className="bg-white rounded-xl border border-border p-5 group hover:border-[hsl(42,90%,50%)]/50 hover:card-shadow-md transition-all card-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-8 w-8 rounded-lg bg-[hsl(220,10%,96%)] flex items-center justify-center group-hover:bg-[hsl(42,90%,50%)]/12 transition-colors">
                      <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(42,90%,50%)] transition-colors" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-border group-hover:text-muted-foreground transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">Mes dossiers</p>
                  <p className="text-xs text-muted-foreground mt-1">{dossiers.length} dossier{dossiers.length !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Dossiers list */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.36 }}
            className="bg-white rounded-xl border border-border card-shadow overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Dossiers récents</h2>
              </div>
              <Link to="/dossiers" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {dossiers.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">Aucun dossier</p>
                  <Link to="/dossiers" className="text-xs text-[hsl(42,90%,45%)] font-medium hover:underline mt-1 inline-block">
                    Créer un dossier →
                  </Link>
                </div>
              ) : dossiers.slice(0, 5).map(d => {
                const sc = statusConfig[d.status] || statusConfig.en_cours;
                return (
                  <div key={d.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(220,10%,98%)] transition-colors">
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.client}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium flex-shrink-0 ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Upcoming / Échéances */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
          className="space-y-3"
        >
          <div className="bg-white rounded-xl border border-border card-shadow overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">Prochaines échéances</p>
            </div>
            <div className="divide-y divide-border">
              {upcoming.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Calendar className="h-7 w-7 mx-auto mb-2 text-border" />
                  <p className="text-xs text-muted-foreground">Aucune audience planifiée</p>
                  <Link to="/calendrier" className="text-xs text-[hsl(42,90%,45%)] font-medium hover:underline mt-1 inline-block">
                    Voir le calendrier →
                  </Link>
                </div>
              ) : upcoming.map((d, i) => {
                const date = d.next_hearing ? new Date(d.next_hearing) : null;
                const day  = date?.getDate();
                const mon  = date?.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
                const isFirst = i === 0;
                return (
                  <div key={d.id} className={`flex items-start gap-3 px-4 py-3.5 ${isFirst ? 'bg-[hsl(222,25%,10%)]' : 'hover:bg-[hsl(220,10%,98%)]'} transition-colors`}>
                    {/* Date block */}
                    <div className={`flex flex-col items-center justify-center w-10 flex-shrink-0 rounded-lg py-1.5 ${isFirst ? 'bg-white/10' : 'bg-[hsl(220,10%,96%)]'}`}>
                      <span className={`text-lg font-bold leading-none ${isFirst ? 'text-white' : 'text-foreground'}`}>{day}</span>
                      <span className={`text-[9px] font-semibold mt-0.5 ${isFirst ? 'text-[hsl(42,90%,60%)]' : 'text-muted-foreground'}`}>{mon}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight truncate ${isFirst ? 'text-white' : 'text-foreground'}`}>
                        {d.title}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${isFirst ? 'text-white/50' : 'text-muted-foreground'}`}>
                        {d.client}{d.type ? ` · ${d.type}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {upcoming.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border">
                <Link to="/calendrier" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  Voir le calendrier <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Tasks panel */}
          <div className="bg-white rounded-xl border border-border card-shadow overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">Tâches prioritaires</p>
              <Link to="/taches" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {tasks.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">Aucune tâche</p>
                </div>
              ) : tasks.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(220,10%,98%)] transition-colors">
                  {t.priority === 'urgent'
                    ? <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    : <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                    {t.dossier_name && <p className="text-[11px] text-muted-foreground truncate">{t.dossier_name}</p>}
                  </div>
                  {t.due_date && <p className="text-[11px] text-muted-foreground flex-shrink-0">{t.due_date}</p>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}