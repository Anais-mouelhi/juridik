import { Calendar, MapPin, CheckCircle, BookMarked, X, ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";

export default function CaseDetailView({ caseData, onClose, onSave, isSaved }) {
  if (!caseData) return null;

  const copyToClipboard = () => {
    const text = `${caseData.title}\n${caseData.reference} - ${caseData.date}\n\n${caseData.summary}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copié", description: "Le résumé a été copié dans le presse-papier." });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="gap-1.5">
              <Copy className="h-4 w-4" />
              Copier
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onSave(caseData)} className="gap-1.5">
              <BookMarked className={`h-4 w-4 ${isSaved ? 'fill-accent text-accent' : ''}`} />
              {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-6">
            {/* Meta */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                  {caseData.jurisdiction}
                </Badge>
                {caseData.topics?.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              <h2 className="text-xl font-serif font-semibold text-foreground leading-tight">
                {caseData.title}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {caseData.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {caseData.reference}
                </span>
              </div>
            </div>

            {/* Key Points */}
            {caseData.key_points?.length > 0 && (
              <div className="bg-primary/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Points clés</h3>
                <div className="space-y-2">
                  {caseData.key_points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground/80">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Résumé de la décision</h3>
              <div className="prose prose-sm max-w-none text-foreground/80">
                <ReactMarkdown>{caseData.summary}</ReactMarkdown>
              </div>
            </div>

            {/* Full text */}
            {caseData.full_text && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Texte intégral</h3>
                <div className="prose prose-sm max-w-none text-foreground/70 bg-muted/30 rounded-lg p-4">
                  <ReactMarkdown>{caseData.full_text}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}