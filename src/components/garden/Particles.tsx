import { useEffect, useRef } from "react";
import flowerBlue from "@/assets/flower-blue.png";
import flowerPink from "@/assets/flower-pink.png";

const flowers = [flowerBlue, flowerPink];

const Particles = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const p = document.createElement("img");
      p.src = flowers[i % 2];
      p.alt = "";
      p.setAttribute("aria-hidden", "true");
      const size = Math.random() * 38 + 20;
      const rotation = Math.random() * 360;
      p.style.cssText = `width:${size}px;height:auto;left:${Math.random() * 100}vw;position:absolute;opacity:0;animation:floatUp ${Math.random() * 18 + 16}s linear -${Math.random() * 18}s infinite;transform:rotate(${rotation}deg);`;
      container.appendChild(p);
    }

    return () => { container.innerHTML = ""; };
  }, []);

  return <div ref={ref} className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-55" aria-hidden="true" />;
};

export default Particles;
