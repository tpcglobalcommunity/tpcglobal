import { PremiumCard, PremiumButton, NoticeBox } from './ui';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { type Language, useI18n, getLangPath } from '../i18n';

interface NotAuthorizedProps {
  lang: Language;
  message?: string;
  backTo?: string;
}

export default function NotAuthorized({ lang, message, backTo }: NotAuthorizedProps) {
  const { t } = useI18n(lang);
  const baseAdmin = `${getLangPath(lang, "")}/admin`;

  return (
    <div className="grid gap-4">
      <PremiumCard className="p-8">
        <div className="text-center">
          <ShieldX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          
          <h2 className="text-2xl font-semibold text-white mb-2">
            {t("admin.notAuthorized.title") || "Not Authorized"}
          </h2>
          
          <p className="text-white/60 mb-6">
            {message || (t("admin.notAuthorized.message") || "You don't have permission to access this page.")}
          </p>

          <div className="flex justify-center gap-3">
            <PremiumButton
              onClick={() => window.location.href = backTo || baseAdmin}
            >
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("admin.notAuthorized.backToAdmin") || "Back to Admin"}
              </span>
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>

      <NoticeBox variant="warning">
        <div className="text-sm text-white/85">
          {t("admin.notAuthorized.help") || "If you believe this is an error, please contact your system administrator."}
        </div>
      </NoticeBox>
    </div>
  );
}
