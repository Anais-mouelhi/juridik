import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, BookMarked, History, Scale, ArrowRight, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import StatsCard from "../components/dashboard/StatsCard";
import RecentSearchItem from "../components/dashboard/RecentSearchItem";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [me, searches, saved] = await Promise.all([
      base44.auth.me(),
      base44.entities.SearchHistory.list('-created_date', 5),
      base44.entities.SavedCase.list('-created_date', 50),
    ]);
    setUser(me);
    setRecentSearches(searches);
    setSavedCount(saved.length);
    setIsLoading(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-foreground/10 border-t-foreground/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-sm text-muted-foreground mb-1">{greeting()}</p>
        <h1 className="font-serif text-4xl font-semibold text-foreground leading-tight">
          {user?.full_name?.split(' ')[0] || 'Maître'}
        </h1>
      </motion.div>

      {/* Hero search CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <Link to="/search">
          <div className="relative bg-primary rounded-3xl p-8 overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow duration-300">
            <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -right-4 w-36 h-36 rounded-full bg-white/5" />
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-primary-foreground/50 text-xs uppercase tracking-widest mb-3">IA · Droit du travail</p>
                <h2 className="font-serif text-2xl font-semibold text-primary-foreground leading-snug max-w-xs">
                  Trouvez la jurisprudence qu'il vous faut
                </h2>
                <p className="text-primary-foreground/60 text-sm mt-2 max-w-sm">
                  Décrivez votre problématique en langage naturel.
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center h-12 w-12 rounded-2xl bg-primary-foreground/10 group-hover:bg-primary-foreground/20 transition-colors flex-shrink-0">
                <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard icon={Search} label="Recherches" value={recentSearches.length} subtitle="Total effectuées" delay={0.2} />
        <StatsCard icon={BookMarked} label="Sauvegardées" value={savedCount} subtitle="Dans votre bibliothèque" delay={0.3} dark />
        <StatsCard icon={Scale} label="Thématiques" value="11" subtitle="Domaines couverts" delay={0.4} />
      </div>

      {/* Recent searches */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-card rounded-3xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Recherches récentes</h3>
          </div>
          <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            Tout voir <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div>
          {recentSearches.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              Lancez votre première recherche.
            </div>
          ) : (
            recentSearches.map((search) => (
              <RecentSearchItem key={search.id} search={search} />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}