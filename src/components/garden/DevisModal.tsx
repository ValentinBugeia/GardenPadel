import { useState, useEffect } from "react";
import { X, Building2, User, Mail, Phone, Users, CalendarDays, MessageSquare, CheckCircle2, Handshake } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-pink/40 focus:border-garden-pink transition-all";

const DevisModal = ({ open, onClose }: Props) => {
  const [form, setForm] = useState({ company: "", contact: "", email: "", phone: "", participants: "", date: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!open) { setSent(false); setError(""); setForm({ company: "", contact: "", email: "", phone: "", participants: "", date: "", message: "" }); }
  }, [open]);

  if (!open) return null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.email.trim() || !form.contact.trim()) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    // Envoi par mailto (ouvre le client mail avec les infos pré-remplies)
    const subject = encodeURIComponent(`Demande de devis séminaire – ${form.company}`);
    const body = encodeURIComponent(
      `Entreprise : ${form.company}\nContact : ${form.contact}\nEmail : ${form.email}\nTéléphone : ${form.phone}\nParticipants : ${form.participants}\nDate souhaitée : ${form.date}\n\nMessage :\n${form.message}`
    );
    window.location.href = `mailto:contact@gardenpadel.fr?subject=${subject}&body=${body}`;
    setTimeout(() => { setLoading(false); setSent(true); }, 500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />
      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-garden-pink/10 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-garden-pink-dark" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">Demande de devis</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Séminaire d'entreprise · Garden Padel</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Entreprise *</label>
                  <input className={inputCls} value={form.company} onChange={set("company")} placeholder="Nom de votre entreprise" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><User className="w-3 h-3" /> Contact *</label>
                  <input className={inputCls} value={form.contact} onChange={set("contact")} placeholder="Prénom Nom" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Phone className="w-3 h-3" /> Téléphone</label>
                  <input className={inputCls} type="tel" value={form.phone} onChange={set("phone")} placeholder="06 00 00 00 00" />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email *</label>
                  <input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="vous@entreprise.fr" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Users className="w-3 h-3" /> Participants</label>
                  <select className={inputCls} value={form.participants} onChange={set("participants")}>
                    <option value="">— Choisir —</option>
                    <option>Moins de 10</option>
                    <option>10 – 20</option>
                    <option>20 – 40</option>
                    <option>40 – 60</option>
                    <option>Plus de 60</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Date souhaitée</label>
                  <input className={inputCls} type="date" value={form.date} onChange={set("date")} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Message / besoins spécifiques</label>
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.message} onChange={set("message")} placeholder="Décrivez vos attentes, contraintes ou questions…" />
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-pink text-white hover:bg-garden-pink-dark transition-all duration-300 hover:-translate-y-0.5 shadow-pink mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                {loading ? "Envoi…" : "Envoyer ma demande de devis →"}
              </button>

              <p className="text-center text-[0.65rem] text-muted-foreground">Nous vous répondons sous 24h ouvrées.</p>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-14 h-14 rounded-full bg-garden-pink/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-garden-pink-dark" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Demande envoyée !</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Votre client mail s'est ouvert avec les informations pré-remplies.<br />Notre équipe vous contactera sous 24h ouvrées.</p>
              </div>
              <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-pink text-white hover:bg-garden-pink-dark transition-all mt-2">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevisModal;
