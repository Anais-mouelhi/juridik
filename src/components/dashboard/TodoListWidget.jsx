import { motion } from "framer-motion";
import { CheckCircle, ArrowUpRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const glass = { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 24, padding: 20, boxShadow: "0 8px 32px rgba(10,0,160,0.08)" };

export default function TodoListWidget({ tasks }) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.36 }} style={glass}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#000", margin: 0 }}>Liste de tâches</p>
          <p style={{ fontSize: 11, color: "#000", opacity: 0.4, marginTop: 2, textTransform: "capitalize", margin: 0 }}>{today}</p>
        </div>
        <Link to="/taches" style={{ color: "#0A00A0" }}><ArrowUpRight size={18} /></Link>
      </div>

      {tasks.length === 0 ? (
        <p style={{ fontSize: 12, color: "#000", opacity: 0.4, textAlign: "center", padding: "24px 0", margin: 0 }}>Aucune tâche en cours</p>
      ) : tasks.slice(0, 4).map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(10,0,160,0.07)" }}>
          {t.priority === 'urgent'
            ? <AlertCircle size={16} color="#0A00A0" style={{ flexShrink: 0 }} />
            : <CheckCircle size={16} color="#0A00A0" style={{ flexShrink: 0, opacity: 0.4 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
            {t.dossier_name && <p style={{ fontSize: 11, color: "#000", opacity: 0.4, margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.dossier_name}</p>}
          </div>
          {t.due_date && <span style={{ fontSize: 10, color: "#000", opacity: 0.4, flexShrink: 0 }}>{t.due_date}</span>}
        </div>
      ))}
    </motion.div>
  );
}