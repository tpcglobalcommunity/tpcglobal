import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Shield, User, CheckCircle2, ExternalLink, BookOpen, Activity, Wallet, LayoutDashboard, ArrowRight } from "lucide-react";
import MemberLayout from "./MemberLayout";

type ProfileRow = {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  role?: string | null;
  verified?: boolean | null;
  can_invite?: boolean | null;
  tpc_tier?: string | null;
  tpc_balance?: number | null;
  wallet_verified_at?: string | null;
  created_at?: string | null;
};

type ReferralUse = {
  code: string;
  invited_by: string | null;
  used_by: string;
  created_at: string;
};

function shortId(id?: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export default function MemberDashboardPage({ lang }: { lang: Language }) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [ref, setRef] = useState<ReferralUse | null>(null);

  const base = getLangPath(lang, "");
  const docsPath = `${base}/docs`;
  const transparencyPath = `${base}/transparency`;
  const telegramUrl = "https://t.me/tpcglobalcommunity";

  const title = useMemo(() => t("member.dashboard.title") || "Member Dashboard", [t]);
  const subtitle = useMemo(
    () => t("member.dashboard.subtitle") || "Your account status, referral, and next steps—at a glance.",
    [t]
  );

  // Warning logic based on verified and role
  const warning = useMemo(() => {
    if (!profile) return null;
    
    const notVerified = profile.verified === false;
    const isViewer = profile.role === "viewer";

    if (isViewer) {
      return "Not authorized";
    } else if (notVerified) {
      return "Account not verified yet";
    }
    return null;
  }, [profile]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data: ses } = await supabase.auth.getSession();
        const uid = ses.session?.user?.id;
        if (!uid) {
          window.location.href = `${base}/signin`;
          return;
        }

        const { data: p, error: pe } = await supabase
          .from("profiles")
          .select("id, email, username, full_name, role, verified, can_invite, tpc_tier, tpc_balance, wallet_verified_at, created_at")
          .eq("id", uid)
          .maybeSingle(); // Use maybeSingle to prevent errors
        if (pe) {
          console.warn('Profile fetch error:', pe);
          setProfile(null); // Safe fallback
          return;
        }
        if (!p) {
          console.warn('No profile found for user:', uid);
          setProfile(null); // Safe fallback
          return;
        }

        const { data: r } = await supabase
          .from("referral_uses")
          .select("code, invited_by, used_by, created_at")
          .eq("used_by", uid)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!alive) return;
        setProfile(p as ProfileRow);
        setRef((r && r[0]) ? (r[0] as ReferralUse) : null);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load member dashboard");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MemberLayout lang={lang}>
      {/* Hero */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/25 mb-3">
        <Shield className="w-4 h-4 text-[#F0B90B]" />
        <span className="text-sm font-semibold text-white/90">
          {t("member.dashboard.badge") || "Member Area"}
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{title}</h1>
      <p className="text-white/65 mt-3 text-sm md:text-lg max-w-[70ch]">{subtitle}</p>

      {(err || warning) ? (
        <div className="mt-5">
          <NoticeBox variant="warning">
            <div className="text-sm text-white/85">{warning || err}</div>
          </NoticeBox>
        </div>
      ) : null}

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {/* Account */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <User className="w-4 h-4 text-[#F0B90B]" />
              {t("member.dashboard.accountTitle") || "Account"}
            </div>

            {loading ? (
              <div className="mt-4 space-y-2">
                <div className="h-4 w-44 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-64 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-40 rounded bg-white/10 animate-pulse" />
              </div>
            ) : profile ? (
              <div className="mt-4 space-y-3">
                <div className="text-white truncate">
                  {profile.username || profile.full_name || profile.email || profile.id.slice(0, 8)}
                </div>
                <div className="text-xs text-white/55 truncate">{profile.email || "—"}</div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full border border-[#F0B90B]/30 bg-[#F0B90B]/10 text-[#F0B90B] font-semibold text-xs">
                    {(profile?.tpc_tier ?? "BASIC").toUpperCase()}
                  </span>

                  {profile?.verified ? (
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs">
                      PENDING
                    </span>
                  )}
                </div>

                <div className="text-xs text-white/45">
                  {t("member.dashboard.createdAt") || "Created"}:{" "}
                  {profile.created_at ? new Date(profile.created_at).toLocaleString() : "—"}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-white/60">
                {t("member.dashboard.noProfile") || "Profile not found."}
              </div>
            )}
          </PremiumCard>

          {/* Referral */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" />
              {t("member.dashboard.refTitle") || "Referral"}
            </div>

            {loading ? (
              <div className="mt-4 space-y-2">
                <div className="h-4 w-36 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-56 rounded bg-white/10 animate-pulse" />
              </div>
            ) : ref ? (
              <div className="mt-4 space-y-3">
                <div className="text-white">
                  {t("member.dashboard.refCode") || "Code"}:{" "}
                  <span className="text-[#F0B90B]">{ref.code}</span>
                </div>
                <div className="text-xs text-white/55">
                  invited_by: {shortId(ref.invited_by)}
                </div>
                <div className="text-xs text-white/45">
                  {t("member.dashboard.refAt") || "Recorded"}:{" "}
                  {ref.created_at ? new Date(ref.created_at).toLocaleString() : "—"}
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="text-white/75 text-sm">
                    {t("member.dashboard.refNoteTitle") || "Integrity"}
                  </div>
                  <div className="text-white/50 text-xs mt-1">
                    {t("member.dashboard.refNoteDesc") || "Referral is recorded once per account to prevent abuse."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-white/60">
                {t("member.dashboard.refNone") || "No referral recorded yet."}
              </div>
            )}
          </PremiumCard>

          {/* Quick Links */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-[#F0B90B]" />
              {t("member.dashboard.quickTitle") || "Quick Links"}
            </div>
            <div className="text-white/55 text-sm mt-1">
              {t("member.dashboard.quickDesc") || "Access essential resources quickly."}
            </div>

            <div className="mt-4 grid gap-3">
              <PremiumButton
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between gap-2"
              >
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {t("member.dashboard.joinTelegram") || "Join Telegram"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </PremiumButton>

              <PremiumButton variant="secondary" href={docsPath} className="inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t("member.dashboard.docs") || "Documentation"}
              </PremiumButton>

              <PremiumButton variant="secondary" href={transparencyPath} className="inline-flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {t("member.dashboard.transparency") || "Transparency"}
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>

        {/* Programs (placeholder) */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {[
            {
              icon: Activity,
              title: t("member.dashboard.program1") || "WD Consistency Program",
              desc: t("member.dashboard.program1Desc") || "Coming soon. Track your consistency and unlock benefits.",
            },
            {
              icon: Activity,
              title: t("member.dashboard.program2") || "Copy Trading",
              desc: t("member.dashboard.program2Desc") || "Coming soon. Follow verified strategies with clear risk notes.",
            },
            {
              icon: Activity,
              title: t("member.dashboard.program3") || "Marketplace",
              desc: t("member.dashboard.program3Desc") || "Coming soon. Services and tools curated for members.",
            },
          ].map((p, idx) => {
            const Icon = p.icon;
            return (
              <PremiumCard key={idx} className="p-5">
                <div className="inline-flex items-center gap-2 text-white font-semibold">
                  <Icon className="w-4 h-4 text-[#F0B90B]" />
                  {p.title}
                </div>
                <div className="text-white/55 text-sm mt-2">{p.desc}</div>
                <div className="mt-4 text-xs text-white/45">
                  {t("member.dashboard.programFoot") || "Planned feature. No guarantees. Risk-aware."}
                </div>
              </PremiumCard>
            );
          })}
        </div>
    </MemberLayout>
  );
}
