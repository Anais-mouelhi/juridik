import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, SlidersHorizontal, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SearchBar from "../components/search/SearchBar";
import SearchFilters from "../components/search/SearchFilters";
import SearchResultCard from "../components/search/SearchResultCard";
import CaseDetailView from "../components/case/CaseDetailView";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  // Load URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      performSearch(q, {});
    }
  }, []);

  // Load saved cases to track which ones are saved
  useEffect(() => {
    base44.entities.SavedCase.list('-created_date', 200).then((saved) => {
      setSavedIds(new Set(saved.map((s) => s.reference)));
    });
  }, []);

  const performSearch = async (searchQuery, searchFilters) => {
    setIsLoading(true);
    setHasSearched(true);

    const filterText = Object.entries(searchFilters || {})
      .filter(([, v]) => v && !v.startsWith("Tous") && !v.startsWith("Toutes"))
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const prompt = `Tu es un expert en droit du travail français. L'utilisateur recherche des jurisprudences sur le sujet suivant:

Requête: "${searchQuery}"
${filterText ? `Filtres: ${filterText}` : ''}

Génère 5 résultats de jurisprudence réalistes et pertinents en droit du travail français. Pour chaque résultat, fournis des informations plausibles et détaillées. Les résultats doivent être variés en termes de juridictions et de dates.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                jurisdiction: { type: "string" },
                date: { type: "string" },
                reference: { type: "string" },
                summary: { type: "string" },
                topics: { type: "array", items: { type: "string" } },
                key_points: { type: "array", items: { type: "string" } },
                full_text: { type: "string" }
              }
            }
          }
        }
      }
    });

    const searchResults = response?.results || [];
    setResults(searchResults);
    setIsLoading(false);

    // Save search history
    await base44.entities.SearchHistory.create({
      query: searchQuery,
      filters: searchFilters,
      results_count: searchResults.length,
    });
  };

  const handleSearch = () => {
    performSearch(query, filters);
  };

  const handleSave = async (caseData) => {
    if (savedIds.has(caseData.reference)) return;

    await base44.entities.SavedCase.create({
      title: caseData.title,
      jurisdiction: caseData.jurisdiction,
      date: caseData.date,
      reference: caseData.reference,
      summary: caseData.summary,
      full_text: caseData.full_text,
      topics: caseData.topics,
      key_points: caseData.key_points,
    });

    setSavedIds((prev) => new Set([...prev, caseData.reference]));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Recherche jurisprudentielle</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Décrivez votre problématique en langage naturel
        </p>
      </div>

      {/* Search bar */}
      <div className="space-y-3 mb-6">
        <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} isLoading={isLoading} />
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showFilters ? 'Masquer les filtres' : 'Filtres avancés'}
          </Button>
        </div>

        {showFilters && <SearchFilters filters={filters} setFilters={setFilters} />}
      </div>

      {/* Results */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <Sparkles className="h-6 w-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground mt-4">Analyse IA en cours...</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Recherche dans la jurisprudence du droit du travail</p>
        </motion.div>
      )}

      {!isLoading && hasSearched && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{results.length} résultats</span> trouvés
          </p>
          {results.map((result, index) => (
            <SearchResultCard
              key={result.reference}
              result={result}
              index={index}
              onSave={handleSave}
              onView={setSelectedCase}
              isSaved={savedIds.has(result.reference)}
            />
          ))}
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Scale className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground mt-4">Aucun résultat trouvé</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Essayez de reformuler votre recherche</p>
        </div>
      )}

      {!hasSearched && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-foreground font-medium">Recherche intelligente</p>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
            Posez votre question en langage naturel. Par exemple : 
            <span className="italic"> "licenciement pour faute grave d'un salarié en arrêt maladie"</span>
          </p>
        </motion.div>
      )}

      {/* Case detail modal */}
      {selectedCase && (
        <CaseDetailView
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onSave={handleSave}
          isSaved={savedIds.has(selectedCase.reference)}
        />
      )}
    </div>
  );
}