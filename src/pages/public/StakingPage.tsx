import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Badge } from "@/components/ui/badge";
import { Coins, Shield, TrendingUp } from "lucide-react";

const StakingPage = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="max-w-3xl mx-auto text-center">
          <Coins className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-6 text-gradient-gold">
            TPC Staking
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-foreground leading-relaxed">
              TPC Staking memungkinkan Anda mendapatkan utilitas ekosistem dengan 
              mengunci token TPC. Semua reward berupa utilitas akses dan bukan return 
              investasi. Transparansi on-chain untuk semua staking activity.
            </p>
          </div>

          <div className="mb-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Coming Soon
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Utility Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Akses premium features dan education content
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">On-Chain Transparent</h3>
              <p className="text-sm text-muted-foreground">
                Semua staking activity terverifikasi di blockchain
              </p>
            </div>
            <div className="text-center">
              <Coins className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Flexible Terms</h3>
              <p className="text-sm text-muted-foreground">
                Multiple staking periods dengan utilitas berbeda
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Education-Only • No Financial Advice • High Risk
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default StakingPage;
