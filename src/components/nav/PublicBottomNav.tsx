import { useNavigate, useLocation } from "react-router-dom";
import { Home, Info, ShoppingCart, Eye, LogIn } from "lucide-react";

export const PublicBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Info, label: "About", path: "/about" },
    { icon: ShoppingCart, label: "Buy TPC", path: "/buytpc" },
    { icon: Eye, label: "Transparency", path: "/transparency" },
    { icon: LogIn, label: "Login", path: "/login" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/id" || location.pathname === "/en";
    }
    return location.pathname.includes(path);
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
              onClick={() => navigate(item.path)}
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
