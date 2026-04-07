const items = [
  { icon: "🛁", text: "Vestiaires & douches haut de gamme" },
  { icon: "🌿", text: "Le Garden Resto — cuisine saine & fraîche" },
  { icon: "📺", text: "Lounge TV & bar à smoothies" },
  { icon: "🎽", text: "Boutique & location de matériel" },
];

const ClubHouse = () => (
  <section className="py-24 bg-gradient-to-br from-garden-blue to-garden-blue-dark relative overflow-hidden" id="clubhouse">
    <div className="absolute w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-[80px] -top-[150px] -right-20 pointer-events-none" aria-hidden="true" />
    <div className="absolute w-[300px] h-[300px] bg-garden-pink/[0.14] rounded-full blur-[80px] -bottom-20 -left-[60px] pointer-events-none" aria-hidden="true" />

    <div className="container grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 bg-white/[0.18] text-white text-[0.72rem] font-bold tracking-[0.1em] uppercase px-4 py-1.5 rounded-pill mb-3.5">🌿 Club House</span>
        <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight mb-3.5 text-white">Votre espace détente<br />après le match</h2>
        <p className="text-base text-white/75 leading-relaxed">Un club house pensé pour prolonger le plaisir — lounge, vestiaires premium et Le Garden Resto pour refaire le monde après chaque set.</p>
        <div className="flex flex-col gap-3 mt-7">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-4 bg-white/[0.12] rounded-[14px] px-4 py-3.5 border border-white/10 transition-all duration-300 hover:bg-white/20 hover:translate-x-1">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="text-[0.92rem] text-white font-medium">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-pill font-bold bg-white text-garden-blue-dark shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5">Visiter le club</a>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <div className="rounded-[22px] overflow-hidden shadow-[0_28px_60px_rgba(0,0,0,0.28)] bg-white/[0.12] min-h-[360px] flex items-center justify-center text-[5rem]" aria-hidden="true">
          🌿
        </div>
        <div className="absolute -bottom-[18px] -left-[18px] bg-garden-pink text-white rounded-2xl px-5 py-3.5 shadow-pink">
          <strong className="block text-xl font-black">★ 4.9</strong>
          <span className="text-[0.72rem] opacity-85">Note Google</span>
        </div>
      </div>
    </div>
  </section>
);

export default ClubHouse;
