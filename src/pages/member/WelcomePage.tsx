import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Shield, CheckCircle2, AlertTriangle, ExternalLink, BookOpen, Home, User, LayoutDashboard } from "lucide-react";

type ProfileRow = {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  role?: string | null;
  status?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
};

type ConsumeResult =
  | { state: "idle" }
  | { state: "running"; code: string }
  | { state: "ok"; code: string }
  | { state: "error"; code: string; error: string; detail?: any };

function chipStatus(status?: string | null) {
  const s = (status || "").toUpperCase();
  const base = "text-xs px-2 py-0.5 rounded-full border";
  if (s === "ACTIVE") return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-200`;
  if (s === "PENDING") return `${base} bg-amber-500/10 border-amber-500/20 text-amber-200`;
  if (s === "BANNED") return `${base} bg-red-500/10 border-red-500/20 text-red-200`;
  return `${base} bg-white/5 border-white/10 text-white/70`;
}

function mapConsumeError(code: string) {
  switch (code) {
    case "ALREADY_CONSUMED": return "Referral already consumed for this account.";
    case "INVITE_LIMIT_REACHED": return "Referral code has reached invite limit.";
    case "CODE_DISABLED": return "Referral code is disabled.";
    case "INVALID_CODE": return "Referral code is invalid.";
    case "REFERRAL_DISABLED": return "Referral system is disabled by admin.";
    case "REGISTRATIONS_CLOSED": return "Registrations are closed by admin.";
    default: return "Failed to apply referral.";
  }
}

export default function WelcomePage({ lang }: { lang: Language }) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [consume, setConsume] = useState<ConsumeResult>({ state: "idle" });

  const title = useMemo(() => t("welcome.title") || "Welcome to TPC", [t]);
  const subtitle = useMemo(
    () => t("welcome.subtitle") || "Your account is ready. Let's complete setup safely.",
    [t]
  );

  const homePath = `${getLangPath(lang)}/public`;
  const docsPath = `${getLangPath(lang)}/public/docs`;
  const dashboardPath = `${getLangPath(lang)}/member/dashboard`;
  const telegramUrl = "https://t.me/tpcglobalcommunity";

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data: ses } = await supabase.auth.getSession();
        const uid = ses.session?.user?.id;
        if (!uid) {
          window.location.href = `${getLangPath(lang)}/signin`;
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, username, full_name, role, verified, created_at")
          .eq("id", uid)
          .single();

        if (error) throw error;
        if (!alive) return;

        setProfile(data as ProfileRow);

        // Attempt consume referral if pending
        const pending = localStorage.getItem("tpc_referral_pending");
        if (pending) {
          const code = pending.trim().toUpperCase();
          setConsume({ state: "running", code });

          const { data: res, error: rpcErr } = await supabase.rpc("consume_referral_code", {
            p_code: code,
          });

          if (rpcErr) {
            setConsume({ state: "error", code, error: rpcErr.message });
            // Don't clear pending on RPC errors
          } else {
            const ok = !!res?.ok;
            if (ok) {
              setConsume({ state: "ok", code });
              localStorage.removeItem("tpc_referral_pending");
            } else {
              const ecode = res?.error || "UNKNOWN";
              setConsume({ state: "error", code, error: ecode, detail: res });
              // Clear pending for terminal errors except already consumed
              if (!["ALREADY_CONSUMED", "INVITE_LIMIT_REACHED", "INVALID_CODE"].includes(ecode)) {
                localStorage.removeItem("tpc_referral_pending");
              }
            }
          }
        }
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load welcome page");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PremiumShell>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-28">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/25 mb-4">
          <Shield className="w-4 h-4 text-[#F0B90B]" />
          <span className="text-sm font-semibold text-white/90">
            {t("welcome.badge") || "Welcome"}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-white/65 mt-3 text-sm md:text-lg max-w-[60ch]">{subtitle}</p>

        {err && (
          <div className="mt-5">
            <NoticeBox variant="warning">
              <div className="text-sm text-white/85">{err}</div>
            </NoticeBox>
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {/* Account Status */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <User className="w-4 h-4 text-[#F0B90B]" />
              {t("welcome.accountTitle") || "Account Status"}
            </div>
            <div className="text-white/55 text-sm mt-1">
              {t("welcome.accountDesc") || "Your profile details and verification status."}
            </div>

            {loading ? (
              <div className="mt-4 space-y-2">
                <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-56 rounded bg-white/10 animate-pulse" />
              </div>
            ) : profile ? (
              <div className="mt-4 space-y-3">
                <div className="text-white truncate">
                  {profile.username || profile.full_name || profile.email || profile.id.slice(0, 8)}
                </div>
                <div className="text-xs text-white/55 truncate">
                  {profile.email || "—"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={chipStatus(profile.status)}>{(profile.status || "—").toUpperCase()}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                    verified: {profile.verified ? "true" : "false"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                    role: {profile.role || "member"}
                  </span>
                </div>
                <div className="text-xs text-white/45">
                  {t("welcome.createdAt") || "Created"}:{" "}
                  {profile.created_at ? new Date(profile.created_at).toLocaleString() : "—"}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-white/60">
                {t("welcome.noProfile") || "Profile not found yet."}
              </div>
            )}
          </PremiumCard>

          {/* Referral Result */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" />
              {t("welcome.refTitle") || "Referral Setup"}
            </div>
            <div className="text-white/55 text-sm mt-1">
              {t("welcome.refDesc") || "Your referral code status and next steps."}
            </div>

            <div className="mt-4">
              {consume.state === "idle" ? (
                <div className="text-sm text-white/60">
                  {t("welcome.refIdle") || "No pending referral found."}
                </div>
              ) : consume.state === "running" ? (
                <NoticeBox variant="info">
                  <div className="text-sm text-white/85 inline-flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#F0B90B]" />
                    {t("welcome.refApplying") || "Applying referral code"}:{" "}
                    <span className="text-[#F0B90B]">{consume.code}</span>
                  </div>
                </NoticeBox>
              ) : consume.state === "ok" ? (
                <NoticeBox variant="success">
                  <div className="text-sm text-white/85">
                    {t("welcome.refOk") || "Referral applied successfully!"}:{" "}
                    <span className="text-[#F0B90B]">{consume.code}</span>
                  </div>
                </NoticeBox>
              ) : (
                <NoticeBox variant="warning">
                  <div className="text-sm text-white/85 inline-flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#F0B90B] mt-0.5" />
                    <div>
                      <div className="font-medium">{mapConsumeError(consume.error)}</div>
                      {consume.detail && (
                        <div className="text-xs text-white/60 mt-1">{consume.detail}</div>
                      )}
                    </div>
                  </div>
                </NoticeBox>
              )}
            </div>
          </PremiumCard>

          {/* Next Steps */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("welcome.nextTitle") || "Next Steps"}
            </div>
            <div className="text-white/55 text-sm mt-1">
              {t("welcome.nextDesc") || "Choose what you want to do next."}
            </div>

            <div className="mt-4 grid gap-3">
              <PremiumButton>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("welcome.joinTelegram") || "Join Telegram Community"}
                </a>
              </PremiumButton>

              <PremiumButton variant="secondary">
                <a href={docsPath} className="inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t("welcome.readDocs") || "Read Documentation"}
                </a>
              </PremiumButton>

              <PremiumButton variant="secondary">
                <a href={homePath} className="inline-flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  {t("welcome.goHome") || "Go to Home"}
                </a>
              </PremiumButton>

              <PremiumButton variant="secondary">
                <a href={dashboardPath} className="inline-flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  {t("welcome.goDashboard") || "Go to Dashboard"}
                </a>
              </PremiumButton>
            </div>

            <div className="mt-4 text-xs text-white/45">
              {t("welcome.footnote") || "Education-first. No guarantees. Risk-aware."}
            </div>

            <div className="mt-4 text-xs text-white/45">
              {t("welcome.footnote") || "Education-first. No guarantees. Risk-aware."}
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
}
