import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, Settings, Paperclip, Smile, Mic, Send } from "lucide-react";

const glass = { background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 24, padding: 20, boxShadow: "0 8px 32px rgba(10,0,160,0.08)" };

function TabIcon({ icon: Icon, active }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "#000" : "transparent", color: active ? "#fff" : "#0A00A0", cursor: "pointer" }}>
      <Icon size={16} />
    </div>
  );
}

export default function AIAssistantWidget() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const send = () => { if (msg.trim()) navigate(`/search?q=${encodeURIComponent(msg.trim())}`); };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} style={{ ...glass, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <TabIcon icon={HelpCircle} />
        <TabIcon icon={MessageSquare} active />
        <TabIcon icon={Settings} />
        <div style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: "50%", background: "#0A00A0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>IA</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flex: 1 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0A00A0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>IA</div>
        <div style={{ background: "#0A00A0", color: "#fff", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", fontSize: 13, lineHeight: 1.55 }}>
          Bonjour ! Je suis votre assistant juridique. Posez-moi une question sur le droit du travail et je lancerai une recherche jurisprudentielle.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(10,0,160,0.05)", border: "1px solid rgba(10,0,160,0.12)", borderRadius: 16, padding: "9px 12px" }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Écrivez un message..." style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#000" }} />
        <Paperclip size={16} color="#0A00A0" />
        <Smile size={16} color="#0A00A0" />
        <Mic size={16} color="#0A00A0" />
        <button onClick={send} style={{ width: 32, height: 32, borderRadius: "50%", background: "#000", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Send size={14} /></button>
      </div>
    </motion.div>
  );
}