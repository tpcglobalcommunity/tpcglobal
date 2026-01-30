import { useNavigate, useLocation } from "react-router-dom";
import { Layout, FileText, Settings, LogOut } from "lucide-react";

export const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
