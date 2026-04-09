import { Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchBar({ query, setQuery, onSearch, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative flex items-center bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <Search className="h-4 w-4 text-muted-foreground absolute left-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex : licenciement abusif pendant arrêt maladie..."
          className="flex-1 bg-transparent py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="m-2 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Rechercher
        </Button>
      </div>
    </form>
  );
}