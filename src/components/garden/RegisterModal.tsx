import { useState, useEffect } from "react";
import { X, User, Mail, Lock, MapPin, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useAuth, type PadelLevel, type RegisterData } from "@/contexts/AuthContext";

const LEVELS: PadelLevel[] = ["Débutant", "P25", "P50", "P100", "P250", "P500", "P1000+"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ open, onClose, onSwitchToLogin }: Props) => {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterData>({
    firstName: "", lastName: "", email: "", password: "",
    address: "", birthDate: "", level: "Débutant",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState(false);
  const [loading, setLoading]                 = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const set = (field: keyof RegisterData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (!form.birthDate) { setError("Veuillez saisir votre date de naissance."); return; }
    const age = Math.floor((Date.now() - new Date(form.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000));
    if (age < 7) { setError("Vous devez avoir au moins 7 ans pour vous inscrire."); return; }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); }, 1500);
    } else {
      setError(result.error || "Erreur lors de l'inscription.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />

      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.2)] w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="px-8 pt-8 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Créer un compte</h2>
              <p className="text-sm text-muted-foreground mt-1">Rejoignez la famille Garden Padel</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground -mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-garden-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-garden-blue-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-foreground">Compte créé avec succès !</p>
              <p className="text-sm text-muted-foreground mt-1">Bienvenue dans le club.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Marie" required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Dupont" required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="vous@exemple.fr" required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Adresse postale</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={form.address} onChange={e => set("address", e.target.value)} placeholder="12 rue des Fleurs, 83140 Six-Fours" required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Date de naissance</label>
                  <input type="date" value={form.birthDate} onChange={e => set("birthDate", e.target.value)} max={new Date().toISOString().split("T")[0]} required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Niveau de padel</label>
                  <div className="relative">
                    <select value={form.level} onChange={e => set("level", e.target.value as PadelLevel)} required
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 caractères" required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Répétez votre mot de passe" required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5 mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                {loading ? "Création du compte…" : "Créer mon compte"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Déjà membre ?{" "}
                <button type="button" onClick={onSwitchToLogin} className="font-semibold text-garden-blue-dark hover:underline">
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
