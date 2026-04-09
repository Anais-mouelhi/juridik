import { BookMarked, Calendar, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function SearchResultCard({ result, index, onSave, onView, isSaved }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary">
              {result.jurisdiction}
            </Badge>
            {result.topics?.map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs font-normal">
                {topic}
              </Badge>
            ))}
          </div>

          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {result.title}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {result.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {result.reference}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
            {result.summary}
          </p>

          {result.key_points?.length > 0 && (
            <div className="mt-3 space-y-1">
              {result.key_points.slice(0, 2).map((point, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{point}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => onSave(result)}
        >
          <BookMarked className={`h-3.5 w-3.5 ${isSaved ? 'fill-accent text-accent' : ''}`} />
          {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => onView(result)}
        >
          Voir le détail
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}