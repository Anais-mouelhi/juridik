import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, CheckSquare, Square, Trash2, AlertCircle, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TachesPage() {
  const [tasks, setTasks] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", dossier_id: "", dossier_name: "", due_date: "", priority: "normal" });

  useEffect(() => {
    Promise.all([
      base44.entities.Task.list('-created_date', 200),
      base44.entities.Dossier.list('-created_date', 100),
    ]).then(([t, d]) => { setTasks(t); setDossiers(d); setIsLoading(false); });
  }, []);

  const handleCreate = async () => {
    if (!form.title) return;
    const dossier = dossiers.find(d => d.id === form.dossier_id);
    await base44.entities.Task.create({ ...form, dossier_name: dossier?.title || form.dossier_name, completed: false });
    setForm({ title: "", dossier_id: "", dossier_name: "", due_date: "", priority: "normal" });
    setShowForm(false);
    const t = await base44.entities.Task.list('-created_date', 200);
    setTasks(t);
  };

  const toggleComplete = async (task) => {
    await base44.entities.Task.update(task.id, { completed: !task.completed });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = async (id) => {
    await base44.entities.Task.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  // Group pending by dossier
  const grouped = pending.reduce((acc, t) => {
    const key = t.dossier_name || "Sans dossier";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Gestion</p>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Tâches</h1>
          <p className="text-sm text-muted-foreground mt-1">{pending.length} en cours · {done.length} terminées</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Nouvelle tâche</h3>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-3 mb-4">
            <input placeholder="Titre de la tâche *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.dossier_id} onChange={e => setForm(f => ({...f, dossier_id: e.target.value}))}
                className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                <option value="">Sans dossier</option>
                {dossiers.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))}
                className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
              <option value="urgent">🔴 Urgent</option>
              <option value="normal">🟡 Normal</option>
              <option value="low">🟢 Faible priorité</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <CheckCircle className="h-4 w-4" />Ajouter
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:text-foreground transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {/* Pending tasks grouped */}
      {pending.length === 0 ? (
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-16 mb-6">
          <CheckSquare className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-foreground font-medium">Aucune tâche en cours</p>
          <p className="text-sm text-muted-foreground mt-1">Ajoutez des tâches à vos dossiers.</p>
        </div>
      ) : (
        <div className="space-y-6 mb-6">
          {Object.entries(grouped).map(([dossierName, groupTasks]) => (
            <div key={dossierName} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dossierName}</p>
              </div>
              <div className="divide-y divide-border">
                {groupTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-5 py-3 group"
                  >
                    <button onClick={() => toggleComplete(task)} className="flex-shrink-0">
                      <Square className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                    {task.priority === 'urgent' && <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{task.title}</p>
                      {task.due_date && <p className="text-xs text-muted-foreground mt-0.5">Échéance : {task.due_date}</p>}
                    </div>
                    <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden opacity-60">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terminées ({done.length})</p>
          </div>
          <div className="divide-y divide-border">
            {done.map(task => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3 group">
                <button onClick={() => toggleComplete(task)} className="flex-shrink-0">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </button>
                <p className="text-sm text-muted-foreground line-through flex-1">{task.title}</p>
                <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}