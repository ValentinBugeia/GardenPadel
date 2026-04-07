import Logo from "./Logo";

const Footer = () => (
  <footer className="bg-foreground text-white/55 pt-16 pb-8">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
        <div>
          <a href="#accueil" className="inline-flex items-center gap-3">
            <Logo />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-black text-garden-blue">GARDen</span>
              <span className="text-[0.5rem] font-extrabold tracking-[0.35em] uppercase text-white/35">Padel</span>
            </div>
          </a>
          <p className="text-sm leading-relaxed mt-3.5 text-white/[0.42]">Où le sport rencontre la sérénité. 3 terrains FFT, club house &amp; restaurant à Six-Fours-Les-Plages, Var.</p>
        </div>

        <div>
          <div className="text-[0.76rem] uppercase tracking-[0.12em] font-bold text-white mb-3.5">Le Club</div>
          <ul className="flex flex-col gap-2">
            {["Nos terrains|#courts", "Club House|#clubhouse", "Tournois|#tournois", "Tarifs|#tarifs", "Adhésion|#adhesion"].map((item) => {
              const [label, href] = item.split("|");
              return <li key={label}><a href={href} className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">{label}</a></li>;
            })}
          </ul>
        </div>

        <div>
          <div className="text-[0.76rem] uppercase tracking-[0.12em] font-bold text-white mb-3.5">Événements</div>
          <ul className="flex flex-col gap-2">
            <li><a href="#evenements" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">Garden Afterwork</a></li>
            <li><a href="#evenements" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">Séminaires</a></li>
            <li><a href="#tournois" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">Calendrier</a></li>
            <li><a href="mailto:contact@gardenpadel.fr?subject=Partenariat" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">Partenariat</a></li>
          </ul>
        </div>

        <div>
          <div className="text-[0.76rem] uppercase tracking-[0.12em] font-bold text-white mb-3.5">Contact</div>
          <ul className="flex flex-col gap-2">
            <li><a href="mailto:contact@gardenpadel.fr" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">contact@gardenpadel.fr</a></li>
            <li><a href="https://www.instagram.com/gardenpadel.fr" target="_blank" rel="noopener" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">Instagram</a></li>
            <li><a href="https://www.facebook.com/share/1EqrNzc1JD/" target="_blank" rel="noopener" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">Facebook</a></li>
            <li><a href="https://www.linkedin.com/company/garden-padel-six-fours-les-plages/" target="_blank" rel="noopener" className="text-sm text-white/[0.48] hover:text-garden-blue transition-colors">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.07] pt-5 flex flex-col md:flex-row justify-between items-center gap-2.5">
        <p className="text-[0.76rem] text-white/[0.28]">© 2026 Garden Padel Club · Six-Fours-Les-Plages · Tous droits réservés</p>
        <div className="flex gap-4">
          <a href="#" className="text-[0.76rem] text-white/[0.28] hover:text-garden-blue transition-colors">Mentions légales</a>
          <a href="#" className="text-[0.76rem] text-white/[0.28] hover:text-garden-blue transition-colors">Confidentialité</a>
          <a href="#" className="text-[0.76rem] text-white/[0.28] hover:text-garden-blue transition-colors">CGU</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
