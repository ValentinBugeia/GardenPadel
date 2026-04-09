import { Users, Gift, ArrowRight, CalendarDays } from "lucide-react";

const tournois = [
  { month: "Avr.", year: "2026", title: "Open Garden Printemps", level: "Niveau P25 à P100 — Mixte", teams: "32 équipes", prize: "Dotation 500€", spots: "8 places restantes", color: "blue" as const, mailto: "Open%20Printemps", btnLabel: "S'inscrire", open: true },
  { month: "Mai", year: "2026", title: "Tournoi Dames & Juniors", level: "Tous niveaux — Dames / -18 ans", teams: "24 équipes", prize: "Trophées & cadeaux", spots: "Inscriptions ouvertes", color: "pink" as const, mailto: "Tournoi%20Dames", btnLabel: "S'inscrire", open: true },
  { month: "Juin", year: "2026", title: "Garden Summer Championship", level: "Niveau P100+ — Open", teams: "48 équipes", prize: "Dotation 1 500€", spots: "Bientôt disponible", color: "blue" as const, mailto: "Summer", btnLabel: "Me notifier", open: false },
];

interface Props { onCalendar: () => void; }

const Tournois = ({ onCalendar }: Props) => (
  <section className="py-28 bg-muted/30" id="tournois">
    <div className="container">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
        <div>
          <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-garden-blue-dark mb-3 block">Compétitions</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-foreground">
            Calendrier des Tournois
          </h2>
        </div>
        <button
          onClick={onCalendar}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-semibold text-sm bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5 self-start md:self-auto"
        >
          <CalendarDays className="w-4 h-4" /> Calendrier complet
        </button>
      </div>

      <div className="divide-y divide-border">
        {tournois.map((t) => (
          <div
            key={t.title}
            className="group grid grid-cols-[5rem_1fr] md:grid-cols-[6rem_1fr_auto] gap-6 md:gap-10 py-9 items-center hover:bg-muted/50 transition-colors duration-200 -mx-4 px-4 rounded-xl"
          >
            {/* Date */}
            <div className="text-center">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.month}</div>
              <div className={`text-3xl font-black tracking-tighter leading-tight ${t.color === "pink" ? "text-garden-pink-dark" : "text-garden-blue-dark"}`}>{t.year}</div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground mb-1">{t.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t.level}</p>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
                  <Users className="w-3.5 h-3.5" /> {t.teams}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
                  <Gift className="w-3.5 h-3.5" /> {t.prize}
                </span>
                <span className={`text-[0.78rem] font-semibold ${t.color === "pink" ? "text-garden-pink-dark" : "text-garden-blue-dark"}`}>
                  {t.spots}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="hidden md:block">
              <a
                href={`mailto:contact@gardenpadel.fr?subject=${t.mailto}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-pill font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                  t.open
                    ? t.color === "pink"
                      ? "bg-garden-pink text-white shadow-pink hover:bg-garden-pink-dark"
                      : "bg-garden-blue text-white shadow-blue hover:bg-garden-blue-dark"
                    : "bg-transparent text-garden-blue border border-garden-blue hover:bg-garden-blue hover:text-white"
                }`}
              >
                {t.btnLabel} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Tournois;
