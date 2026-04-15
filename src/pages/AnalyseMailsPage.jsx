import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  Mail, Sparkles, Copy, Shield, AlertTriangle, CheckCircle,
  FileText, RefreshCw, Lock, Eye, EyeOff, FolderPlus, Search,
  CalendarPlus, Download, ChevronRight, ArrowRight, BookOpen, Gavel
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import { base44 as b44 } from "@/api/base44Client";

// ── Anonymisation ──────────────────────────────────────────────────────────────
function anonymize(text) {
  return text
    .replace(/\b[A-Z][a-zéèêëàâùûüîïôç]+\s[A-Z][a-zéèêëàâùûüîïôç]+\b/g, "[CLIENT]")
    .replace(/\b[A-Za-zÀ-ÿ0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]")
    .replace(/\b\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}\b/g, "[NUMERO]")
    .replace(/\b(?:0[1-9]|[12]\d|3[01])[\/\-\.]\s?(?:0[1-9]|1[0-2])[\/\-\.]\s?\d{2,4}\b/g, "[DATE]")
    .replace(/\b(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}\b/gi, "[DATE]")
    .replace(/\b(?:SARL|SAS|SA|EURL|SNC|SCI|SASU)\s+[A-ZÀ-Ÿa-zà-ÿ\s&.-]+/g, "[ENTREPRISE]");
}

