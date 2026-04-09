import { useState, useEffect, useMemo, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Target, Medal, Flower2, CheckCircle2, Clock, Search, UserPlus, XCircle } from "lucide-react";
import { useAuth, type User } from "@/contexts/AuthContext";
import flowerBlue from "@/assets/flower-blue.png";

const STORAGE_RESERVATIONS = "gp_reservations";
const STORAGE_USERS = "gp_users";
const STORAGE_EVENTS = "gp_admin_events";
const STORAGE_BADGES = "gp_badges";
const STORAGE_USER_BADGES = "gp_user_badges";

const terrains = [
  { id: 1, name: "Le Jardin Bleu",    desc: "Vue jardin · LED · FFT",         bg: "from-[#89c9eb]/30 to-[#6ab5db]/50", border: "border-garden-blue", icon: <Target  className="w-6 h-6 text-garden-blue-dark" /> },
  { id: 2, name: "La Rose des Vents", desc: "Tribunes · HD · Sono",            bg: "from-[#e98eaa]/30 to-[#d87594]/50", border: "border-garden-pink", icon: <Medal   className="w-6 h-6 text-garden-pink-dark" /> },
  { id: 3, name: "La Terrasse Rose",  desc: "Familial · Terrasse · Initiation",bg: "from-[#89c9eb]/20 to-[#e98eaa]/30", border: "border-garden-pink", icon: <Flower2 className="w-6 h-6 text-garden-pink-dark" /> },
];

const slots = [
  "08:00 – 09:30", "09:30 – 11:00", "11:00 – 12:30",
  "12:30 – 14:00", "14:00 – 15:30", "15:30 – 17:00",
  "17:00 – 18:30", "18:30 – 20:00", "20:00 – 21:30",
];

const getNextDays = () => {
  const days = [];
  const dayNames  = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const monthNames = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push({ key: d.toISOString().split("T")[0], day: dayNames[d.getDay()], date: d.getDate(), month: monthNames[d.getMonth()] });
  }
  return days;
};

const getAvailableTerrains = (day: string, slot: string) => {
  const reservations = JSON.parse(localStorage.getItem(STORAGE_RESERVATIONS) || "[]");
  const events       = JSON.parse(localStorage.getItem(STORAGE_EVENTS) || "[]");
  const takenByRes   = reservations.filter((r: { date: string; slot: string; courtId: number }) => r.date === day && r.slot === slot).map((r: { courtId: number }) => r.courtId);
  const takenByEvs   = events.filter((e: { date: string; slot: string; courtIds: number[] }) => e.date === day && e.slot === slot).flatMap((e: { courtIds: number[] }) => e.courtIds);
  const taken        = [...new Set([...takenByRes, ...takenByEvs])];
  return terrains.filter(t => !taken.includes(t.id));
};

const getNearestAvailableSlot = (day: string, currentSlot: string): string | null => {
  const idx = slots.indexOf(currentSlot);
  const candidates = slots
    .map((s, i) => ({ s, dist: Math.abs(i - idx) }))
    .filter(({ s }) => s !== currentSlot && getAvailableTerrains(day, s).length > 0)
    .sort((a, b) => a.dist - b.dist);
  return candidates.length > 0 ? candidates[0].s : null;
};

interface Props { open: boolean; onClose: () => void; }

