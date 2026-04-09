import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookMarked, Trash2, Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import CaseDetailView from "../components/case/CaseDetailView";

export default function SavedCases() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    const saved = await base44.entities.SavedCase.list('-created_date', 200);
    setCases(saved);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.SavedCase.delete(id);
    setCases((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = cases.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.reference?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.topics?.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()))
  );

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
          <h1 className="text-2xl font-serif font-semibold text-foreground">Décisions sauvegardées</h1>
          <p className="text-sm text-muted-foreground mt-1">{cases.length} décision{cases.length !== 1 ? 's' : ''} dans votre bibliothèque</p>
        </div>
      </div>

      {/* Search filter */}
      {cases.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrer les décisions..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Cases list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-primary/30" />
          </div>
          <p className="text-foreground font-medium">
            {cases.length === 0 ? 'Aucune décision sauvegardée' : 'Aucun résultat'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {cases.length === 0 ? 'Sauvegardez des décisions depuis la page de recherche.' : 'Essayez un autre terme de recherche.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedCase(c)}
            >
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookMarked className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.jurisdiction} · {c.date} · {c.reference}
                  </p>
                  {c.topics?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {c.topics.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedCase && (
        <CaseDetailView
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onSave={() => {}}
          isSaved={true}
        />
      )}
    </div>
  );
}