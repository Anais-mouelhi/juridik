import { motion } from "framer-motion";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const glass = { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 24, padding: 20, boxShadow: "0 8px 32px rgba(10,0,160,0.08)" };

export default function SummaryChart({ dossiers }) {
  const data = [
    { name: "Urgent", value: dossiers.filter(d => d.status === 'urgent').length },
    { name: "En cours", value: dossiers.filter(d => d.status === 'en_cours').length },
    { name: "Stable", value: dossiers.filter(d => d.status === 'stable').length },
    { name: "Attente", value: dossiers.filter(d => d.status === 'en_attente').length },
  ];
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.44 }} style={glass}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#000", margin: 0 }}>Synthèse</p>
          <p style={{ fontSize: 11, color: "#000", opacity: 0.4, marginTop: 2, margin: 0 }}>Suivez votre activité</p>
        </div>
        <div style={{ display: "flex", gap: 10, color: "#0A00A0" }}>
          <SlidersHorizontal size={16} />
          <Link to="/dossiers" style={{ color: "#0A00A0" }}><ArrowUpRight size={16} /></Link>
        </div>
      </div>

      <div style={{ position: "relative", height: 150, marginTop: 6 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 14, right: 12, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A00A0" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0A00A0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#000" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(10,0,160,0.15)", fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke="#0A00A0" strokeWidth={2.5} fill="url(#gradBlue)" dot={{ r: 3, fill: "#0A00A0" }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", top: 2, right: 22, background: "#000", color: "#fff", borderRadius: 8, padding: "3px 9px", fontSize: 12, fontWeight: 700 }}>{max}</div>
      </div>
    </motion.div>
  );
}