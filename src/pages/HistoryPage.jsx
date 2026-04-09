import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { History, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import moment from "moment";
import { Link } from "react-router-dom";

export default function HistoryPage() {
  const [searches, setSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await base44.entities.SearchHistory.list('-created_date', 100);
    setSearches(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.SearchHistory.delete(id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAll = async () => {
    for (const s of searches) {
      await base44.entities.SearchHistory.delete(s.id);
    }
    setSearches([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Historique des recherches</h1>
          <p className="text-sm text-muted-foreground mt-1">{searches.length} recherche{searches.length !== 1 ? 's' : ''}</p>
        </div>
        {searches.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll} className="text-destructive hover:text-destructive gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Tout effacer
          </Button>
        )}
      </div>

      {searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-primary/30" />
          </div>
          <p className="text-foreground font-medium">Aucun historique</p>
          <p className="text-sm text-muted-foreground mt-1">Vos recherches apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {searches.map((search, i) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                to={`/search?q=${encodeURIComponent(search.query)}`}
                className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-all group"
              >
                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <Search className="h-3.5 w-3.5 text-primary/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {search.query}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {search.results_count ? `${search.results_count} résultats` : 'Aucun résultat'} · {moment(search.created_date).format('DD MMM YYYY à HH:mm')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(search.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}