'use client';

export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      role="img"
      aria-label="Castkite"
      className="mt-[8px] min-w-[60px] min-h-[60px]"
    >
      <rect x="10" y="10" width="44" height="44" fill="#000000" />
      <rect x="6" y="6" width="44" height="44" fill="#FFD400" stroke="#000000" strokeWidth="2.5" />
      <path d="M28 13L39 26L28 41L17 26Z" fill="#000000" />
      <path d="M28 41C27 45 31 46 30 50" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};
