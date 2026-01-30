import { useState } from 'react';
import { X, FileText, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { legalContent } from '@/content/legal';
import { useLanguage } from '@/hooks/useLanguage';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'risk' | 'disclaimer';
}

export function LegalModal({ isOpen, onClose, defaultTab = 'terms' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'risk' | 'disclaimer'>(defaultTab);
  const { language } = useLanguage();
  const content = legalContent[language];

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'terms':
        return <FileText className="w-4 h-4" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'disclaimer':
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'terms':
        return language === 'en' ? 'Terms & Conditions' : 'Syarat & Ketentuan';
      case 'risk':
        return language === 'en' ? 'Risk Disclosure' : 'Pengungkapan Risiko';
      case 'disclaimer':
        return language === 'en' ? 'Disclaimer' : 'Penafian';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {getTabTitle(activeTab)}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            {language === 'en' 
              ? 'Read the Terms, Risk Disclosure, and Disclaimer before proceeding.'
              : 'Baca Syarat, Risiko, dan Disklaimer sebelum melanjutkan.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'terms' | 'risk' | 'disclaimer')}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="terms" className="flex items-center gap-2">
                {getTabIcon('terms')}
                <span className="hidden sm:inline">
                  {language === 'en' ? 'Terms' : 'Syarat'}
                </span>
              </TabsTrigger>
              <TabsTrigger value="risk" className="flex items-center gap-2">
                {getTabIcon('risk')}
                <span className="hidden sm:inline">
                  {language === 'en' ? 'Risk' : 'Risiko'}
                </span>
              </TabsTrigger>
              <TabsTrigger value="disclaimer" className="flex items-center gap-2">
                {getTabIcon('disclaimer')}
                <span className="hidden sm:inline">
                  {language === 'en' ? 'Disclaimer' : 'Penafian'}
                </span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-4">
                <TabsContent value="terms" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {content.terms.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risk" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {content.risk.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="disclaimer" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {content.disclaimer.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={onClose} className="min-w-[100px]">
              {language === 'en' ? 'Close' : 'Tutup'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
