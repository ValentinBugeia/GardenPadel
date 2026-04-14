import { useState, useEffect } from "react";
import { X, Users, Calendar, Clock, Trophy, Dumbbell, PartyPopper, Briefcase, MoreHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminEvent } from "./AdminDashboard";

interface Props { ev: AdminEvent | null; onClose: () => void; }

interface Registrant { userId: string; firstName: string; lastName: string; }

const TYPE_CFG = {
  tournoi:   { label: "Tournoi",   Icon: Trophy,         color: "bg-garden-blue text-white",          light: "bg-garden-blue-light" },
  coaching:  { label: "Coaching",  Icon: Dumbbell,       color: "bg-garden-blue text-white",          light: "bg-garden-blue-light" },
  soiree:    { label: "Soirée",    Icon: PartyPopper,    color: "bg-garden-pink text-white",          light: "bg-garden-pink-light" },
  seminaire: { label: "Séminaire", Icon: Briefcase,      color: "bg-foreground/80 text-white",        light: "bg-muted" },
  autre:     { label: "Autre",     Icon: MoreHorizontal, color: "bg-muted-foreground/80 text-white",  light: "bg-muted" },
} as const;

const EventRegistrantsModal = ({ ev, onClose }: Props) => {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ev) return;
    setRegistrants([]);
    setLoading(true);
    const eventKey = `${ev.date}__${ev.title}`;
    (async () => {
      const { data: regsData } = await supabase
        .from("event_registrations")
        .select("user_id")
        .eq("event_key", eventKey);
      const userIds = (regsData || []).map(r => (r as { user_id: string }).user_id);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);
        if (profiles) {
          setRegistrants(
            (profiles as { id: string; first_name: string; last_name: string }[]).map(p => ({
              userId: p.id,
              firstName: p.first_name || "",
              lastName: p.last_name || "",
            })).sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr"))
          );
        }
      }
      setLoading(false);
    })();
  }, [ev?.id]);

  if (!ev) return null;

  const cfg = TYPE_CFG[ev.type];
  const { Icon } = cfg;
  const capacity = ev.maxPlaces;

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />
      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-foreground">{ev.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event info */}
        <div className={`px-6 py-4 border-b border-border ${cfg.light}`}>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {new Date(ev.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            {ev.slot && (
              <span className="flex items-center gap-1.5 text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {ev.slot}
              </span>
            )}
          </div>
          {capacity && (
            <div className="mt-2 text-xs text-muted-foreground">
              Capacité :{" "}
              <span className={`font-bold ${registrants.length >= capacity ? "text-red-500" : "text-foreground"}`}>
                {registrants.length} / {capacity}
              </span>{" "}
              places
              {registrants.length >= capacity && (
                <span className="ml-2 text-[0.65rem] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Complet</span>
              )}
            </div>
          )}
          {ev.desc && <p className="mt-2 text-xs text-muted-foreground">{ev.desc}</p>}
        </div>

        {/* Registrants list */}
        <div className="px-6 py-5 flex flex-col gap-3 overflow-y-auto max-h-[340px]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-black text-foreground">Inscrits</span>
            <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{registrants.length}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-garden-blue/30 border-t-garden-blue rounded-full animate-spin" />
            </div>
          ) : registrants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucun inscrit pour le moment.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {registrants.map((r, i) => (
                <div key={r.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40">
                  <span className="text-[0.65rem] font-bold text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-garden-blue-light to-garden-pink-light flex items-center justify-center text-xs font-bold text-garden-blue-dark shrink-0">
                    {r.firstName[0]}{r.lastName[0]}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{r.firstName} {r.lastName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 shrink-0">
          <button onClick={onClose} className="w-full py-3 rounded-2xl font-bold text-sm bg-muted text-foreground hover:bg-muted/70 transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrantsModal;
