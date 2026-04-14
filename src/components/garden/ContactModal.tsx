import { useState, useEffect } from "react";
import { X, Mail, User, MessageSquare, FileText, CheckCircle2 } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-garden-blue/40 focus:border-garden-blue transition-all";

const ContactModal = ({ open, onClose }: Props) => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!open) { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }
  }, [open]);

  if (!open) return null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.subject || `Message de ${form.name}`);
    const body = encodeURIComponent(
      `De : ${form.name}\nEmail : ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:contact@gardenpadel.fr?subject=${subject}&body=${body}`;
    setTimeout(() => setSent(true), 400);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" aria-hidden="true" />
      <div className="relative bg-background rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-garden-blue/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-garden-blue-dark" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">Nous contacter</h2>
              <p className="text-xs text-muted-foreground mt-0.5">contact@gardenpadel.fr</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-7 py-6 overflow-y-auto">
          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><User className="w-3 h-3" /> Nom *</label>
                  <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Prénom Nom" required />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email *</label>
                  <input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="vous@email.fr" required />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><FileText className="w-3 h-3" /> Objet</label>
                  <input className={inputCls} value={form.subject} onChange={set("subject")} placeholder="Ex : Question sur les réservations" />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Message *</label>
                  <textarea className={`${inputCls} resize-none`} rows={4} value={form.message} onChange={set("message")} placeholder="Votre message…" required />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-blue text-white hover:bg-garden-blue-dark transition-all duration-300 hover:-translate-y-0.5 shadow-blue mt-1">
                Envoyer le message →
              </button>
              <p className="text-center text-[0.65rem] text-muted-foreground">Votre client mail s'ouvrira avec le message pré-rempli.</p>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-14 h-14 rounded-full bg-garden-blue/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-garden-blue-dark" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Message prêt !</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Votre client mail s'est ouvert avec votre message.<br />Envoyez-le pour que nous puissions vous répondre.</p>
              </div>
              <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-garden-blue text-white hover:bg-garden-blue-dark transition-all mt-2">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
