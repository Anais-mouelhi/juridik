import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Search, Sparkles, ArrowRight, FolderOpen, Plus,
  BookOpen, CheckCircle, ArrowUpRight, Clock, Gavel
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const quickThemes = [
  "Licenciement abusif",
  "Faute grave",
  "Harcèlement moral",
  "Rupture conventionnelle",
  "Clause de non-concurrence",
  "Discrimination syndicale",
];

const statusConfig = {
  urgent:     { dot: "bg-red-500",            label: "Urgent" },
  en_cours:   { dot: "bg-amber-400",          label: "En cours" },
  stable:     { dot: "bg-green-500",          label: "Stable" },
  en_attente: { dot: "bg-muted-foreground/40", label: "En attente" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [searches, setSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [addingTo, setAddingTo] = useState(null); // result.reference being added

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Dossier.list('-created_date', 20),
      base44.entities.SearchHistory.list('-created_date', 5),
    ]).then(([me, d, s]) => {
      setUser(me); setDossiers(d); setSearches(s); setIsLoading(false);
    });
  }, []);

  const handleSearch = async (q) => {
    const term = q || query;
    if (!term.trim()) return;
    setQuery(term);
    setIsSearching(true);
    setResults(null);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en droit du travail français. Recherche des jurisprudences pour : "${term}". Génère 3 décisions pertinentes avec une référence plausible, un score de pertinence entre 60 et 99, et un résumé structuré en 3 parties (faits, motifs, solution).`,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title:       { type: "string" },
                reference:   { type: "string" },
                date:        { type: "string" },
                jurisdiction: { type: "string" },
                score:       { type: "number", description: "Score de pertinence entre 60 et 99" },
                faits:       { type: "string" },
                motifs:      { type: "string" },
                solution:    { type: "string" },
                topics:      { type: "array", items: { type: "string" } },
              }
            }
          }
        }
      }
    });

    setResults(response?.results || []);
    setIsSearching(false);

    await base44.entities.SearchHistory.create({ query: term, results_count: response?.results?.length || 0 });
    setSearches(prev => [{ query: term, created_date: new Date().toISOString() }, ...prev].slice(0, 5));
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

  const handleFullSearch = () => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
    else navigate("/search");
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 border-2 border-foreground/10 border-t-foreground/40 rounded-full animate-spin" />
    </div>
  );

  const firstName = user?.full_name?.split(' ')[0] || 'Maître';

  return (
    <div className="min-h-full">

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div className="bg-primary px-6 lg:px-10 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary-foreground/40 mb-2 font-medium">JurisIA · Droit du travail</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-primary-foreground leading-tight mb-6">
              Bonjour, {firstName}.<br />
              <span className="text-primary-foreground/60">Quelle situation analysez-vous ?</span>
            </h1>
          </motion.div>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/40" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Décrivez la situation en langage naturel…"
                  className="w-full bg-primary-foreground/10 border border-primary-foreground/15 rounded-2xl pl-11 pr-4 py-4 text-sm text-primary-foreground placeholder:text-primary-foreground/35 focus:outline-none focus:bg-primary-foreground/15 focus:border-primary-foreground/30 transition-all"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={!query.trim() || isSearching}
                className="flex items-center gap-2 px-5 py-4 bg-primary-foreground text-primary rounded-2xl text-sm font-semibold hover:bg-primary-foreground/90 disabled:opacity-50 transition-all flex-shrink-0"
              >
                {isSearching
                  ? <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  : <Sparkles className="h-4 w-4" />}
                <span className="hidden sm:inline">Analyser</span>
              </button>
            </div>

            {/* Quick themes */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickThemes.map(t => (
                <button
                  key={t}
                  onClick={() => handleSearch(t)}
                  className="text-[11px] px-3 py-1.5 bg-primary-foreground/8 hover:bg-primary-foreground/15 text-primary-foreground/60 hover:text-primary-foreground border border-primary-foreground/10 rounded-xl transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── RESULTS / CONTENT ─────────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto space-y-6">

        {/* Loading */}
        {isSearching && (
          <div className="flex flex-col items-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              <Sparkles className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Recherche en cours…</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results && !isSearching && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{results.length} résultat{results.length !== 1 ? 's' : ''} — <span className="text-foreground">{query}</span></p>
                <button onClick={handleFullSearch} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Recherche complète <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {results.map((r, i) => (
                <motion.div
                  key={r.reference}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden card-shadow"
                >
                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[11px] font-medium text-muted-foreground">{r.jurisdiction}</span>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-[11px] text-muted-foreground">{r.date}</span>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{r.reference}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground leading-snug">{r.title}</h3>
                      </div>
                      {/* Score badge */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold
                          ${r.score >= 85 ? 'bg-green-100 text-green-700' : r.score >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                          {r.score}
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-0.5">pertinence</span>
                      </div>
                    </div>

                    {/* Structured summary */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Faits", text: r.faits },
                        { label: "Motifs", text: r.motifs },
                        { label: "Solution", text: r.solution },
                      ].map(s => (
                        <div key={s.label} className="bg-muted/30 rounded-xl p-3">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                          <p className="text-xs text-foreground/75 leading-relaxed line-clamp-3">{s.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Topics */}
                    {r.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {r.topics.map(t => (
                          <span key={t} className="text-[11px] px-2.5 py-0.5 bg-primary/8 text-primary border border-primary/15 rounded-lg">{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      {addingTo === r.reference ? (
                        <div className="flex items-center gap-2 flex-wrap flex-1">
                          <span className="text-xs text-muted-foreground">Ajouter à :</span>
                          {dossiers.length === 0
                            ? <Link to="/dossiers" className="text-xs text-primary hover:underline">Créer un dossier</Link>
                            : dossiers.map(d => (
                              <button key={d.id} onClick={() => handleAddToDossier(r, d.id)}
                                className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                                {d.title}
                              </button>
                            ))}
                          <button onClick={() => setAddingTo(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setAddingTo(r.reference)}
                            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors font-medium">
                            <Plus className="h-3.5 w-3.5" /> Ajouter au dossier
                          </button>
                          <button onClick={() => navigate(`/search?q=${encodeURIComponent(r.title)}`)}
                            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors font-medium">
                            <BookOpen className="h-3.5 w-3.5" /> Approfondir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Full search CTA */}
              <button onClick={handleFullSearch}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-card border border-border rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                <Search className="h-4 w-4" />
                Recherche jurisprudentielle complète
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default state (no search yet) */}
        {!results && !isSearching && (
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Recent searches */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden card-shadow">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Recherches récentes</p>
                </div>
                <Link to="/search" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  Nouvelle <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {searches.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Search className="h-6 w-6 mx-auto text-muted-foreground/20 mb-2" />
                    <p className="text-xs text-muted-foreground">Aucune recherche récente</p>
                  </div>
                ) : searches.map((s, i) => (
                  <button key={i} onClick={() => handleSearch(s.query)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors text-left group">
                    <Gavel className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-sm text-foreground/80 group-hover:text-foreground truncate transition-colors">{s.query}</span>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors ml-auto flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Dossiers */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="bg-card border border-border rounded-2xl overflow-hidden card-shadow">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Dossiers jurisprudentiels</p>
                </div>
                <Link to="/dossiers" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {dossiers.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <FolderOpen className="h-6 w-6 mx-auto text-muted-foreground/20 mb-2" />
                    <Link to="/dossiers" className="text-xs text-primary hover:underline">Créer un premier dossier →</Link>
                  </div>
                ) : dossiers.slice(0, 5).map(d => {
                  const sc = statusConfig[d.status] || statusConfig.en_cours;
                  return (
                    <div key={d.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.jurisprudences?.length || 0} jurisprudence{(d.jurisprudences?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}