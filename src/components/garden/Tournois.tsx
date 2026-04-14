import { useState, useEffect } from "react";
import { ArrowRight, CalendarDays, Trophy, CheckCircle2, LogIn, X, Clock, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface TournoiEvent {
  id: string;
  title: string;
  date: string;
  slot: string;
  desc: string;
  maxPlaces?: number;
}

interface Props { onCalendar: () => void; onLogin: () => void; }

const MONTH_SHORT = ["jan.","fév.","mars","avr.","mai","juin","juil.","août","sep.","oct.","nov.","déc."];

const Tournois = ({ onCalendar, onLogin }: Props) => {
  const { user } = useAuth();
  const [events, setEvents]             = useState<TournoiEvent[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [selectedEv, setSelectedEv]     = useState<TournoiEvent | null>(null);
  const [justRegistered, setJustRegistered] = useState<string | null>(null);
  const [loadingKey, setLoadingKey]     = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, date, slot, description, max_places")
        .eq("type", "tournoi")
        .order("date");
      if (data) setEvents(data.map(e => ({
        id: e.id as string,
        title: e.title as string,
        date: e.date as string,
        slot: (e.slot as string) || "",
        desc: (e.description as string) || "",
        maxPlaces: e.max_places as number | undefined,
      })));
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (!user) { setRegistrations([]); return; }
    supabase.from("event_registrations").select("event_key").eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setRegistrations((data as { event_key: string }[]).map(r => r.event_key));
      });
  }, [user]);

  const evKey = (ev: TournoiEvent) => `${ev.date}__${ev.title}`;
  const isRegistered = (ev: TournoiEvent) => registrations.includes(evKey(ev));

  const handleRegister = async (ev: TournoiEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { onLogin(); return; }
    const key = evKey(ev);
    setLoadingKey(key);
    const { error } = await supabase.from("event_registrations").insert({ event_key: key, user_id: user.id });
    if (!error) {
      setRegistrations(prev => [...prev, key]);
      setJustRegistered(key);
      setTimeout(() => setJustRegistered(null), 2500);
    }
    setLoadingKey(null);
  };

  const handleUnregister = async (ev: TournoiEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const key = evKey(ev);
    await supabase.from("event_registrations").delete().eq("event_key", key).eq("user_id", user.id);
    setRegistrations(prev => prev.filter(k => k !== key));
  };

  // Today's date for filtering past events
  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => e.date >= today);

  return (
    <section className="py-28 bg-muted/30" id="tournois">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-garden-blue-dark mb-3 block">Compétitions</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-foreground">
              Calendrier des Tournois
            </h2>
          </div>
          <button
            onClick={onCalendar}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-semibold text-sm bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5 self-start md:self-auto"
          >
            <CalendarDays className="w-4 h-4" /> Calendrier complet
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun tournoi à venir pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map(ev => {
              const registered = isRegistered(ev);
              const key = evKey(ev);
              const justDone = justRegistered === key;
              const loading = loadingKey === key;
              const d = new Date(ev.date + "T12:00:00");

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEv(ev)}
                  className="group grid grid-cols-[5rem_1fr] md:grid-cols-[6rem_1fr_auto] gap-6 md:gap-10 py-9 items-center hover:bg-muted/50 transition-colors duration-200 -mx-4 px-4 rounded-xl cursor-pointer"
                >
                  {/* Date badge */}
                  <div className="text-center">
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{MONTH_SHORT[d.getMonth()]}</div>
                    <div className="text-3xl font-black tracking-tighter leading-tight text-garden-blue-dark">{d.getDate()}</div>
                    <div className="text-[0.65rem] font-semibold text-muted-foreground">{d.getFullYear()}</div>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-3.5 h-3.5 text-garden-blue shrink-0" />
                      <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">{ev.title}</h3>
                    </div>
                    {ev.slot && (
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 shrink-0" /> {ev.slot}
                      </p>
                    )}
                    {ev.desc && <p className="text-xs text-muted-foreground line-clamp-1">{ev.desc}</p>}
                  </div>

                  {/* CTA */}
                  <div className="hidden md:flex flex-col items-end gap-1.5" onClick={e => e.stopPropagation()}>
                    {registered ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-garden-blue-dark">
                          <CheckCircle2 className="w-4 h-4" />
                          {justDone ? "Inscription confirmée !" : "Inscrit(e)"}
                        </span>
                        <button
                          onClick={e => handleUnregister(ev, e)}
                          className="text-xs text-muted-foreground hover:text-red-500 underline underline-offset-2 transition-colors"
                        >
                          Se désinscrire
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={e => handleRegister(ev, e)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill font-semibold text-sm bg-garden-blue text-white shadow-blue hover:bg-garden-blue-dark transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                      >
                        {loading ? "…" : <><Trophy className="w-3.5 h-3.5" /> S'inscrire</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedEv && (() => {
        const registered = isRegistered(selectedEv);
        const key = evKey(selectedEv);
        const justDone = justRegistered === key;
        const loading = loadingKey === key;
        const d = new Date(selectedEv.date + "T12:00:00");
        return (
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setSelectedEv(null); }}
          >
            <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />
            <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-md flex flex-col overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-garden-blue flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight text-foreground leading-tight">{selectedEv.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Tournoi · Garden Padel</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEv(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="px-6 py-5 flex flex-col gap-4">
                <div className="bg-garden-blue-light rounded-2xl px-4 py-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                    <CalendarDays className="w-4 h-4 text-garden-blue-dark shrink-0" />
                    {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  {selectedEv.slot && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Clock className="w-4 h-4 text-garden-blue-dark shrink-0" />
                      {selectedEv.slot}
                    </div>
                  )}
                </div>

                {selectedEv.desc && (
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{selectedEv.desc}</p>
                  </div>
                )}

                {/* Registration */}
                <div className="pt-2 border-t border-border">
                  {!user ? (
                    <button
                      onClick={() => { setSelectedEv(null); onLogin(); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-garden-blue text-white hover:bg-garden-blue-dark transition-all"
                    >
                      <LogIn className="w-4 h-4" /> Se connecter pour s'inscrire
                    </button>
                  ) : registered ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-garden-blue-dark">
                        <CheckCircle2 className="w-4 h-4" />
                        {justDone ? "Inscription confirmée !" : "Vous êtes inscrit(e) à ce tournoi"}
                      </span>
                      <button
                        onClick={e => handleUnregister(selectedEv, e)}
                        className="text-xs text-muted-foreground hover:text-red-500 underline underline-offset-2 transition-colors"
                      >
                        Se désinscrire
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={e => handleRegister(selectedEv, e)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-garden-blue text-white hover:bg-garden-blue-dark transition-all disabled:opacity-60"
                    >
                      {loading ? "Inscription en cours…" : <><Trophy className="w-4 h-4" /> S'inscrire à ce tournoi</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};

export default Tournois;
