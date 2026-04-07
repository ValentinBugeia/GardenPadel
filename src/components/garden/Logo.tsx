import logoSrc from "@/assets/logo-garden.webp";

const Logo = () => (
  <img
    src={logoSrc}
    alt=""
    aria-hidden="true"
    className="w-[46px] h-[46px] flex-shrink-0"
    style={{ mixBlendMode: "multiply" }}
    width={46}
    height={46}
  />
);

export default Logo;
