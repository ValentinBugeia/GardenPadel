const tournois = [
  { date: "🗓️ Avril 2026", title: "Open Garden Printemps", level: "Niveau P25 à P100 — Mixte", teams: "👥 32 équipes", prize: "🎁 Dotation 500€", spots: "8 places restantes", color: "blue" as const, mailto: "Open%20Printemps", btnLabel: "S'inscrire" },
  { date: "🗓️ Mai 2026", title: "Tournoi Dames & Juniors", level: "Tous niveaux — Dames / -18 ans", teams: "👥 24 équipes", prize: "🎁 Trophées & cadeaux", spots: "Inscriptions ouvertes", color: "pink" as const, mailto: "Tournoi%20Dames", btnLabel: "S'inscrire" },
  { date: "🗓️ Juin 2026", title: "Garden Summer Championship", level: "Niveau P100+ — Open", teams: "👥 48 équipes", prize: "🎁 Dotation 1 500€", spots: "Bientôt disponible", color: "blue" as const, mailto: "Summer", btnLabel: "Me notifier", outline: true },
];

const Tournois = () => (
  <section className="py-24 bg-background" id="tournois">
    <div className="container">
      <div className="flex justify-between items-end flex-wrap gap-5">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-garden-blue-light text-garden-blue-dark text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-pill mb-3.5">🏆 Compétitions</span>
          <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight mb-3.5 text-foreground">Calendrier des Tournois</h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[540px]">Des compétitions pour tous les niveaux tout au long de l'année.</p>
        </div>
        <a href="mailto:contact@gardenpadel.fr?subject=Tournoi" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5">Calendrier complet</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
        {tournois.map((t) => (
          <div key={t.title} className={`bg-card rounded-lg p-6 shadow-card border-[1.5px] border-transparent transition-all duration-400 hover:-translate-y-2 ${t.color === "pink" ? "hover:border-garden-pink-light hover:shadow-pink" : "hover:border-garden-blue-light hover:shadow-blue"}`}>
            <span className={`inline-block rounded-[10px] px-3 py-1 text-[0.77rem] font-bold mb-3.5 ${t.color === "pink" ? "bg-garden-pink-light text-garden-pink-dark" : "bg-garden-blue-light text-garden-blue-dark"}`}>{t.date}</span>
            <h3 className="text-base font-extrabold mb-1.5 text-foreground">{t.title}</h3>
            <p className="text-sm text-muted-foreground mb-3.5">{t.level}</p>
            <div className="flex gap-3.5 mb-4 flex-wrap">
              <span className="text-[0.78rem] text-muted-foreground">{t.teams}</span>
              <span className="text-[0.78rem] text-muted-foreground">{t.prize}</span>
            </div>
            <div className="border-t border-background pt-3.5 flex justify-between items-center">
              <span className={`text-sm font-bold ${t.color === "pink" ? "text-garden-pink-dark" : "text-garden-blue-dark"}`}>{t.spots}</span>
              <a href={`mailto:contact@gardenpadel.fr?subject=${t.mailto}`} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-pill font-bold text-[0.78rem] transition-all duration-300 hover:-translate-y-0.5 ${t.outline ? "bg-transparent text-garden-blue border-2 border-garden-blue hover:bg-garden-blue hover:text-white" : t.color === "pink" ? "bg-garden-pink text-white shadow-pink hover:bg-garden-pink-dark" : "bg-garden-blue text-white shadow-blue hover:bg-garden-blue-dark"}`}>{t.btnLabel}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Tournois;
