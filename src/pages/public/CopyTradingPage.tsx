import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, TrendingUp } from "lucide-react";

const CopyTradingPage = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="max-w-3xl mx-auto text-center">
          <Users className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-6 text-gradient-gold">
            Copy Trading
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-foreground leading-relaxed">
              TPC Copy Trading memungkinkan Anda mengikuti strategi trader berpengalaman. 
              Semua transaksi transparan dan dapat diverifikasi on-chain. Edukasi tentang 
              risiko dan manajemen selalu menjadi prioritas.
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
              <h3 className="font-semibold mb-2">Verified Traders</h3>
              <p className="text-sm text-muted-foreground">
                Trader terverifikasi dengan track record transparan
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Risk Management</h3>
              <p className="text-sm text-muted-foreground">
                Kontrol risiko dan manajemen portofolio otomatis
              </p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Community Learning</h3>
              <p className="text-sm text-muted-foreground">
                Belajar dari strategi dan analisis trader profesional
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

export default CopyTradingPage;
