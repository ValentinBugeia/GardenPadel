import { useState, useEffect, useMemo } from "react";
import { X, Calendar, Dumbbell, PartyPopper, Plus, ChevronLeft, ChevronRight, Target, Medal, Flower2, Trash2, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminEvent } from "./AdminDashboard";
import { supabase } from "@/lib/supabase";
import EventRegistrantsModal from "./EventRegistrantsModal";

const SLOTS = [
  "08:00 – 09:30","09:30 – 11:00","11:00 – 12:30",
  "12:30 – 14:00","14:00 – 15:30","15:30 – 17:00",
  "17:00 – 18:30","18:30 – 20:00","20:00 – 21:30",
];

const COURTS = [
  { id: 1, name: "Le Jardin Bleu",    icon: <Target  className="w-3.5 h-3.5" />, bg: "bg-gradient-to-br from-[#89c9eb]/30 to-[#6ab5db]/50", text: "text-garden-blue-dark", border: "border-garden-blue/40" },
  { id: 2, name: "La Rose des Vents", icon: <Medal   className="w-3.5 h-3.5" />, bg: "bg-gradient-to-br from-[#e98eaa]/30 to-[#d87594]/50", text: "text-garden-pink-dark", border: "border-garden-pink/40" },
  { id: 3, name: "La Terrasse Rose",  icon: <Flower2 className="w-3.5 h-3.5" />, bg: "bg-gradient-to-br from-[#89c9eb]/20 to-[#e98eaa]/30", text: "text-garden-pink-dark", border: "border-garden-pink/30" },
];

const DAY_NAMES   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const MONTH_NAMES = ["jan.","fév.","mar.","avr.","mai","juin","juil.","août","sep.","oct.","nov.","déc."];

const getWeekDays = (startOffset: number) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + startOffset + i);
    days.push({ key: d.toISOString().split("T")[0], label: `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`, isToday: startOffset + i === 0 });
  }
  return days;
};

const inputCls = "w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all";

interface Reservation {
  id: string;
  courtId: number;
  date: string;
  slot: string;
  userFirstName: string;
  userLastName: string;
}

interface Props { open: boolean; onClose: () => void; }

