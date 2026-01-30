import { useI18n } from "@/i18n/i18n";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Vote, Camera, Shield } from "lucide-react";

const DaoLitePage = () => {
  const { t } = useI18n();

  return (
    <div className="container-app section-spacing">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm text-primary font-medium">{t("daoLite.comingSoon")}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-gold mb-4">
          {t("daoLite.title")}
        </h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          {t("daoLite.subtitle")}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* What is DAO Lite */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("daoLite.sectionWhat.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t("daoLite.sectionWhat.body")}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-sm">{t("daoLite.features.governance")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-sm">{t("daoLite.features.education")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-sm">{t("daoLite.features.transparency")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Proposals Work */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              {t("daoLite.sectionHow.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t("daoLite.sectionHow.body")}
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("daoLite.proposalSteps.submit")}</p>
                    <p className="text-xs text-muted-foreground">{t("daoLite.proposalSteps.submitDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("daoLite.proposalSteps.discuss")}</p>
                    <p className="text-xs text-muted-foreground">{t("daoLite.proposalSteps.discussDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("daoLite.proposalSteps.vote")}</p>
                    <p className="text-xs text-muted-foreground">{t("daoLite.proposalSteps.voteDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Snapshot Section */}
      <Card className="card-premium mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {t("daoLite.sectionSnapshot.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t("daoLite.sectionSnapshot.body")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button 
                disabled 
                className="w-full sm:w-auto"
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                {t("daoLite.snapshotCta")}
              </Button>
              <Badge variant="secondary" className="w-full sm:w-auto justify-center">
                {t("daoLite.comingSoon")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-600 mb-2">
                {t("daoLite.disclaimer.title")}
              </h3>
              <p className="text-sm text-yellow-700 leading-relaxed">
                {t("daoLite.disclaimer.body")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="text-center">
        <Link to="/id">
          <Button variant="outline" className="inline-flex items-center gap-2">
            {t("daoLite.backToHome")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DaoLitePage;
