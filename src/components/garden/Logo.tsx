import logoSrc from "@/assets/logo-garden-transparent.png";

const Logo = () => (
  <img
    src={logoSrc}
    alt=""
    aria-hidden="true"
    className="h-[58px] w-auto flex-shrink-0"
    width={58}
    height={58}
  />
);

export default Logo;
