import { useNavigate, useLocation } from "react-router-dom";
import { Layout, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: Layout, label: "Dashboard", path: "/admin" },
    { icon: FileText, label: "Invoices", path: "/admin/invoices" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
    { icon: LogOut, label: "Logout", path: "/logout" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.includes(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0F1624] border-t z-50" style={{ borderColor: 'rgba(240,185,11,0.15)' }}>
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => item.path === "/logout" ? handleLogout() : navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                active 
                  ? "text-[#F0B90B]" 
                  : "text-[#9CA3AF] hover:text-[#E5E7EB]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
