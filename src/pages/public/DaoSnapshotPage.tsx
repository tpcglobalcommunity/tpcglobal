import { useI18n } from "@/i18n/i18n";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Clock, ExternalLink } from "lucide-react";

const DaoSnapshotPage = () => {
  const { t } = useI18n();

  return (
    <div className="container-app section-spacing">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Camera className="h-5 w-5 text-primary" />
          <span className="text-sm text-primary font-medium">{t("daoSnapshot.comingSoon")}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-gold mb-4">
          {t("daoSnapshot.title")}
        </h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          {t("daoSnapshot.subtitle")}
        </p>
      </div>

      {/* Main Content */}
      <Card className="card-premium mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {t("daoSnapshot.mainTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t("daoSnapshot.body")}
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">{t("daoSnapshot.features.voting")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("daoSnapshot.features.votingDesc")}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">{t("daoSnapshot.features.proposals")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("daoSnapshot.features.proposalsDesc")}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">{t("daoSnapshot.features.transparency")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("daoSnapshot.features.transparencyDesc")}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">{t("daoSnapshot.features.access")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("daoSnapshot.features.accessDesc")}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t("daoSnapshot.timeline.title")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">{t("daoSnapshot.timeline.phase1")}</p>
                    <p className="text-sm text-muted-foreground">{t("daoSnapshot.timeline.phase1Desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary/40 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">{t("daoSnapshot.timeline.phase2")}</p>
                    <p className="text-sm text-muted-foreground">{t("daoSnapshot.timeline.phase2Desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary/20 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">{t("daoSnapshot.timeline.phase3")}</p>
                    <p className="text-sm text-muted-foreground">{t("daoSnapshot.timeline.phase3Desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold">{t("daoSnapshot.cta.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("daoSnapshot.cta.description")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    disabled 
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t("daoSnapshot.cta.button")}
                  </Button>
                  <Badge variant="secondary" className="w-full sm:w-auto justify-center">
                    {t("daoSnapshot.comingSoon")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back Navigation */}
      <div className="text-center">
        <Link to="/id/dao">
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("daoSnapshot.backToDao")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DaoSnapshotPage;
