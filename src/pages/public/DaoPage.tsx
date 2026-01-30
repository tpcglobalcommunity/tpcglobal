import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  Lightbulb, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";

const DaoPage = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-gold mb-4">
            {t("dao.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            {t("dao.subtitle")}
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {t("dao.badge")}
          </Badge>
        </div>

        {/* What is DAO Section */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <AlertCircle className="h-6 w-6 text-primary" />
              {t("dao.whatIsDaoTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {t("dao.whatIsDaoDesc")}
            </div>
          </CardContent>
        </Card>

        {/* Current Phase Section */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Clock className="h-6 w-6 text-primary" />
              {t("dao.currentPhaseTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("dao.currentPhaseBullet1")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("dao.currentPhaseBullet2")}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("dao.currentPhaseBullet3")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("dao.currentPhaseBullet4")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Participation Section */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              {t("dao.participationTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t("dao.participationDesc")}
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <span>{t("dao.participationItem1")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>{t("dao.participationItem2")}</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{t("dao.participationItem3")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <span>{t("dao.participationItem4")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snapshot Section */}
        <Card className="card-premium mb-8 border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Clock className="h-6 w-6 text-primary" />
              {t("dao.snapshotTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line mb-6">
              {t("dao.snapshotDesc")}
            </div>
            <Button 
              disabled 
              size="lg" 
              className="w-full md:w-auto opacity-60 cursor-not-allowed"
            >
              {t("dao.snapshotButton")}
            </Button>
          </CardContent>
        </Card>

        {/* DAO Roadmap Section */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <TrendingUp className="h-6 w-6 text-primary" />
              {t("dao.roadmapTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold">{t("dao.roadmapPhase1")}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold">{t("dao.roadmapPhase2")}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold">{t("dao.roadmapPhase3")}</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  {t("dao.roadmapNote")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Disclaimer */}
        <Card className="card-premium border-2 border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-200 leading-relaxed">
                {t("dao.disclaimer")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PremiumShell>
  );
};

export default DaoPage;
