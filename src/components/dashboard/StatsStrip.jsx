import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function StatsStrip({ dossiersCount, tasksCount, audiencesCount }) {
  const stats = [
    { label: "Dossiers actifs", value: dossiersCount },
    { label: "Tâches en cours", value: tasksCount },
    { label: "Audiences", value: audiencesCount },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
      style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 20, marginBottom: 24, flexWrap: "wrap" }}>
      {stats.map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#000", letterSpacing: "-0.5px" }}>{s.value}</span>
          <span style={{ fontSize: 13, color: "#000", opacity: 0.5, fontWeight: 500 }}>{s.label}</span>
        </div>
      ))}
      <Link to="/search" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "#000", color: "#fff", borderRadius: 999, padding: "11px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
        <Zap size={15} /> Nouvelle recherche IA
      </Link>
    </motion.div>
  );
}