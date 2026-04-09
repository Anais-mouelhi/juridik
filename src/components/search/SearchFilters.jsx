import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

const jurisdictions = [
  "Toutes juridictions",
  "Cour de cassation",
  "Conseil d'État",
  "Cour d'appel",
  "Conseil de prud'hommes",
  "Tribunal administratif",
];

const topics = [
  "Tous les thèmes",
  "Licenciement",
  "Contrat de travail",
  "Discrimination",
  "Harcèlement",
  "Rémunération",
  "Temps de travail",
  "Santé et sécurité",
  "Rupture conventionnelle",
  "Représentation du personnel",
  "Clause de non-concurrence",
];

export default function SearchFilters({ filters, setFilters }) {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filtres avancés</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Juridiction</Label>
          <Select value={filters.jurisdiction || ""} onValueChange={(v) => update("jurisdiction", v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Toutes juridictions" />
            </SelectTrigger>
            <SelectContent>
              {jurisdictions.map((j) => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Thématique</Label>
          <Select value={filters.topic || ""} onValueChange={(v) => update("topic", v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Tous les thèmes" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date début</Label>
          <Input
            type="date"
            value={filters.date_from || ""}
            onChange={(e) => update("date_from", e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date fin</Label>
          <Input
            type="date"
            value={filters.date_to || ""}
            onChange={(e) => update("date_to", e.target.value)}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  );
}