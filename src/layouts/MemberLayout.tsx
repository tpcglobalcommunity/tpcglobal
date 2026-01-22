// =========================================================
// MEMBER LAYOUT COMPONENT
// Layout utama untuk member area dengan navigation
// =========================================================

import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useProfileStatus } from "../lib/useProfileStatus";
import { 
  Home, 
  User, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Copy,
  Share2
} from "lucide-react";

export default function MemberLayout() {
  const location = useLocation();
  const { role, verified, loading } = useProfileStatus();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const displayName = role === 'viewer' ? 'Guest User' : 'Member';
  const memberCode = 'TPC000000'; // TODO: Implement proper member code fetching

  // Navigation items
  const navigation = [
    {
      name: "Dashboard",
      href: "/member/dashboard",
      icon: Home,
      current: location.pathname === "/member/dashboard",
    },
    {
      name: "Profile",
      href: "/member/profile",
      icon: User,
      current: location.pathname === "/member/profile",
    },
    {
      name: "Team",
      href: "/member/team",
      icon: Users,
      current: location.pathname === "/member/team",
    },
    {
      name: "Settings",
      href: "/member/settings",
      icon: Settings,
      current: location.pathname === "/member/settings",
    },
  ];

  // Copy member code to clipboard
  const copyMemberCode = async () => {
    try {
      await navigator.clipboard.writeText(memberCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        <div className="text-center">
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  // Always show layout if authenticated
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F0B90B] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">TPC</span>
            </div>
            <span className="font-semibold">Member Area</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F0B90B]/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#F0B90B]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {displayName}
              </div>
              <div className="text-sm text-white/60">
                {memberCode}
              </div>
            </div>
          </div>
          
          {/* Member code copy */}
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <span className="text-sm text-white/60 flex-1">
              {memberCode}
            </span>
            <button
              onClick={copyMemberCode}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Copy member code"
            >
              {copySuccess ? (
                <div className="text-green-400 text-xs">Copied!</div>
              ) : (
                <Copy className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${item.current 
                    ? 'bg-[#F0B90B]/20 text-[#F0B90B]' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="h-16 bg-black/50 backdrop-blur-xl border-b border-white/10 lg:px-8 px-4">
          <div className="flex items-center justify-between h-full">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">
                  {verified ? "Verified" : "Pending"}
                </span>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 bg-[#F0B90B]/20 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-[#F0B90B]" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b border-white/10">
                      <div className="font-medium">{displayName}</div>
                      <div className="text-sm text-white/60">member@tpcglobal.io</div>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/member/profile"
                        className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// =========================================================
// MEMBER LAYOUT VARIANTS
// =========================================================

/**
 * Minimal member layout (tanpa sidebar)
 */
export function MemberMinimalLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple header */}
      <header className="h-16 bg-black/50 backdrop-blur-xl border-b border-white/10 px-8">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F0B90B] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">TPC</span>
            </div>
            <span className="font-semibold">Member Area</span>
          </div>
          
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-[#F0B90B] text-black rounded-lg hover:bg-[#F0B90B]/90"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