const MemberDashboard = ({ open, onClose }: Props) => {
  const { user } = useAuth();

  const [permissions, setPermissions] = useState<string[]>([]);
  const [memberBadges, setMemberBadges] = useState<{ id: string; name: string; emoji: string; color: string }[]>([]);

  const canViewPlanning   = permissions.includes("view_planning");
  const canManageCoaching = permissions.includes("manage_coaching");
  const canManageSoirees  = permissions.includes("manage_soirees");

  const [tab, setTab]           = useState("soirees");
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents]     = useState<AdminEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: "", date: "", slot: "", desc: "", maxPlaces: 8 });
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Chargement Supabase
  useEffect(() => {
    if (!open || !user) return;
    const load = async () => {
      // Badges & permissions
      const { data: ubData } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id);
      const badgeIds = (ubData || []).map(r => (r as { badge_id: string }).badge_id);
      if (badgeIds.length > 0) {
        const { data: bdData } = await supabase.from("badges").select("id, name, emoji, color, permissions").in("id", badgeIds);
        if (bdData) {
          setMemberBadges(bdData.map(b => ({ id: b.id as string, name: b.name as string, emoji: b.emoji as string, color: b.color as string })));
          const perms = [...new Set((bdData as { permissions: string[] }[]).flatMap(b => b.permissions || []))];
          setPermissions(perms);
          // Définir l'onglet par défaut selon les permissions chargées
          const dt = perms.includes("view_planning") ? "planning" : perms.includes("manage_coaching") ? "coaching" : "soirees";
          setTab(dt);
        }
      }
      // Events & reservations
      const [evRes, rsRes] = await Promise.all([
        supabase.from("events").select("*").order("date"),
        supabase.from("reservations").select("id, court_id, date, slot, user_first_name, user_last_name").order("date"),
      ]);
      if (evRes.data) setEvents(evRes.data.map(e => ({
        id: e.id as string,
        type: e.type as AdminEvent["type"],
        title: e.title as string,
        date: e.date as string,
        slot: (e.slot as string) || "",
        courtIds: (e.court_ids as number[]) || [],
        maxPlaces: e.max_places as number | undefined,
        desc: (e.description as string) || "",
        createdAt: (e.created_at as string) || "",
      })));
      if (rsRes.data) setReservations(rsRes.data.map(r => ({
        id: r.id as string,
        courtId: r.court_id as number,
        date: r.date as string,
        slot: r.slot as string,
        userFirstName: (r.user_first_name as string) || "",
        userLastName: (r.user_last_name as string) || "",
      })));
    };
    load();
  }, [open, user]);

  useEffect(() => {
    setShowForm(false);
  }, [tab]);
  const days = getWeekDays(weekOffset * 7);
  const getResForDayAndCourt = (date: string, courtId: number) =>
    reservations.filter(r => r.date === date && r.courtId === courtId).sort((a, b) => a.slot.localeCompare(b.slot));

  const saveEvent = async (type: "coaching" | "soiree") => {
    if (!form.title || !form.date) return;
    const newRow = {
      id: `ev-${Date.now()}`,
      type, title: form.title, date: form.date,
      slot: form.slot, court_ids: [],
      max_places: type === "coaching" ? form.maxPlaces : null,
      description: form.desc,
    };
    const { data, error } = await supabase.from("events").insert(newRow).select().single();
    if (!error && data) {
      const ev: AdminEvent = {
        id: data.id as string, type, title: data.title as string,
        date: data.date as string, slot: (data.slot as string) || "",
        courtIds: [], maxPlaces: data.max_places as number | undefined,
        desc: (data.description as string) || "", createdAt: data.created_at as string,
      };
      setEvents(prev => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)));
    }
    setForm({ title: "", date: "", slot: "", desc: "", maxPlaces: 8 });
    setShowForm(false);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  if (!open || !user) return null;
  if (!canViewPlanning && !canManageCoaching && !canManageSoirees) return null;

  const coachingEvents = events.filter(e => e.type === "coaching");
  const soireeEvents   = events.filter(e => e.type === "soiree");

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-md" aria-hidden="true" />

      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-[960px] max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-garden-blue-light to-garden-blue flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">Mon espace</h2>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</span>
                {memberBadges.map(b => (
                  <span key={b.id} className="inline-flex items-center gap-1 text-[0.65rem] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: b.color }}>
                    {b.emoji} {b.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-7 pt-4 pb-3 border-b border-border shrink-0 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {canViewPlanning && (
              <button onClick={() => setTab("planning")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "planning" ? "bg-garden-blue text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                <Calendar className="w-4 h-4" /> Planning
              </button>
            )}
            {canManageCoaching && (
              <button onClick={() => setTab("coaching")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "coaching" ? "bg-garden-blue text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                <Dumbbell className="w-4 h-4" /> Coachings
              </button>
            )}
            {canManageSoirees && (
              <button onClick={() => setTab("soirees")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "soirees" ? "bg-garden-pink text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                <PartyPopper className="w-4 h-4" /> Soirées
              </button>
            )}
          </div>

          {tab === "planning" && (
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset(w => w - 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-semibold text-foreground min-w-[130px] text-center">{days[0].label.split(" ").slice(1).join(" ")} – {days[6].label.split(" ").slice(1).join(" ")}</span>
              <button onClick={() => setWeekOffset(w => w + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
          {(tab === "coaching" || tab === "soirees") && (
            <button onClick={() => setShowForm(f => !f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "coaching" ? "bg-garden-blue text-white hover:bg-garden-blue-dark" : "bg-garden-pink text-white hover:bg-garden-pink-dark"}`}>
              <Plus className="w-4 h-4" /> {showForm ? "Annuler" : tab === "coaching" ? "Créer un coaching" : "Créer une soirée"}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">

          {/* ── Planning (lecture seule) ── */}
          {tab === "planning" && (
            <div className="flex flex-col">
              <div className="sticky top-0 z-10 bg-background border-b border-border grid grid-cols-[140px_1fr_1fr_1fr] gap-px">
                <div className="px-4 py-3" />
                {COURTS.map(c => (
                  <div key={c.id} className={`flex items-center gap-2 px-4 py-3 ${c.bg}`}>
                    <span className={c.text}>{c.icon}</span>
                    <span className={`text-xs font-bold ${c.text}`}>{c.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col divide-y divide-border">
                {days.map(day => {
                  const dayRes = reservations.filter((r) => r.date === day.key);
                  const dayEvs    = events.filter(e => e.date === day.key && e.courtIds.length > 0);
                  const globalEvs = events.filter(e => e.date === day.key && e.courtIds.length === 0);
                  return (
                    <div key={day.key} className={day.isToday ? "bg-garden-blue/5" : ""}>
                      {globalEvs.length > 0 && (
                        <div className="flex gap-px border-b border-border/40">
                          <div className={`w-[140px] shrink-0 flex items-center px-4 py-2 ${day.isToday ? "bg-garden-blue/10" : "bg-muted/30"}`}>
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">Agenda</span>
                          </div>
                          <div className="flex-1 bg-background px-3 py-2 flex flex-wrap gap-1.5 items-center">
                            {globalEvs.map(e => (
                              <span key={e.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${e.type === "coaching" ? "bg-garden-blue text-white" : e.type === "soiree" ? "bg-garden-pink text-white" : "bg-foreground/70 text-white"}`}>
                                {e.title}{e.slot ? ` · ${e.slot}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-px">
                        <div className={`flex flex-col justify-center px-4 py-3 ${day.isToday ? "bg-garden-blue/10" : "bg-muted/30"}`}>
                          <span className={`text-xs font-black tracking-tight ${day.isToday ? "text-garden-blue-dark" : "text-foreground"}`}>{day.label}</span>
                          {day.isToday && <span className="text-[0.6rem] font-bold text-garden-blue mt-0.5">Aujourd'hui</span>}
                          {dayRes.length > 0 && <span className="text-[0.6rem] text-muted-foreground mt-1">{dayRes.length} rés.</span>}
                        </div>
                        {COURTS.map(court => {
                          const courtRes = getResForDayAndCourt(day.key, court.id);
                          const courtEvs = dayEvs.filter(e => e.courtIds.includes(court.id));
                          return (
                            <div key={court.id} className="bg-background p-2.5 flex flex-col gap-1.5 min-h-[56px]">
                              {courtRes.length === 0 && courtEvs.length === 0 ? (
                                <div className="flex items-center justify-center h-full"><span className="text-[0.65rem] text-muted-foreground/30">—</span></div>
                              ) : (
                                <>
                                  {courtEvs.map(e => (
                                    <div key={e.id} className="rounded-xl px-3 py-2 border border-foreground/10 bg-muted">
                                      <div className="text-[0.7rem] font-black text-foreground truncate">{e.slot}</div>
                                      <div className="text-[0.7rem] font-semibold text-muted-foreground mt-0.5 truncate">{e.title}</div>
                                    </div>
                                  ))}
                                  {courtRes.map((r) => (
                                    <div key={r.id} className={`rounded-xl px-3 py-2 border ${court.bg} ${court.border}`}>
                                      <div className={`text-[0.7rem] font-black ${court.text}`}>{r.slot}</div>
                                      <div className="text-[0.7rem] font-semibold text-foreground mt-0.5">{r.userFirstName} {r.userLastName}</div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Coachings ── */}
          {tab === "coaching" && (
            <div className="p-7 flex flex-col gap-4">
              {showForm && (
                <div className="bg-muted/30 border border-border rounded-2xl p-5 flex flex-col gap-3">
                  <h3 className="text-sm font-black text-foreground">Nouveau coaching</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Titre</p>
                      <input className={inputCls} placeholder="Ex : Coaching débutants" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                      <input className={inputCls} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Horaires</p>
                      <select className={inputCls} value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value }))}>
                        <option value="">-- Sélectionner --</option>
                        {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Nombre de places</p>
                      <input className={inputCls} type="number" min="1" max="30" value={form.maxPlaces} onChange={e => setForm(f => ({ ...f, maxPlaces: Math.max(1, parseInt(e.target.value) || 1) }))} />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Description <span className="normal-case font-normal">(optionnel)</span></p>
                      <input className={inputCls} placeholder="Détails..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                    </div>
                  </div>
                  <button onClick={() => saveEvent("coaching")} disabled={!form.title || !form.date}
                    className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-garden-blue text-white hover:bg-garden-blue-dark transition-all disabled:opacity-40">
                    <Plus className="w-4 h-4" /> Créer le coaching
                  </button>
                </div>
              )}
              {coachingEvents.length === 0 && !showForm ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Dumbbell className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun coaching créé. Cliquez sur "Créer un coaching" pour commencer.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {coachingEvents.map(ev => (
                    <div key={ev.id} onClick={() => setSelectedEvent(ev)} className="flex items-start gap-4 p-4 rounded-2xl border border-garden-blue/20 bg-garden-blue-light cursor-pointer hover:brightness-95 transition-all">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-garden-blue text-white"><Dumbbell className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(ev.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          {ev.slot && ` · ${ev.slot}`}
                        </p>
                        {ev.maxPlaces && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[0.65rem] font-semibold text-garden-blue-dark bg-white/60 px-2 py-0.5 rounded-pill">{ev.maxPlaces} places</span>
                        )}
                        {ev.desc && <p className="text-xs text-muted-foreground mt-1">{ev.desc}</p>}
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[0.65rem] text-muted-foreground"><Users className="w-3 h-3" /> Voir les inscrits</span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Soirées ── */}
          {tab === "soirees" && (
            <div className="p-7 flex flex-col gap-4">
              {showForm && (
                <div className="bg-muted/30 border border-border rounded-2xl p-5 flex flex-col gap-3">
                  <h3 className="text-sm font-black text-foreground">Nouvelle soirée</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Titre</p>
                      <input className={inputCls} placeholder="Ex : Soirée Roland-Garros 🎾" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                      <input className={inputCls} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Horaires <span className="normal-case font-normal">(optionnel)</span></p>
                      <input className={inputCls} placeholder="Ex : 19h – Minuit" value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Description <span className="normal-case font-normal">(optionnel)</span></p>
                      <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Détails de la soirée..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                    </div>
                  </div>
                  <button onClick={() => saveEvent("soiree")} disabled={!form.title || !form.date}
                    className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-garden-pink text-white hover:bg-garden-pink-dark transition-all disabled:opacity-40">
                    <Plus className="w-4 h-4" /> Créer la soirée
                  </button>
                </div>
              )}
              {soireeEvents.length === 0 && !showForm ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <PartyPopper className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune soirée créée. Cliquez sur "Créer une soirée" pour commencer.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {soireeEvents.map(ev => (
                    <div key={ev.id} onClick={() => setSelectedEvent(ev)} className="flex items-start gap-4 p-4 rounded-2xl border border-garden-pink/20 bg-garden-pink-light cursor-pointer hover:brightness-95 transition-all">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-garden-pink text-white"><PartyPopper className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(ev.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          {ev.slot && ` · ${ev.slot}`}
                        </p>
                        {ev.desc && <p className="text-xs text-muted-foreground mt-1">{ev.desc}</p>}
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[0.65rem] text-muted-foreground"><Users className="w-3 h-3" /> Voir les inscrits</span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
    <EventRegistrantsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
  );
};

export default MemberDashboard;
