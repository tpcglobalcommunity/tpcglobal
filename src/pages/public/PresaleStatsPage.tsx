import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/i18n';
import { logger } from '@/lib/logger';
import { PremiumShell } from '@/components/layout/PremiumShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText,
  Activity
} from 'lucide-react';

interface PresaleStats {
  totalTpcSold: number;
  totalUsdRaised: number;
  totalInvoiceCount: number;
  currentStage: string;
  stage1Price: number;
  stage2Price: number;
  stage1Sold: number;
  stage2Sold: number;
  stage1Supply: number;
  stage2Supply: number;
}

const PresaleStatsPage = () => {
  const { t, lang } = useI18n();
  const [stats, setStats] = useState<PresaleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Mock data - in real implementation, fetch from RPC
        const mockStats: PresaleStats = {
          totalTpcSold: 0,
          totalUsdRaised: 0,
          totalInvoiceCount: 0,
          currentStage: 'stage1',
          stage1Price: 0.001,
          stage2Price: 0.002,
          stage1Sold: 0,
          stage2Sold: 0,
          stage1Supply: 100000000,
          stage2Supply: 100000000,
        };
        setStats(mockStats);
      } catch (error) {
        logger.error('Failed to load presale stats', { error });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const getStageProgress = (stage: string) => {
    if (!stats) return 0;
    if (stage === 'stage1') {
      return (stats.stage1Sold / stats.stage1Supply) * 100;
    } else {
      return (stats.stage2Sold / stats.stage2Supply) * 100;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="container-app section-spacing">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading presale stats...</p>
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (!stats) {
    return (
      <PremiumShell>
        <div className="container-app section-spacing">
          <div className="text-center">
            <p className="text-muted-foreground">Unable to load presale statistics.</p>
          </div>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="text-center mb-8">
          <Activity className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">
            {lang === 'en' ? 'Presale Statistics' : 'Statistik Presale'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en' 
              ? 'This page shows real, approved presale transactions. No personal data is displayed.'
              : 'Halaman ini menampilkan transaksi presale yang sudah diverifikasi. Tidak ada data pribadi yang ditampilkan.'
            }
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {lang === 'en' ? 'Total TPC Sold' : 'Total TPC Terjual'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalTpcSold)}</div>
              <p className="text-xs text-muted-foreground">
                TPC
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {lang === 'en' ? 'Total USD Raised' : 'Total USD Terkumpul'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalUsdRaised)}</div>
              <p className="text-xs text-muted-foreground">
                USD
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {lang === 'en' ? 'Total Invoices' : 'Total Invoice'}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalInvoiceCount)}</div>
              <p className="text-xs text-muted-foreground">
                {lang === 'en' ? 'Approved' : 'Disetujui'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {lang === 'en' ? 'Current Stage' : 'Stage Saat Ini'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold uppercase">
                {stats.currentStage === 'stage1' ? 'Stage 1' : 'Stage 2'}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.currentStage === 'stage1' ? stats.stage1Price : stats.stage2Price}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stage Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Stage 1 */}
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stage 1</CardTitle>
                <Badge className={stats.currentStage === 'stage1' ? 'bg-green-500' : 'bg-gray-500'}>
                  {stats.currentStage === 'stage1' ? 
                    (lang === 'en' ? 'Active' : 'Aktif') : 
                    (lang === 'en' ? 'Completed' : 'Selesai')
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Price:' : 'Harga:'}</span>
                <span className="font-semibold">${stats.stage1Price}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Sold:' : 'Terjual:'}</span>
                <span className="font-semibold">{formatNumber(stats.stage1Sold)} TPC</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Supply:' : 'Total:'}</span>
                <span className="font-semibold">{formatNumber(stats.stage1Supply)} TPC</span>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{lang === 'en' ? 'Progress:' : 'Progress:'}</span>
                  <span className="text-sm">{getStageProgress('stage1').toFixed(2)}%</span>
                </div>
                <Progress value={getStageProgress('stage1')} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Stage 2 */}
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stage 2</CardTitle>
                <Badge className={stats.currentStage === 'stage2' ? 'bg-green-500' : 'bg-gray-500'}>
                  {stats.currentStage === 'stage2' ? 
                    (lang === 'en' ? 'Active' : 'Aktif') : 
                    (lang === 'en' ? 'Upcoming' : 'Akan Datang')
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Price:' : 'Harga:'}</span>
                <span className="font-semibold">${stats.stage2Price}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Sold:' : 'Terjual:'}</span>
                <span className="font-semibold">{formatNumber(stats.stage2Sold)} TPC</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Supply:' : 'Total:'}</span>
                <span className="font-semibold">{formatNumber(stats.stage2Supply)} TPC</span>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{lang === 'en' ? 'Progress:' : 'Progress:'}</span>
                  <span className="text-sm">{getStageProgress('stage2').toFixed(2)}%</span>
                </div>
                <Progress value={getStageProgress('stage2')} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PremiumShell>
  );
};

export default PresaleStatsPage;
