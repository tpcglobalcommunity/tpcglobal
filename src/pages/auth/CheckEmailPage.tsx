import { Mail, ArrowLeft } from "lucide-react";
import { useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton } from "@/components/ui";
import { Link } from "@/components/Router";

interface CheckEmailPageProps {
  lang: string;
}

const CheckEmailPage = ({ lang }: CheckEmailPageProps) => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <PremiumCard>
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full mb-6">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              
              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-4">
                {t("auth.checkEmail.title")}
              </h1>
              
              {/* Body */}
              <p className="text-white/70 mb-8 leading-relaxed">
                {t("auth.checkEmail.body")}
              </p>
              
              {/* Email App Button */}
              <a
                href={`mailto:`}
                className="block w-full mb-4"
              >
                <PremiumButton variant="primary" size="sm" className="w-full flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {t("auth.checkEmail.openEmail")}
                </PremiumButton>
              </a>
              
              {/* Back to Sign In */}
              <Link to={getLangPath(lang as any, "/signin")}>
                <PremiumButton variant="secondary" size="sm" className="w-full flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("auth.checkEmail.backToSignIn")}
                </PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
};

export default CheckEmailPage;
