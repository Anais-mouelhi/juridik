import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { User, Mail, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((me) => {
      setUser(me);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-serif font-semibold text-foreground mb-6">Paramètres</h1>

        {/* Profile card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-xl font-semibold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-foreground">{user?.full_name || 'Utilisateur'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {user?.email || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Role info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Rôle et accès
          </h2>
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-sm text-foreground capitalize">{user?.role || 'Utilisateur'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}