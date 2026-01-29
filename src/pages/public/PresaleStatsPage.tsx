import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { getPresaleStatsPublic, type PresaleStats } from '../../lib/rpc/public';
import { formatCurrency, formatTpcAmount } from '../../lib/tokenSale';

export function PresaleStatsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PresaleStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getPresaleStatsPublic();
        setStats(data);
      } catch (error) {
        console.error('Failed to load presale stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading presale statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {t('presaleStats.title')}
            </h1>
            <p className="text-xl text-text-secondary">
              {t('presaleStats.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {stats.map((stage) => (
              <Card key={stage.stage}>
                <CardHeader>
                  <CardTitle className="text-gold">
                    {stage.stage === 'stage1' ? t('presaleStats.stage1') : t('presaleStats.stage2')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('presaleStats.sold')}:</span>
                      <span className="text-white font-medium">
                        {formatTpcAmount(stage.sold_tpc)} TPC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('presaleStats.remaining')}:</span>
                      <span className="text-white font-medium">
                        {formatTpcAmount(stage.remaining_tpc)} TPC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('presaleStats.supply')}:</span>
                      <span className="text-white font-medium">
                        {formatTpcAmount(stage.stage_supply)} TPC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total USD:</span>
                      <span className="text-white font-medium">
                        {formatCurrency(stage.sold_usd, 'USD')}
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div 
                        className="bg-gold h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(stage.sold_tpc / stage.stage_supply) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <OfficialWalletsCard />
        </div>
      </div>
    </div>
  );
}
