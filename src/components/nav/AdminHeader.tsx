import { Link } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/i18n";
import { toast } from "sonner";

export const AdminHeader = () => {
  const { signOut } = useAuth();
  const { t, lang } = useI18n();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="bg-[#0F1624] border-b" style={{ borderColor: 'rgba(240,185,11,0.15)' }}>
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
              <Shield className="h-5 w-5" style={{ color: '#F0B90B' }} />
            </div>
            <span className="font-semibold text-lg" style={{ color: '#F0B90B' }}>Admin Panel</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm" style={{ color: '#9CA3AF' }}>Administrator</span>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-[#F0B90B] transition-colors"
              style={{ color: '#E5E7EB' }}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">{t("auth.logout") || "Logout"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
