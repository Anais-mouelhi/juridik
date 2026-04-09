import { BookMarked, Calendar, ArrowUpRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SearchResultCard({ result, index, onSave, onView, isSaved }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
            {result.jurisdiction}
          </span>
          {result.topics?.slice(0, 2).map((topic) => (
            <span key={topic} className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary/30 text-secondary-foreground">
              {topic}
            </span>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
          <Calendar className="h-3 w-3" />
          {result.date}
        </span>
      </div>

      <h3 className="text-base font-semibold text-foreground group-hover:text-foreground/80 transition-colors leading-snug mb-2 line-clamp-2">
        {result.title}
      </h3>

      <p className="text-xs font-mono text-muted-foreground/70 mb-3">{result.reference}</p>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
        {result.summary}
      </p>

      {result.key_points?.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {result.key_points.slice(0, 2).map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-foreground/30 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground line-clamp-1">{point}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          onClick={() => onSave(result)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
            isSaved ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookMarked className="h-3.5 w-3.5" />
          {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onView(result)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Voir le détail
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}