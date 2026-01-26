import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Loader2 } from "lucide-react";

type BadgeStatus = "active" | "initializing";

interface TrustBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "hero";
}

export default function TrustBadge({ className = "", size = "md", variant = "default" }: TrustBadgeProps) {
  const [status, setStatus] = useState<BadgeStatus>("initializing");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useI18n();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        
        // Check if we have distributed transactions
        const { data: metrics } = await supabase.rpc("get_public_metrics");
        const { data: batches } = await supabase.rpc("get_public_batches", { p_limit: 1 });
        
        const hasDistributedTx = metrics?.batches_total > 0;
        const hasBatches = batches && batches.length > 0;
        
        setStatus(hasDistributedTx || hasBatches ? "active" : "initializing");
      } catch (error) {
        console.error("Error checking trust status:", error);
        setStatus("initializing");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Refresh status every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    navigate(`/${language}/transparency`);
  };

  const isActive = status === "active";
  const isHero = variant === "hero";

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  };

  const baseClasses = `
    inline-flex items-center gap-2 rounded-full border
    transition-all duration-200 cursor-pointer
    ${sizeClasses[size]}
    ${isHero 
      ? "bg-[#F0B90B]/10 border-[#F0B90B]/30 hover:bg-[#F0B90B]/20" 
      : "bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20"
    }
    ${className}
  `;

  const textClasses = isHero
    ? "text-[#F0B90B] font-semibold"
    : "text-emerald-300 font-semibold";

  const iconClasses = isHero
    ? "text-[#F0B90B]"
    : "text-emerald-400";

  return (
    <div
      className={baseClasses}
      onClick={handleClick}
      title={t("trust.badgeTooltip")}
    >
      {loading ? (
        <Loader2 className={`w-3 h-3 animate-spin ${iconClasses}`} />
      ) : (
        <ShieldCheck className={`w-3 h-3 ${iconClasses}`} />
      )}
      <span className={textClasses}>
        {isActive 
          ? t("trust.badgeActive")
          : t("trust.badgeInitializing")
        }
      </span>
    </div>
  );
}
