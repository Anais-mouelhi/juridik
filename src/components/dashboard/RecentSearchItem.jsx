import { Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import moment from "moment";

export default function RecentSearchItem({ search }) {
  return (
    <Link
      to={`/search?q=${encodeURIComponent(search.query)}`}
      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
        <Search className="h-3.5 w-3.5 text-primary/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{search.query}</p>
        <p className="text-xs text-muted-foreground">
          {search.results_count ? `${search.results_count} résultats` : 'Aucun résultat'} · {moment(search.created_date).fromNow()}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}