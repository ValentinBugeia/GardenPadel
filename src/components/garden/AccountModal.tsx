import { useState, useEffect } from "react";
import { X, LogOut, Mail, MapPin, Calendar, Trophy, ShieldCheck, Settings, Pencil, Check, AlertCircle, LayoutDashboard, Plus, ShoppingCart } from "lucide-react";
import { useAuth, type PadelLevel } from "@/contexts/AuthContext";
import flowerBlue from "@/assets/flower-blue.png";
import { supabase } from "@/lib/supabase";

const CREDIT_PACKS = [
  { credits: 5,  price: 25 },
  { credits: 10, price: 45 },
  { credits: 15, price: 60 },
  { credits: 20, price: 75 },
];
const MEMBER_PANEL_PERMS  = ["view_planning", "manage_coaching", "manage_soirees"];

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "bg-muted text-muted-foreground",
  "P25": "bg-garden-blue-light text-garden-blue-dark",
  "P50": "bg-garden-blue-light text-garden-blue-dark",
  "P100": "bg-garden-blue-light text-garden-blue-dark",
  "P250": "bg-garden-pink-light text-garden-pink-dark",
  "P500": "bg-garden-pink-light text-garden-pink-dark",
  "P1000+": "bg-garden-pink text-white",
};

const LEVELS: PadelLevel[] = ["Débutant", "P25", "P50", "P100", "P250", "P500", "P1000+"];

const inputCls = "w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdmin?: () => void;
  onMemberPanel?: () => void;
}

