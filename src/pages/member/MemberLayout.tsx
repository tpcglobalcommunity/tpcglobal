import { type Language, useI18n } from "@/i18n";
import { PremiumShell } from "@/components/ui";
import MemberNav from "@/components/member/MemberNav";

export default function MemberLayout({
  lang,
  children,
}: {
  lang: Language;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <div className="mb-5">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
            {t("member.title") || "Member Area"}
          </h1>
          <p className="text-white/60 mt-2">
            {t("member.subtitle") || "Secure access to community tools and programs."}
          </p>
        </div>

        <div className="grid md:grid-cols-[280px,1fr] gap-4">
          <MemberNav lang={lang} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </PremiumShell>
  );
}
