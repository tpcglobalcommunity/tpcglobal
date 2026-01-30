import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
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
    try {
      const value = t(key);
      if (Array.isArray(value)) {
        return value;
      }
      return [];
    } catch (error) {
      logger.error(`Failed to get array for key: ${key}`, error);
      return [];
    }
  };

  // Official wallets data
  const wallets = [
    {
      title: "TPC Global Treasury",
      address: "5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw",
      purpose: "Official TPC Treasury wallet for presale funds",
      status: "Active",
      statusColor: "text-green-500",
      icon: Wallet
    },
    {
      title: "Distribution Wallet",
      address: "9WzDXwBbmkg8ZTbNMUxvYR4bS6bT1hTcPj5c9vX8QK",
      purpose: "Distribution wallet for TPC tokens",
      status: "Active",
      statusColor: "text-blue-500",
      icon: Globe
    },
    {
      title: "Marketing Wallet",
      address: "7xXKf9W2sY8ZTbNMUxvYR4bS6bT1hTcPj5c9vX8QK",
      purpose: "Marketing and community wallet",
      status: "Active",
      statusColor: "text-purple-500",
      icon: Users
    }
  ];

  // Mint information
  const mintInfo = [
    {
      purpose: t("verified.mintPurpose"),
      address: t("verified.mintAddress"),
      status: t("verified.mintStatus"),
      note: t("verified.mintNote"),
      icon: FileText,
      statusColor: "text-green-500"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
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
                      <div className="bg-muted/50 rounded-lg p-3">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Mint Information */}
      <Card className="card-premium mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            {t("verified.mintTitle")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.mintSubtitle")}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mintInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-4 border border-muted rounded-lg">
                  <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${info.statusColor} mt-1`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{info.purpose}</h3>
                      <Badge variant="outline" className={info.statusColor}>
                        {info.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{info.note}</p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-foreground break-all">
                          {info.address}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(info.address)}
                          className="flex-shrink-0 ml-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 5. Verification Status */}
      <Card className="card-premium mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <CheckCircle className="h-6 w-6 text-success" />
            {t("verified.verificationTitle")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.verificationSubtitle")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <h4 className="font-semibold">{t("verified.verifiedContract")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.verifiedContractDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <h4 className="font-semibold">{t("verified.verifiedSupply")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.verifiedSupplyDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <h4 className="font-semibold">{t("verified.verifiedLiquidity")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.verifiedLiquidityDesc")}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">{t("verified.securityAudit")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.securityAuditDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">{t("verified.teamVerified")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.teamVerifiedDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">{t("verified.roadmapCompliance")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.roadmapComplianceDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Call to Action */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            {t("verified.ctaTitle")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.ctaSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={() => window.open('/id/buytpc', '_blank')}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {t("verified.ctaBuyTpc")}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={() => window.open('/id/transparency', '_blank')}
            >
              <FileText className="h-4 w-4 mr-2" />
              {t("verified.ctaTransparency")}
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("verified.ctaNote")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 7. Contact Information */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Info className="h-6 w-6 text-primary" />
            {t("verified.contactTitle")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.contactSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">{t("verified.contactEmail")}</h4>
              <p className="text-muted-foreground">support@tpcglobal.io</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("verified.contactWebsite")}</h4>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">tpcglobal.io</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://tpcglobal.io', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">{t("verified.contactTelegram")}</h4>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">@tpcglobal</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://t.me/tpcglobal', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("verified.contactTwitter")}</h4>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">@tpcglobal</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://twitter.com/tpcglobal', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifiedPage;
