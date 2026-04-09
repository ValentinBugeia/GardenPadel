import { ArrowDown, CalendarDays } from "lucide-react";
import heroBg from "@/assets/hero-padel.jpg";

interface Props { onBooking: () => void; }

const Hero = ({ onBooking }: Props) => {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" id="accueil">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#0a1a2e]">
        <div
          className="absolute inset-0 opacity-40 animate-hero-zoom bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBg}')` }}
          aria-hidden="true"
        />
      </div>
      {/* Gradient overlay — stronger on left for readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0a1a2e]/95 via-[#0a1a2e]/60 to-transparent" aria-hidden="true" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 z-[1] bg-gradient-to-t from-[#0a1a2e]/60 to-transparent" aria-hidden="true" />

      <div className="container relative z-[2] w-full pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-end">

          {/* Left — editorial content */}
          <div className="max-w-[680px]">
            <div className="inline-flex items-center gap-2 text-white/60 text-[0.7rem] font-semibold tracking-[0.18em] uppercase mb-8">
              <span className="w-6 h-px bg-garden-blue" aria-hidden="true" />
              Six-Fours-Les-Plages · Ouvert 7j/7
            </div>

            <h1 className="text-[clamp(3.8rem,8vw,7rem)] font-black text-white leading-[0.95] tracking-tighter mb-6">
              Garden<br />
              <em className="text-garden-blue not-italic">Padel</em><br />
              <span className="text-white/30 text-[0.55em] font-light tracking-normal">Club</span>
            </h1>

            <p className="text-lg text-white/60 mb-10 font-light leading-relaxed max-w-[440px]">
              Où le sport rencontre la sérénité —
              3 terrains FFT, club house &amp; restaurant à deux pas de la Méditerranée.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onBooking}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-pill font-semibold text-sm bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5 hover:shadow-[0_14px_30px_hsla(200,74%,73%,0.45)]"
              >
                Réserver un Terrain
              </button>
              <button
                onClick={() => scrollTo("#tournois")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-pill font-semibold text-sm bg-white/10 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
              >
                <CalendarDays className="w-4 h-4" /> Nos Tournois
              </button>
            </div>
          </div>

          {/* Right — stats column */}
          <div className="hidden lg:flex flex-col gap-0 self-center" aria-hidden="true">
            {[
              { num: "3", label: "Terrains", sub: "homologués FFT" },
              { num: "7j", label: "Sur 7", sub: "dès 8h00" },
              { num: "4.9", label: "Google", sub: "avis clients" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`px-8 py-6 text-right border-white/10 ${i !== 2 ? "border-b" : ""}`}
              >
                <div className="text-[2.6rem] font-black text-white leading-none tracking-tighter">{s.num}</div>
                <div className="text-[0.78rem] font-bold text-white uppercase tracking-wider mt-0.5">{s.label}</div>
                <div className="text-[0.68rem] text-white/35 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo("#services")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2 text-white/35 text-[0.65rem] tracking-[0.18em] uppercase transition-colors hover:text-white/60"
        aria-label="Défiler vers le bas"
      >
        <div className="w-px h-10 bg-white/20 animate-scroll-line" />
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
    </section>
  );
};

export default Hero;
