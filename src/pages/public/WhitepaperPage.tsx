import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent } from '../../components/ui/Card';

export function WhitepaperPage() {

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Whitepaper
            </h1>
            <p className="text-xl text-text-secondary">
              Comprehensive documentation of TPC Global ecosystem
            </p>
          </div>

          <Card className="mb-12">
            <CardContent className="p-8">
              <p className="text-white mb-4">
                The TPC Global whitepaper provides detailed information about our technology, tokenomics, and roadmap.
              </p>
              <p className="text-text-secondary">
                Full whitepaper coming soon with comprehensive technical documentation.
              </p>
            </CardContent>
          </Card>

          <OfficialWalletsCard />
        </div>
      </div>
    </div>
  );
}
