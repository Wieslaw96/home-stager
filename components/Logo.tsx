import Link from "next/link";

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stageria-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C9A96E" />
          <stop offset="100%" stopColor="#8B5E30" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9" fill="url(#stageria-g)" />
      {/* Stylised S — two reversed arcs */}
      <path
        d="M25,13 C25,9 15,9 15,14 C15,20 25,20 25,26 C25,31 15,31 15,27"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

type LogoProps = {
  dark?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { mark: 26, textClass: "text-base" },
  md: { mark: 32, textClass: "text-lg" },
  lg: { mark: 40, textClass: "text-2xl" },
};

export function Logo({ dark = false, size = "md" }: LogoProps) {
  const { mark, textClass } = SIZES[size];
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Mark size={mark} />
      <span
        className={`font-bold ${textClass} tracking-tight`}
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: dark ? "#1A1410" : "white",
        }}
      >
        stageria
      </span>
    </Link>
  );
}
