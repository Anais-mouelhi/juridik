import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Search, FolderOpen, CheckSquare, Calendar, ArrowRight,
  AlertCircle, Clock, ArrowUpRight, Sparkles, Bell
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  urgent:    { label: "Urgent",    color: "bg-red-50 text-red-600 border-red-200" },
  en_cours:  { label: "En cours",  color: "bg-gold-light text-amber-700 border-amber-200" },
  stable:    { label: "Stable",    color: "bg-green-50 text-green-600 border-green-200" },
  en_attente:{ label: "En attente",color: "bg-muted text-muted-foreground border-border" },
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
      <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
    </div>
  );

  const urgentCount = dossiers.filter(d => d.status === 'urgent').length;
  const todayTasks = tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0]);

  const stats = [
    { icon: FolderOpen,  label: "Dossiers actifs",   value: dossiers.length, sub: `${urgentCount} urgent${urgentCount !== 1 ? 's' : ''}`, href: "/dossiers" },
    { icon: Search,      label: "Recherches IA",      value: searches.length, sub: "Total effectuées",                                       href: "/search" },
    { icon: CheckSquare, label: "Tâches en cours",    value: tasks.length,    sub: `${todayTasks.length} aujourd'hui`,                       href: "/taches" },
    { icon: Calendar,    label: "Audiences planifiées",value: dossiers.filter(d => d.next_hearing).length, sub: "À venir",                  href: "/calendrier" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-7">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1.5">
            Tableau de bord
          </p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Bonjour, {user?.full_name?.split(' ')[0] || 'Maître'} 👋
          </h1>
        </div>
        <div className="hidden lg:flex items-center gap-2 mt-1">
          <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors card-shadow">
            <Bell className="h-4 w-4" />
          </button>
          <div className="h-9 w-9 rounded-full bg-[hsl(42,85%,52%)] flex items-center justify-center text-xs font-bold text-[hsl(222,28%,8%)]">
            {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?'}
          </div>
        </div>
      </motion.div>

      {/* Hero CTA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.07 }}>
        <Link to="/search">
          <div className="relative bg-[hsl(222,28%,10%)] rounded-2xl p-7 overflow-hidden group cursor-pointer hover:brightness-110 transition-all card-shadow-md">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[hsl(42,85%,52%)]/8 pointer-events-none" />
            <div className="absolute bottom-0 right-12 w-28 h-28 rounded-full bg-[hsl(42,85%,52%)]/5 pointer-events-none" />
            <div className="relative z-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(220,10%,45%)] mb-3 font-semibold">
                  Intelligence Artificielle · Droit du travail
                </p>
                <h2 className="text-xl font-bold text-white leading-snug">
                  Trouvez la jurisprudence<br />qu'il vous faut
                </h2>
                <p className="text-sm text-[hsl(220,10%,55%)] mt-1.5">
                  Décrivez votre situation en langage naturel.
                </p>
              </div>
              <div className="hidden sm:flex h-11 w-11 rounded-xl bg-[hsl(42,85%,52%)] group-hover:scale-105 transition-transform items-center justify-center flex-shrink-0">
                <ArrowUpRight className="h-5 w-5 text-[hsl(222,28%,8%)]" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
          >
            <Link to={s.href}>
              <div className="bg-card rounded-2xl border border-border p-5 card-shadow hover:card-shadow-md transition-all group hover:border-[hsl(42,85%,52%)]/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-[hsl(42,85%,52%)]/10 transition-colors">
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[hsl(42,85%,52%)] transition-colors" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-border group-hover:text-muted-foreground transition-colors" />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm font-medium text-foreground/80 mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Dossiers */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.38 }}
          className="bg-card rounded-2xl border border-border overflow-hidden card-shadow"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Dossiers en cours</h2>
            </div>
            <Link to="/dossiers" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {dossiers.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FolderOpen className="h-7 w-7 mx-auto mb-2 text-border" />
                <Link to="/dossiers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Créer un dossier →
                </Link>
              </div>
            ) : dossiers.slice(0, 5).map(d => {
              const sc = statusConfig[d.status] || statusConfig.en_cours;
              return (
                <div key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.client}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium flex-shrink-0 ${sc.color}`}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tasks */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.46 }}
          className="bg-card rounded-2xl border border-border overflow-hidden card-shadow"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Tâches prioritaires</h2>
            </div>
            <Link to="/taches" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tasks.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckSquare className="h-7 w-7 mx-auto mb-2 text-border" />
                <Link to="/taches" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ajouter une tâche →
                </Link>
              </div>
            ) : tasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                {t.priority === 'urgent'
                  ? <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                  : <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{t.title}</p>
                  {t.dossier_name && <p className="text-xs text-muted-foreground mt-0.5">{t.dossier_name}</p>}
                </div>
                {t.due_date && <p className="text-xs text-muted-foreground flex-shrink-0">{t.due_date}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}