const AccountModal = ({ open, onClose, onAdmin, onMemberPanel }: Props) => {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", address: "", birthDate: "", level: "" as PadelLevel });
  const [myBadges, setMyBadges] = useState<{ id: string; name: string; emoji: string; color: string }[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [buyingPack, setBuyingPack] = useState<number | null>(null);
  const [buySuccess, setBuySuccess] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    const load = async () => {
      const { data: ubData } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id);
      const badgeIds = (ubData || []).map(r => (r as { badge_id: string }).badge_id);
      if (badgeIds.length > 0) {
        const { data: bdData } = await supabase.from("badges").select("id, name, emoji, color, permissions").in("id", badgeIds);
        if (bdData) {
          setMyBadges(bdData.map(b => ({ id: b.id as string, name: b.name as string, emoji: b.emoji as string, color: b.color as string })));
          setPermissions([...new Set((bdData as { permissions: string[] }[]).flatMap(b => b.permissions || []))]);
        }
      } else {
        setMyBadges([]);
        setPermissions([]);
      }
    };
    load();
  }, [open, user]);

  if (!open || !user) return null;

  const handleLogout = () => { logout(); onClose(); };

  const startEdit = () => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      address: user.address,
      birthDate: user.birthDate,
      level: user.level,
    });
    setError("");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Prénom, nom et email sont requis.");
      return;
    }
    const res = await updateUser({ ...form, level: form.level as PadelLevel });
    if (!res.success) { setError(res.error || "Erreur."); return; }
    setEditing(false);
    setError("");
  };

  const handleBuy = async (pack: typeof CREDIT_PACKS[0]) => {
    if (!user) return;
    setBuyingPack(pack.credits);
    const newCredits = (user.credits ?? 0) + pack.credits;
    await updateUser({ credits: newCredits });
    setBuyingPack(null);
    setBuySuccess(pack.credits);
    setTimeout(() => setBuySuccess(null), 3000);
  };

  const birthFormatted = user.birthDate
    ? new Date(user.birthDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) { setEditing(false); onClose(); } }}
    >
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-md" aria-hidden="true" />

      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-garden-blue-light via-white to-garden-pink-light px-7 pt-8 pb-6 text-center">
          <button
            onClick={() => { setEditing(false); onClose(); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors text-foreground/50 hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-garden-blue to-garden-pink flex items-center justify-center text-2xl font-black text-white mx-auto mb-4 shadow-[0_8px_24px_rgba(137,201,235,0.4)]">
            {user.firstName[0]}{user.lastName[0]}
          </div>

          {editing ? (
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Prénom" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              <input className={inputCls} placeholder="Nom" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          ) : (
            <h2 className="text-xl font-black tracking-tight text-foreground">{user.firstName} {user.lastName}</h2>
          )}

          <div className="flex items-center justify-center gap-2 mt-2">
            {!editing && (
              <span className={`inline-block px-2.5 py-0.5 rounded-pill text-[0.7rem] font-bold ${LEVEL_COLORS[user.level] || "bg-muted text-muted-foreground"}`}>
                <Trophy className="w-3 h-3 inline mr-1" />{user.level}
              </span>
            )}
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[0.7rem] font-bold bg-garden-blue text-white">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Info / Form */}
        <div className="px-7 py-5 space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}

          {editing ? (
            <>
              <div>
                <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground block mb-1">Email</label>
                <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground block mb-1">Date de naissance</label>
                <input className={inputCls} type="date" value={form.birthDate} max={new Date().toISOString().split("T")[0]} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground block mb-1">Adresse</label>
                <input className={inputCls} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground block mb-1">Niveau</label>
                <select className={inputCls} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as PadelLevel }))}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">Date de naissance</p>
                  <p className="text-sm font-medium text-foreground">{birthFormatted}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">Adresse</p>
                  <p className="text-sm font-medium text-foreground">{user.address || "—"}</p>
                </div>
              </div>
            </>
          )}

          {/* Badges */}
          {myBadges.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Mes badges</p>
              <div className="flex flex-wrap gap-1.5">
                {myBadges.map(badge => (
                  <span key={badge.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: badge.color }}>
                    {badge.emoji} {badge.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Crédits */}
          <div className="pt-3 border-t border-border">
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5 text-center">Crédits restants</p>
            {(permissions.includes("book_free") || user.role === "admin") ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-4xl font-black text-garden-blue leading-none">∞</span>
                <p className="text-center text-[0.7rem] text-muted-foreground mt-1">Réservation sans crédits</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {Array.from({ length: Math.max(user.credits ?? 0, 0) }).map((_, i) => (
                    <img key={i} src={flowerBlue} alt="crédit" className="h-7 w-auto drop-shadow-sm" />
                  ))}
                  {(user.credits ?? 0) === 0 && (
                    <p className="text-xs text-muted-foreground italic">Aucun crédit disponible</p>
                  )}
                </div>
                <p className="text-center text-[0.7rem] text-muted-foreground mt-1.5">
                  {user.credits ?? 0} crédit{(user.credits ?? 0) !== 1 ? "s" : ""}
                </p>

                {/* Acheter des crédits */}
                <div className="mt-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ShoppingCart className="w-3 h-3" /> Acheter des crédits
                  </p>
                  {buySuccess && (
                    <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-garden-blue/10 border border-garden-blue/20 text-garden-blue-dark text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" /> +{buySuccess} crédits ajoutés !
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {CREDIT_PACKS.map(pack => (
                      <button
                        key={pack.credits}
                        onClick={() => handleBuy(pack)}
                        disabled={buyingPack !== null}
                        className="flex flex-col items-center gap-0.5 px-3 py-3 rounded-2xl border-2 border-garden-blue/20 bg-garden-blue/5 hover:bg-garden-blue/10 hover:border-garden-blue/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(pack.credits, 5) }).map((_, i) => (
                            <img key={i} src={flowerBlue} alt="" className="h-4 w-auto" />
                          ))}
                          {pack.credits > 5 && <Plus className="w-3 h-3 text-garden-blue" />}
                        </div>
                        <span className="text-sm font-black text-garden-blue-dark mt-1">
                          {buyingPack === pack.credits ? "…" : `${pack.credits} crédits`}
                        </span>
                        <span className="text-[0.65rem] font-semibold text-muted-foreground">{pack.price}€</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-border pt-1">
            <p className="text-[0.65rem] text-muted-foreground text-center">Membre depuis le {memberSince}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-7 pb-6 flex flex-col gap-2">
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setError(""); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-garden-pink text-white hover:bg-garden-pink-dark transition-colors">
                <Check className="w-4 h-4" /> Enregistrer
              </button>
            </div>
          ) : (
            <>
              <button onClick={startEdit} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-garden-blue text-garden-blue hover:bg-garden-blue hover:text-white transition-colors">
                <Pencil className="w-4 h-4" /> Modifier mes informations
              </button>
              {MEMBER_PANEL_PERMS.some(p => permissions.includes(p)) && onMemberPanel && (
                <button onClick={() => { onMemberPanel(); onClose(); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-garden-pink text-white hover:bg-garden-pink-dark transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Mon espace
                </button>
              )}
              {(user.role === "admin" || permissions.includes("admin_access")) && onAdmin && (
                <button onClick={() => { onAdmin(); onClose(); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-garden-blue text-white hover:bg-garden-blue-dark transition-colors">
                  <Settings className="w-4 h-4" /> Panel Administrateur
                </button>
              )}
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
