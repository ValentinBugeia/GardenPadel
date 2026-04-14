import { useState, useEffect, useMemo, type ReactNode } from "react";
import { X, ChevronLeft, ChevronRight, Trophy, PartyPopper, Briefcase, CheckCircle2, LogIn, Dumbbell, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Registration {
  eventKey: string;
  userId: string;
}

type EventType = "tournoi" | "soiree" | "seminaire" | "coaching" | "autre";

interface CalEvent {
  date: string;
  type: EventType;
  title: string;
  desc: string;
  time?: string;
  maxPlaces?: number;
  fromAdmin?: boolean;
}


const TYPE_CONFIG: Record<EventType, { label: string; bg: string; light: string; text: string; border: string; icon: ReactNode }> = {
  tournoi:   { label: "Tournoi",   bg: "bg-garden-blue",    light: "bg-garden-blue-light",  text: "text-garden-blue-dark",  border: "border-garden-blue/30",  icon: <Trophy          className="w-3.5 h-3.5" /> },
  soiree:    { label: "Soirée",    bg: "bg-garden-pink",    light: "bg-garden-pink-light",  text: "text-garden-pink-dark",  border: "border-garden-pink/30",  icon: <PartyPopper     className="w-3.5 h-3.5" /> },
  seminaire: { label: "Séminaire", bg: "bg-foreground/70",  light: "bg-muted",              text: "text-foreground",        border: "border-border",          icon: <Briefcase       className="w-3.5 h-3.5" /> },
  coaching:  { label: "Coaching",  bg: "bg-garden-blue",    light: "bg-garden-blue-light",  text: "text-garden-blue-dark",  border: "border-garden-blue/30",  icon: <Dumbbell        className="w-3.5 h-3.5" /> },
  autre:     { label: "Autre",     bg: "bg-muted-foreground",light: "bg-muted",             text: "text-foreground",        border: "border-border",          icon: <MoreHorizontal  className="w-3.5 h-3.5" /> },
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const PUBLIC_TYPES: EventType[] = ["tournoi", "soiree", "coaching"];


const getEventsForDate = (date: string, adminEvents: CalEvent[]) =>
  adminEvents.filter(e => e.date === date);

const buildMonthGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const offset   = firstDay === 0 ? 6 : firstDay - 1; // Mon-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const toKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

interface Props { open: boolean; onClose: () => void; }

const CalendarModal = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const today  = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [adminEvents, setAdminEvents] = useState<CalEvent[]>([]);
  const [justRegistered, setJustRegistered] = useState<string | null>(null);

  // Chargement Supabase à chaque ouverture
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const [evRes, regRes] = await Promise.all([
        supabase.from("events").select("id, type, title, date, slot, description, max_places"),
        supabase.from("event_registrations").select("event_key, user_id"),
      ]);
      if (evRes.data) {
        setAdminEvents(
          evRes.data
            .filter(e => PUBLIC_TYPES.includes(e.type as EventType))
            .map(e => ({
              date: e.date as string,
              type: e.type as EventType,
              title: e.title as string,
              desc: (e.description as string) || "",
              time: (e.slot as string) || undefined,
              maxPlaces: e.max_places as number | undefined,
              fromAdmin: true,
            }))
        );
      }
      if (regRes.data) {
        setRegistrations(regRes.data.map(r => ({ eventKey: r.event_key as string, userId: r.user_id as string })));
      }
    };
    load();
  }, [open]);

  const eventKey = (ev: CalEvent) => `${ev.date}__${ev.title}`;

  const isRegistered = (ev: CalEvent) =>
    !!registrations.find(r => r.eventKey === eventKey(ev) && r.userId === user?.id);

  const handleRegister = async (ev: CalEvent) => {
    if (!user) return;
    const key = eventKey(ev);
    const { error } = await supabase.from("event_registrations").insert({ event_key: key, user_id: user.id });
    if (!error) {
      setRegistrations(prev => [...prev, { eventKey: key, userId: user.id }]);
      setJustRegistered(key);
      setTimeout(() => setJustRegistered(null), 2000);
    }
  };

  const handleUnregister = async (ev: CalEvent) => {
    if (!user) return;
    const key = eventKey(ev);
    await supabase.from("event_registrations").delete().eq("event_key", key).eq("user_id", user.id);
    setRegistrations(prev => prev.filter(r => !(r.eventKey === key && r.userId === user.id)));
  };

  if (!open) return null;

  const cells = buildMonthGrid(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const selectedEvents = selectedDay ? getEventsForDate(selectedDay, adminEvents) : [];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-md" aria-hidden="true" />

      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">Calendrier du Club</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tournois · Soirées · Coaching</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 mr-3">
              {(["tournoi","soiree","coaching"] as EventType[]).map(t => (
                <span key={t} className="flex items-center gap-1.5 text-[0.68rem] font-semibold">
                  <span className={`w-2.5 h-2.5 rounded-full ${TYPE_CONFIG[t].bg}`} />
                  {TYPE_CONFIG[t].label}
                </span>
              ))}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between px-7 py-3 shrink-0">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-black text-base tracking-tight text-foreground capitalize">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar */}
        <div className="px-4 pb-2 overflow-y-auto flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const key = toKey(year, month, day);
              const evs = getEventsForDate(key, adminEvents);
              const isToday = key === toKey(today.getFullYear(), today.getMonth(), today.getDate());
              const isSelected = key === selectedDay;

              // Group event types for dots
              const types = [...new Set(evs.map(e => e.type))];

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={`relative flex flex-col items-center pt-1.5 pb-2 rounded-xl min-h-[52px] transition-all duration-150 border
                    ${isSelected  ? "bg-garden-blue/10 border-garden-blue/30 shadow-sm" :
                      evs.length  ? "hover:bg-muted/70 border-transparent hover:border-border cursor-pointer" :
                                    "border-transparent cursor-default"}
                  `}
                >
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 leading-none
                    ${isToday   ? "bg-garden-blue text-white" :
                      isSelected ? "text-garden-blue-dark" :
                                   "text-foreground"}`}>
                    {day}
                  </span>
                  {/* Event dots */}
                  {types.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {types.map(t => (
                        <span key={t} className={`w-1.5 h-1.5 rounded-full ${TYPE_CONFIG[t].bg}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDay && selectedEvents.length > 0 && (
            <div className="mt-4 mb-2 flex flex-col gap-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground px-1">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {selectedEvents.map((ev, i) => {
                const cfg        = TYPE_CONFIG[ev.type];
                const registered = isRegistered(ev);
                const justDone   = justRegistered === eventKey(ev);
                const isTournoi  = ev.type === "tournoi";
                const isCoaching = ev.type === "coaching";
                const takenCount = registrations.filter(r => r.eventKey === eventKey(ev)).length;
                const isFull     = isCoaching && !!ev.maxPlaces && takenCount >= ev.maxPlaces;
                const remaining  = isCoaching && ev.maxPlaces ? Math.max(0, ev.maxPlaces - takenCount) : null;

                return (
                  <div key={i} className={`flex flex-col gap-3 p-3.5 rounded-2xl border ${cfg.light} ${cfg.border}`}>
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} text-white`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-bold ${cfg.text} leading-tight`}>{ev.title}</p>
                          {ev.time && <span className="text-[0.65rem] font-semibold text-muted-foreground shrink-0 mt-0.5">{ev.time}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ev.desc}</p>
                        {/* Jauge places coaching */}
                        {isCoaching && ev.maxPlaces && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all ${isFull ? "bg-red-400" : "bg-garden-blue"}`}
                                style={{ width: `${Math.min(100, (takenCount / ev.maxPlaces) * 100)}%` }}
                              />
                            </div>
                            <span className={`text-[0.65rem] font-semibold shrink-0 ${isFull ? "text-red-500" : "text-muted-foreground"}`}>
                              {isFull ? "Complet" : `${remaining} place${remaining! > 1 ? "s" : ""} restante${remaining! > 1 ? "s" : ""}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inscription tournoi / coaching */}
                    {(isTournoi || isCoaching) && (
                      <div className="pl-11">
                        {!user ? (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <LogIn className="w-3.5 h-3.5" /> Connectez-vous pour vous inscrire
                          </p>
                        ) : registered ? (
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-garden-blue-dark">
                              <CheckCircle2 className="w-4 h-4" />
                              {justDone ? "Inscription confirmée !" : "Vous êtes inscrit(e)"}
                            </span>
                            <button
                              onClick={() => handleUnregister(ev)}
                              className="text-[0.65rem] text-muted-foreground hover:text-red-500 underline underline-offset-2 transition-colors"
                            >
                              Se désinscrire
                            </button>
                          </div>
                        ) : isFull ? (
                          <span className="text-xs font-semibold text-red-500">Ce coaching est complet.</span>
                        ) : (
                          <button
                            onClick={() => handleRegister(ev)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-pill text-xs font-bold bg-garden-blue text-white hover:bg-garden-blue-dark transition-all hover:-translate-y-0.5 shadow-blue"
                          >
                            {isTournoi ? <><Trophy className="w-3.5 h-3.5" /> S'inscrire au tournoi</> : <><Dumbbell className="w-3.5 h-3.5" /> S'inscrire au coaching</>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend mobile */}
          <div className="sm:hidden flex items-center justify-center gap-4 py-3 mt-1 border-t border-border">
            {(["tournoi","soiree","coaching"] as EventType[]).map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[0.68rem] font-semibold">
                <span className={`w-2.5 h-2.5 rounded-full ${TYPE_CONFIG[t].bg}`} />
                {TYPE_CONFIG[t].label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
