import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, FolderOpen, CheckSquare, Calendar, ArrowRight, AlertCircle, Clock, TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700 border-red-200" },
  en_cours: { label: "En cours", color: "bg-amber-100 text-amber-700 border-amber-200" },
  stable: { label: "Stable", color: "bg-green-100 text-green-700 border-green-200" },
  en_attente: { label: "En attente", color: "bg-muted text-muted-foreground border-border" },
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
      <div className="w-7 h-7 border-2 border-foreground/10 border-t-foreground/40 rounded-full animate-spin" />
    </div>
  );

  const urgentCount = dossiers.filter(d => d.status === 'urgent').length;
  const todayTasks = tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0]);

  const stats = [
    { icon: FolderOpen, label: "Dossiers actifs", value: dossiers.length, sub: `${urgentCount} urgent${urgentCount !== 1 ? 's' : ''}`, href: "/dossiers" },
    { icon: Search, label: "Recherches", value: searches.length, sub: "Total effectuées", href: "/search" },
    { icon: CheckSquare, label: "Tâches en cours", value: tasks.length, sub: `${todayTasks.length} aujourd'hui`, href: "/taches" },
    { icon: Calendar, label: "Audiences", value: dossiers.filter(d => d.next_hearing).length, sub: "Planifiées", href: "/calendrier" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Tableau de bord</p>
        <h1 className="font-serif text-4xl font-semibold text-foreground leading-tight">
          Bonjour, {user?.full_name?.split(' ')[0] || 'Maître'} 👋
        </h1>
      </motion.div>

      {/* Hero CTA */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
        <Link to="/search">
          <div className="relative bg-primary rounded-2xl p-8 overflow-hidden group cursor-pointer card-shadow-md hover:opacity-95 transition-opacity">
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute bottom-0 right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/40 mb-3 font-medium">Intelligence Artificielle · Droit du travail</p>
                <h2 className="font-serif text-2xl font-semibold text-primary-foreground leading-snug">
                  Trouvez la jurisprudence<br />qu'il vous faut
                </h2>
                <p className="text-sm text-primary-foreground/55 mt-2">Décrivez votre situation en langage naturel.</p>
              </div>
              <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-primary-foreground/10 group-hover:bg-primary-foreground/18 transition-colors items-center justify-center flex-shrink-0">
                <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 + i * 0.07 }}
          >
            <Link to={s.href}>
              <div className="bg-card rounded-2xl border border-border p-5 card-shadow hover:card-shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </div>
                <p className="text-3xl font-serif font-semibold text-foreground">{s.value}</p>
                <p className="text-sm font-medium text-foreground/80 mt-1">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Dossiers */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.42 }}
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
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                <FolderOpen className="h-7 w-7 mx-auto mb-2 opacity-25" />
                <Link to="/dossiers" className="hover:text-foreground transition-colors">Créer un dossier →</Link>
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
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}
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
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                <CheckSquare className="h-7 w-7 mx-auto mb-2 opacity-25" />
                <Link to="/taches" className="hover:text-foreground transition-colors">Ajouter une tâche →</Link>
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