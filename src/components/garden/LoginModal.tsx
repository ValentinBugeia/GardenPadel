import { useState, useEffect } from "react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onAdminOpen: () => void;
}

const LoginModal = ({ open, onClose, onSwitchToRegister, onAdminOpen }: Props) => {
  const { login } = useAuth();
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (email === "admin@gardenpadel.fr") {
        onClose();
        onAdminOpen();
      } else {
        onClose();
      }
    } else {
      setError(result.error || "Identifiants incorrects.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />

      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.2)] w-full max-w-[420px] overflow-hidden">
        <div className="px-8 pt-8 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Connexion</h2>
              <p className="text-sm text-muted-foreground mt-1">Accédez à votre espace membre</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground -mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Mot de passe</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore membre ?{" "}
            <button onClick={onSwitchToRegister} className="font-semibold text-garden-pink-dark hover:underline">
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
