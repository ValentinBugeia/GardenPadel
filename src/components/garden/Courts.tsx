const courts = [
  { emoji: "🎾", name: "Le Jardin Bleu", desc: "Vue panoramique sur les jardins. Idéal pour les matchs du matin dans la lumière naturelle.", tags: ["🌳 Vue jardin", "💡 LED", "🏆 FFT"], thumb: "bg-gradient-to-br from-garden-blue-light to-garden-blue", tag: "Court 1", tagStyle: "" },
  { emoji: "🏅", name: "La Rose des Vents", desc: "Notre court central, scène de tous les tournois. Tribunes pour une ambiance compétition unique.", tags: ["🎭 Tribunes", "📸 HD", "🎙️ Sono"], thumb: "bg-gradient-to-br from-garden-pink-light to-garden-pink", tag: "Court 2", tagStyle: "bg-garden-pink text-white" },
  { emoji: "🌸", name: "La Terrasse Rose", desc: "Le court familial et convivial. Parfait pour les cours débutants et les parties entre amis.", tags: ["👨‍👩‍👧 Familial", "🌅 Terrasse", "🎓 Initiation"], thumb: "bg-gradient-to-br from-garden-blue-light to-garden-pink-light", tag: "Court 3", tagStyle: "" },
];

const Courts = () => {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-background" id="courts">
      <div className="container">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-garden-blue-light text-garden-blue-dark text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-pill mb-3.5">🎾 Nos Terrains</span>
          <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight mb-3.5 text-foreground">3 Terrains de Padel<br />de Haut Standing</h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[540px]">Courts homologués FFT avec revêtement premium, éclairage LED et équipements professionnels.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {courts.map((c) => (
            <div key={c.name} className="bg-card rounded-lg overflow-hidden shadow-card transition-all duration-400 hover:-translate-y-2.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.1)] group">
              <div className={`h-[200px] flex items-center justify-center text-4xl overflow-hidden relative transition-transform duration-500 group-hover:scale-105 ${c.thumb}`}>
                {c.emoji}
                <span className={`absolute top-3 left-3 rounded-pill px-3 py-0.5 text-[0.7rem] font-bold ${c.tagStyle || "bg-white/90 backdrop-blur-sm"}`}>{c.tag}</span>
              </div>
              <div className="p-5 pb-6">
                <h3 className="text-base font-extrabold mb-1.5 text-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3.5">{c.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span key={t} className="bg-background rounded-pill px-3 py-0.5 text-[0.72rem] font-semibold text-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#adhesion" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5" onClick={(e) => { e.preventDefault(); scrollTo("#adhesion"); }}>Réserver un terrain</a>
        </div>
      </div>
    </section>
  );
};

export default Courts;
