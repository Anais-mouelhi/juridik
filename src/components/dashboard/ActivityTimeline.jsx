import { motion } from "framer-motion";
import { Calendar, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const glass = { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 24, padding: 20, boxShadow: "0 8px 32px rgba(10,0,160,0.08)" };
const PILL = ["#0A00A0", "#000", "#C2B8FF", "#0A00A0"];

export default function ActivityTimeline({ upcoming }) {
  const items = upcoming.slice(0, 4);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.28 }} style={glass}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#000", opacity: 0.4, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>Mon activité</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <Calendar size={13} color="#0A00A0" />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#000" }}>Ce qui vous attend</span>
        </div>
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 12, color: "#000", opacity: 0.4, textAlign: "center", padding: "30px 0" }}>Aucune audience planifiée</p>
      ) : (
        <div style={{ position: "relative", paddingTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            {items.map((d, i) => {
              const dt = d.next_hearing ? new Date(d.next_hearing) : null;
              return (
                <div key={d.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 10, color: "#000", opacity: 0.5 }}>{dt ? `${dt.getDate()} ${MONTHS_FR[dt.getMonth()]}` : ""}</span>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: PILL[i % 4], border: "3px solid #fff", boxShadow: "0 0 0 1px rgba(10,0,160,0.2)" }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#fff", background: PILL[i % 4], padding: "5px 9px", borderRadius: 999, textAlign: "center", lineHeight: 1.25, maxWidth: 84, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</span>
                </div>
              );
            })}
          </div>
          <div style={{ height: 2, background: "rgba(10,0,160,0.15)", marginTop: 8, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#000", opacity: 0.3 }}>
            <span>07:00</span><span>12:00</span><span>18:00</span><span>02:00</span>
          </div>
        </div>
      )}

      <Link to="/calendrier" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#0A00A0", fontWeight: 600, textDecoration: "none", marginTop: 16 }}>Voir le calendrier <ArrowUpRight size={13} /></Link>
    </motion.div>
  );
}