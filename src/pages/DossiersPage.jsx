import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, FolderOpen, Trash2, X, CheckCircle, Scale } from "lucide-react";
import CollaboratorsManager from "../components/dossiers/CollaboratorsManager";
import { motion } from "framer-motion";

const statusConfig = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  en_cours: { label: "En cours", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  stable: { label: "Stable", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  en_attente: { label: "En attente", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
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

  const handleDossierUpdate = (updated) => {
    setDossiers(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const filtered = filter === "all" ? dossiers : dossiers.filter(d => d.status === filter);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 border-2 border-foreground/10 border-t-foreground/40 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Gestion</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Mes dossiers</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors card-shadow"
        >
          <Plus className="h-4 w-4" />
          Nouveau dossier
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-7 flex-wrap">
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`text-xs px-4 py-2 rounded-xl transition-all font-medium ${
              filter === s.value
                ? 'bg-primary text-primary-foreground card-shadow'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {s.label}
            {s.value !== "all" && (
              <span className="ml-1.5 opacity-60">
                ({dossiers.filter(d => d.status === s.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* New dossier form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 mb-7 card-shadow"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Nouveau dossier</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {[
              { placeholder: "Intitulé du dossier *", key: "title" },
              { placeholder: "Client *", key: "client" },
              { placeholder: "Type (licenciement, harcèlement...)", key: "type" },
            ].map(f => (
              <input key={f.key} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
            ))}
            <input type="date" value={form.next_hearing} onChange={e => setForm(p => ({...p, next_hearing: e.target.value}))}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
            <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors col-span-2 sm:col-span-1">
              <option value="urgent">Urgent</option>
              <option value="en_cours">En cours</option>
              <option value="stable">Stable</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
          <textarea placeholder="Description (optionnel)" value={form.description}
            onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={2}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 mb-4 resize-none transition-colors" />
          <div className="flex gap-2">
            <button onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              <CheckCircle className="h-4 w-4" /> Créer le dossier
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm hover:text-foreground transition-colors">
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-border card-shadow">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="text-foreground font-semibold">Aucun dossier</p>
          <p className="text-sm text-muted-foreground mt-1">Créez votre premier dossier pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => {
            const sc = statusConfig[d.status] || statusConfig.en_cours;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="bg-card rounded-2xl border border-border p-5 hover:card-shadow-md card-shadow transition-shadow group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${sc.dot}`} />
                    <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(d.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 leading-snug">{d.title}</h3>
                <p className="text-xs text-muted-foreground">{d.client}</p>
                {d.type && <p className="text-[11px] text-muted-foreground/60 mt-1 italic">{d.type}</p>}
                {d.description && <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">{d.description}</p>}

                <CollaboratorsManager dossier={d} onUpdate={handleDossierUpdate} />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">
                      {d.jurisprudences?.length || 0} jurisprudence{(d.jurisprudences?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {d.next_hearing && (
                    <span className="text-[11px] text-foreground/60 font-medium">{d.next_hearing}</span>
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