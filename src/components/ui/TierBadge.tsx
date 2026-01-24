import { tierLabel } from "@/lib/tier";

interface TierBadgeProps {
  tier?: string | null;
  className?: string;
}

export function TierBadge({ tier, className = "" }: TierBadgeProps) {
  const label = tierLabel(tier);
  
  const getTierStyles = () => {
    switch (label) {
      case "ELITE":
        return "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-purple-400/30 bg-purple-500/10 text-purple-300";
      case "PRO":
        return "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-[#F0B90B]/30 bg-[#F0B90B]/10 text-[#F0B90B]";
      default: // BASIC
        return "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-blue-400/30 bg-blue-500/10 text-blue-300";
    }
  };

  return (
    <span className={`${getTierStyles()} ${className}`}>
      {label}
    </span>
  );
}