// ── Configs ────────────────────────────────────────────────────────────────────
const urgenceConfig = {
  faible: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", label: "Faible" },
  moyen:  { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Moyen" },
  élevé:  { color: "bg-red-100 text-red-700 border-red-200",       dot: "bg-red-500",   label: "Élevé" },
};

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepBadge({ n, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${done ? "text-primary" : active ? "text-foreground" : "text-muted-foreground/40"}`}>
      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-colors
        ${done ? "bg-primary text-primary-foreground border-primary" : active ? "bg-card border-foreground/30 text-foreground" : "bg-card border-border text-muted-foreground/40"}`}>
        {done ? <CheckCircle className="h-3.5 w-3.5" /> : n}
      </div>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AnalyseMailsPage() {
  const navigate = useNavigate();
  const [emailText, setEmailText] = useState("");
  const [anonymizedText, setAnonymizedText] = useState("");
  const [showAnon, setShowAnon] = useState(false);
  const [step, setStep] = useState(1); // 1=input, 2=preview, 3=result, 4=actions
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [result, setResult] = useState(null);
  const [detailedReply, setDetailedReply] = useState(null);
  const [creatingDossier, setCreatingDossier] = useState(false);

  // Step 1 → 2: anonymise and preview
  const handlePreview = () => {
    if (!emailText.trim()) return;
    setAnonymizedText(anonymize(emailText));
    setStep(2);
    setShowAnon(false);
  };

  // Step 2 → 3: send to IA
  const handleAnalyze = async () => {
    setIsLoading(true);
    setStep(3);
    setResult(null);
    setDetailedReply(null);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en droit du travail français. Analyse cet email anonymisé d'un client et fournis une analyse juridique très structurée.

Email anonymisé :
"""${anonymizedText}"""

Sois précis sur les thèmes juridiques (faute grave, entretien préalable, ancienneté, période d'essai, etc.) et propose des jurisprudences réelles et pertinentes.`,
      response_json_schema: {
        type: "object",
        properties: {
          domaine: { type: "string", description: "Domaine juridique principal (ex: Droit du licenciement, Harcèlement moral…)" },
          themes: { type: "array", items: { type: "string" }, description: "Thèmes juridiques précis identifiés (faute grave, entretien préalable, ancienneté, clause de non-concurrence…)" },
          type_situation: { type: "string", description: "Type de situation (ex: Licenciement pour faute grave)" },
          niveau_urgence: { type: "string", enum: ["faible", "moyen", "élevé"] },
          resume: { type: "string", description: "Résumé structuré en 5-6 lignes" },
          points_cles: { type: "array", items: { type: "string" }, description: "Points légaux à examiner" },
          jurisprudences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                reference: { type: "string" },
                titre: { type: "string" },
                pertinence: { type: "string" }
              }
            },
            description: "2-3 jurisprudences pertinentes avec référence et pourquoi elles s'appliquent"
          },
          suggestion_reponse: { type: "string", description: "Brouillon de réponse email sobre que l'avocat peut modifier" }
        }
      }
    });

    setResult(response);
    setIsLoading(false);
  };

  const handleDetailedReply = async () => {
    setIsGeneratingReply(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un avocat spécialisé en droit du travail français. Rédige une réponse email professionnelle, détaillée et structurée pour ce type de situation : "${result.type_situation}". Contexte résumé : "${result.resume}". Formelle, rassurante, avec les prochaines étapes et les pièces à fournir.`,
    });
    setDetailedReply(res);
    setIsGeneratingReply(false);
  };

  const handleCreateDossier = async () => {
    if (!result) return;
    setCreatingDossier(true);
    await base44.entities.Dossier.create({
      title: result.type_situation || "Dossier issu d'analyse mail",
      client: "À renseigner",
      status: result.niveau_urgence === "élevé" ? "urgent" : "en_cours",
      type: result.domaine || "",
      description: result.resume || "",
    });
    setCreatingDossier(false);
    toast({ title: "Dossier créé !", description: "Retrouvez-le dans la section Mes dossiers." });
  };

  const handleSearchJurisprudence = () => {
    if (!result) return;
    const q = encodeURIComponent(result.type_situation || result.domaine || "");
    navigate(`/search?q=${q}`);
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      `ANALYSE MAIL — ${new Date().toLocaleDateString("fr-FR")}`,
      ``,
      `Domaine : ${result.domaine}`,
      `Type : ${result.type_situation}`,
      `Urgence : ${result.niveau_urgence}`,
      ``,
      `RÉSUMÉ`,
      result.resume,
      ``,
      `POINTS CLÉS`,
      ...(result.points_cles || []).map(p => `• ${p}`),
      ``,
      `JURISPRUDENCES`,
      ...(result.jurisprudences || []).map(j => `• ${j.reference} — ${j.titre}`),
      ``,
      `SUGGESTION DE RÉPONSE`,
      result.suggestion_reponse,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "analyse-mail.txt"; a.click();
  };

  const copy = (text, label) => {
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
        <p className="text-sm text-muted-foreground mt-1">Flux sécurisé en 4 étapes — anonymisation RGPD automatique.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        <StepBadge n="1" label="Mail brut"       active={step === 1} done={step > 1} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
        <StepBadge n="2" label="Anonymisation"   active={step === 2} done={step > 2} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
        <StepBadge n="3" label="Analyse IA"      active={step === 3} done={step > 3} />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
        <StepBadge n="4" label="Actions"         active={step === 4} done={false} />
      </div>

      {/* Privacy banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/15 rounded-xl">
        <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary">Secret professionnel & RGPD.</span>{" "}
          Le mail est anonymisé localement avant d'être envoyé à l'IA. <span className="font-medium text-foreground">Aucune donnée personnelle n'est stockée.</span> L'analyse ne remplace pas un avis juridique.
        </p>
      </div>

      {/* ── STEP 1 : Input ─────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Contenu de l'email</span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
            <Shield className="h-3 w-3" /> Anonymisation automatique
          </span>
        </div>
        <textarea
          value={emailText}
          onChange={e => { setEmailText(e.target.value); if (step > 1) { setStep(1); setResult(null); } }}
          placeholder="Collez ici le contenu de l'email client…"
          rows={8}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none transition-colors"
        />
        <button
          onClick={handlePreview}
          disabled={!emailText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Shield className="h-4 w-4" /> Anonymiser & prévisualiser
        </button>
      </div>

      {/* ── STEP 2 : Anonymisation preview ─────────────────────────────── */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Aperçu après anonymisation</span>
              </div>
              <button onClick={() => setShowAnon(v => !v)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {showAnon ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showAnon ? "Masquer" : "Voir"}
              </button>
            </div>

            <AnimatePresence>
              {showAnon && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <pre className="px-5 py-4 text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed font-mono bg-muted/20 max-h-48 overflow-y-auto">
                    {anonymizedText}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">Les balises <code className="bg-muted px-1 rounded text-[11px]">[CLIENT]</code> <code className="bg-muted px-1 rounded text-[11px]">[EMAIL]</code> <code className="bg-muted px-1 rounded text-[11px]">[ENTREPRISE]</code> <code className="bg-muted px-1 rounded text-[11px]">[DATE]</code> remplacent toutes les données personnelles.</p>
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isLoading
                  ? <><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Analyse…</>
                  : <><Sparkles className="h-4 w-4" /> Lancer l'analyse IA</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP 3 : Loading ───────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <Sparkles className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground mt-4">Analyse juridique en cours…</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Le mail anonymisé est transmis à l'IA</p>
        </div>
      )}

      {/* ── STEP 3 : Results ──────────────────────────────────────────── */}
      {result && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">

          {/* Domaine + Urgence + Thèmes */}
          <div className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Domaine juridique</p>
                <p className="text-base font-semibold text-foreground font-serif">{result.domaine}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{result.type_situation}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Niveau d'urgence</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${urgence?.dot}`} />
                  <span className={`text-sm font-semibold px-3 py-1 rounded-lg border capitalize ${urgence?.color}`}>
                    {urgence?.label || result.niveau_urgence}
                  </span>
                </div>
              </div>
            </div>

            {result.themes?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Thèmes identifiés</p>
                <div className="flex flex-wrap gap-2">
                  {result.themes.map((t, i) => (
                    <span key={i} className="text-[12px] px-3 py-1 bg-primary/8 text-primary border border-primary/15 rounded-lg font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Résumé */}
          <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Résumé structuré</p>
              </div>
              <button onClick={() => copy(result.resume, "Résumé")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
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
                <p className="text-sm font-semibold text-foreground">Points légaux à examiner</p>
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

          {/* Jurisprudences */}
          {result.jurisprudences?.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Jurisprudences suggérées</p>
              </div>
              <div className="space-y-3">
                {result.jurisprudences.map((j, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{j.reference}</p>
                      <p className="text-sm text-foreground/70 mt-0.5">{j.titre}</p>
                      {j.pertinence && <p className="text-xs text-muted-foreground mt-1 italic">{j.pertinence}</p>}
                    </div>
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
                <p className="text-sm font-semibold text-foreground">Brouillon de réponse</p>
              </div>
              <button onClick={() => copy(result.suggestion_reponse, "Réponse")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Copy className="h-3.5 w-3.5" /> Copier
              </button>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{result.suggestion_reponse}</p>

            {detailedReply ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Réponse détaillée</p>
                  <button onClick={() => copy(detailedReply, "Réponse détaillée")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="h-3.5 w-3.5" /> Copier
                  </button>
                </div>
                <div className="text-sm text-foreground/70 bg-muted/30 rounded-lg p-3 prose prose-sm max-w-none">
                  <ReactMarkdown>{detailedReply}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <button onClick={handleDetailedReply} disabled={isGeneratingReply}
                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {isGeneratingReply
                  ? <><div className="h-3.5 w-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" /> Génération…</>
                  : <><RefreshCw className="h-3.5 w-3.5" /> Générer une réponse plus détaillée</>}
              </button>
            )}
          </div>

          {/* ── STEP 4 : Actions ─────────────────────────────────────── */}
          <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Actions rapides</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleCreateDossier}
                disabled={creatingDossier}
                className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl hover:bg-muted/50 hover:border-foreground/20 transition-all text-center group"
              >
                {creatingDossier
                  ? <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  : <FolderPlus className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />}
                <span className="text-xs font-medium text-foreground leading-tight">Créer un dossier</span>
              </button>

              <button
                onClick={handleSearchJurisprudence}
                className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl hover:bg-muted/50 hover:border-foreground/20 transition-all text-center group"
              >
                <Search className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-xs font-medium text-foreground leading-tight">Recherche jurisprudentielle</span>
              </button>

              <button
                onClick={() => navigate("/calendrier")}
                className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl hover:bg-muted/50 hover:border-foreground/20 transition-all text-center group"
              >
                <CalendarPlus className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-xs font-medium text-foreground leading-tight">Planifier un RDV client</span>
              </button>

              <button
                onClick={handleExport}
                className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-xl hover:bg-muted/50 hover:border-foreground/20 transition-all text-center group"
              >
                <Download className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-xs font-medium text-foreground leading-tight">Exporter l'analyse</span>
              </button>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}