import { useState, useEffect, useMemo } from "react";
import { X, Users, LogOut, Search, Calendar, Target, Medal, Flower2, ChevronLeft, ChevronRight, Plus, Trash2, PartyPopper, Briefcase, Dumbbell, MoreHorizontal, Trophy, Shield, Check, Pencil, Mail, MapPin, CreditCard, Ban, UserX, ChevronRight as ArrowRight } from "lucide-react";
import flowerBlue from "@/assets/flower-blue.png";
import { useAuth, type User } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Props { open: boolean; onClose: () => void; }

interface Reservation {
  id: string; courtId: number; courtName: string;
  date: string; slot: string; userId: string;
  userFirstName: string; userLastName: string; userEmail: string; createdAt: string;
  players: { id: string; firstName: string; lastName: string }[];
}

export interface AdminEvent {
  id: string;
  type: "seminaire" | "coaching" | "soiree" | "tournoi" | "autre";
  title: string;
  date: string;
  slot: string;        // "" if no terrain involved
  courtIds: number[];  // [] if no terrain
  maxPlaces?: number;  // coaching only
  desc: string;
  createdAt: string;
}

// DB → local type converters
const toAdminEvent = (row: Record<string, unknown>): AdminEvent => ({
  id:        row.id as string,
  type:      row.type as AdminEvent["type"],
  title:     row.title as string,
  date:      row.date as string,
  slot:      (row.slot as string) || "",
  courtIds:  (row.court_ids as number[]) || [],
  maxPlaces: row.max_places as number | undefined,
  desc:      (row.description as string) || "",
  createdAt: (row.created_at as string) || new Date().toISOString(),
});

const toBadge = (row: Record<string, unknown>): Badge => ({
  id:          row.id as string,
  name:        row.name as string,
  emoji:       (row.emoji as string) || "",
  color:       (row.color as string) || "#6ab5db",
  permissions: (row.permissions as string[]) || [],
  createdAt:   (row.created_at as string) || new Date().toISOString(),
});

const toReservation = (row: Record<string, unknown>): Reservation => ({
  id:            row.id as string,
  courtId:       row.court_id as number,
  courtName:     (row.court_name as string) || "",
  date:          row.date as string,
  slot:          row.slot as string,
  userId:        (row.user_id as string) || "",
  userFirstName: (row.user_first_name as string) || "",
  userLastName:  (row.user_last_name as string) || "",
  userEmail:     (row.user_email as string) || "",
  createdAt:     (row.created_at as string) || new Date().toISOString(),
  players:       Array.isArray(row.players) ? (row.players as { id: string; firstName: string; lastName: string }[]) : typeof row.players === "string" ? JSON.parse(row.players) : [],
});

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  color: string; // hex
  permissions: string[];
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "book_free",       label: "Réserver sans crédits" },
  { id: "manage_coaching", label: "Gérer les événements coaching" },
  { id: "manage_soirees",  label: "Gérer les événements soirées" },
  { id: "view_planning",   label: "Voir le planning" },
  { id: "admin_access",    label: "Accès panel Admin" },
];

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "bg-muted text-muted-foreground",
  "P25": "bg-garden-blue-light text-garden-blue-dark",
  "P50": "bg-garden-blue-light text-garden-blue-dark",
  "P100": "bg-garden-blue-light text-garden-blue-dark",
  "P250": "bg-garden-pink-light text-garden-pink-dark",
  "P500": "bg-garden-pink-light text-garden-pink-dark",
  "P1000+": "bg-garden-pink text-white",
};

const COURTS = [
  { id: 1, name: "Le Jardin Bleu",    icon: <Target  className="w-3.5 h-3.5" />, bg: "bg-gradient-to-br from-[#89c9eb]/30 to-[#6ab5db]/50", text: "text-garden-blue-dark",  border: "border-garden-blue/40" },
  { id: 2, name: "La Rose des Vents", icon: <Medal   className="w-3.5 h-3.5" />, bg: "bg-gradient-to-br from-[#e98eaa]/30 to-[#d87594]/50", text: "text-garden-pink-dark",  border: "border-garden-pink/40" },
  { id: 3, name: "La Terrasse Rose",  icon: <Flower2 className="w-3.5 h-3.5" />, bg: "bg-gradient-to-br from-[#89c9eb]/20 to-[#e98eaa]/30", text: "text-garden-pink-dark",  border: "border-garden-pink/30" },
];

