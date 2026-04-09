import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, CheckCircle, Scale, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import "moment/locale/fr";

moment.locale('fr');

const eventTypes = [
  { value: "audience", label: "Audience", icon: Scale, color: "bg-red-500/15 text-red-400 border-red-500/25" },
  { value: "consultation", label: "Consultation client", icon: Users, color: "bg-primary/15 text-primary border-primary/25" },
  { value: "deadline", label: "Deadline dépôt", icon: Clock, color: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
  { value: "autre", label: "Autre", icon: Calendar, color: "bg-muted text-muted-foreground border-border" },
];

export default function CalendrierPage() {
  const [dossiers, setDossiers] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", type: "audience", dossier_id: "", dossier_name: "" });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    base44.entities.Dossier.list('-created_date', 100).then(d => {
      setDossiers(d);
      // Build events from dossiers' next_hearing
      const hearings = d.filter(dos => dos.next_hearing).map(dos => ({
        id: `hearing-${dos.id}`,
        title: `Audience — ${dos.title}`,
        date: dos.next_hearing,
        type: "audience",
        dossier_name: dos.title,
        fromDossier: true,
      }));
      setEvents(hearings);
    });
  }, []);

  const startOfMonth = currentMonth.clone().startOf('month');
  const endOfMonth = currentMonth.clone().endOf('month');
  const startDay = startOfMonth.clone().startOf('week');
  const endDay = endOfMonth.clone().endOf('week');

  const days = [];
  let day = startDay.clone();
  while (day.isSameOrBefore(endDay)) { days.push(day.clone()); day.add(1, 'day'); }

  const getEventsForDay = (d) => events.filter(e => e.date === d.format('YYYY-MM-DD'));

  const handleAddEvent = () => {
    if (!form.title || !form.date) return;
    const dossier = dossiers.find(d => d.id === form.dossier_id);
    setEvents(prev => [...prev, { id: Date.now().toString(), ...form, dossier_name: dossier?.title || '' }]);
    setForm({ title: "", date: "", type: "audience", dossier_id: "", dossier_name: "" });
    setShowForm(false);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Gestion</p>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Calendrier</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Nouvel événement</h3>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input placeholder="Titre *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
              {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.dossier_id} onChange={e => setForm(f => ({...f, dossier_id: e.target.value}))}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
              <option value="">Sans dossier</option>
              {dossiers.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddEvent} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <CheckCircle className="h-4 w-4" />Ajouter
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:text-foreground transition-colors">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground capitalize">
              {currentMonth.format('MMMM YYYY')}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentMonth(m => m.clone().subtract(1, 'month'))}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentMonth(moment())}
                className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Aujourd'hui
              </button>
              <button onClick={() => setCurrentMonth(m => m.clone().add(1, 'month'))}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="py-2 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const isCurrentMonth = d.month() === currentMonth.month();
              const isToday = d.isSame(moment(), 'day');
              const isSelected = selectedDay?.isSame(d, 'day');
              const dayEvents = getEventsForDay(d);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(d)}
                  className={`
                    min-h-[64px] p-1.5 text-left border-b border-r border-border transition-colors
                    ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                  `}
                >
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1
                    ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                    {d.date()}
                  </span>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e, ei) => {
                      const et = eventTypes.find(t => t.value === e.type);
                      return (
                        <div key={ei} className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${et?.color || 'bg-muted text-muted-foreground border-border'}`}>
                          {e.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="bg-card rounded-xl border border-border overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              {selectedDay ? selectedDay.format('dddd D MMMM') : 'Sélectionnez un jour'}
            </h3>
          </div>
          <div className="p-4">
            {!selectedDay ? (
              <p className="text-xs text-muted-foreground text-center py-4">Cliquez sur un jour pour voir les événements</p>
            ) : selectedEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun événement ce jour</p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map(e => {
                  const et = eventTypes.find(t => t.value === e.type);
                  const Icon = et?.icon || Calendar;
                  return (
                    <div key={e.id} className={`p-3 rounded-lg border ${et?.color || 'bg-muted border-border'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium">{et?.label}</span>
                      </div>
                      <p className="text-sm font-medium">{e.title}</p>
                      {e.dossier_name && <p className="text-xs opacity-70 mt-0.5">{e.dossier_name}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}