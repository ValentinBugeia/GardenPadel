import { useEffect, useRef } from "react";
import logoFlower from "@/assets/logo-garden-transparent.png";

const Particles = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const p = document.createElement("img");
      p.src = logoFlower;
      p.alt = "";
      p.setAttribute("aria-hidden", "true");
      const size = Math.random() * 42 + 22;
      const rotation = Math.random() * 360;
      p.style.cssText = `width:${size}px;height:auto;left:${Math.random() * 100}vw;position:absolute;opacity:0;animation:floatUp ${Math.random() * 18 + 16}s linear -${Math.random() * 18}s infinite;transform:rotate(${rotation}deg);`;
      container.appendChild(p);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div ref={ref} className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-55" aria-hidden="true" />;
};

export default Particles;
