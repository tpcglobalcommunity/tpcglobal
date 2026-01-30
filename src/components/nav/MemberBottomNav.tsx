import { useNavigate, useLocation } from "react-router-dom";
import { Layout, FileText, Users, User, LogOut } from "lucide-react";

export const MemberBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Layout, label: "Dashboard", path: "/member" },
    { icon: FileText, label: "Invoices", path: "/member/invoices" },
    { icon: Users, label: "Referral", path: "/member/referral" },
    { icon: User, label: "Profile", path: "/member/profile" },
    { icon: LogOut, label: "Logout", path: "/logout" },
  ];

  const isActive = (path: string) => {
    if (path === "/member") {
      return location.pathname === "/member";
    }
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/login");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
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
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-700"
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
