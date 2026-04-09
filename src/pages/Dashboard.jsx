import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, FolderOpen, CheckSquare, Calendar, ArrowRight, Plus, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  urgent: { label: "Urgent", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  en_cours: { label: "En cours", color: "bg-primary/20 text-primary border-primary/30" },
  stable: { label: "Stable", color: "bg-green-500/20 text-green-400 border-green-500/30" },
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
      setUser(me);
      setDossiers(d);
      setTasks(t);
      setSearches(s);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const urgentCount = dossiers.filter(d => d.status === 'urgent').length;
  const todayTasks = tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0]);

  const stats = [
    { icon: FolderOpen, label: "Dossiers actifs", value: dossiers.length, sub: `${urgentCount} urgent${urgentCount !== 1 ? 's' : ''}` },
    { icon: Search, label: "Recherches", value: searches.length, sub: "Total effectuées" },
    { icon: CheckSquare, label: "Tâches en cours", value: tasks.length, sub: `${todayTasks.length} aujourd'hui` },
    { icon: Calendar, label: "Audiences", value: dossiers.filter(d => d.next_hearing).length, sub: "Cette semaine" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-muted-foreground text-sm mb-1">Tableau de bord</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          Bonjour, {user?.full_name?.split(' ')[0] || 'Maître'}
        </h1>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <TrendingUp className="h-3 w-3 text-primary/60" />
            </div>
            <p className="text-3xl font-serif font-semibold text-foreground">{s.value}</p>
            <p className="text-sm text-foreground/80 font-medium mt-1">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dossiers récents */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Dossiers en cours</h2>
            <Link to="/dossiers" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {dossiers.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Aucun dossier. <Link to="/dossiers" className="text-primary hover:underline">Créer un dossier</Link>
              </div>
            ) : dossiers.slice(0, 5).map(d => {
              const sc = statusConfig[d.status] || statusConfig.en_cours;
              return (
                <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.client}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium flex-shrink-0 ${sc.color}`}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tâches prioritaires */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Tâches prioritaires</h2>
            <Link to="/taches" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tasks.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Aucune tâche. <Link to="/taches" className="text-primary hover:underline">Ajouter une tâche</Link>
              </div>
            ) : tasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                {t.priority === 'urgent' && <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />}
                {t.priority !== 'urgent' && <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{t.title}</p>
                  {t.dossier_name && <p className="text-xs text-muted-foreground">{t.dossier_name}</p>}
                </div>
                {t.due_date && <p className="text-xs text-muted-foreground flex-shrink-0">{t.due_date}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick search CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
        <Link to="/search">
          <div className="relative bg-card rounded-xl border border-primary/30 p-6 hover:border-primary/60 transition-colors group overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs text-primary uppercase tracking-widest mb-1">Recherche IA</p>
                <p className="text-lg font-serif font-semibold text-foreground">Lancer une nouvelle recherche jurisprudentielle</p>
                <p className="text-sm text-muted-foreground mt-1">Décrivez votre situation en langage naturel</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0 ml-4">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}