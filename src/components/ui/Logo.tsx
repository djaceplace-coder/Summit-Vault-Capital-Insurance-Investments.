import { cn } from "../../lib/utils";

interface LogoProps {
  className?: string;
  dark?: boolean;
  showWordmark?: boolean;
}

export function Logo({ className, dark = false, showWordmark = true }: LogoProps) {
  const primaryStroke = dark ? "#ffffff" : "#0f172a";
  const goldAccent = "#d97706"; // Warm amber/gold accent

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none flex-shrink-0", className)}>
      {/* Summit Vault Geometric Emblem */}
      <svg 
        viewBox="0 0 36 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 flex-shrink-0"
      >
        {/* Outer Vault Diamond */}
        <rect 
          x="18" 
          y="2.5" 
          width="21" 
          height="21" 
          rx="4" 
          transform="rotate(45 18 2.5)" 
          stroke={goldAccent} 
          strokeWidth="2.2" 
        />
        {/* Mountain Summit Peak */}
        <path 
          d="M10 21L18 10L26 21" 
          stroke={primaryStroke} 
          strokeWidth="2.4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Inner Security Keystone */}
        <path 
          d="M14 24L18 19L22 24" 
          stroke={goldAccent} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <circle cx="18" cy="7.5" r="1.5" fill={goldAccent} />
      </svg>

      {/* Wordmark: SUMMIT VAULT on top line, CAPITAL in bigger font below */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none text-left py-0.5">
          <span className={cn(
            "text-[10px] sm:text-[10.5px] font-semibold tracking-[0.24em] uppercase whitespace-nowrap",
            dark ? "text-slate-300" : "text-slate-600"
          )}>
            SUMMIT VAULT
          </span>
          <span className={cn(
            "text-[13px] sm:text-[14.5px] font-black tracking-[0.28em] uppercase whitespace-nowrap mt-0.5",
            dark ? "text-white" : "text-slate-950"
          )}>
            CAPITAL
          </span>
        </div>
      )}
    </div>
  );
}
