import { useState } from "react";
import { X, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props { open: boolean; onClose: () => void; }

const ResetPasswordModal = ({ open, onClose }: Props) => {
  const { resetPassword } = useAuth();
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const result = await resetPassword(password);
      if (result.success) setDone(true);
      else setError(result.error || "Une erreur est survenue.");
    } catch {
      setError("Une erreur est survenue, réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />
      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.2)] w-full max-w-[420px] overflow-hidden">
        <div className="px-8 pt-8 pb-8">

          {!done ? (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-foreground">Nouveau mot de passe</h2>
                  <p className="text-sm text-muted-foreground mt-1">Choisissez un nouveau mot de passe</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground -mt-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required minLength={6}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPwd ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                )}

                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                  {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-garden-blue/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-garden-blue" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground">Mot de passe mis à jour !</h2>
                <p className="text-sm text-muted-foreground mt-2">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              </div>
              <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5 mt-2">
                Fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
