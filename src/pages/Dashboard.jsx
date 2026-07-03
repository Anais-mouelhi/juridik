import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import StatsStrip from "@/components/dashboard/StatsStrip";
import AIAssistantWidget from "@/components/dashboard/AIAssistantWidget";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import TodoListWidget from "@/components/dashboard/TodoListWidget";
import SummaryChart from "@/components/dashboard/SummaryChart";

const BG = "linear-gradient(160deg, #F6F6F6 0%, #D8DFF8 100%)";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searches, setSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Dossier.list('-created_date', 50),
      base44.entities.Task.filter({ completed: false }, '-created_date', 50),
      base44.entities.SearchHistory.list('-created_date', 50),
    ]).then(([me, d, t, s]) => {
      setUser(me); setDossiers(d); setTasks(t); setSearches(s); setIsLoading(false);
    });
  }, []);

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: BG }}>
      <div style={{ width: 22, height: 22, border: "2px solid rgba(10,0,160,0.2)", borderTop: "2px solid #0A00A0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const upcoming = dossiers.filter(d => d.next_hearing).sort((a, b) => a.next_hearing > b.next_hearing ? 1 : -1).slice(0, 6);
  const firstName = user?.full_name?.split(' ')[0] || 'Maître';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const audiencesCount = dossiers.filter(d => d.next_hearing).length;

  return (
    <div style={{ padding: "30px 34px", background: BG, minHeight: "100%", boxSizing: "border-box" }}>
      <GreetingHeader dateStr={dateStr} greeting={greeting} firstName={firstName} />
      <StatsStrip dossiersCount={dossiers.length} tasksCount={tasks.length} audiencesCount={audiencesCount} />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18, marginBottom: 18, alignItems: "stretch" }}>
        <AIAssistantWidget />
        <ActivityTimeline upcoming={upcoming} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
        <TodoListWidget tasks={tasks} />
        <SummaryChart dossiers={dossiers} />
      </div>
    </div>
  );
}