const EVENT_TYPES = [
  { value: "tournoi",   label: "Tournoi",    icon: <Trophy      className="w-4 h-4" />, color: "bg-garden-blue text-white",           light: "bg-garden-blue-light",  usesTerrain: false },
  { value: "seminaire", label: "Séminaire",  icon: <Briefcase   className="w-4 h-4" />, color: "bg-foreground/80 text-white",         light: "bg-muted",              usesTerrain: true  },
  { value: "coaching",  label: "Coaching",   icon: <Dumbbell    className="w-4 h-4" />, color: "bg-garden-blue text-white",           light: "bg-garden-blue-light",  usesTerrain: true  },
  { value: "soiree",    label: "Soirée",     icon: <PartyPopper className="w-4 h-4" />, color: "bg-garden-pink text-white",           light: "bg-garden-pink-light",  usesTerrain: false },
  { value: "autre",     label: "Autre",      icon: <MoreHorizontal className="w-4 h-4" />, color: "bg-muted-foreground text-white",  light: "bg-muted",              usesTerrain: false },
] as const;

const SLOTS = [
  "08:00 – 09:30","09:30 – 11:00","11:00 – 12:30",
  "12:30 – 14:00","14:00 – 15:30","15:30 – 17:00",
  "17:00 – 18:30","18:30 – 20:00","20:00 – 21:30",
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

const AdminDashboard = ({ open, onClose }: Props) => {
  const { user: currentUser, users, logout, refreshUsers } = useAuth();
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState<"members"|"reservations"|"events"|"badges">("members");
  const [weekOffset, setWeekOffset] = useState(0);

  // Events state
  const [events, setEvents]         = useState<AdminEvent[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ type: "seminaire" as AdminEvent["type"], title: "", date: "", slot: "", courtIds: [] as number[], maxPlaces: 8, desc: "" });

  // Badges state
  const [badges, setBadges]         = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<Record<string, string[]>>({});
  const [badgeEditState, setBadgeEditState] = useState<{ id?: string; name: string; emoji: string; color: string; permissions: string[] } | null>(null);

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Member detail state
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [pendingCredits, setPendingCredits] = useState<number>(0);
  const [creditSaving, setCreditSaving] = useState(false);
  const [creditSaved, setCreditSaved] = useState(false);
  const [memberConfirm, setMemberConfirm] = useState<"delete" | "ban" | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  // Chargement Supabase à chaque ouverture / changement d'onglet
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const [evRes, bdRes, ubRes, rsRes] = await Promise.all([
        supabase.from("events").select("*").order("date"),
        supabase.from("badges").select("*").order("created_at"),
        supabase.from("user_badges").select("*"),
        supabase.from("reservations").select("*").order("date"),
      ]);
      if (evRes.data) setEvents(evRes.data.map(r => toAdminEvent(r as Record<string, unknown>)));
      if (bdRes.data) setBadges(bdRes.data.map(r => toBadge(r as Record<string, unknown>)));
      if (ubRes.data) {
        const ub: Record<string, string[]> = {};
        for (const row of ubRes.data as { user_id: string; badge_id: string }[]) {
          ub[row.user_id] = ub[row.user_id] ? [...ub[row.user_id], row.badge_id] : [row.badge_id];
        }
        setUserBadges(ub);
      }
      if (rsRes.data) setReservations(rsRes.data.map(r => toReservation(r as Record<string, unknown>)));
      await refreshUsers();
    };
    load();
  }, [open, tab]);

  // IDs des membres ayant la permission "book_free"
  const bookFreeIds = useMemo(() => new Set(
    Object.entries(userBadges)
      .filter(([, ids]) => ids.some(bid => badges.find(b => b.id === bid)?.permissions.includes("book_free")))
      .map(([userId]) => userId)
  ), [badges, userBadges]);

  const days = getWeekDays(weekOffset * 7);

  const handleSaveCredits = async () => {
    if (!selectedMember) return;
    setCreditSaving(true);
    await supabase.from("profiles").update({ credits: pendingCredits }).eq("id", selectedMember.id);
    await refreshUsers();
    setSelectedMember(prev => prev ? { ...prev, credits: pendingCredits } : null);
    setCreditSaving(false);
    setCreditSaved(true);
    setTimeout(() => setCreditSaved(false), 2000);
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    setMemberActionLoading(true);
    await supabase.rpc("delete_user", { user_id: selectedMember.id });
    await refreshUsers();
    setSelectedMember(null);
    setMemberConfirm(null);
    setMemberActionLoading(false);
  };

  const handleBanMember = async () => {
    if (!selectedMember) return;
    setMemberActionLoading(true);
    await supabase.from("banned_emails").insert({ email: selectedMember.email });
    await supabase.rpc("delete_user", { user_id: selectedMember.id });
    await refreshUsers();
    setSelectedMember(null);
    setMemberConfirm(null);
    setMemberActionLoading(false);
  };

  const allMembers = users;
  const filteredUsers = allMembers.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.level}`.toLowerCase().includes(search.toLowerCase())
  );
  const getResForDayAndCourt = (date: string, courtId: number) =>
    reservations.filter(r => r.date === date && r.courtId === courtId).sort((a, b) => a.slot.localeCompare(b.slot));

  const handleLogout = () => { logout(); onClose(); };

  const selectedType = EVENT_TYPES.find(t => t.value === form.type)!;

  const toggleCourt = (id: number) =>
    setForm(f => ({ ...f, courtIds: f.courtIds.includes(id) ? f.courtIds.filter(c => c !== id) : [...f.courtIds, id] }));

  const saveEvent = async () => {
    if (!form.title || !form.date) return;
    if (selectedType.usesTerrain && (!form.slot || form.courtIds.length === 0)) return;
    const newRow = {
      id: `ev-${Date.now()}`,
      type: form.type, title: form.title, date: form.date,
      slot: form.slot, court_ids: form.courtIds,
      max_places: form.type === "coaching" ? form.maxPlaces : null,
      description: form.desc,
    };
    const { data, error } = await supabase.from("events").insert(newRow).select().single();
    if (!error && data) {
      const ev = toAdminEvent(data as Record<string, unknown>);
      setEvents(prev => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)));
    }
    setForm({ type: "seminaire", title: "", date: "", slot: "", courtIds: [], maxPlaces: 8, desc: "" });
    setShowForm(false);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // ── Badge CRUD ──────────────────────────────────────────────────────────
  const saveBadge = async () => {
    if (!badgeEditState || !badgeEditState.name.trim()) return;
    const row = {
      id: badgeEditState.id || `badge-${Date.now()}`,
      name: badgeEditState.name, emoji: badgeEditState.emoji,
      color: badgeEditState.color, permissions: badgeEditState.permissions,
    };
    const { data, error } = await supabase.from("badges").upsert(row).select().single();
    if (!error && data) {
      const badge = toBadge(data as Record<string, unknown>);
      setBadges(prev => badgeEditState.id ? prev.map(b => b.id === badge.id ? badge : b) : [...prev, badge]);
    }
    setBadgeEditState(null);
  };

  const deleteBadge = async (id: string) => {
    await supabase.from("badges").delete().eq("id", id);
    setBadges(prev => prev.filter(b => b.id !== id));
    setUserBadges(prev => Object.fromEntries(
      Object.entries(prev).map(([uid, bids]) => [uid, bids.filter(bid => bid !== id)])
    ));
  };

  const toggleUserBadge = async (userId: string, badgeId: string) => {
    const current = userBadges[userId] || [];
    if (current.includes(badgeId)) {
      await supabase.from("user_badges").delete().eq("user_id", userId).eq("badge_id", badgeId);
      setUserBadges(prev => ({ ...prev, [userId]: current.filter(id => id !== badgeId) }));
    } else {
      await supabase.from("user_badges").insert({ user_id: userId, badge_id: badgeId });
      setUserBadges(prev => ({ ...prev, [userId]: [...current, badgeId] }));
    }
  };

  const subLabel = () => {
    if (tab === "members")      return `${users.length} membre${users.length > 1 ? "s" : ""} inscrit${users.length > 1 ? "s" : ""}`;
    if (tab === "reservations") return `${reservations.length} réservation${reservations.length > 1 ? "s" : ""}`;
    if (tab === "events")       return `${events.length} événement${events.length > 1 ? "s" : ""}`;
    return `${badges.length} badge${badges.length > 1 ? "s" : ""} · ${Object.values(userBadges).flat().length} attribution${Object.values(userBadges).flat().length > 1 ? "s" : ""}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-md" aria-hidden="true" />

      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-[960px] max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-garden-blue-light to-garden-blue flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">Panel Administrateur</h2>
              <p className="text-xs text-muted-foreground">{subLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-7 pt-4 pb-3 border-b border-border shrink-0 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button onClick={() => setTab("members")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "members" ? "bg-garden-blue text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Users className="w-4 h-4" /> Membres
            </button>
            <button onClick={() => setTab("reservations")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "reservations" ? "bg-garden-blue text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Calendar className="w-4 h-4" /> Réservations
            </button>
            <button onClick={() => setTab("events")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "events" ? "bg-garden-pink text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <PartyPopper className="w-4 h-4" /> Événements
            </button>
            <button onClick={() => setTab("badges")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "badges" ? "bg-garden-blue text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Shield className="w-4 h-4" /> Badges
            </button>
          </div>

          {tab === "members" && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
            </div>
          )}

          {tab === "reservations" && (
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset(w => w - 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-semibold text-foreground min-w-[130px] text-center">{days[0].label.split(" ").slice(1).join(" ")} – {days[6].label.split(" ").slice(1).join(" ")}</span>
              <button onClick={() => setWeekOffset(w => w + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}

          {tab === "events" && (
            <button onClick={() => setShowForm(f => !f)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-garden-pink text-white hover:bg-garden-pink-dark transition-colors">
              <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Créer un événement"}
            </button>
          )}
          {tab === "badges" && (
            <button onClick={() => setBadgeEditState(badgeEditState ? null : { name: "", emoji: "🏅", color: "#6ab5db", permissions: [] })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-garden-blue text-white hover:bg-garden-blue-dark transition-colors">
              <Plus className="w-4 h-4" /> {badgeEditState && !badgeEditState.id ? "Annuler" : "Créer un badge"}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">

          {/* ── Membres ── */}
          {tab === "members" && (
            filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{users.length === 0 ? "Aucun membre inscrit." : "Aucun résultat."}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background border-b border-border">
                  <tr>{["Membre","Email","Naissance","Adresse","Niveau","Crédits","Inscrit le"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u: User) => (
                    <tr
                      key={u.id}
                      onClick={() => { setSelectedMember(u); setMemberConfirm(null); setPendingCredits(u.credits ?? 0); setCreditSaved(false); }}
                      className={`hover:bg-muted/40 transition-colors cursor-pointer ${selectedMember?.id === u.id ? "bg-garden-blue/5" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-garden-blue-light to-garden-pink-light flex items-center justify-center text-xs font-bold text-garden-blue-dark shrink-0">{u.firstName[0]}{u.lastName[0]}</div>
                          <span className="font-semibold text-foreground">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{u.birthDate ? new Date(u.birthDate).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="px-5 py-3.5 text-muted-foreground max-w-[140px] truncate">{u.address}</td>
                      <td className="px-5 py-3.5"><span className={`inline-block px-2.5 py-0.5 rounded-pill text-[0.7rem] font-bold ${LEVEL_COLORS[u.level] || "bg-muted text-muted-foreground"}`}>{u.level}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {(u.role === "admin" || bookFreeIds.has(u.id)) ? (
                            <span className="text-lg font-black text-garden-blue leading-none">∞</span>
                          ) : (
                            <>
                              <img src={flowerBlue} alt="crédit" className="h-4 w-auto" />
                              <span className="text-sm font-bold text-garden-blue-dark">{u.credits ?? 0}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* ── Réservations ── */}
          {tab === "reservations" && (
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
                  const dayRes = reservations.filter(r => r.date === day.key);
                  const dayEvs    = events.filter(e => e.date === day.key && e.courtIds.length > 0);
                  const globalEvs = events.filter(e => e.date === day.key && e.courtIds.length === 0);
                  return (
                    <div key={day.key} className={day.isToday ? "bg-garden-blue/5" : ""}>

                      {/* ── Bannière événements sans terrain (soirées, tournois…) ── */}
                      {globalEvs.length > 0 && (
                        <div className="flex gap-px border-b border-border/40">
                          <div className={`w-[140px] shrink-0 flex items-center px-4 py-2 ${day.isToday ? "bg-garden-blue/10" : "bg-muted/30"}`}>
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">Agenda</span>
                          </div>
                          <div className="flex-1 bg-background px-3 py-2 flex flex-wrap gap-1.5 items-center">
                            {globalEvs.map(e => {
                              const cfg = EVENT_TYPES.find(t => t.value === e.type)!;
                              return (
                                <span key={e.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.color}`}>
                                  {cfg.icon}
                                  {e.title}{e.slot ? <span className="opacity-75 font-medium"> · {e.slot}</span> : null}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── Grille terrains ── */}
                      <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-px">
                        <div className={`flex flex-col justify-center px-4 py-3 ${day.isToday ? "bg-garden-blue/10" : "bg-muted/30"}`}>
                          <span className={`text-xs font-black tracking-tight ${day.isToday ? "text-garden-blue-dark" : "text-foreground"}`}>{day.label}</span>
                          {day.isToday && <span className="text-[0.6rem] font-bold text-garden-blue mt-0.5">Aujourd'hui</span>}
                          {(dayRes.length + dayEvs.length) > 0 && <span className="text-[0.6rem] text-muted-foreground mt-1">{dayRes.length + dayEvs.length} rés.</span>}
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
                                  {courtEvs.map(e => {
                                    const cfg = EVENT_TYPES.find(t => t.value === e.type)!;
                                    return (
                                      <div key={e.id} className={`rounded-xl px-3 py-2 border border-foreground/10 ${cfg.light}`}>
                                        <div className="flex items-center gap-1"><span className="text-foreground/60">{cfg.icon}</span><span className="text-[0.7rem] font-black text-foreground truncate">{e.slot}</span></div>
                                        <div className="text-[0.7rem] font-semibold text-muted-foreground mt-0.5 truncate">{e.title}</div>
                                      </div>
                                    );
                                  })}
                                  {courtRes.map(r => (
                                    <div key={r.id} className={`rounded-xl px-3 py-2 border ${court.bg} ${court.border}`}>
                                      <div className={`text-[0.7rem] font-black ${court.text}`}>{r.slot}</div>
                                      {r.players.length > 0 ? (
                                        <div className="text-[0.65rem] text-foreground leading-tight mt-0.5">
                                          {r.players.map((p, i) => (
                                            <div key={i} className="font-medium truncate">{p.firstName} {p.lastName}</div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-[0.7rem] font-semibold text-foreground mt-0.5">{r.userFirstName} {r.userLastName}</div>
                                      )}
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

          {/* ── Badges ── */}
          {tab === "badges" && (
            <div className="p-7 flex flex-col lg:flex-row gap-8">

              {/* ── Colonne gauche : définitions des badges ── */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-garden-blue" /> Badges du club</h3>

                {/* Formulaire créer / éditer */}
                {badgeEditState && (
                  <div className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col gap-3">
                    <p className="text-xs font-black text-foreground">{badgeEditState.id ? "Modifier le badge" : "Nouveau badge"}</p>
                    <div className="flex gap-2">
                      <div className="w-[72px]">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Emoji</p>
                        <input className={inputCls} value={badgeEditState.emoji} maxLength={4} onChange={e => setBadgeEditState(s => s && ({ ...s, emoji: e.target.value }))} placeholder="🏅" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Nom</p>
                        <input className={inputCls} value={badgeEditState.name} onChange={e => setBadgeEditState(s => s && ({ ...s, name: e.target.value }))} placeholder="Ex : Coach, VIP…" />
                      </div>
                      <div className="w-[60px]">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Couleur</p>
                        <input type="color" className="w-full h-[38px] rounded-xl border border-border cursor-pointer p-1 bg-background" value={badgeEditState.color} onChange={e => setBadgeEditState(s => s && ({ ...s, color: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Droits associés</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {AVAILABLE_PERMISSIONS.map(p => {
                          const active = badgeEditState.permissions.includes(p.id);
                          return (
                            <button key={p.id} onClick={() => setBadgeEditState(s => s && ({ ...s, permissions: active ? s.permissions.filter(x => x !== p.id) : [...s.permissions, p.id] }))}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${active ? "bg-garden-blue/10 border-garden-blue/30 text-garden-blue-dark" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}>
                              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${active ? "bg-garden-blue border-garden-blue" : "border-border"}`}>
                                {active && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setBadgeEditState(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:text-foreground transition-colors">Annuler</button>
                      <button onClick={saveBadge} disabled={!badgeEditState.name.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-garden-blue text-white hover:bg-garden-blue-dark transition-all disabled:opacity-40">
                        <Check className="w-3.5 h-3.5" /> {badgeEditState.id ? "Enregistrer" : "Créer"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Liste des badges */}
                {badges.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">Aucun badge créé.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {badges.map(badge => (
                      <div key={badge.id} className="flex items-start gap-3 p-3.5 rounded-2xl border border-border bg-background">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: badge.color + "22" }}>{badge.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: badge.color }}>
                              {badge.emoji} {badge.name}
                            </span>
                          </div>
                          {badge.permissions.length === 0 ? (
                            <p className="text-[0.65rem] text-muted-foreground italic">Aucun droit</p>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {badge.permissions.map(pid => {
                                const perm = AVAILABLE_PERMISSIONS.find(p => p.id === pid);
                                return perm ? (
                                  <span key={pid} className="text-[0.63rem] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{perm.label}</span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setBadgeEditState({ id: badge.id, name: badge.name, emoji: badge.emoji, color: badge.color, permissions: [...badge.permissions] })}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-garden-blue/10 text-muted-foreground hover:text-garden-blue transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteBadge(badge.id)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Séparateur vertical */}
              <div className="hidden lg:block w-px bg-border shrink-0" />

              {/* ── Colonne droite : attribution aux membres ── */}
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-garden-blue" /> Attribution aux membres</h3>
                {users.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">Aucun membre.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {users.map(u => {
                      const memberBadgeIds = userBadges[u.id] || [];
                      const memberBadges = memberBadgeIds.map(bid => badges.find(b => b.id === bid)).filter(Boolean) as Badge[];
                      const availableBadges = badges.filter(b => !memberBadgeIds.includes(b.id));
                      return (
                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-background">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-garden-blue-light to-garden-pink-light flex items-center justify-center text-xs font-bold text-garden-blue-dark shrink-0">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{u.firstName} {u.lastName}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {memberBadges.length === 0 ? (
                                <span className="text-[0.65rem] text-muted-foreground italic">Aucun badge</span>
                              ) : memberBadges.map(badge => (
                                <button key={badge.id} onClick={() => toggleUserBadge(u.id, badge.id)} title="Cliquer pour retirer"
                                  className="inline-flex items-center gap-1 text-[0.65rem] font-bold px-2 py-0.5 rounded-full text-white transition-opacity hover:opacity-70"
                                  style={{ backgroundColor: badge.color }}>
                                  {badge.emoji} {badge.name} ×
                                </button>
                              ))}
                            </div>
                          </div>
                          {availableBadges.length > 0 && (
                            <select defaultValue="" onChange={e => { if (e.target.value) { toggleUserBadge(u.id, e.target.value); e.target.value = ""; } }}
                              className="text-[0.7rem] border border-dashed border-border rounded-lg px-2 py-1.5 text-muted-foreground bg-transparent cursor-pointer hover:border-garden-blue hover:text-garden-blue transition-colors shrink-0">
                              <option value="" disabled>+ Badge</option>
                              {availableBadges.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Événements ── */}
          {tab === "events" && (
            <div className="p-7 flex flex-col gap-6">

              {/* Formulaire */}
              {showForm && (
                <div className="bg-muted/30 border border-border rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-sm font-black text-foreground">Nouvel événement</h3>

                  {/* Type */}
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Type</p>
                    <div className="flex gap-2 flex-wrap">
                      {EVENT_TYPES.map(t => (
                        <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value, courtIds: [], slot: "" }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${form.type === t.value ? `${t.color} border-transparent shadow-sm` : "bg-background border-border text-muted-foreground hover:text-foreground"}`}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Titre */}
                    <div className="col-span-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Titre</p>
                      <input className={inputCls} placeholder="Ex : Séminaire TotalEnergies" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    {/* Date */}
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                      <input className={inputCls} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    {/* Créneau (terrain uniquement) */}
                    {selectedType.usesTerrain && (
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Créneau</p>
                        <select className={inputCls} value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value }))}>
                          <option value="">-- Sélectionner --</option>
                          {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {/* Horaires libres (sans terrain) */}
                    {!selectedType.usesTerrain && (
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Horaires <span className="normal-case font-normal">(optionnel)</span></p>
                        <input className={inputCls} placeholder="Ex : 19h – Minuit" value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value }))} />
                      </div>
                    )}
                    {/* Nombre de places (coaching uniquement) */}
                    {form.type === "coaching" && (
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Nombre de places</p>
                        <input className={inputCls} type="number" min="1" max="30"
                          value={form.maxPlaces}
                          onChange={e => setForm(f => ({ ...f, maxPlaces: Math.max(1, parseInt(e.target.value) || 1) }))} />
                      </div>
                    )}
                    {/* Terrains (terrain uniquement) */}
                    {selectedType.usesTerrain && (
                      <div className="col-span-2">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Terrains réservés</p>
                        <div className="flex gap-2">
                          {COURTS.map(c => (
                            <button key={c.id} onClick={() => toggleCourt(c.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${form.courtIds.includes(c.id) ? `${c.bg} ${c.border} ${c.text}` : "bg-background border-border text-muted-foreground hover:text-foreground"}`}>
                              {c.icon} {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Description */}
                    <div className="col-span-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Description <span className="normal-case font-normal">(optionnel)</span></p>
                      <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Détails supplémentaires..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                    </div>
                  </div>

                  <button onClick={saveEvent}
                    disabled={!form.title || !form.date || (selectedType.usesTerrain && (!form.slot || form.courtIds.length === 0))}
                    className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-garden-pink text-white hover:bg-garden-pink-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4" /> Créer l'événement
                  </button>
                </div>
              )}

              {/* Liste des événements */}
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PartyPopper className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun événement créé. Cliquez sur "Créer un événement" pour commencer.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {events.map(ev => {
                    const cfg = EVENT_TYPES.find(t => t.value === ev.type)!;
                    const courts = COURTS.filter(c => ev.courtIds.includes(c.id));
                    return (
                      <div key={ev.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${cfg.light} border-foreground/8`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-foreground">{ev.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(ev.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                {ev.slot && ` · ${ev.slot}`}
                              </p>
                              {courts.length > 0 && (
                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                  {courts.map(c => (
                                    <span key={c.id} className={`inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2 py-0.5 rounded-pill ${c.bg} ${c.text} border ${c.border}`}>
                                      {c.icon} {c.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {ev.type === "coaching" && ev.maxPlaces && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[0.65rem] font-semibold text-garden-blue-dark bg-garden-blue-light px-2 py-0.5 rounded-pill">
                                  {ev.maxPlaces} places
                                </span>
                              )}
                              {ev.desc && <p className="text-xs text-muted-foreground mt-1">{ev.desc}</p>}
                            </div>
                            <button onClick={() => deleteEvent(ev.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Member detail panel ── */}
        {selectedMember && (
          <div className="absolute inset-y-0 right-0 w-80 bg-background border-l border-border flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.08)] z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
              <h3 className="text-sm font-black text-foreground">Fiche membre</h3>
              <button onClick={() => { setSelectedMember(null); setMemberConfirm(null); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
              {/* Avatar + nom */}
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-garden-blue-light to-garden-pink-light flex items-center justify-center text-xl font-black text-garden-blue-dark">
                  {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                </div>
                <div className="text-center">
                  <p className="font-black text-foreground">{selectedMember.firstName} {selectedMember.lastName}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-pill text-[0.7rem] font-bold mt-1 ${LEVEL_COLORS[selectedMember.level] || "bg-muted text-muted-foreground"}`}>
                    <Trophy className="w-3 h-3 inline mr-1" />{selectedMember.level}
                  </span>
                </div>
              </div>

              {/* Infos */}
              <div className="flex flex-col gap-2.5 bg-muted/30 rounded-2xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">Email</p>
                    <p className="text-xs font-medium text-foreground break-all">{selectedMember.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">Naissance</p>
                    <p className="text-xs font-medium text-foreground">{selectedMember.birthDate ? new Date(selectedMember.birthDate).toLocaleDateString("fr-FR") : "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">Adresse</p>
                    <p className="text-xs font-medium text-foreground">{selectedMember.address || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">Membre depuis</p>
                    <p className="text-xs font-medium text-foreground">{new Date(selectedMember.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              </div>

              {/* Crédits */}
              {selectedMember.role !== "admin" && !bookFreeIds.has(selectedMember.id) && (
                <div className="bg-garden-blue/5 border border-garden-blue/20 rounded-2xl p-3.5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> Crédits
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setPendingCredits(c => Math.max(0, c - 1))}
                      disabled={pendingCredits === 0}
                      className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-lg font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >−</button>
                    <div className="flex items-center gap-2">
                      <img src={flowerBlue} alt="" className="h-5 w-auto" />
                      <span className="text-2xl font-black text-garden-blue-dark">{pendingCredits}</span>
                    </div>
                    <button
                      onClick={() => setPendingCredits(c => c + 1)}
                      className="w-9 h-9 rounded-xl bg-garden-blue text-white flex items-center justify-center text-lg font-bold hover:bg-garden-blue-dark transition-colors"
                    >+</button>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    {[5, 10, 15, 20].map(n => (
                      <button key={n} onClick={() => setPendingCredits(c => c + n)} className="flex-1 py-1 rounded-lg bg-garden-blue/10 text-garden-blue-dark text-xs font-bold hover:bg-garden-blue/20 transition-colors">
                        +{n}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveCredits}
                    disabled={creditSaving || pendingCredits === (selectedMember.credits ?? 0)}
                    className="mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-garden-blue text-white hover:bg-garden-blue-dark"
                  >
                    {creditSaving ? "Enregistrement…" : creditSaved ? "✓ Crédits sauvegardés" : "Valider les crédits"}
                  </button>
                </div>
              )}

              {/* Actions danger */}
              {selectedMember.role !== "admin" && (
                <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border">
                  {memberConfirm === null && (
                    <>
                      <button onClick={() => setMemberConfirm("delete")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border border-red-200 transition-colors">
                        <UserX className="w-4 h-4" /> Supprimer le compte
                      </button>
                      <button onClick={() => setMemberConfirm("ban")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-orange-600 hover:bg-orange-50 border border-orange-200 transition-colors">
                        <Ban className="w-4 h-4" /> Bannir (email bloqué)
                      </button>
                    </>
                  )}
                  {memberConfirm === "delete" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex flex-col gap-2">
                      <p className="text-xs font-semibold text-red-700">Supprimer définitivement <strong>{selectedMember.firstName} {selectedMember.lastName}</strong> ?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setMemberConfirm(null)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-background border border-border text-muted-foreground hover:text-foreground transition-colors">Annuler</button>
                        <button onClick={handleDeleteMember} disabled={memberActionLoading} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60">
                          {memberActionLoading ? "…" : "Confirmer"}
                        </button>
                      </div>
                    </div>
                  )}
                  {memberConfirm === "ban" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex flex-col gap-2">
                      <p className="text-xs font-semibold text-orange-700">Bannir et supprimer <strong>{selectedMember.firstName}</strong> ? Son email <strong>{selectedMember.email}</strong> sera bloqué.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setMemberConfirm(null)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-background border border-border text-muted-foreground hover:text-foreground transition-colors">Annuler</button>
                        <button onClick={handleBanMember} disabled={memberActionLoading} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-60">
                          {memberActionLoading ? "…" : "Bannir"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
