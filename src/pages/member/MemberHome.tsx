import React, { useState } from "react";
import { Link } from "@/components/Router";
import { useProfileStatus } from "@/lib/useProfileStatus";
import { useWalletStatus } from "@/lib/useWalletStatus";
import { ConnectWalletCard } from "@/components/wallet/ConnectWalletCard";
import {
  Home,
  User,
  Shield,
  FileText,
  Users,
  Store,
  Lock,
  LogOut,
  Wallet,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  lang: any;
};

export default function MemberHome({ lang }: Props) {
  const { role, verified, loading, profile } = useProfileStatus() as any;
  const { walletConnected, walletAddress, tpcBalance, meetsRequirement, loading: walletLoading } = useWalletStatus();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWalletConnected = () => {
    setRefreshKey((prev: number) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.replace(`/signin`);
    }
  };

  const isComplete = Boolean(verified) && role !== "viewer";

  const memberNavItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: `/member`,
      requiresProfile: false,
    },
    {
      icon: User,
      label: "Profile",
      path: `/member/profile`,
      requiresProfile: true,
    },
    {
      icon: Shield,
      label: "Security",
      path: `/member/security`,
      requiresProfile: true,
    },
    {
      icon: FileText,
      label: "Announcements",
      path: `/member/announcements`,
      requiresProfile: true,
    },
    {
      icon: Users,
      label: "Referrals",
      path: `/member/referrals`,
      requiresProfile: true,
    },
    {
      icon: Users,
      label: "Directory",
      path: `/member/directory`,
      requiresProfile: true,
    },
    {
      icon: Store,
      label: "Vendor Application",
      path: `/member/vendor/apply`,
      requiresProfile: true,
    },
    {
      icon: Wallet,
      label: "Services",
      path: `/member/services`,
      requiresProfile: true,
      requiresWallet: true,
    },
  ];

  const filteredNavItems = memberNavItems.filter((item) => {
    if (!isComplete && item.requiresProfile) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/80">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading member dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Member Dashboard</h1>
          <p className="text-white/70">
            {isComplete
              ? "Welcome to the Member Area. Your profile is complete and you have full access."
              : "Complete your profile to unlock all member features."}
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isLocked = item.requiresProfile && !isComplete;

            const isWalletLocked =
              Boolean(item.requiresWallet) && (!walletConnected || !meetsRequirement);

            const cardClass = `
              relative group bg-white/5 border border-white/10 rounded-xl p-6
              transition-all duration-200
              ${isLocked || isWalletLocked
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-white/10 hover:border-[#F0B90B]/30 hover:scale-[1.02]"}
            `;

            const content = (
              <>
                {/* Lock Overlay */}
                {(isLocked || isWalletLocked) && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-6 h-6 text-[#F0B90B] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">
                        {isLocked
                          ? "Complete Profile"
                          : walletConnected
                          ? "Need 1000+ TPC"
                          : "Connect Wallet + 1000 TPC"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <Icon
                    className={`w-8 h-8 mb-3 ${
                      isLocked || isWalletLocked ? "text-white/40" : "text-[#F0B90B]"
                    }`}
                  />
                  <h3
                    className={`font-semibold text-white mb-1 ${
                      isLocked || isWalletLocked ? "text-white/60" : ""
                    }`}
                  >
                    {item.label}
                  </h3>

                  {item.requiresWallet && (
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-2">
                      <Wallet className="w-3 h-3" />
                      <span>
                        {walletConnected
                          ? `${tpcBalance.toLocaleString()} TPC`
                          : "Not Connected"}
                      </span>
                    </div>
                  )}
                </div>
              </>
            );

            // ✅ Kalau locked, jangan Link (biar bener2 gak bisa diklik)
            if (isLocked || isWalletLocked) {
              return (
                <div key={item.path} className={cardClass} aria-disabled="true">
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cardClass}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* Profile Completion Notice */}
        {!isComplete && (
          <div className="bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F0B90B]/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#F0B90B]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Complete Your Profile</h3>
                <p className="text-white/70 text-sm">
                  Fill in your profile information to access all member features and services.
                </p>
              </div>
            </div>
            <Link
              to="/member/complete-profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F0B90B] text-black font-semibold rounded-lg hover:bg-[#F0B90B]/90 transition-colors"
            >
              <User className="w-4 h-4" />
              Complete Profile Now
            </Link>
          </div>
        )}

        {/* Wallet Connection Card */}
        {!walletConnected && isComplete && (
          <div className="mb-6">
            <ConnectWalletCard onWalletConnected={handleWalletConnected} />
          </div>
        )}

        {/* Quick Stats */}
        {isComplete && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-[#F0B90B]" />
                <h4 className="font-semibold text-white">Profile Status</h4>
              </div>
              <p className="text-green-400 text-sm font-medium">Complete</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-[#F0B90B]" />
                <h4 className="font-semibold text-white">Wallet</h4>
              </div>
              <p className="text-white/70 text-sm">
                {walletConnected ? `Connected • ${tpcBalance.toLocaleString()} TPC` : "Not Connected"}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-5 h-5 text-[#F0B90B]" />
                <h4 className="font-semibold text-white">TPC Balance</h4>
              </div>
              <p className={`text-sm font-medium ${meetsRequirement ? 'text-green-400' : 'text-yellow-400'}`}>
                {tpcBalance.toLocaleString()} TPC
                {!meetsRequirement && (
                  <span className="block text-xs text-white/50 mt-1">Need 1000+ TPC for full access</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
