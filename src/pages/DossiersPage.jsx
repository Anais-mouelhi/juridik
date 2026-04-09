import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, FolderOpen, Trash2, Edit2, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  urgent: { label: "Urgent", color: "bg-red-500/15 text-red-400 border-red-500/25" },
  en_cours: { label: "En cours", color: "bg-primary/15 text-primary border-primary/25" },
  stable: { label: "Stable", color: "bg-green-500/15 text-green-400 border-green-500/25" },
  en_attente: { label: "En attente", color: "bg-muted text-muted-foreground border-border" },
};

const statuses = [
  { value: "all", label: "Tous" },
  { value: "urgent", label: "Urgent" },
  { value: "en_cours", label: "En cours" },
  { value: "stable", label: "Stable" },
  { value: "en_attente", label: "En attente" },
];

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", client: "", status: "en_cours", type: "", description: "", next_hearing: "" });

  useEffect(() => { loadDossiers(); }, []);

  const loadDossiers = async () => {
    setIsLoading(true);
    const data = await base44.entities.Dossier.list('-created_date', 100);
    setDossiers(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.client) return;
    await base44.entities.Dossier.create(form);
    setForm({ title: "", client: "", status: "en_cours", type: "", description: "", next_hearing: "" });
    setShowForm(false);
    loadDossiers();
  };

  const handleDelete = async (id) => {
    await base44.entities.Dossier.delete(id);
    setDossiers(prev => prev.filter(d => d.id !== id));
  };

  const filtered = filter === "all" ? dossiers : dossiers.filter(d => d.status === filter);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Gestion</p>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Mes dossiers</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau dossier
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`text-xs px-4 py-2 rounded-lg transition-colors font-medium ${
              filter === s.value ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
            {s.value !== "all" && (
              <span className="ml-1.5 opacity-70">
                ({dossiers.filter(d => d.status === s.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* New dossier form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Nouveau dossier</h3>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input placeholder="Intitulé du dossier *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            <input placeholder="Client *" value={form.client} onChange={e => setForm(f => ({...f, client: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            <input placeholder="Type (licenciement, harcèlement...)" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            <input type="date" placeholder="Prochaine audience" value={form.next_hearing} onChange={e => setForm(f => ({...f, next_hearing: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
            <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
              <option value="urgent">Urgent</option>
              <option value="en_cours">En cours</option>
              <option value="stable">Stable</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 mb-4 resize-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <CheckCircle className="h-4 w-4" />Créer le dossier
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:text-foreground transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Dossiers grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-foreground font-medium">Aucun dossier</p>
          <p className="text-sm text-muted-foreground mt-1">Créez votre premier dossier pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => {
            const sc = statusConfig[d.status] || statusConfig.en_cours;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-border/80 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${sc.color}`}>
                    {sc.label}
                  </span>
                  <button onClick={() => handleDelete(d.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{d.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{d.client}</p>
                {d.type && <p className="text-xs text-muted-foreground/60 mb-2">{d.type}</p>}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {d.jurisprudences?.length || 0} jurisprudence{(d.jurisprudences?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  {d.next_hearing && (
                    <span className="text-xs text-primary">{d.next_hearing}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}