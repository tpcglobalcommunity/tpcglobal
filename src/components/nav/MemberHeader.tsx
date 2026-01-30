import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";

export const MemberHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <Link to="/member" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TPC</span>
            </div>
            <span className="font-semibold text-lg">Member Area</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/member/profile" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <User className="h-4 w-4" />
              <span className="text-sm">Profile</span>
            </Link>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
