import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Sparkles, Plus, FileText, Download, ChevronRight, Filter } from "lucide-react";
import { motion } from "framer-motion";
import SearchFilters from "../components/search/SearchFilters";
import CaseDetailView from "../components/case/CaseDetailView";

const themes = [
  { label: "Licenciement abusif", icon: "⚖️" },
  { label: "Faute grave", icon: "🔴" },
  { label: "Harcèlement moral", icon: "🛡️" },
  { label: "Discrimination", icon: "🚫" },
  { label: "Rupture conventionnelle", icon: "🤝" },
  { label: "Clause de non-concurrence", icon: "🔒" },
  { label: "Temps de travail", icon: "🕐" },
  { label: "Heures supplémentaires", icon: "📋" },
  { label: "Arrêt maladie", icon: "🏥" },
  { label: "Salaire et primes", icon: "💶" },
  { label: "CDD / CDI", icon: "📄" },
  { label: "Période d'essai", icon: "🔍" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [activeTab, setActiveTab] = useState("results");
  const [addingTo, setAddingTo] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);

  const handleTheme = (theme) => {
    setQuery(theme);
    setSearchVisible(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) { setQuery(q); performSearch(q, {}); }
    base44.entities.Dossier.list('-created_date', 50).then(setDossiers);
  }, []);

  const performSearch = async (searchQuery, searchFilters) => {
    setIsLoading(true);
    setHasSearched(true);
    const filterText = Object.entries(searchFilters || {})
      .filter(([, v]) => v && !v.startsWith("Tous") && !v.startsWith("Toutes"))
      .map(([k, v]) => `${k}: ${v}`).join(", ");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en droit du travail français. L'utilisateur recherche des jurisprudences sur: "${searchQuery}"${filterText ? `. Filtres: ${filterText}` : ''}. Génère 4 résultats réalistes et pertinents avec des références plausibles (pourvoi, chambre sociale). Pour chaque résultat, génère: (1) un résumé analytique clair, (2) un texte intégral réaliste de style décision de justice française (avec les formules officielles : "LA COUR DE CASSATION, CHAMBRE SOCIALE...", "Attendu que...", "Par ces motifs...", etc.) d'au moins 300 mots.`,
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
                chamber: { type: "string" },
                date: { type: "string" },
                reference: { type: "string" },
                source: { type: "string" },
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

    await base44.entities.SearchHistory.create({
      query: searchQuery,
      filters: searchFilters,
      results_count: searchResults.length,
    });
  };

  const handleAddToDossier = async (result, dossierId) => {
    const dossier = dossiers.find(d => d.id === dossierId);
    if (!dossier) return;
    const existing = dossier.jurisprudences || [];
    await base44.entities.Dossier.update(dossierId, {
      jurisprudences: [...existing, { title: result.title, reference: result.reference, date: result.date }]
    });
    setAddingTo(null);
  };

  const exportPDF = (result) => {
    const content = `${result.title}\n${result.reference} - ${result.date}\n\n${result.summary}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${result.reference}.txt`; a.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar - only shown when search is active */}
      {searchVisible && (
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Recherche</p>
          <p className="text-lg font-serif font-semibold text-foreground leading-none mt-0.5">IA</p>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && performSearch(query, filters)}
            placeholder="Rechercher une jurisprudence..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <button
          onClick={() => query.trim() && performSearch(query, filters)}
          disabled={!query.trim() || isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Plus className="h-4 w-4" />}
          Nouvelle recherche
        </button>
      </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Theme cards - shown when search not yet triggered */}
        {!searchVisible && (
          <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Recherche IA</p>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Jurisprudence droit du travail</h1>
            <p className="text-sm text-muted-foreground mb-8">Choisissez un thème ou saisissez votre recherche librement.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {themes.map(t => (
                <button
                  key={t.label}
                  onClick={() => handleTheme(t.label)}
                  className="flex flex-col items-start gap-2 p-4 bg-card border border-border rounded-2xl text-left hover:bg-muted hover:border-foreground/20 transition-all card-shadow group"
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-sm font-medium text-foreground leading-snug">{t.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSearchVisible(true)}
              className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
              Recherche libre
            </button>
          </div>
        )}

          {/* Search panel - shown when searchVisible */}
          {searchVisible && (
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Recherche jurisprudentielle IA</h2>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/20 font-medium">
                Spécialisée droit du travail
              </span>
            </div>
            <div className="p-5">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && query.trim() && performSearch(query, filters)}
                    placeholder="Ex : faute grave et ancienneté du salarié..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => query.trim() && performSearch(query, filters)}
                  disabled={!query.trim() || isLoading}
                  className="px-5 py-3 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isLoading ? <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" /> : <Search className="h-4 w-4" />}
                  Rechercher
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-card border border-border text-muted-foreground rounded-lg text-sm hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
              {showFilters && <SearchFilters filters={filters} setFilters={setFilters} />}
            </div>
          </div>

          {/* Results */}
          {hasSearched && !isLoading && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-6 px-5 py-3 border-b border-border">
                {[
                  { id: "results", label: `Résultats (${results.length})` },
                  { id: "theme", label: "Par thème" },
                  { id: "chrono", label: "Chronologique" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-sm pb-1 transition-colors ${activeTab === tab.id ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="divide-y divide-border">
                {results.map((result, index) => (
                  <motion.div
                    key={result.reference}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.07 }}
                    className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setSelectedCase(result)}
                  >
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">{result.title}</h3>
                      <p className="text-xs text-muted-foreground">{result.chamber} · {result.reference} · {result.source || 'Légifrance'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{result.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {addingTo === result.reference ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">Ajouter à :</span>
                          {dossiers.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Aucun dossier</span>
                          ) : dossiers.map(d => (
                            <button key={d.id} onClick={() => handleAddToDossier(result, d.id)}
                              className="text-xs px-3 py-1.5 bg-primary/15 text-primary rounded-lg hover:bg-primary/25 transition-colors">
                              {d.title}
                            </button>
                          ))}
                          <button onClick={() => setAddingTo(null)} className="text-xs text-muted-foreground hover:text-foreground">Annuler</button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingTo(result.reference)}
                          className="flex items-center gap-1.5 text-xs px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
                          <Plus className="h-3.5 w-3.5" />
                          Ajouter au dossier
                        </button>
                      )}
                      <button onClick={() => setSelectedCase(result)}
                        className="flex items-center gap-1.5 text-xs px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
                        <FileText className="h-3.5 w-3.5" />
                        Résumé complet
                      </button>
                      <button onClick={() => exportPDF(result)}
                        className="flex items-center gap-1.5 text-xs px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
                        <Download className="h-3.5 w-3.5" />
                        Export PDF
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <Sparkles className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">Analyse IA en cours...</p>
            </div>
          )}

          {!hasSearched && !isLoading && (
            <div className="text-center py-16">
              <Search className="h-10 w-10 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-foreground font-medium mb-1">Décrivez votre situation</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">Saisissez votre requête et lancez la recherche.</p>
            </div>
          )}
          </div>
          )}
        </div>

        {selectedCase && (
          <CaseDetailView
            caseData={selectedCase}
            onClose={() => setSelectedCase(null)}
            onSave={() => {}}
            isSaved={false}
          />
        )}
      </div>
  );
}