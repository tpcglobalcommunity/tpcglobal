import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Vote } from "lucide-react";

const DaoPage = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="max-w-3xl mx-auto text-center">
          <Users className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-6 text-gradient-gold">
            TPC DAO
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-foreground leading-relaxed">
              TPC DAO adalah sistem tata kelola komunitas berbasis token. 
              Pemegang TPC token dapat berpartisipasi dalam pengambilan keputusan 
              ekosistem secara transparan dan terdesentralisasi.
            </p>
          </div>

          <div className="mb-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Coming Soon
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <Vote className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Community Governance</h3>
              <p className="text-sm text-muted-foreground">
                Voting system untuk keputusan ekosistem
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Transparent Treasury</h3>
              <p className="text-sm text-muted-foreground">
                Semua treasury activity terverifikasi on-chain
              </p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Token-Based Voting</h3>
              <p className="text-sm text-muted-foreground">
                Satu token satu suara untuk keadilan
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

export default DaoPage;
