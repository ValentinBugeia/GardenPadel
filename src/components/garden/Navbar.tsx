import { useState, useEffect } from "react";
import Logo from "./Logo";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#courts", label: "Terrains" },
  { href: "#clubhouse", label: "Club House" },
  { href: "#tournois", label: "Tournois" },
  { href: "#evenements", label: "Événements" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

interface Props { onLogin: () => void; onRegister: () => void; onAccount: () => void; }

const Navbar = ({ onLogin, onRegister, onAccount }: Props) => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("accueil");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 72);
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= (s as HTMLElement).offsetTop - 120) current = s.id;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const isHero = activeSection === "accueil";
  const sectionIndex = navLinks.findIndex(l => l.href.slice(1) === activeSection);
  const logoVariant = sectionIndex % 2 === 0 ? "pink" : "blue";

  return (
    <>
      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[1000] bg-foreground/97 backdrop-blur-[24px] flex flex-col items-center justify-center gap-7 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} role="dialog" aria-modal="true">
        <button className="absolute top-6 right-7 bg-transparent border-none text-white/65 text-3xl cursor-pointer hover:text-garden-pink transition-colors" onClick={() => setMobileOpen(false)} aria-label="Fermer">✕</button>
        {navLinks.map((l) => (
          <a key={l.href} href={l.href} className="text-2xl font-bold text-white/85 hover:text-garden-blue transition-colors" onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}>{l.label}</a>
        ))}
        {user ? (
          <>
            <span className="text-2xl font-bold text-white/50">Connecté</span>
            <button onClick={() => { onAccount(); setMobileOpen(false); }} className="px-6 py-3 rounded-pill bg-garden-pink text-white font-bold">Mon compte</button>
          </>
        ) : (
          <>
            <button onClick={() => { onLogin(); setMobileOpen(false); }} className="text-2xl font-bold text-white/85 hover:text-garden-blue transition-colors">Connexion</button>
            <button onClick={() => { onRegister(); setMobileOpen(false); }} className="px-6 py-3 rounded-pill bg-garden-pink text-white font-bold">Adhésion</button>
          </>
        )}
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[900] transition-all duration-400 ${scrolled ? "bg-white/94 backdrop-blur-[20px] shadow-[0_2px_24px_rgba(137,201,235,0.1)] py-3" : "py-[18px]"}`}>
        <div className="container">
          <div className="flex items-center justify-between gap-6">
            <a href="#accueil" className="flex items-center flex-shrink-0" aria-label="Garden Padel – accueil" onClick={(e) => { e.preventDefault(); scrollTo("#accueil"); }}>
              <Logo variant={logoVariant} />
            </a>

            <ul className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`relative px-3 py-2 text-sm font-medium rounded-pill transition-colors
                      ${isHero ? "text-white/85 hover:text-white" : "text-foreground hover:text-garden-pink"}
                      ${activeSection === l.href.slice(1) ? (isHero ? "text-white" : "text-garden-pink") : ""}
                      after:content-[''] after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-0.5 after:bg-garden-pink after:rounded after:origin-left after:transition-transform after:duration-300
                      ${activeSection === l.href.slice(1) ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}
                    `}
                    onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden lg:flex items-center gap-2.5">
              {user ? (
                <>
                  <span className={`px-4 py-2 text-sm font-bold ${isHero ? "text-white/50" : "text-muted-foreground"}`}>Connecté</span>
                  <button onClick={onAccount} className="px-4 py-2 rounded-pill text-sm font-bold bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5">Mon compte</button>
                </>
              ) : (
                <>
                  <button onClick={onLogin} className={`px-4 py-2 rounded-pill text-sm font-bold border-2 transition-all duration-300 hover:-translate-y-0.5 ${isHero ? "text-white border-white/45 hover:bg-white/18 hover:border-white" : "text-garden-blue border-garden-blue bg-transparent hover:bg-garden-blue hover:text-white"}`}>Connexion</button>
                  <button onClick={onRegister} className="px-4 py-2 rounded-pill text-sm font-bold bg-garden-pink text-white shadow-pink transition-all duration-300 hover:bg-garden-pink-dark hover:-translate-y-0.5">Adhésion</button>
                </>
              )}
            </div>

            <button className="flex lg:hidden flex-col gap-[5px] cursor-pointer bg-transparent border-none p-1" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <span className={`w-6 h-0.5 rounded-sm transition-all ${isHero ? "bg-white" : "bg-foreground"}`} />
              <span className={`w-6 h-0.5 rounded-sm transition-all ${isHero ? "bg-white" : "bg-foreground"}`} />
              <span className={`w-6 h-0.5 rounded-sm transition-all ${isHero ? "bg-white" : "bg-foreground"}`} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
