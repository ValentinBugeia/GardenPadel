const Logo = ({ id = "petals" }: { id?: string }) => (
  <svg className="w-[46px] h-[46px] flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath id={id}>
        <circle cx="33" cy="32" r="28"/>
        <circle cx="67" cy="32" r="28"/>
        <ellipse cx="22" cy="62" rx="28" ry="19"/>
        <ellipse cx="78" cy="62" rx="28" ry="19"/>
      </clipPath>
      <mask id={`hole-${id}`}>
        <rect width="100" height="100" fill="white"/>
        <circle cx="50" cy="47" r="16" fill="black"/>
      </mask>
    </defs>
    <g clipPath={`url(#${id})`} mask={`url(#hole-${id})`}>
      <rect width="100" height="100" fill="#89c9eb"/>
    </g>
  </svg>
);

export default Logo;
