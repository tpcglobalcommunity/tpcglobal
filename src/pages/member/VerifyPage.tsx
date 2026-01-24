import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Language, useI18n } from "@/i18n";
import MemberLayout from "./MemberLayout";
import { PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { Wallet, Save, BadgeCheck, RefreshCcw, AlertTriangle } from "lucide-react";

type Profile = {
  id: string;
  wallet_address?: string | null;
  verification_status?: string | null;
  status?: string | null;
  verified?: boolean | null;
};

type Req = {
  id: number;
  created_at: string;
  status: string;
  wallet_address: string;
  notes?: string | null;
};

function mapWalletErr(code: string) {
  switch (code) {
    case "EMPTY_WALLET": return "Wallet is required.";
    case "WALLET_LENGTH": return "Wallet length invalid.";
    case "WALLET_FORMAT": return "Wallet format invalid.";
    default: return "Failed to save wallet.";
  }
}
function mapReqErr(code: string) {
  if (code.startsWith("ALREADY_")) return "You already have an active verification state.";
  switch (code) {
    case "EMPTY_WALLET": return "Wallet is required.";
    default: return "Failed to request verification.";
  }
}

function chip(v?: string | null) {
  const s = (v || "NONE").toUpperCase();
  const base = "text-xs px-2 py-0.5 rounded-full border";
  if (s === "VERIFIED") return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-200`;
  if (s === "REQUESTED") return `${base} bg-amber-500/10 border-amber-500/20 text-amber-200`;
  if (s === "REJECTED") return `${base} bg-red-500/10 border-red-500/20 text-red-200`;
  return `${base} bg-white/5 border-white/10 text-white/70`;
}

export default function VerifyPage({ lang }: { lang: Language }) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState("");
  const [latestReq, setLatestReq] = useState<Req | null>(null);

  const dirty = useMemo(() => (wallet || "") !== (profile?.wallet_address || ""), [wallet, profile]);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const { data: ses } = await supabase.auth.getSession();
      const uid = ses.session?.user?.id;
      if (!uid) {
        window.location.href = "/signin";
        return;
      }

      const { data: p, error: pe } = await supabase
        .from("profiles")
        .select("id, wallet_address, verification_status, verified")
        .eq("id", uid)
        .maybeSingle(); // Use maybeSingle to prevent errors
      if (pe) {
        console.warn('Profile fetch error:', pe);
        setErr("Failed to load profile");
        return;
      }
      if (!p) {
        console.warn('No profile found for user:', uid);
        setErr("Profile not found");
        return;
      }

      const { data: r } = await supabase
        .from("verification_requests")
        .select("id, created_at, status, wallet_address, notes")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1);

      setProfile(p as Profile);
      setWallet((p as any)?.wallet_address || "");
      setLatestReq(r && r[0] ? (r[0] as Req) : null);
    } catch (e: any) {
      setErr(e?.message || "Failed to load verify page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function saveWallet() {
    setErr(null);
    setOk(null);
    try {
      const { data, error } = await supabase.rpc("member_set_wallet_self", { p_wallet: wallet });
      if (error) throw error;

      if (!data?.ok) {
        setErr(mapWalletErr(data?.error || "UNKNOWN"));
        return;
      }
      setOk(t("member.verify.walletSaved") || "Wallet saved.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to save wallet");
    }
  }

  async function request() {
    setErr(null);
    setOk(null);
    try {
      const { data, error } = await supabase.rpc("request_verification", { p_wallet: wallet });
      if (error) throw error;

      if (!data?.ok) {
        setErr(mapReqErr(data?.error || "UNKNOWN"));
        return;
      }
      setOk(t("member.verify.requested") || "Verification requested.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to request verification");
    }
  }

  return (
    <MemberLayout lang={lang}>
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#F0B90B]" />
              {t("member.verify.title") || "Verify Wallet"}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {t("member.verify.subtitle") || "Connect or submit your Solana wallet for verification."}
            </p>
          </div>

          <PremiumButton variant="secondary" onClick={load} disabled={loading}>
            <span className="inline-flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              {t("member.common.refresh") || "Refresh"}
            </span>
          </PremiumButton>
        </div>

        {err ? (
          <NoticeBox variant="warning">
            <div className="text-sm text-white/85 inline-flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F0B90B] mt-0.5" />
              <span>{err}</span>
            </div>
          </NoticeBox>
        ) : null}

        {ok ? (
          <NoticeBox variant="success">
            <div className="text-sm text-white/85">{ok}</div>
          </NoticeBox>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-4">
          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("member.verify.statusTitle") || "Verification Status"}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className={chip(profile?.verification_status)}>
                {(profile?.verification_status || "NONE").toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                account: {profile?.verified ? "VERIFIED" : "UNVERIFIED"}
              </span>
            </div>

            <div className="mt-4 text-xs text-white/45">
              {t("member.verify.statusDesc") ||
                "Verification helps confirm membership and unlock future on-chain utilities."}
            </div>

            {latestReq ? (
              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-xs text-white/55">
                  {t("member.verify.latestReq") || "Latest request"}
                </div>
                <div className="mt-1 text-white/85 text-sm">
                  #{latestReq.id} • {latestReq.status} • {new Date(latestReq.created_at).toLocaleString()}
                </div>
                <div className="text-xs text-white/55 mt-1 truncate">
                  wallet: {latestReq.wallet_address}
                </div>
                {latestReq.notes ? (
                  <div className="text-xs text-white/55 mt-2">
                    notes: {latestReq.notes}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 text-sm text-white/60">
                {t("member.verify.noReq") || "No verification requests yet."}
              </div>
            )}
          </PremiumCard>

          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[#F0B90B]" />
              {t("member.verify.walletTitle") || "Wallet Address"}
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2">
                <span className="text-xs text-white/55">
                  {t("member.verify.walletLabel") || "Solana address"}
                </span>
                <input
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                  placeholder="Enter your Solana wallet..."
                />
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <PremiumButton onClick={saveWallet} disabled={!dirty || loading}>
                  <span className="inline-flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {t("member.verify.saveWallet") || "Save wallet"}
                  </span>
                </PremiumButton>

                <PremiumButton variant="secondary" onClick={request} disabled={loading || !wallet.trim()}>
                  <span className="inline-flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" />
                    {t("member.verify.request") || "Request verification"}
                  </span>
                </PremiumButton>
              </div>

              <div className="text-xs text-white/45">
                {t("member.verify.walletHint") ||
                  "Never share private keys. Only submit your public wallet address."}
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </MemberLayout>
  );
}
