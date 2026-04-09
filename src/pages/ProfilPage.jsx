import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { User, Mail, Shield, LogOut, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilPage() {
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Compte</p>
        <h1 className="text-2xl font-serif font-semibold text-foreground mb-6">Profil</h1>

        {/* Avatar + name */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4 flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{user?.full_name || 'Utilisateur'}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Scale className="h-3.5 w-3.5" />
              Avocat · Droit du travail
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
          <div className="divide-y divide-border">
            <div className="flex items-center gap-3 px-5 py-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Nom complet</p>
                <p className="text-sm text-foreground">{user?.full_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-sm text-foreground">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Rôle</p>
                <p className="text-sm text-foreground capitalize">{user?.role || 'Utilisateur'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </motion.div>
    </div>
  );
}