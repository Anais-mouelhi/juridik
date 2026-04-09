import { Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchBar({ query, setQuery, onSearch, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <Search className="h-5 w-5 text-muted-foreground absolute left-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une jurisprudence en droit du travail..."
          className="flex-1 bg-transparent py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="m-2 gap-2 bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Rechercher
        </Button>
      </div>
    </form>
  );
}