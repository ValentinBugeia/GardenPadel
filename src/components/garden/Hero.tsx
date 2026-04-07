import { Target, Trophy } from "lucide-react";
import heroBg from "@/assets/hero-padel.jpg";

const Hero = () => {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" id="accueil">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0d2035] to-[#1a3a55]">
        <div
          className="absolute inset-0 opacity-[0.38] animate-hero-zoom bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBg}')` }}
          aria-hidden="true"
        />
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[rgba(13,32,53,0.82)] via-[rgba(13,32,53,0.55)] to-[rgba(13,32,53,0.28)]" aria-hidden="true" />

      <div className="container relative w-full" style={{ position: "relative" }}>
        <div className="relative z-[2] max-w-[660px]">
          <div className="inline-flex items-center gap-2 bg-white/[0.11] backdrop-blur-[12px] text-white text-xs font-bold tracking-[0.12em] uppercase px-[18px] py-1.5 rounded-pill mb-6 border border-white/20 animate-fade-in-down">
            <span className="w-2 h-2 rounded-full bg-garden-pink animate-blink" aria-hidden="true" />
            Six-Fours-Les-Plages &nbsp;·&nbsp; Ouvert 7j/7
          </div>
          <h1 className="text-[clamp(3rem,6.5vw,5.2rem)] font-black text-white leading-[1.02] tracking-tight mb-5 animate-fade-in-up-delay1">
            Garden<br /><em className="text-garden-blue not-italic">Padel</em> Club
          </h1>
          <p className="text-lg text-white/[0.78] mb-10 font-light leading-relaxed animate-fade-in-up-delay2">
            Où le sport rencontre la sérénité.<br />
            3 terrains, club house &amp; restaurant.
          </p>
          <div className="flex flex-wrap gap-3.5 animate-fade-in-up-delay3">
            <a href="#courts" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold text-[0.92rem] bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5" onClick={(e) => { e.preventDefault(); scrollTo("#courts"); }}><Target className="w-4 h-4" /> Réserver un Court</a>
            <a href="#tournois" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold text-[0.92rem] bg-white text-garden-blue-dark shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)]" onClick={(e) => { e.preventDefault(); scrollTo("#tournois"); }}><Trophy className="w-4 h-4" /> Nos Tournois</a>
          </div>
        </div>

        <div className="absolute bottom-20 right-0 z-[2] hidden md:flex flex-col gap-3 animate-fade-in-right" aria-hidden="true">
          {[
            { num: "3", label: "Terrains" },
            { num: "7/7", label: "Ouvert" },
            { num: "Pro", label: "Coachs certifiés", accent: true },
          ].map((s) => (
            <div key={s.label} className={`backdrop-blur-[16px] border rounded-2xl px-5 py-3.5 text-center min-w-[110px] ${s.accent ? "bg-garden-pink/[0.18] border-garden-pink/30" : "bg-white/[0.09] border-white/[0.16]"}`}>
              <div className={`text-3xl font-black leading-none ${s.accent ? "text-garden-pink" : "text-white"}`}>{s.num}</div>
              <div className="text-[0.65rem] text-white/55 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2 text-white/45 text-[0.68rem] tracking-[0.14em] uppercase animate-fade-in" aria-hidden="true">
        <div className="w-px h-[38px] bg-white/30 animate-scroll-line" />
        <span>Découvrir</span>
      </div>
    </section>
  );
};

export default Hero;