const BookingModal = ({ open, onClose }: Props) => {
  const { user, users, updateUser } = useAuth();
  const [step, setStep]                   = useState<1|2|3|4>(1);
  const [selectedDay, setSelectedDay]     = useState<string>(getNextDays()[0].key);
  const [selectedSlot, setSelectedSlot]   = useState<string|null>(null);
  const [selectedTerrain, setSelectedTerrain] = useState<number|null>(null);
  const [players, setPlayers]             = useState<User[]>([]);
  const [search, setSearch]               = useState("");
  const [showDropdown, setShowDropdown]   = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const days = getNextDays();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const reset = () => { setStep(1); setSelectedSlot(null); setSelectedTerrain(null); setPlayers([]); setSearch(""); };
  const handleClose = () => { onClose(); setTimeout(reset, 300); };

  const availableTerrains = useMemo(
    () => (selectedDay && selectedSlot ? getAvailableTerrains(selectedDay, selectedSlot) : []),
    [selectedDay, selectedSlot]
  );
  const nearestSlot = useMemo(
    () => (selectedDay && selectedSlot && availableTerrains.length === 0 ? getNearestAvailableSlot(selectedDay, selectedSlot) : null),
    [selectedDay, selectedSlot, availableTerrains.length]
  );

  // IDs des utilisateurs ayant la permission "book_free"
  const bookFreeIds = useMemo(() => {
    const ub: Record<string, string[]> = JSON.parse(localStorage.getItem(STORAGE_USER_BADGES) || "{}");
    const ab: { id: string; permissions: string[] }[] = JSON.parse(localStorage.getItem(STORAGE_BADGES) || "[]");
    return new Set(
      Object.entries(ub)
        .filter(([, ids]) => ids.some(bid => ab.find(b => b.id === bid)?.permissions.includes("book_free")))
        .map(([userId]) => userId)
    );
  }, [open]);

  // Utilisateurs éligibles : crédits > 0 OU book_free, pas déjà sélectionné, pas soi-même
  const eligible = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      u.id !== user?.id &&
      ((u.credits ?? 0) > 0 || bookFreeIds.has(u.id)) &&
      !players.find(p => p.id === u.id) &&
      (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, user, players, search, bookFreeIds]);

  const addPlayer  = (u: User) => { if (players.length < 3) { setPlayers([...players, u]); setSearch(""); setShowDropdown(false); } };
  const removePlayer = (id: string) => setPlayers(players.filter(p => p.id !== id));

  const handleConfirm = () => {
    const terrain = terrains.find(t => t.id === selectedTerrain);
    const allPlayers = [user!, ...players];

    // Déduire 1 crédit à chaque joueur
    const storedUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
    const updatedUsers = storedUsers.map(u =>
      allPlayers.find(p => p.id === u.id) ? { ...u, credits: Math.max(0, (u.credits ?? 0) - 1) } : u
    );
    localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));
    // Mettre à jour le state du user courant
    if ((user?.credits ?? 0) > 0) updateUser({ credits: Math.max(0, (user?.credits ?? 0) - 1) } as Parameters<typeof updateUser>[0]);

    // Enregistrer la réservation
    const reservation = {
      id: `res-${Date.now()}`,
      courtId: selectedTerrain,
      courtName: terrain?.name,
      date: selectedDay,
      slot: selectedSlot,
      userId: user?.id || "guest",
      userFirstName: user?.firstName || "Invité",
      userLastName:  user?.lastName  || "",
      userEmail:     user?.email     || "—",
      players: allPlayers.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName })),
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem(STORAGE_RESERVATIONS) || "[]");
    localStorage.setItem(STORAGE_RESERVATIONS, JSON.stringify([...existing, reservation]));
    setStep(4);
    setTimeout(handleClose, 2500);
  };

  const selectedTerrainObj = terrains.find(t => t.id === selectedTerrain);
  const selectedDayObj     = days.find(d => d.key === selectedDay);

  if (!open) return null;

  const stepBack: Record<number, () => void> = {
    2: () => setStep(1),
    3: () => setStep(2),
  };

  const subtitle: Record<number, string> = {
    1: "Choisissez une date et un créneau",
    2: `${selectedDayObj?.day} ${selectedDayObj?.date} ${selectedDayObj?.month} · ${selectedSlot}`,
    3: `${selectedTerrainObj?.name} · ${selectedSlot}`,
    4: "Réservation enregistrée",
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />

      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.2)] w-full max-w-[560px] overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {(step === 2 || step === 3) && (
              <button onClick={stepBack[step]} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">Réserver un terrain</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle[step]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {step !== 4 && (
              <div className="flex gap-1.5">
                {[1,2,3].map(s => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-5 bg-garden-blue" : s < step ? "w-3 bg-garden-blue/40" : "w-3 bg-border"}`} />
                ))}
              </div>
            )}
            <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 overflow-y-auto flex-1">

          {/* Étape 4 — Confirmation */}
          {step === 4 && (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <CheckCircle2 className="w-14 h-14 text-garden-blue mb-2" />
              <p className="font-black text-xl text-foreground tracking-tight">Réservation confirmée !</p>
              <p className="text-sm text-muted-foreground">{selectedTerrainObj?.name} · {selectedDayObj?.day} {selectedDayObj?.date} {selectedDayObj?.month} · {selectedSlot}</p>
              <p className="text-xs text-muted-foreground mt-1">1 crédit déduit par joueur</p>
            </div>
          )}

          {/* Étape 1 — Date + Créneau */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">Date</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {days.map(d => (
                    <button key={d.key} onClick={() => { setSelectedDay(d.key); setSelectedSlot(null); }}
                      className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-center transition-all duration-200 border ${selectedDay === d.key ? "bg-garden-blue text-white border-garden-blue shadow-blue" : "bg-muted/50 border-transparent hover:border-border text-foreground"}`}>
                      <span className="text-[0.6rem] font-semibold uppercase opacity-70">{d.day}</span>
                      <span className="text-base font-black leading-tight">{d.date}</span>
                      <span className="text-[0.55rem] opacity-60">{d.month}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">Créneau horaire</p>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(slot => (
                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-2 rounded-xl text-[0.78rem] font-semibold border transition-all duration-200 ${selectedSlot === slot ? "bg-garden-pink text-white border-garden-pink shadow-pink" : "bg-muted/50 border-transparent hover:border-border text-foreground"}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 — Choix du terrain */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              {availableTerrains.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground mb-1">{availableTerrains.length} terrain{availableTerrains.length > 1 ? "s" : ""} disponible{availableTerrains.length > 1 ? "s" : ""}</p>
                  {availableTerrains.map(t => (
                    <button key={t.id} onClick={() => setSelectedTerrain(t.id)}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border-2 bg-gradient-to-r ${t.bg} transition-all duration-200 text-left hover:-translate-y-0.5 hover:shadow-md ${selectedTerrain === t.id ? `${t.border} shadow-md` : "border-transparent hover:border-border"}`}>
                      <div className="w-11 h-11 rounded-xl bg-background/60 flex items-center justify-center shrink-0">{t.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-foreground tracking-tight">{t.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center py-6 text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Aucun terrain disponible</p>
                    <p className="text-sm text-muted-foreground mt-1">Tous les terrains sont réservés pour ce créneau.</p>
                  </div>
                  {nearestSlot ? (
                    <div className="w-full bg-garden-blue/5 border border-garden-blue/20 rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground mb-2">Prochain créneau disponible ce jour</p>
                      <button onClick={() => { setSelectedSlot(nearestSlot); setSelectedTerrain(null); }}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-garden-blue text-white hover:bg-garden-blue-dark transition-colors">
                        {nearestSlot}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun créneau disponible ce jour. Essayez une autre date.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Étape 3 — Joueurs */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">Il faut 4 joueurs pour réserver un terrain. Ajoutez 3 autres membres (1 crédit sera déduit par joueur).</p>

              {/* Joueur 1 — vous-même */}
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Joueur 1 — Vous</p>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-garden-blue/8 border border-garden-blue/20">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-garden-blue to-garden-pink flex items-center justify-center text-sm font-black text-white shrink-0">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {user && bookFreeIds.has(user.id) ? (
                      <span className="text-base font-black text-garden-blue leading-none">∞</span>
                    ) : (
                      <>
                        <img src={flowerBlue} alt="crédit" className="h-4 w-auto" />
                        <span className="text-xs font-semibold text-garden-blue-dark">{user?.credits ?? 0}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Joueurs ajoutés */}
              {players.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Joueurs ajoutés ({players.length}/3)</p>
                  <div className="flex flex-col gap-2">
                    {players.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50 border border-border">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-garden-blue/60 to-garden-pink/60 flex items-center justify-center text-sm font-black text-white shrink-0">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">Joueur {i + 2} — {p.firstName} {p.lastName}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {bookFreeIds.has(p.id) ? (
                              <span className="text-base font-black text-garden-blue leading-none">∞</span>
                            ) : (
                              <>
                                <img src={flowerBlue} alt="crédit" className="h-4 w-auto" />
                                <span className="text-xs font-semibold text-garden-blue-dark">{p.credits ?? 0}</span>
                              </>
                            )}
                          </div>
                          <button onClick={() => removePlayer(p.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-red-500">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recherche joueur */}
              {players.length < 3 && (
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Ajouter joueur {players.length + 2}
                  </p>
                  <div className="relative">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/40 focus-within:ring-2 focus-within:ring-garden-blue/40 focus-within:border-garden-blue transition-all">
                      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input
                        ref={searchRef}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                        placeholder="Rechercher par nom ou email…"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                      />
                    </div>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-2xl shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                        {eligible.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                            {search ? "Aucun membre trouvé avec des crédits disponibles." : "Tapez un nom ou email pour chercher."}
                          </div>
                        ) : (
                          eligible.map(u => (
                            <button key={u.id} onMouseDown={() => addPlayer(u)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-garden-blue/50 to-garden-pink/50 flex items-center justify-center text-xs font-black text-white shrink-0">
                                {u.firstName[0]}{u.lastName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{u.firstName} {u.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {bookFreeIds.has(u.id) ? (
                                  <span className="text-base font-black text-garden-blue leading-none">∞</span>
                                ) : (
                                  <>
                                    <img src={flowerBlue} alt="crédit" className="h-3.5 w-auto" />
                                    <span className="text-xs font-semibold text-garden-blue-dark">{u.credits}</span>
                                  </>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {eligible.length === 0 && !search && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" /> Seuls les membres avec au moins 1 crédit peuvent être ajoutés.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="px-7 pb-7 shrink-0">
            <button onClick={() => { setSelectedTerrain(null); setStep(2); }} disabled={!selectedSlot}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
              {selectedSlot ? "Voir les terrains disponibles" : "Sélectionnez un créneau"}
            </button>
          </div>
        )}

        {step === 2 && availableTerrains.length > 0 && (
          <div className="px-7 pb-7 shrink-0">
            <button onClick={() => setStep(3)} disabled={!selectedTerrain}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
              {selectedTerrain ? "Choisir les joueurs →" : "Sélectionnez un terrain"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="px-7 pb-7 shrink-0">
            <button onClick={handleConfirm} disabled={players.length < 3}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0">
              {players.length < 3 ? `Ajoutez encore ${3 - players.length} joueur${3 - players.length > 1 ? "s" : ""}` : "Confirmer la réservation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
