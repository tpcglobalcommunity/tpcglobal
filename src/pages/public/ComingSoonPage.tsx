import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  const { t, withLang } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(withLang('/'))}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-gold" />
              </div>
              <CardTitle className="text-3xl text-gold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-text-secondary mb-6">
                This feature is coming soon! We're working hard to bring you the best experience.
              </p>
              <p className="text-text-secondary mb-8">
                Stay tuned for updates and announcements about the launch of {title}.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(withLang('/'))}>
                  Back to Home
                </Button>
                <Button variant="outline" onClick={() => navigate(withLang('/verified'))}>
                  Verify Wallets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
