import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Sparkles, Copy, Shield, AlertTriangle, CheckCircle, FileText, RefreshCw, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";

const urgenceConfig = {
  faible: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  moyen: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  élevé: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
};

function anonymize(text) {
  return text
    .replace(/\b[A-Z][a-zéèêëàâùûüîïôç]+\s[A-Z][a-zéèêëàâùûüîïôç]+\b/g, "[CLIENT]")
    .replace(/\b[A-Za-zÀ-ÿ0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]")
    .replace(/\b\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}\b/g, "[NUMERO]")
    .replace(/\b(?:0[1-9]|[12]\d|3[01])[\/\-\.]\s?(?:0[1-9]|1[0-2])[\/\-\.]\s?\d{2,4}\b/g, "[DATE]")
    .replace(/\b(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}\b/gi, "[DATE]")
    .replace(/\b(?:SARL|SAS|SA|EURL|SNC|SCI|SASU|NV|BV)\s+[A-ZÀ-Ÿa-zà-ÿ\s&.-]+/g, "[ENTREPRISE]");
}

export default function AnalyseMailsPage() {
  const [emailText, setEmailText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [result, setResult] = useState(null);
  const [detailedReply, setDetailedReply] = useState(null);

  const handleAnalyze = async () => {
    if (!emailText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setDetailedReply(null);

    const anonymized = anonymize(emailText);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en droit du travail français. Analyse cet email (déjà anonymisé) d'un client et fournis une analyse juridique structurée. Email : """${anonymized}"""`,
      response_json_schema: {
        type: "object",
        properties: {
          type_situation: { type: "string", description: "Type de situation juridique (ex: licenciement abusif, harcèlement moral, rupture conventionnelle...)" },
          niveau_urgence: { type: "string", enum: ["faible", "moyen", "élevé"] },
          resume: { type: "string", description: "Résumé clair du mail en 5-6 lignes maximum" },
          points_cles: { type: "array", items: { type: "string" }, description: "Points juridiques clés à vérifier" },
          suggestion_reponse: { type: "string", description: "Brouillon de réponse simple que l'avocat peut modifier" },
          anonymized_text: { type: "string", description: "Le texte après anonymisation" }
        }
      }
    });

    setResult({ ...response, anonymized_text: anonymized });
    setIsLoading(false);
  };

  const handleDetailedReply = async () => {
    if (!result) return;
    setIsGeneratingReply(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un avocat spécialisé en droit du travail français. Rédige une réponse email professionnelle, détaillée et structurée pour ce type de situation : "${result.type_situation}". Contexte résumé : "${result.resume}". La réponse doit être formelle, rassurante pour le client, mentionner les prochaines étapes et les pièces à fournir.`,
    });
    setDetailedReply(res);
    setIsGeneratingReply(false);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: `${label} copié dans le presse-papier.` });
  };

  const urgence = result ? (urgenceConfig[result.niveau_urgence] || urgenceConfig["moyen"]) : null;

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Outils IA</p>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Analyse de mails</h1>
        <p className="text-sm text-muted-foreground mt-1">Analysez rapidement les emails clients en droit du travail.</p>
      </div>

      {/* Privacy banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/15 rounded-xl">
        <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-primary">Analyse automatique — ne remplace pas un avis juridique.</p>
          <p className="text-xs text-muted-foreground mt-0.5">Les données sont anonymisées avant analyse. <span className="font-medium text-foreground">Aucune donnée personnelle n'est stockée.</span></p>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Contenu de l'email</span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
            <Shield className="h-3 w-3" /> Anonymisation automatique
          </span>
        </div>
        <textarea
          value={emailText}
          onChange={e => setEmailText(e.target.value)}
          placeholder="Collez ici le contenu de l'email client…"
          rows={8}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none transition-colors"
        />
        <button
          onClick={handleAnalyze}
          disabled={!emailText.trim() || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading
            ? <><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Analyse en cours…</>
            : <><Sparkles className="h-4 w-4" /> Analyser le mail</>
          }
        </button>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">

          {/* Type + Urgence */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Type de situation</p>
              <p className="text-base font-semibold text-foreground font-serif">{result.type_situation}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Niveau d'urgence</p>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${urgence?.dot}`} />
                <span className={`text-sm font-semibold px-3 py-1 rounded-lg border capitalize ${urgence?.color}`}>
                  {result.niveau_urgence}
                </span>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Résumé</p>
              </div>
              <button
                onClick={() => copyToClipboard(result.resume, "Résumé")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Copier
              </button>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{result.resume}</p>
          </div>

          {/* Points clés */}
          {result.points_cles?.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Points clés à vérifier</p>
              </div>
              <div className="space-y-2">
                {result.points_cles.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/80">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestion de réponse */}
          <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Suggestion de réponse</p>
              </div>
              <button
                onClick={() => copyToClipboard(result.suggestion_reponse, "Réponse")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Copier
              </button>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{result.suggestion_reponse}</p>

            {/* Réponse détaillée */}
            {detailedReply ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Réponse détaillée</p>
                  <button
                    onClick={() => copyToClipboard(detailedReply, "Réponse détaillée")}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copier
                  </button>
                </div>
                <div className="text-sm text-foreground/70 leading-relaxed bg-muted/30 rounded-lg p-3 prose prose-sm max-w-none">
                  <ReactMarkdown>{detailedReply}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={handleDetailedReply}
                disabled={isGeneratingReply}
                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isGeneratingReply
                  ? <><div className="h-3.5 w-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" /> Génération…</>
                  : <><RefreshCw className="h-3.5 w-3.5" /> Générer une réponse plus détaillée</>
                }
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}