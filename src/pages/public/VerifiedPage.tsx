import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

const VerifiedPage = () => {
  const { t, lang, withLang } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="container-app section-spacing">
      <div className="max-w-md mx-auto">
        <Card className="card-premium">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">
              {lang === 'id' ? 'Terverifikasi' : 'Verified'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              {lang === 'id' 
                ? 'Email Anda telah berhasil diverifikasi.' 
                : 'Your email has been successfully verified.'}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(withLang('/'))}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                onClick={() => navigate(withLang('/buytpc'))}
                variant="outline"
                className="w-full"
              >
                {lang === 'id' ? 'Beli TPC' : 'Buy TPC'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifiedPage;
