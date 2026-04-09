import { Droplets, Leaf, Tv, ShoppingBag } from "lucide-react";
import { type ReactNode, useState, useEffect } from "react";

const items: { icon: ReactNode; text: string }[] = [
  { icon: <Droplets className="w-5 h-5" />, text: "Vestiaires & douches haut de gamme" },
  { icon: <Leaf className="w-5 h-5" />, text: "Le Garden Resto — cuisine saine & fraîche" },
  { icon: <Tv className="w-5 h-5" />, text: "Lounge TV & bar à smoothies" },
  { icon: <ShoppingBag className="w-5 h-5" />, text: "Boutique & location de matériel" },
];

const reviews = [
  { name: "Sophie M.", date: "Il y a 2 semaines", stars: 5, text: "Terrains impeccables, ambiance au top ! Le Garden Resto après le match c'est le bonheur. On revient chaque semaine." },
  { name: "Thomas R.", date: "Il y a 1 mois", stars: 5, text: "Meilleur club de padel du Var. Coachs super pros, vestiaires nickel. L'afterwork du jeudi est une institution !" },
  { name: "Laura & Pierre", date: "Il y a 3 semaines", stars: 5, text: "On a organisé notre séminaire d'équipe ici. Accueil parfait, organisation sans faille. Toute l'équipe a adoré." },
  { name: "Marc D.", date: "Il y a 1 semaine", stars: 5, text: "Vue sur les jardins incroyable depuis le terrain 1. L'éclairage LED la nuit donne une ambiance vraiment unique." },
  { name: "Camille F.", date: "Il y a 2 mois", stars: 5, text: "Le bar à smoothies après l'entraînement, c'est une tuerie. Personnel aux petits soins, cadre magnifique." },
];

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ClubHouse = () => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % reviews.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const review = reviews[current];

  return (
    <section className="py-24 bg-gradient-to-br from-garden-blue to-garden-blue-dark relative overflow-hidden" id="clubhouse">
      <div className="absolute w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-[80px] -top-[150px] -right-20 pointer-events-none" aria-hidden="true" />
      <div className="absolute w-[300px] h-[300px] bg-garden-pink/[0.14] rounded-full blur-[80px] -bottom-20 -left-[60px] pointer-events-none" aria-hidden="true" />

      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-white/50 mb-4 block">Club House</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-white mb-4">Votre espace détente<br />après le match</h2>
          <p className="text-base text-white/65 leading-relaxed">Un club house pensé pour prolonger le plaisir — lounge, vestiaires premium et Le Garden Resto pour refaire le monde après chaque set.</p>
          <div className="flex flex-col gap-3 mt-7">
            {items.map((item) => (
              <div key={item.text} className="flex items-center gap-4 bg-white/[0.12] rounded-[14px] px-4 py-3.5 border border-white/10 transition-all duration-300 hover:bg-white/20 hover:translate-x-1">
                <span className="flex-shrink-0 text-white/80">{item.icon}</span>
                <span className="text-[0.92rem] text-white font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold bg-white text-garden-blue-dark shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5">Visiter le club</a>
          </div>
        </div>

        <div className="relative hidden lg:flex flex-col gap-5">
          {/* Score global */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4">
            <div className="text-center">
              <div className="text-4xl font-black text-white leading-none">4.9</div>
              <Stars count={5} />
              <div className="text-[0.65rem] text-white/50 mt-1 uppercase tracking-wider">Google</div>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white mb-0.5">Excellent</div>
              <div className="text-xs text-white/50">Basé sur 124 avis vérifiés</div>
              {/* Barres de progression */}
              <div className="flex flex-col gap-1 mt-2">
                {[["5", "88%"], ["4", "9%"], ["3", "3%"]].map(([star, pct]) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[0.6rem] text-white/40 w-2">{star}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400/70 rounded-full" style={{ width: pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Avis rotatif */}
          <div
            className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 transition-all duration-400"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {review.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{review.name}</div>
                  <div className="text-[0.65rem] text-white/40">{review.date}</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-white/20 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
              </svg>
            </div>
            <Stars count={review.stars} />
            <p className="text-sm text-white/70 leading-relaxed mt-2">"{review.text}"</p>
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true); }, 400); }}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"}`}
                aria-label={`Avis ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubHouse;
