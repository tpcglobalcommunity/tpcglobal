import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
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
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Clock,
  Users,
  Info,
  TriangleAlert
} from "lucide-react";

const VerifiedPage = () => {
  const { t } = useI18n();

  // Helper function to safely get array from translation
  const getArray = (key: string): string[] => {
    const value = t(key);
    return Array.isArray(value) ? value : [value];
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      logger.error('Failed to copy text', { error: err });
    }
  };

  // Wallet data structure
  const wallets = [
    {
      title: t("verified.treasuryTitle"),
      purpose: t("verified.treasuryPurpose"),
      address: t("verified.treasuryAddress"),
      status: t("verified.treasuryStatus"),
      note: t("verified.treasuryNote"),
      icon: Wallet,
      statusColor: "text-green-500"
    },
    {
      title: t("verified.liquidityTitle"),
      purpose: t("verified.liquidityPurpose"),
      address: t("verified.liquidityAddress"),
      status: t("verified.liquidityStatus"),
      note: t("verified.liquidityNote"),
      icon: Wallet,
      statusColor: "text-green-500"
    },
    {
      title: t("verified.buybackTitle"),
      purpose: t("verified.buybackPurpose"),
      address: t("verified.buybackAddress"),
      status: t("verified.buybackStatus"),
      note: t("verified.buybackNote"),
      icon: Lock,
      statusColor: "text-orange-500"
    },
    {
      title: t("verified.burnTitle"),
      purpose: t("verified.burnPurpose"),
      address: t("verified.burnAddress"),
      status: t("verified.burnStatus"),
      note: t("verified.burnNote"),
      icon: TriangleAlert,
      statusColor: "text-red-500"
    },
    {
      title: t("verified.presaleTitle"),
      purpose: t("verified.presalePurpose"),
      address: t("verified.presaleAddress"),
      status: t("verified.presaleStatus"),
      note: t("verified.presaleNote"),
      icon: Wallet,
      statusColor: "text-green-500"
    },
    {
      title: t("verified.mintTitle"),
      purpose: t("verified.mintPurpose"),
      address: t("verified.mintAddress"),
      status: t("verified.mintStatus"),
      note: t("verified.mintNote"),
      icon: FileText,
      statusColor: "text-green-500"
    }
  ];

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        {/* 1. Verified Page Hero (Trust Statement) */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-gold mb-4">
            {t("verified.heroTitle")}
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            {t("verified.heroSubtitle")}
          </p>
          <p className="text-lg text-muted-foreground mb-4">
            {t("verified.heroDescription")}
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-primary font-medium">{t("verified.heroNote")}</p>
          </div>
        </div>

        {/* 2. How to Verify TPC (Step-by-Step) */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Eye className="h-6 w-6 text-primary" />
              {t("verified.howToVerifyTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("verified.howToVerifySubtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("verified.step1Title")}</h3>
                  <p className="text-muted-foreground">{t("verified.step1Desc")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("verified.step2Title")}</h3>
                  <p className="text-muted-foreground">{t("verified.step2Desc")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("verified.step3Title")}</h3>
                  <p className="text-muted-foreground">{t("verified.step3Desc")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("verified.step4Title")}</h3>
                  <p className="text-muted-foreground">{t("verified.step4Desc")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("verified.step5Title")}</h3>
                  <p className="text-muted-foreground">{t("verified.step5Desc")}</p>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-200 font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t("verified.urgencyWarning")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Official Wallets (CORE SECTION) */}
        <Card className="card-premium mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Wallet className="h-6 w-6 text-primary" />
              {t("verified.walletsTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("verified.walletsSubtitle")}</p>
            <Badge variant="secondary" className="w-fit">
              {t("verified.networkInfo")}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {wallets.map((wallet, index) => {
                const Icon = wallet.icon;
                return (
                  <div key={index} className="border border-muted rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{wallet.title}</h3>
                          <Badge variant="outline" className={wallet.statusColor}>
                            {wallet.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{wallet.purpose}</p>
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono text-foreground break-all">
                              {wallet.address}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.address)}
                              className="flex-shrink-0 ml-2"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{wallet.note}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <p className="text-orange-200 font-medium">{t("verified.noHiddenWallets")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. What TPC Will NEVER Do (Red Flags) */}
        <Card className="card-premium mb-8 border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <XCircle className="h-6 w-6 text-red-500" />
              {t("verified.neverDoTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("verified.neverDoSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getArray("verified.neverDoList").map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 5. What Users Should ALWAYS Do */}
        <Card className="card-premium mb-8 border-2 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <CheckCircle className="h-6 w-6 text-green-500" />
              {t("verified.alwaysDoTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("verified.alwaysDoSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getArray("verified.alwaysDoList").map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 6. Presale Address Rules */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              {t("verified.presaleRulesTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("verified.presaleRulesSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t("verified.presaleRulesDesc")}</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("verified.presaleRule1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("verified.presaleRule2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{t("verified.presaleRule3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("verified.presaleRule4")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("verified.presaleRule5")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 7. Relationship With Trust Center */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              {t("verified.relationshipTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("verified.relationshipSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-muted rounded-lg p-4">
                <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {t("verified.trustCenterRole")}
                </h3>
                <p className="text-muted-foreground">{t("verified.trustCenterDesc")}</p>
              </div>
              <div className="border border-muted rounded-lg p-4">
                <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("verified.verifiedPageRole")}
                </h3>
                <p className="text-muted-foreground">{t("verified.verifiedPageDesc")}</p>
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-primary font-medium">{t("verified.bothRequired")}</p>
            </div>
          </CardContent>
        </Card>

        {/* 8. Short Legal & Risk Note */}
        <Card className="card-premium mb-8 border-2 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              {t("verified.legalTitle")}
            </CardTitle>
            <p className="text-muted-foreground">{t("verified.legalSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {getArray("verified.legalList").map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">{t("verified.legalLink")}</p>
          </CardContent>
        </Card>

        {/* 9. Final Warning Box */}
        <Card className="card-premium border-2 border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-red-500">{t("verified.finalWarningTitle")}</h3>
              <p className="text-lg text-red-400 italic">"{t("verified.finalWarningText")}"</p>
              <p className="text-red-300">{t("verified.finalWarningSubtitle")}</p>
              <p className="text-muted-foreground">{t("verified.finalAction")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PremiumShell>
  );
};

export default VerifiedPage;
