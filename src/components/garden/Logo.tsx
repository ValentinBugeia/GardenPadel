import { useState, useEffect } from "react";
import logoSrc from "@/assets/logo-garden-transparent.png";

interface Props {
  variant?: "blue" | "pink";
}

const Logo = ({ variant = "blue" }: Props) => {
  const [visible, setVisible] = useState(true);
  const [displayed, setDisplayed] = useState<"blue" | "pink">(variant ?? "pink");

  useEffect(() => {
    if (variant === displayed) return;
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayed(variant);
      setVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [variant, displayed]);

  return (
    <img
      src={logoSrc}
      alt=""
      aria-hidden="true"
      className="h-[58px] w-auto flex-shrink-0 transition-opacity duration-180"
      style={{
        opacity: visible ? 1 : 0,
        filter: displayed === "pink" ? "hue-rotate(140deg) saturate(1.35) brightness(1.05)" : undefined,
      }}
      width={58}
      height={58}
    />
  );
};

export default Logo;
