import { useEffect, useRef } from "react";

const flowerSVG = (color: string) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none">
  <defs>
    <clipPath id="petals-particle">
      <circle cx="33" cy="32" r="28"/>
      <circle cx="67" cy="32" r="28"/>
      <ellipse cx="22" cy="62" rx="28" ry="19"/>
      <ellipse cx="78" cy="62" rx="28" ry="19"/>
    </clipPath>
    <mask id="hole-particle">
      <rect width="100" height="100" fill="white"/>
      <circle cx="50" cy="47" r="16" fill="black"/>
    </mask>
  </defs>
  <g clip-path="url(#petals-particle)" mask="url(#hole-particle)">
    <rect width="100" height="100" fill="${color}"/>
  </g>
</svg>`;

const COLORS = ["#89c9eb", "#e8487f", "#89c9eb", "#e8487f", "#6bb8e0", "#d63d6e"];

const Particles = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      const color = COLORS[i % COLORS.length];
      // Use unique IDs per particle to avoid SVG ID clashes
      const uid = `p${i}`;
      const svg = flowerSVG(color)
        .replace(/petals-particle/g, `petals-${uid}`)
        .replace(/hole-particle/g, `hole-${uid}`);
      p.innerHTML = svg;
      const size = Math.random() * 36 + 18;
      const rotation = Math.random() * 360;
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}vw;position:absolute;opacity:0;animation:floatUp ${Math.random() * 18 + 16}s linear -${Math.random() * 18}s infinite;transform:rotate(${rotation}deg);`;
      container.appendChild(p);
    }
    return () => { container.innerHTML = ""; };
  }, []);

  return <div ref={ref} className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-55" aria-hidden="true" />;
};

export default Particles;
