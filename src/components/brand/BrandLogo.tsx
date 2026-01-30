import { useI18n } from "@/i18n/i18n";
import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7",
  md: "h-9 w-9", 
  lg: "h-11 w-11"
};

export const BrandLogo = ({ size = "md", withText = false, className = "" }: BrandLogoProps) => {
  const { withLang } = useI18n();
  
  return (
    <Link to={withLang("/")} className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/favicons/android-chrome-192x192.png" 
        alt="TPC Global" 
        className={`${sizeClasses[size]} rounded-lg object-contain`}
      />
      {withText && (
        <span className="font-bold text-lg text-gradient-gold hidden sm:inline">TPC Global</span>
      )}
    </Link>
  );
};
