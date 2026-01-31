import { NavLink } from "react-router-dom";
import { Home, Info, ShoppingCart, Eye, LogIn, User } from "lucide-react";

export const PublicBottomNav = () => {
  const menuItems = [
    { icon: Home, label: "Home", path: "/id" },
    { icon: Info, label: "About", path: "/id/about" },
    { icon: ShoppingCart, label: "Buy TPC", path: "/id/buytpc" },
    { icon: Eye, label: "Transparency", path: "/id/transparency" },
    { icon: User, label: "Member", path: "/id/member" },
    { icon: LogIn, label: "Login", path: "/id/login" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/id"}
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
