import { MapPin, Mail, Clock } from "lucide-react";
import { type ReactNode } from "react";

interface Props { onEmail: () => void; }

const Contact = ({ onEmail }: Props) => (
  <section className="py-24 bg-background" id="contact">
    <div className="container">
      <div>
        <span className="inline-flex items-center gap-1.5 bg-garden-blue-light text-garden-blue-dark text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-pill mb-3.5"><MapPin className="w-3 h-3" /> Nous trouver</span>
        <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight mb-3.5 text-foreground">Venez nous rendre visite</h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[540px]">À Six-Fours-Les-Plages, dans le Var, à deux pas de la Méditerranée.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-14 mt-14">
        <div className="flex flex-col gap-4">
          {([
            { icon: <MapPin className="w-5 h-5" />, label: "Adresse", value: "Six-Fours-Les-Plages\nVar (83), France" },
            { icon: <Mail className="w-5 h-5" />, label: "Email", value: "contact@gardenpadel.fr", isLink: true },
            { icon: <Clock className="w-5 h-5" />, label: "Ouverture", value: "7 jours sur 7 · Dès 8h00" },
          ] as { icon: ReactNode; label: string; value: string; isLink?: boolean }[]).map((item) => (
            <div key={item.label} className="flex gap-4 bg-card rounded-[14px] p-4 shadow-card transition-transform duration-300 hover:translate-x-1">
              <div className="w-[46px] h-[46px] rounded-xl bg-garden-blue-light text-garden-blue-dark flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <div>
                <div className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">{item.label}</div>
                {item.isLink ? (
                  <button onClick={onEmail} className="text-[0.92rem] font-semibold text-garden-blue-dark hover:underline underline-offset-2 transition-colors text-left">{item.value}</button>
                ) : (
                  <div className="text-[0.92rem] font-semibold text-foreground leading-relaxed whitespace-pre-line">{item.value}</div>
                )}
              </div>
            </div>
          ))}

          <div>
            <div className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold mb-2.5">Réseaux sociaux</div>
            <div className="flex gap-2.5">
              {[
                { href: "https://www.instagram.com/gardenpadel.fr", title: "Instagram", hoverClass: "hover:bg-gradient-to-br hover:from-[#e040fb] hover:via-[#f06292] hover:to-[#ff7043]", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
                { href: "https://www.facebook.com/share/1EqrNzc1JD/", title: "Facebook", hoverClass: "hover:bg-[#1877f2]", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
                { href: "https://www.linkedin.com/company/garden-padel-six-fours-les-plages/", title: "LinkedIn", hoverClass: "hover:bg-[#0a66c2]", icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/> },
              ].map((s) => (
                <a key={s.title} href={s.href} target="_blank" rel="noopener" className={`w-[42px] h-[42px] rounded-xl bg-garden-blue-light text-garden-blue-dark flex items-center justify-center transition-all duration-300 hover:text-white hover:-translate-y-0.5 ${s.hoverClass}`} title={s.title}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.08)] min-h-[400px] h-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46779.89!2d5.99!3d43.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9b8e1b8b8b8b8%3A0x0!2sSix-Fours-les-Plages!5e0!3m2!1sfr!2sfr!4v1617000000000!5m2!1sfr!2sfr"
            className="w-full h-full border-none min-h-[400px]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Garden Padel – Six-Fours-Les-Plages"
          />
        </div>
      </div>
    </div>
  </section>
);

export default Contact;
