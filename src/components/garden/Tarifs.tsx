const horaires = [
  { jour: "Lundi – Vendredi", h: "08h00 – 23h00" },
  { jour: "Samedi", h: "08h00 – 23h00" },
  { jour: "Dimanche", h: "09h00 – 21h00" },
  { jour: "Jours fériés", h: "09h00 – 20h00" },
];

const tarifs = [
  { label: "Heure creuse", sub: "Lun–Ven avant 17h", price: "14€", unit: "/pers.", color: "blue" as const },
  { label: "Heure de pointe", sub: "Soir & week-end", price: "18€", unit: "/pers.", color: "blue" as const },
  { label: "Abonnement mensuel", sub: "10 séances + club house", price: "120€", unit: "/mois", color: "pink" as const },
  { label: "Cours collectif", sub: "Coach certifié · 4 joueurs max", price: "25€", unit: "/pers.", color: "pink" as const },
];

const Tarifs = () => (
  <section className="py-24" id="tarifs">
    <div className="container">
      <div>
        <span className="inline-flex items-center gap-1.5 bg-garden-blue-light text-garden-blue-dark text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-pill mb-3.5">📋 Pratique</span>
        <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight mb-3.5 text-foreground">Horaires &amp; Tarifs</h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[540px]">Des tarifs transparents pour profiter du club à tout moment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 mt-14 items-start">
        <div>
          <h3 className="text-base font-bold mb-4 text-foreground">⏰ Horaires d'ouverture</h3>
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr><th className="bg-garden-blue text-white px-4 py-3 text-sm font-bold text-left">Jour</th><th className="bg-garden-blue text-white px-4 py-3 text-sm font-bold text-left">Horaires</th></tr>
            </thead>
            <tbody>
              {horaires.map((h, i) => (
                <tr key={h.jour}><td className={`px-4 py-3 text-sm text-foreground border-b border-background ${i % 2 === 1 ? "bg-background" : ""}`}>{h.jour}</td><td className={`px-4 py-3 text-sm text-foreground border-b border-background ${i % 2 === 1 ? "bg-background" : ""}`}>{h.h}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-base font-bold mb-4 text-foreground">💶 Tarifs</h3>
          <div className="flex flex-col gap-3">
            {tarifs.map((t) => (
              <div key={t.label} className={`bg-card rounded-[14px] px-5 py-4 shadow-card flex justify-between items-center border-l-4 transition-all duration-300 ${t.color === "pink" ? "border-l-garden-pink hover:shadow-pink hover:translate-x-1" : "border-l-garden-blue hover:shadow-blue hover:translate-x-1"}`}>
                <div>
                  <div className="text-[0.9rem] font-semibold text-foreground">{t.label}</div>
                  <div className="text-[0.75rem] text-muted-foreground mt-0.5">{t.sub}</div>
                </div>
                <div className={`text-xl font-black whitespace-nowrap ${t.color === "pink" ? "text-garden-pink-dark" : "text-garden-blue-dark"}`}>
                  {t.price}<span className="text-[0.7rem] font-medium text-muted-foreground">{t.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Tarifs;
