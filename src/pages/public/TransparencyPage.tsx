import { useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Wallet, 
  Copy, 
  ExternalLink, 
  Flame, 
  Layers, 
  BadgeCheck 
} from "lucide-react";
import { TRANSPARENCY_WALLETS } from "@/config/tpcWallets";

const TransparencyPage = () => {
  const { t, lang } = useI18n();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success(t("transparency.toast.copied"));
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error(t("transparency.toast.copyFailed"));
    }
  };

  const openExplorer = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };

  return (
    <div className="container-app section-spacing">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm text-primary font-medium">
            {t("transparency.hero.badge")}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
          {t("transparency.title")}
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {t("transparency.subtitle")}
        </p>
        
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Badge variant="secondary" className="px-4 py-2">
            <Flame className="h-4 w-4 mr-2" />
            {t("transparency.badges.educationOnly")}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            {t("transparency.badges.securityFirst")}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Layers className="h-4 w-4 mr-2" />
            {t("transparency.badges.publicWallets")}
          </Badge>
        </div>
      </div>

      {/* Wallets Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t("transparency.section.wallets.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("transparency.section.wallets.desc")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRANSPARENCY_WALLETS.map((wallet) => (
            <Card key={wallet.address} className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  {t(wallet.labelKey)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t(wallet.purposeKey)}
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <code className="flex-1 text-xs font-mono break-all">
                      {wallet.address}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(wallet.address)}
                      className="flex-shrink-0"
                    >
                      {copiedAddress === wallet.address ? (
                        <BadgeCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => openExplorer(wallet.address)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("transparency.actions.viewExplorer")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How to Verify Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t("transparency.section.verify.title")}</h2>
        </div>
        
        <Card className="card-premium max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("transparency.section.verify.stepsTitle")}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm">{t("transparency.section.verify.step1")}</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm">{t("transparency.section.verify.step2")}</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-sm">{t("transparency.section.verify.step3")}</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <p className="text-sm">{t("transparency.section.verify.step4")}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("transparency.section.verify.officialChannels")}</h3>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-mono text-sm mb-2">t.me/tpcglobalcommunity</p>
                    <p className="text-xs text-muted-foreground">
                      {t("transparency.section.verify.telegramNote")}
                    </p>
                  </AlertDescription>
                </Alert>
                
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    {t("transparency.section.verify.warning")}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="text-center">
        <Alert className="max-w-2xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {t("transparency.section.disclaimer")}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default TransparencyPage;
