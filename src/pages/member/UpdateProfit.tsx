import { useState, useEffect } from "react";
import { TrendingUp, Target, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { createClient } from '@supabase/supabase-js';
import { getLanguageFromPath } from "../../lib/authGuards";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface UpdateProfitProps {
  lang?: Language;
}

interface FormData {
  profitDate: string;
  account: string;
  profitAmount: number;
  currency: string;
  pnlType: string;
  note: string;
  agree: boolean;
}

interface FormErrors {
  profitDate?: string;
  profitAmount?: string;
  agree?: string;
  note?: string;
}

export default function UpdateProfit({ }: UpdateProfitProps) {
  const { t, language } = useI18n();
  const L = language;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    profitDate: new Date().toISOString().split('T')[0],
    account: '',
    profitAmount: 0,
    currency: 'USDT',
    pnlType: 'profit',
    note: '',
    agree: false
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Check auth state and redirect if needed
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // Not logged in - redirect to login
          const currentLang = getLanguageFromPath(window.location.pathname);
          const loginPath = `/${currentLang}/login`;
          window.location.assign(loginPath);
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          const currentLang = getLanguageFromPath(window.location.pathname);
          const loginPath = `/${currentLang}/login`;
          window.location.assign(loginPath);
          return;
        }

        if (!user.email_confirmed_at) {
          // Not verified - redirect to verify
          const currentLang = getLanguageFromPath(window.location.pathname);
          const verifyPath = `/${currentLang}/verify`;
          window.location.assign(verifyPath);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        const currentLang = getLanguageFromPath(window.location.pathname);
        const loginPath = `/${currentLang}/login`;
        window.location.assign(loginPath);
      }
    };

    checkAuthAndRedirect();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.profitDate) {
      errors.profitDate = t("updateProfit.errors.required");
    }

    if (formData.profitAmount === 0) {
      errors.profitAmount = t("updateProfit.errors.invalidAmount");
    }

    if (!isFinite(formData.profitAmount)) {
      errors.profitAmount = t("updateProfit.errors.invalidAmount");
    }

    if (Math.abs(formData.profitAmount) > 1000000) {
      errors.profitAmount = t("updateProfit.errors.tooLarge");
    }

    if (formData.note.length > 280) {
      errors.note = t("updateProfit.errors.noteTooLong");
    }

    if (!formData.agree) {
      errors.agree = t("updateProfit.errors.mustAgree");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Reset form partially
      setFormData(prev => ({
        ...prev,
        profitAmount: 0,
        note: ''
      }));
      
    } catch (err) {
      setError("Failed to save result. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    const adjustedValue = formData.pnlType === 'loss' ? -Math.abs(numValue) : numValue;
    setFormData(prev => ({ ...prev, profitAmount: adjustedValue }));
  };

  const handlePnlTypeChange = (type: string) => {
    const currentAmount = Math.abs(formData.profitAmount);
    const adjustedValue = type === 'loss' ? -currentAmount : currentAmount;
    setFormData(prev => ({ ...prev, pnlType: type, profitAmount: adjustedValue }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#F0B90B] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#F0B90B]/20 to-[#F8D568]/20 border border-[#F0B90B]/30 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F0B90B] to-[#F8D568] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t("updateProfit.success.title")}
            </h2>
            <p className="text-white/80 mb-6">
              {t("updateProfit.success.body")}
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px]"
            >
              Add Another Result
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F0B90B] to-[#F8D568] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("updateProfit.title")}
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            {t("updateProfit.subtitle")}
          </p>
          <p className="text-sm text-white/50 max-w-xl mx-auto mt-2">
            {t("updateProfit.disclaimer")}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t("updateProfit.fields.date")}
                </label>
                <input
                  type="date"
                  value={formData.profitDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, profitDate: e.target.value }))}
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                  required
                />
                {formErrors.profitDate && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.profitDate}</p>
                )}
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t("updateProfit.fields.account")}
                </label>
                <input
                  type="text"
                  value={formData.account}
                  onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                  placeholder="e.g., Binance, Bybit"
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Amount and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t("updateProfit.fields.amount")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={Math.abs(formData.profitAmount)}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                    required
                  />
                  {formErrors.profitAmount && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.profitAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t("updateProfit.fields.type")}
                  </label>
                  <select
                    value={formData.pnlType}
                    onChange={(e) => handlePnlTypeChange(e.target.value)}
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                  >
                    <option value="profit">Profit</option>
                    <option value="loss">Loss</option>
                  </select>
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t("updateProfit.fields.currency")}
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                >
                  <option value="USDT">USDT</option>
                  <option value="USD">USD</option>
                  <option value="IDR">IDR</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t("updateProfit.fields.note")}
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Optional notes about this trade..."
                  rows={3}
                  maxLength={280}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all resize-none"
                />
                <div className="text-right text-xs text-white/50 mt-1">
                  {formData.note.length}/280
                </div>
                {formErrors.note && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.note}</p>
                )}
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  checked={formData.agree}
                  onChange={(e) => setFormData(prev => ({ ...prev, agree: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border border-white/20 bg-white/10 text-[#F0B90B] focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50"
                  required
                />
                <label htmlFor="agree" className="text-sm text-white/70 leading-relaxed">
                  {t("updateProfit.fields.agree")}
                </label>
              </div>
              {formErrors.agree && (
                <p className="text-red-400 text-sm mt-1">{formErrors.agree}</p>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("updateProfit.actions.saving")}
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    {t("updateProfit.actions.save")}
                  </>
                )}
              </button>
            </form>

            {/* TODO Note */}
            <div className="mt-6 p-4 bg-[#F0B90B]/10 border border-[#F0B90B]/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#F0B90B]" />
                <span className="text-sm font-medium text-[#F0B90B]">TODO: Database Integration</span>
              </div>
              <p className="text-xs text-white/60">
                Connect this form to your database to store profit results. Consider adding validation for user permissions, duplicate prevention, and audit trails.
              </p>
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
