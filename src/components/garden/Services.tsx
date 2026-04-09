import { Target, Trophy, Leaf } from "lucide-react";
import { type ReactNode } from "react";

const services: { icon: ReactNode; title: string; text: string; link: string; linkText: string; accent: string }[] = [
  { icon: <Target className="w-5 h-5" />, title: "Entraînements de Pro", text: "Améliorez votre jeu avec nos coachs certifiés. Cours individuels, collectifs et stages pour tous les niveaux.", link: "#courts", linkText: "En savoir plus", accent: "text-garden-blue-dark bg-garden-blue-light" },
  { icon: <Trophy className="w-5 h-5" />, title: "Tournois Communautaires", text: "Rejoignez nos compétitions mensuelles. Tournois mixtes, dames, juniors et open pour tous les niveaux.", link: "#tournois", linkText: "Voir le calendrier", accent: "text-garden-pink-dark bg-garden-pink-light" },
  { icon: <Leaf className="w-5 h-5" />, title: "Le Garden Resto", text: "Une cuisine fraîche et saine après le match. Brunchs, cocktails et assiettes healthy dans un cadre verdoyant.", link: "#clubhouse", linkText: "Découvrir", accent: "text-foreground bg-muted" },
];

const Services = () => (
  <section className="py-28" id="services">
    <div className="container">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
        <div>
          <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-garden-blue-dark mb-3 block">Nos Services</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-foreground">
            Tout ce qu'il vous faut<br className="hidden md:block" /> pour jouer &amp; profiter
          </h2>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[380px] md:text-right">
          Du padel de haut niveau à une table dressée après le match.
        </p>
      </div>

      <div className="divide-y divide-border">
        {services.map((s, i) => (
          <div
            key={s.title}
            className="group grid grid-cols-[3rem_1fr] md:grid-cols-[4rem_1fr_auto] gap-6 md:gap-10 py-10 items-start hover:bg-muted/40 transition-colors duration-200 -mx-4 px-4 rounded-xl"
          >
            {/* Number */}
            <span className="text-[2.2rem] font-black tracking-tighter text-muted-foreground/25 leading-none pt-1 select-none">
              0{i + 1}
            </span>

            {/* Content */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.accent}`}>
                  {s.icon}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{s.title}</h3>
              </div>
              <p className="text-[0.92rem] text-muted-foreground leading-relaxed max-w-[480px]">{s.text}</p>
              <a
                href={s.link}
                className="inline-flex items-center gap-1.5 text-sm font-semibold mt-4 text-garden-blue-dark transition-all duration-200 hover:gap-3"
              >
                {s.linkText} →
              </a>
            </div>

            {/* Arrow on hover — desktop only */}
            <div className="hidden md:flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;
