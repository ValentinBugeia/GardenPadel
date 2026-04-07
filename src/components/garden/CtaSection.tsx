import { Flower2, Handshake } from "lucide-react";

const CtaSection = () => (
  <section className="py-24 bg-gradient-to-br from-garden-pink to-garden-pink-dark text-center relative overflow-hidden" id="adhesion">
    <div className="absolute w-[600px] h-[600px] bg-white/[0.07] rounded-full blur-[70px] -top-[250px] -right-[150px] pointer-events-none" aria-hidden="true" />
    <div className="absolute w-[350px] h-[350px] bg-white/[0.05] rounded-full blur-[70px] -bottom-[120px] -left-[100px] pointer-events-none" aria-hidden="true" />
    <div className="container relative">
      <span className="inline-flex items-center gap-1.5 bg-white/[0.18] text-white text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-pill mb-3.5"><Flower2 className="w-3 h-3" /> Membership</span>
      <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight mb-3.5 text-white">Rejoignez la famille<br />Garden Padel</h2>
      <p className="text-base text-white/80 leading-relaxed max-w-[540px] mx-auto mb-10">Accès prioritaire, tarifs préférentiels et invitations aux événements exclusifs.</p>
      <div className="flex justify-center flex-wrap gap-3.5">
        <a href="mailto:contact@gardenpadel.fr?subject=Adhésion" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold bg-white text-garden-blue-dark shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5"><Flower2 className="w-4 h-4" /> Devenir Membre</a>
        <a href="mailto:contact@gardenpadel.fr?subject=Partenariat" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold bg-white/15 text-white border-2 border-white/35 transition-all duration-300 hover:bg-white/[0.28] hover:-translate-y-0.5"><Handshake className="w-4 h-4" /> Devenir Partenaire</a>
      </div>
    </div>
  </section>
);

export default CtaSection;
