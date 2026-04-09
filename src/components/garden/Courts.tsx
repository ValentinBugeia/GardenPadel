import { Target, Medal, Flower2, TreePine, Lightbulb, Trophy, Users, Camera, Mic, Sun, GraduationCap } from "lucide-react";
import { type ReactNode } from "react";

const tagIconMap: Record<string, ReactNode> = {
  "Vue jardin": <TreePine className="w-3 h-3" />,
  "LED": <Lightbulb className="w-3 h-3" />,
  "FFT": <Trophy className="w-3 h-3" />,
  "Tribunes": <Users className="w-3 h-3" />,
  "HD": <Camera className="w-3 h-3" />,
  "Sono": <Mic className="w-3 h-3" />,
  "Familial": <Users className="w-3 h-3" />,
  "Terrasse": <Sun className="w-3 h-3" />,
  "Initiation": <GraduationCap className="w-3 h-3" />,
};

const courts = [
  {
    icon: <Target className="w-10 h-10" />,
    name: "Le Jardin Bleu",
    desc: "Vue panoramique sur les jardins. Idéal pour les matchs du matin dans la lumière naturelle.",
    tags: ["Vue jardin", "LED", "FFT"],
    label: "Terrain 1",
    bg: "from-[#89c9eb]/30 to-[#6ab5db]/50",
    iconColor: "text-garden-blue-dark",
    large: true,
  },
  {
    icon: <Medal className="w-8 h-8" />,
    name: "La Rose des Vents",
    desc: "Notre terrain central, scène de tous les tournois. Tribunes pour une ambiance compétition unique.",
    tags: ["Tribunes", "HD", "Sono"],
    label: "Terrain 2",
    bg: "from-[#e98eaa]/30 to-[#d87594]/50",
    iconColor: "text-garden-pink-dark",
    large: false,
  },
  {
    icon: <Flower2 className="w-8 h-8" />,
    name: "La Terrasse Rose",
    desc: "Le terrain familial et convivial. Parfait pour les cours débutants et les parties entre amis.",
    tags: ["Familial", "Terrasse", "Initiation"],
    label: "Terrain 3",
    bg: "from-[#89c9eb]/20 to-[#e98eaa]/30",
    iconColor: "text-garden-pink-dark",
    large: false,
  },
];

interface Props { onBooking: () => void; }

const Courts = ({ onBooking }: Props) => {

  return (
    <section className="py-28 bg-muted/30" id="courts">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-garden-blue-dark mb-3 block">Nos Terrains</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-foreground">
              3 Terrains de Padel<br className="hidden md:block" /> de Haut Standing
            </h2>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[360px] md:text-right">
            Terrains homologués FFT, revêtement premium, éclairage LED.
          </p>
        </div>

        {/* Grid 3 colonnes égales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {courts.map((c) => (
            <div key={c.name} className={`rounded-2xl overflow-hidden border border-border bg-gradient-to-br ${c.bg} group flex flex-col`}>
              <div className="p-7 flex-1 flex flex-col justify-between min-h-[280px]">
                <div className="flex items-start justify-between mb-6">
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-muted-foreground border border-border rounded-pill px-3 py-1 bg-background/50">{c.label}</span>
                  <span className={c.iconColor}>{c.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-foreground mb-2">{c.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5 bg-background/70 backdrop-blur-sm border border-border rounded-pill px-2.5 py-1 text-[0.72rem] font-medium text-foreground">
                        {tagIconMap[t]} {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <button
            onClick={onBooking}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-pill font-semibold text-sm bg-garden-blue text-white shadow-blue transition-all duration-300 hover:bg-garden-blue-dark hover:-translate-y-0.5"
          >
            Réserver un terrain
          </button>
        </div>
      </div>
    </section>
  );
};

export default Courts;
