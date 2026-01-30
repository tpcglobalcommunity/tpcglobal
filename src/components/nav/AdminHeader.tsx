import { Link } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";

export const AdminHeader = () => {
  return (
    <header className="bg-red-600 text-white border-b border-red-700 sticky top-0 z-40">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <span className="font-semibold text-lg">Admin Panel</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm opacity-90">Administrator</span>
            <button className="flex items-center space-x-2 text-white hover:text-red-200">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
