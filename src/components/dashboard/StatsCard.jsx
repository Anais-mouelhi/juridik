import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value, subtitle, delay = 0, dark = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl p-6 ${dark ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}
    >
      <div className={`h-9 w-9 rounded-xl mb-4 flex items-center justify-center ${dark ? 'bg-primary-foreground/10' : 'bg-muted'}`}>
        <Icon className={`h-4 w-4 ${dark ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
      </div>
      <p className={`text-4xl font-serif font-semibold leading-none ${dark ? 'text-primary-foreground' : 'text-foreground'}`}>{value}</p>
      <p className={`text-sm font-medium mt-2 ${dark ? 'text-primary-foreground/80' : 'text-foreground'}`}>{label}</p>
      {subtitle && <p className={`text-xs mt-1 ${dark ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>{subtitle}</p>}
    </motion.div>
  );
}