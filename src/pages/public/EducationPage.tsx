import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users } from "lucide-react";

const EducationPage = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="max-w-3xl mx-auto text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-6 text-gradient-gold">
            Education Center
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-foreground leading-relaxed">
              TPC Education Center menyediakan materi pembelajaran trading yang komprehensif, 
              dari dasar hingga strategi lanjutan. Semua konten dirancang untuk membantu trader 
              memahami risiko dan mengembangkan skill trading yang disiplin.
            </p>
          </div>

          <div className="mb-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Coming Soon
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Self-Paced Learning</h3>
              <p className="text-sm text-muted-foreground">
                Belajar sesuai kecepatan Anda dengan materi terstruktur
              </p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Community Support</h3>
              <p className="text-sm text-muted-foreground">
                Diskusi dan sharing dengan trader lain
              </p>
            </div>
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Practical Examples</h3>
              <p className="text-sm text-muted-foreground">
                Studi kasus real dan implementasi strategi
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

export default EducationPage;
