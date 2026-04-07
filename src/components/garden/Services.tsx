import { Target, Trophy, Leaf, Sparkles } from "lucide-react";
import { type ReactNode } from "react";

const services: { icon: ReactNode; title: string; text: string; link: string; linkText: string; color: "blue" | "pink" | "gray" }[] = [
  { icon: <Target className="w-8 h-8" />, title: "Entraînements de Pro", text: "Améliorez votre jeu avec nos coachs certifiés. Cours individuels, collectifs et stages pour tous les niveaux.", link: "#courts", linkText: "En savoir plus →", color: "blue" },
  { icon: <Trophy className="w-8 h-8" />, title: "Tournois Communautaires", text: "Rejoignez nos compétitions mensuelles. Tournois mixtes, dames, juniors et open pour tous les niveaux.", link: "#tournois", linkText: "Voir le calendrier →", color: "pink" },
  { icon: <Leaf className="w-8 h-8" />, title: "Le Garden Resto", text: "Une cuisine fraîche et saine après le match. Brunchs, cocktails et assiettes healthy dans un cadre verdoyant.", link: "#clubhouse", linkText: "Découvrir →", color: "gray" },
];

const colorMap = {
  blue: { wrap: "bg-garden-blue-light text-garden-blue-dark", title: "text-garden-blue-dark", link: "text-garden-blue-dark" },
  pink: { wrap: "bg-garden-pink-light text-garden-pink-dark", title: "text-garden-pink-dark", link: "text-garden-pink-dark" },
  gray: { wrap: "bg-muted text-foreground", title: "text-foreground", link: "text-foreground" },
};

const Services = () => (
  <section className="py-24" id="services">
    <div className="container">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 bg-garden-blue-light text-garden-blue-dark text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-pill mb-3.5"><Sparkles className="w-3 h-3" /> Nos Services</span>
        <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight mb-3.5 text-foreground">Tout ce qu'il vous faut<br />pour jouer &amp; profiter</h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[540px] mx-auto">Du padel de haut niveau à une table dressée après le match — Garden Padel, c'est bien plus qu'un club.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
        {services.map((s) => {
          const c = colorMap[s.color];
          return (
            <div key={s.title} className="bg-card rounded-lg p-10 pb-9 text-center border border-black/5 shadow-card flex flex-col items-center transition-all duration-400 cursor-default hover:-translate-y-3.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.09)] group">
              <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center mb-5 ${c.wrap}`}>
                <span className="group-hover:animate-wiggle inline-block">{s.icon}</span>
              </div>
              <h3 className={`text-lg font-extrabold mb-2.5 ${c.title}`}>{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              <a href={s.link} className={`inline-flex items-center gap-1.5 text-[0.83rem] font-bold mt-4 transition-all hover:gap-2.5 ${c.link}`}>{s.linkText}</a>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default Services;
