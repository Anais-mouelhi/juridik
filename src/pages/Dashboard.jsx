import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, BookMarked, History, Scale, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import StatsCard from "../components/dashboard/StatsCard";
import RecentSearchItem from "../components/dashboard/RecentSearchItem";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          {greeting()}, {user?.full_name?.split(' ')[0] || 'Maître'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Votre assistant IA en droit du travail est prêt.
        </p>
      </motion.div>

      {/* Quick search CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <Link to="/search">
          <div className="relative overflow-hidden bg-primary rounded-2xl p-8 text-primary-foreground hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-accent">Recherche IA</span>
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-2">
                Trouvez la jurisprudence qu'il vous faut
              </h2>
              <p className="text-primary-foreground/70 text-sm max-w-lg">
                Décrivez votre problématique en langage naturel. Notre IA analyse et retrouve les décisions pertinentes en droit du travail.
              </p>
              <Button
                variant="secondary"
                className="mt-4 gap-2 group-hover:gap-3 transition-all"
              >
                Commencer une recherche
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          icon={Search}
          label="Recherches effectuées"
          value={recentSearches.length}
          subtitle="Total des recherches"
          delay={0.2}
        />
        <StatsCard
          icon={BookMarked}
          label="Décisions sauvegardées"
          value={savedCount}
          subtitle="Dans votre bibliothèque"
          delay={0.3}
        />
        <StatsCard
          icon={Scale}
          label="Domaines couverts"
          value="11"
          subtitle="Thématiques du droit du travail"
          delay={0.4}
        />
      </div>

      {/* Recent searches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-card rounded-xl border border-border"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Recherches récentes</h3>
          </div>
          <Link to="/history" className="text-xs text-primary hover:underline">
            Tout voir
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentSearches.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Aucune recherche récente. Lancez votre première recherche !
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