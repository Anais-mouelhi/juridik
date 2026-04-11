import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, X, Mail } from "lucide-react";

export default function CollaboratorsManager({ dossier, onUpdate }) {
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const collaborators = dossier.collaborators || [];

  const handleAdd = async () => {
    if (!email.trim() || collaborators.includes(email.trim())) return;
    const updated = [...collaborators, email.trim()];
    await base44.entities.Dossier.update(dossier.id, { collaborators: updated });
    onUpdate({ ...dossier, collaborators: updated });
    setEmail("");
    setIsAdding(false);
  };

  const handleRemove = async (emailToRemove) => {
    const updated = collaborators.filter(e => e !== emailToRemove);
    await base44.entities.Dossier.update(dossier.id, { collaborators: updated });
    onUpdate({ ...dossier, collaborators: updated });
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Collaborateurs</span>
          {collaborators.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground">
              {collaborators.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="text-[11px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" /> Ajouter
        </button>
      </div>

      {collaborators.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {collaborators.map(collab => (
            <div key={collab} className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-foreground truncate">{collab}</span>
              </div>
              <button onClick={() => handleRemove(collab)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="flex gap-2 mt-2">
          <input
            type="email"
            placeholder="email@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
            className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <button onClick={handleAdd} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
            OK
          </button>
          <button onClick={() => { setIsAdding(false); setEmail(""); }} className="px-2 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:text-foreground transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {collaborators.length === 0 && !isAdding && (
        <p className="text-[11px] text-muted-foreground">Aucun collaborateur ajouté.</p>
      )}
    </div>
  );
}