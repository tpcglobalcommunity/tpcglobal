import { NavLink, useParams } from "react-router-dom";
import { Home, Info, ShoppingCart, Eye, LogIn } from "lucide-react";

export const PublicBottomNav = () => {
  const params = useParams();
  
  // Get current language from URL params, fallback to "id"
  const lang = params.lang === "en" ? "en" : "id";
  
  // Helper to build language-aware URLs
  const to = (path: string) => {
    if (path === "") return `/${lang}`;
    return `/${lang}${path}`;
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "" },
    { icon: Info, label: "About", path: "/about" },
    { icon: ShoppingCart, label: "Buy TPC", path: "/buytpc" },
    { icon: Eye, label: "Transparency", path: "/transparency" },
    { icon: LogIn, label: "Login", path: "/login" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={to(item.path)}
              end={item.path === ""}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive 
                    ? "text-primary" 
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
