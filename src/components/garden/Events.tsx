import { Sparkles, Wine, Handshake } from "lucide-react";

const Events = () => (
  <section className="py-24" id="evenements">
    <div className="container">
      <div>
        <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-garden-pink-dark mb-3 block">Événements</span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-foreground mb-4">Afterwork &amp; Séminaires<br />autour du padel</h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[480px]">Soirées afterwork entre collègues ou séminaires team-building sur les terrains.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
        {/* Afterwork */}
        <div className="rounded-lg overflow-hidden relative min-h-[420px] flex items-end shadow-[0_12px_40px_rgba(0,0,0,0.14)] transition-transform duration-400 hover:-translate-y-2 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5e] to-[#0d1e35] transition-transform duration-600 group-hover:scale-[1.06]">
            <div className="absolute inset-0 bg-cover bg-center opacity-[0.22]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=70')" }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.88] via-transparent to-transparent" />
          <span className="absolute top-4 right-4 px-3 py-1 rounded-pill text-[0.7rem] font-bold text-white bg-garden-blue">Chaque semaine</span>
          <div className="relative z-[1] p-9 text-white">
            <div className="mb-3"><Wine className="w-10 h-10 text-garden-blue" /></div>
            <h3 className="text-2xl font-extrabold mb-2.5">Garden Afterwork</h3>
            <p className="text-sm text-white/75 leading-relaxed">Chaque jeudi et vendredi soir, décompressez après le travail. Padel, cocktails et bonne humeur. Formule all-inclusive disponible.</p>
          </div>
        </div>

        {/* Séminaires */}
        <div className="rounded-lg overflow-hidden relative min-h-[420px] flex items-end shadow-[0_12px_40px_rgba(0,0,0,0.14)] transition-transform duration-400 hover:-translate-y-2 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a1a4e] to-[#150d2e] transition-transform duration-600 group-hover:scale-[1.06]">
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=70')" }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.88] via-transparent to-transparent" />
          <span className="absolute top-4 right-4 px-3 py-1 rounded-pill text-[0.7rem] font-bold text-white bg-garden-pink">Sur réservation</span>
          <div className="relative z-[1] p-9 text-white">
            <div className="mb-3"><Handshake className="w-10 h-10 text-garden-pink" /></div>
            <h3 className="text-2xl font-extrabold mb-2.5">Séminaires d'Entreprise</h3>
            <p className="text-sm text-white/75 leading-relaxed mb-5">Privatisez le club pour votre team-building : tournoi interne, repas et animation garantis. Le padel, sport de cohésion par excellence.</p>
            <a href="mailto:contact@gardenpadel.fr?subject=Séminaire" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill font-bold text-sm bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5">Demander un devis →</a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Events;
