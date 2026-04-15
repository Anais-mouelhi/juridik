import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  X, User, Tag, FileText, Calendar, Scale, Users,
  Pencil, CheckCircle, Trash2, BookOpen, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CollaboratorsManager from "./CollaboratorsManager";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  urgent:    { label: "Urgent",    color: "bg-red-100 text-red-700 border-red-200",     dot: "bg-red-500" },
  en_cours:  { label: "En cours",  color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  stable:    { label: "Stable",    color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  en_attente:{ label: "En attente",color: "bg-muted text-muted-foreground border-border",  dot: "bg-muted-foreground" },
};

export default function DossierDetail({ dossier, onClose, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...dossier });
  const [saving, setSaving] = useState(false);

  const sc = statusConfig[dossier.status] || statusConfig.en_cours;

  const handleSave = async () => {
    setSaving(true);
    const updated = await base44.entities.Dossier.update(dossier.id, form);
    onUpdate({ ...dossier, ...form });
    setEditing(false);
    setSaving(false);
  };

  const handleRemoveJurisprudence = async (index) => {
    const newJuris = (dossier.jurisprudences || []).filter((_, i) => i !== index);
    await base44.entities.Dossier.update(dossier.id, { jurisprudences: newJuris });
    onUpdate({ ...dossier, jurisprudences: newJuris });
  };

  const Field = ({ label, value }) => value ? (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  ) : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${sc.dot}`} />
              <span className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${sc.color}`}>{sc.label}</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground leading-tight">{dossier.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{dossier.client}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(e => !e)}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Edit form */}
          <AnimatePresence>
            {editing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4 bg-muted/30 border-b border-border space-y-3 overflow-hidden">
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  placeholder="Intitulé *"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                <input value={form.client} onChange={e => setForm(f => ({...f, client: e.target.value}))}
                  placeholder="Client *"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.type || ""} onChange={e => setForm(f => ({...f, type: e.target.value}))}
                    placeholder="Type"
                    className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                    className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option value="urgent">Urgent</option>
                    <option value="en_cours">En cours</option>
                    <option value="stable">Stable</option>
                    <option value="en_attente">En attente</option>
                  </select>
                </div>
                <input type="date" value={form.next_hearing || ""} onChange={e => setForm(f => ({...f, next_hearing: e.target.value}))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                <textarea value={form.description || ""} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={3} placeholder="Description"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    {saving ? <div className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    Enregistrer
                  </button>
                  <button onClick={() => { setEditing(false); setForm({...dossier}); }}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm hover:text-foreground transition-colors">
                    Annuler
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6 py-5 space-y-6">
            {/* Infos */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client" value={dossier.client} />
              <Field label="Type" value={dossier.type} />
              <Field label="Prochaine audience" value={dossier.next_hearing} />
              <Field label="Créé le" value={dossier.created_date ? new Date(dossier.created_date).toLocaleDateString("fr-FR") : null} />
            </div>

            {dossier.description && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> Description
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 rounded-xl p-4">{dossier.description}</p>
              </div>
            )}

            {/* Jurisprudences */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-3 w-3" /> Jurisprudences ({dossier.jurisprudences?.length || 0})
                </p>
                <button onClick={() => navigate(`/search`)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowUpRight className="h-3 w-3" /> Rechercher
                </button>
              </div>
              {!dossier.jurisprudences?.length ? (
                <p className="text-xs text-muted-foreground bg-muted/20 rounded-xl p-4 text-center">
                  Aucune jurisprudence ajoutée.<br />
                  <button onClick={() => navigate("/search")} className="text-primary hover:underline mt-1 inline-block">Lancer une recherche →</button>
                </p>
              ) : (
                <div className="space-y-2">
                  {dossier.jurisprudences.map((j, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border group">
                      <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{j.reference}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{j.title}</p>
                        {j.date && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{j.date}</p>}
                      </div>
                      <button onClick={() => handleRemoveJurisprudence(i)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded flex-shrink-0">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collaborateurs */}
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Collaborateurs
              </p>
              <CollaboratorsManager dossier={dossier} onUpdate={onUpdate} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button onClick={() => { onDelete(dossier.id); onClose(); }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Supprimer ce dossier
          </button>
        </div>
      </motion.div>
    </>
  );
}