import { useI18n } from "@/i18n/i18n";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle, 
  Wallet,
  FileText,
  Copy,
  ExternalLink,
  Globe,
  Users,
  TriangleAlert
} from "lucide-react";
import { OFFICIAL, WALLET_TYPES } from "@/lib/constants/official";

const VerifiedPage = () => {
  const { t } = useI18n();

  // Get current language from pathname
  const getCurrentLang = (): string => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/en')) return 'en';
    }
    return 'id'; // default
  };

  const lang = getCurrentLang();

  // Helper to create language-aware paths
  const withLang = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${cleanPath}`;
  };

  // Official wallets data - only show real addresses, mark others as coming soon
  const officialWallets = [
    {
      title: t("verified.wallets.treasury"),
      address: OFFICIAL.TREASURY_ADDRESS,
      purpose: t("verified.wallets.treasuryPurpose"),
      status: t("verified.wallets.treasuryStatus"),
      statusColor: "text-green-500",
      icon: Wallet,
      type: WALLET_TYPES.TREASURY,
      isComingSoon: false
    },
    {
      title: t("verified.wallets.distribution"),
      address: "-", // No real address yet
      purpose: t("verified.wallets.distributionPurpose"),
      status: t("verified.wallets.distributionStatus"),
      statusColor: "text-yellow-500",
      icon: Globe,
      type: WALLET_TYPES.DISTRIBUTION,
      isComingSoon: true
    },
    {
      title: t("verified.wallets.marketing"),
      address: "-", // No real address yet
      purpose: t("verified.wallets.marketingPurpose"),
      status: t("verified.wallets.marketingStatus"),
      statusColor: "text-yellow-500",
      icon: Users,
      type: WALLET_TYPES.MARKETING,
      isComingSoon: true
    }
  ];

  // Anti-scam rules
  const antiScamRules = [
    t("verified.antiScam.rule1"),
    t("verified.antiScam.rule2"),
    t("verified.antiScam.rule3"),
    t("verified.antiScam.rule4"),
    t("verified.antiScam.rule5"),
    t("verified.antiScam.rule6"),
    t("verified.antiScam.rule7")
  ];

  const copyToClipboard = (text: string) => {
    if (text === "-") return; // Don't copy placeholder
    navigator.clipboard.writeText(text);
    toast.success(t("common.copied"));
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <div className="container-app section-spacing">
      {/* 1. Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <span className="text-xs text-primary font-medium">{t("verified.badge")}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-gold mb-2">
          {t("verified.title")}
        </h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          {t("verified.subtitle")}
        </p>
        <p className="text-lg text-muted-foreground mb-4">
          {t("verified.description")}
        </p>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-primary font-medium">{t("verified.note")}</p>
        </div>
      </div>

      {/* 2. Official Links Section */}
      <Card className="card-premium mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Globe className="h-6 w-6 text-primary" />
            {t("verified.official.title")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.official.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">{t("verified.official.website")}</h4>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{OFFICIAL.WEBSITE}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(OFFICIAL.WEBSITE)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("verified.official.telegram")}</h4>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{OFFICIAL.TELEGRAM}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(OFFICIAL.TELEGRAM)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("verified.official.twitter")}</h4>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{OFFICIAL.TWITTER}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(OFFICIAL.TWITTER)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Official Treasury Section */}
      <Card className="card-premium mb-8 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            {t("verified.treasury.title")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.treasury.subtitle")}</p>
          <Badge variant="secondary" className="w-fit">
            {t("verified.treasury.network")}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-foreground break-all">
                  {OFFICIAL.TREASURY_ADDRESS}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(OFFICIAL.TREASURY_ADDRESS)}
                  className="flex-shrink-0 ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">{t("verified.treasury.note")}</p>
              <p className="text-xs text-muted-foreground">
                {t("verified.treasury.warning")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Official Mint Section */}
      <Card className="card-premium mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            {t("verified.mint.title")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.mint.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-foreground break-all">
                  {OFFICIAL.MINT_ADDRESS}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(OFFICIAL.MINT_ADDRESS)}
                  className="flex-shrink-0 ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">{t("verified.mint.note")}</p>
              <p className="text-xs text-muted-foreground">
                {t("verified.mint.warning")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Official Wallets Section */}
      <Card className="card-premium mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            {t("verified.wallets.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialWallets.map((wallet, index) => (
              <Card key={index} className="border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <wallet.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{wallet.title}</CardTitle>
                  </div>
                  <Badge 
                    variant={wallet.isComingSoon ? "outline" : "secondary"}
                    className={`w-fit ${wallet.statusColor}`}
                  >
                    {wallet.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Address:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground break-all">
                        {wallet.address}
                      </span>
                      {!wallet.isComingSoon && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.address)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Purpose:</p>
                    <p className="text-sm text-foreground">{wallet.purpose}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. Anti-Scam Rules Section */}
      <Card className="card-premium mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <TriangleAlert className="h-6 w-6 text-orange-500" />
            {t("verified.antiScam.title")}
          </CardTitle>
          <Badge variant="destructive" className="w-fit">
            {t("verified.antiScam.badge")}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {antiScamRules.map((rule, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7. Verification Status */}
      <Card className="card-premium mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <CheckCircle className="h-6 w-6 text-success" />
            {t("verified.verification.title")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.verification.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <h4 className="font-semibold">{t("verified.verification.supply")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.verification.supplyDesc")}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <h4 className="font-semibold">{t("verified.verification.liquidity")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.verification.liquidityDesc")}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <h4 className="font-semibold">{t("verified.verification.audit")}</h4>
                  <p className="text-sm text-muted-foreground">{t("verified.verification.auditDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. Call to Action */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            {t("verified.cta.title")}
          </CardTitle>
          <p className="text-muted-foreground">{t("verified.cta.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={() => window.open(withLang('/buytpc'), '_blank', 'noopener,noreferrer')}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {t("verified.cta.buyTpc")}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={() => window.open(withLang('/transparency'), '_blank', 'noopener,noreferrer')}
            >
              <FileText className="h-4 w-4 mr-2" />
              {t("verified.cta.transparency")}
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("verified.cta.note")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifiedPage;
