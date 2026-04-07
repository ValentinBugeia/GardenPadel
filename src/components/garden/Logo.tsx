import logoSrc from "@/assets/logo-garden.webp";

const Logo = () => (
  <img
    src={logoSrc}
    alt=""
    aria-hidden="true"
    className="h-[58px] w-auto flex-shrink-0"
    style={{ mixBlendMode: "multiply" }}
  />
);

export default Logo;
