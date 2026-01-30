import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Wallet,
  FileText,
  HelpCircle,
  ExternalLink,
  Globe,
  MessageSquare,
  Mail,
  Users,
  TrendingUp,
  Lock
} from "lucide-react";

const TrustCenterPage = () => {
  const { t } = useI18n();

  // Helper function to safely get array from translation
  const getArray = (key: string): string[] => {
    const value = t(key);
    return Array.isArray(value) ? value : [value];
  };

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        {/* 1. Trust Overview (Hero) */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-gold mb-4">
            {t("trust.heroTitle")}
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            {t("trust.heroSubtitle")}
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {t("trust.heroDescription")}
          </Badge>
        </div>

        {/* 2. What TPC Is / Is Not (Canonical) */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <CheckCircle className="h-6 w-6 text-green-500" />
              {t("trust.whatIsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t("trust.tpcIsTitle")}
                </h3>
                <ul className="space-y-2">
                  {getArray("trust.tpcIsList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {t("trust.tpcIsNotTitle")}
                </h3>
                <ul className="space-y-2">
                  {getArray("trust.tpcIsNotList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Anti-Scam Rules (Very Clear) */}
        <Card className="card-premium mb-8 border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              {t("trust.antiScamTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("trust.antiScamSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {t("trust.neverTitle")}
                </h3>
                <ul className="space-y-2">
                  {getArray("trust.neverList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t("trust.alwaysTitle")}
                </h3>
                <ul className="space-y-2">
                  {getArray("trust.alwaysList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Official Verification (CRITICAL) */}
        <Card className="card-premium mb-8 border-2 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Shield className="h-6 w-6 text-blue-500" />
              {t("trust.verificationTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("trust.verificationSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-blue-600 mb-3">{t("trust.officialTitle")}</h3>
                <ul className="space-y-2">
                  {getArray("trust.officialList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-orange-600 mb-3">{t("trust.adminTitle")}</h3>
                <ul className="space-y-2">
                  {getArray("trust.adminList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-200 font-medium">{t("trust.warningNote")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. On-Chain Transparency */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Eye className="h-6 w-6 text-primary" />
              {t("trust.onchainTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("trust.onchainSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">{t("trust.whyTitle")}</h3>
                <p className="text-muted-foreground">{t("trust.whyDescription")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">{t("trust.walletsTitle")}</h3>
                <ul className="space-y-2">
                  {getArray("trust.walletsList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Wallet className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 border border-muted rounded-lg p-4">
                  <p className="text-sm">{t("trust.explorerNote")}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <p className="text-sm text-orange-200">{t("trust.noWalletNote")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Presale Safety Explanation */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              {t("trust.presaleSafetyTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("trust.presaleSafetySubtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">{t("trust.howTitle")}</h3>
                <ul className="space-y-2">
                  {getArray("trust.howList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-200 mb-3">{t("trust.importantTitle")}</h3>
                <ul className="space-y-2">
                  {getArray("trust.importantList").map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-100">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Risk Disclosure (Short Version) */}
        <Card className="card-premium mb-8 border-2 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              {t("trust.riskTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("trust.riskSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {getArray("trust.riskList").map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">{t("trust.legalNote")}</p>
          </CardContent>
        </Card>

        {/* 8. FAQ (Trust-Specific) */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              {t("trust.faqTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("trust.faqSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Anti-Scam FAQ */}
              <div>
                <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t("trust.scamFaqTitle")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">{t("trust.scamQ1")}</p>
                    <p className="text-muted-foreground">{t("trust.scamA1")}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">{t("trust.scamQ2")}</p>
                    <p className="text-muted-foreground">{t("trust.scamA2")}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">{t("trust.scamQ3")}</p>
                    <p className="text-muted-foreground">{t("trust.scamA3")}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Verification FAQ */}
              <div>
                <h3 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("trust.verifyFaqTitle")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">{t("trust.verifyQ1")}</p>
                    <p className="text-muted-foreground">{t("trust.verifyA1")}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">{t("trust.verifyQ2")}</p>
                    <p className="text-muted-foreground">{t("trust.verifyA2")}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">{t("trust.verifyQ3")}</p>
                    <p className="text-muted-foreground">{t("trust.verifyA3")}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Presale Safety FAQ */}
              <div>
                <h3 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("trust.presaleFaqTitle")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">{t("trust.presaleQ1")}</p>
                    <p className="text-muted-foreground">{t("trust.presaleA1")}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">{t("trust.presaleQ2")}</p>
                    <p className="text-muted-foreground">{t("trust.presaleA2")}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">{t("trust.presaleQ3")}</p>
                    <p className="text-muted-foreground">{t("trust.presaleA3")}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 9. Final Reminder Box */}
        <Card className="card-premium border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-primary">{t("trust.finalReminderTitle")}</h3>
              <p className="text-lg text-primary/80 italic">"{t("trust.finalReminderText")}"</p>
              <p className="text-muted-foreground">{t("trust.finalReminderSubtitle")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PremiumShell>
  );
};

export default TrustCenterPage;
