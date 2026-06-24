"use client";

export function PlanButton({ href, highlight, children }: {
  href: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fbq?.("track", "InitiateCheckout");
      }}
      className={`block w-full rounded-xl py-3 text-sm font-semibold text-center transition-all duration-200 hover:scale-[1.02] ${
        highlight
          ? "bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a]"
          : "bg-white/8 text-white hover:bg-white/12 border border-white/10"
      }`}
    >
      {children}
    </a>
  );
}
