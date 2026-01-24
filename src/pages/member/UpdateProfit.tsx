import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Target, Award, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { getAuthState, getLanguageFromPath } from "../../lib/authGuards";

interface UpdateProfitProps {
  lang?: Language;
}

export default function UpdateProfit({ lang }: UpdateProfitProps) {
  const { t, language } = useI18n();
  const L = language;

  const [profitData, setProfitData] = useState({
    totalProfit: 0,
    monthlyProfit: 0,
    winRate: 0,
    totalTrades: 0
  });

  // Check auth state and redirect if needed
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const authState = await getAuthState();
      const currentLang = getLanguageFromPath(window.location.pathname);
      
      if (!authState.isAuthed) {
        // Not logged in - redirect to login
        const loginPath = `/${currentLang}/login`;
        window.location.assign(loginPath);
        return;
      }
      
      if (!authState.isEmailVerified) {
        // Not verified - redirect to verify
        const verifyPath = `/${currentLang}/verify`;
        window.location.assign(verifyPath);
        return;
      }
    };

    checkAuthAndRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F0B90B] to-[#F8D568] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Update Your Profit
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Track your trading performance and share your success with the TPC community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-[#F0B90B]" />
              <span className="text-sm text-white/50">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${profitData.totalProfit.toLocaleString()}
            </div>
            <div className="text-sm text-white/50 mt-1">Total Profit</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-sm text-white/50">Monthly</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${profitData.monthlyProfit.toLocaleString()}
            </div>
            <div className="text-sm text-white/50 mt-1">Monthly Profit</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-white/50">Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {profitData.winRate}%
            </div>
            <div className="text-sm text-white/50 mt-1">Win Rate</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-purple-500" />
              <span className="text-sm text-white/50">Trades</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {profitData.totalTrades}
            </div>
            <div className="text-sm text-white/50 mt-1">Total Trades</div>
          </div>
        </div>

        {/* Update Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Update Your Trading Results
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Total Profit ($)
                </label>
                <input
                  type="number"
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                  placeholder="Enter your total profit"
                  value={profitData.totalProfit}
                  onChange={(e) => setProfitData(prev => ({ ...prev, totalProfit: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Monthly Profit ($)
                </label>
                <input
                  type="number"
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                  placeholder="Enter your monthly profit"
                  value={profitData.monthlyProfit}
                  onChange={(e) => setProfitData(prev => ({ ...prev, monthlyProfit: Number(e.target.value) }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Win Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                    placeholder="Win rate"
                    value={profitData.winRate}
                    onChange={(e) => setProfitData(prev => ({ ...prev, winRate: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Total Trades
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                    placeholder="Total trades"
                    value={profitData.totalTrades}
                    onChange={(e) => setProfitData(prev => ({ ...prev, totalTrades: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <button className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] flex items-center justify-center gap-2">
                Update Profit Data
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12">
          <Link 
            to={getLangPath(L, "/member/dashboard")} 
            className="text-white/60 hover:text-[#F0B90B] transition-colors inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
