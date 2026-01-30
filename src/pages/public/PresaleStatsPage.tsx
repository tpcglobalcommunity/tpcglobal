import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { getPresaleStatsPublic, type PresaleStats } from "@/lib/rpc/public";
import { PremiumShell } from "@/components/layout/PremiumShell";

const PresaleStatsPage = () => {
  const { t, lang, withLang } = useI18n();
  const [stats, setStats] = useState<PresaleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SAFE numeric helpers
  const toNum = (v: unknown, fallback = 0) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const formatUsd = (v: unknown) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(toNum(v, 0));

  const formatNumber = (v: unknown) =>
    new Intl.NumberFormat('en-US').format(toNum(v, 0));

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPresaleStatsPublic();
      setStats(data);
    } catch (err) {
      logger.error('Failed to load presale stats', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Calculate progress percentage
  const progressPercentage = stats ? 
    (toNum(stats.active_stage.sold) / toNum(stats.active_stage.allocation)) * 100 : 0;

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        {/* Header */}
        <div className="text-center mb-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-gold mb-2">
            {t("presaleStats.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("presaleStats.subtitle")}
          </p>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {lang === 'en' ? 'Refresh' : 'Perbarui'}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="card-premium">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="card-premium mb-8">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={loadStats} className="mt-4">
                {lang === 'en' ? 'Try Again' : 'Coba Lagi'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Display */}
        {stats && !loading && !error && (
          <>
            {/* Main Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="card-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("presaleStats.totalSold")}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.total_tpc_sold)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    TPC
                  </p>
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("presaleStats.totalRaised")}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatUsd(stats.total_usd_raised)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    USD
                  </p>
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("presaleStats.uniqueBuyers")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.unique_buyers)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lang === 'en' ? 'Participants' : 'Peserta'}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("presaleStats.activeStage")}
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {stats.active_stage.name.replace('stage', 'Stage ')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatUsd(stats.active_stage.price_usd)} / TPC
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Active Stage Progress */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t("presaleStats.activeStage")} - {stats.active_stage.name.replace('stage', 'Stage ')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{t("presaleStats.progress")}</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{lang === 'en' ? 'Sold' : 'Terjual'}:</span>
                    <div className="font-semibold">
                      {formatNumber(stats.active_stage.sold)} TPC
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{lang === 'en' ? 'Allocation' : 'Alokasi'}:</span>
                    <div className="font-semibold">
                      {formatNumber(stats.active_stage.allocation)} TPC
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-4">
                  {lang === 'en' ? 'Last updated' : 'Terakhir diperbarui'}: {new Date(stats.last_updated * 1000).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!stats && !loading && !error && (
          <Card className="card-premium">
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t("presaleStats.empty")}
              </h3>
            </CardContent>
          </Card>
        )}
      </div>
    </PremiumShell>
  );
};

export default PresaleStatsPage;
