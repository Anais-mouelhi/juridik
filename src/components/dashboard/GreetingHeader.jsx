import { motion } from "framer-motion";

export default function GreetingHeader({ dateStr, greeting, firstName }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#0A00A0", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, opacity: 0.7 }}>
        {dateStr}
      </p>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: "#000", margin: 0, letterSpacing: "-0.6px" }}>
        {greeting}, {firstName} 👋
      </h1>
      <p style={{ fontSize: 14, color: "#000", opacity: 0.5, marginTop: 6, margin: 0 }}>
        Faisons de cette journée une journée productive.
      </p>
    </motion.div>
  );
}