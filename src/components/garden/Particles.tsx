import { useEffect, useRef } from "react";

const flowerSVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="33" cy="32" r="28"/>
  <circle cx="67" cy="32" r="28"/>
  <ellipse cx="22" cy="62" rx="28" ry="19"/>
  <ellipse cx="78" cy="62" rx="28" ry="19"/>
  <circle cx="50" cy="47" r="15" fill="white" opacity="0.6"/>
</svg>`;

const Particles = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      p.className = `absolute opacity-0 animate-float-up ${i % 2 === 0 ? "text-garden-blue" : "text-garden-pink"}`;
      p.innerHTML = flowerSVG;
      p.querySelector("svg")!.style.fill = "currentColor";
      const size = Math.random() * 36 + 18;
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}vw;animation-duration:${Math.random() * 18 + 16}s;animation-delay:-${Math.random() * 18}s;color:inherit;position:absolute;opacity:0;animation-name:floatUp;animation-timing-function:linear;animation-iteration-count:infinite;`;
      p.querySelector("svg")!.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(p);
    }
    return () => { container.innerHTML = ""; };
  }, []);

  return <div ref={ref} className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-55" aria-hidden="true" />;
};

export default Particles;
