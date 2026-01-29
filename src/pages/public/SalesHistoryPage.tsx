import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { getSalesHistoryPublic, type SalesHistory } from '../../lib/rpc/public';
import { formatCurrency, formatTpcAmount } from '../../lib/tokenSale';

export function SalesHistoryPage() {
  const { t } = useI18n();
  const [history, setHistory] = useState<SalesHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getSalesHistoryPublic(50);
        setHistory(data);
      } catch (error) {
        console.error('Failed to load sales history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading sales history...</p>
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
              {t('salesHistory.title')}
            </h1>
            <p className="text-xl text-text-secondary">
              {t('salesHistory.subtitle')}
            </p>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-text-secondary">{t('salesHistory.invoice')}</th>
                      <th className="text-left py-3 px-4 text-text-secondary">{t('salesHistory.stage')}</th>
                      <th className="text-left py-3 px-4 text-text-secondary">{t('salesHistory.amount')}</th>
                      <th className="text-left py-3 px-4 text-text-secondary">{t('salesHistory.total')}</th>
                      <th className="text-left py-3 px-4 text-text-secondary">{t('salesHistory.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 px-4 text-mono text-sm">{item.masked_invoice_no}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gold/20 text-gold rounded text-xs">
                            {item.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatTpcAmount(item.tpc_amount)} TPC</td>
                        <td className="py-3 px-4">{formatCurrency(item.total_usd, 'USD')}</td>
                        <td className="py-3 px-4 text-text-secondary">
                          {item.paid_at ? new Date(item.paid_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {history.length === 0 && (
                  <div className="text-center py-8 text-text-secondary">
                    No sales history available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <OfficialWalletsCard />
        </div>
      </div>
    </div>
  );
}
