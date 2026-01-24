import { hasTier } from "@/lib/tier";

interface FeatureGateProps {
  profile: any;
  requiredTier: "PRO" | "ELITE";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function FeatureGate({ 
  profile, 
  requiredTier, 
  children, 
  fallback,
  className = ""
}: FeatureGateProps) {
  const hasAccess = hasTier(profile?.tpc_tier, requiredTier);
  
  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }
  
  return fallback || (
    <div className={`opacity-50 cursor-not-allowed ${className}`}>
      {children}
    </div>
  );
}

interface GatedButtonProps {
  profile: any;
  requiredTier: "PRO" | "ELITE";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function GatedButton({ 
  profile, 
  requiredTier, 
  children, 
  onClick,
  className = "",
  disabled = false,
  type = "button"
}: GatedButtonProps) {
  const hasAccess = hasTier(profile?.tpc_tier, requiredTier);
  const isDisabled = disabled || !hasAccess;
  
  return (
    <button
      type={type}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
        hasAccess 
          ? "hover:bg-white/5" 
          : "opacity-50 cursor-not-allowed"
      } ${className}`}
      disabled={isDisabled}
      onClick={() => hasAccess && onClick?.()}
    >
      {children}
      {!hasAccess && (
        <span className="ml-2 text-xs text-white/50">🔒 {requiredTier}</span>
      )}
    </button>
  );
}
