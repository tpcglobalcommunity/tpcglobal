import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { AlertTriangle, Shield, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AntiScamFaqPage = () => {
  const { t } = useI18n();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const faqs = [
    {
      question: "Apakah admin pernah DM duluan?",
      answer: "TIDAK. Admin TPC TIDAK PERNAH menghubungi user duluan lewat DM, WA, atau Telegram pribadi. Jika ada yang chat duluan mengaku admin, itu PENIPU."
    },
    {
      question: "Apakah ada jaminan profit?",
      answer: "TIDAK ADA. TPC adalah platform edukasi-only. Kami tidak menjanjikan profit, ROI, atau hasil pasti apapun. Semua trading ada risiko."
    },
    {
      question: "Cara beli resmi?",
      answer: "Hanya melalui website resmi https://tpcglobal.io. Klik menu 'Buy TPC (Presale)', isi data, dan ikuti petunjuk. Proses otomatis, tidak perlu chat admin."
    },
    {
      question: "Wallet resmi yang mana?",
      answer: "Semua wallet resmi hanya ada di halaman https://tpcglobal.io/verified. Jangan pernah transfer ke alamat yang dikirim lewat chat pribadi."
    },
    {
      question: "Bagaimana cek invoice?",
      answer: "Setelah beli, Anda dapat nomor invoice. Cek statusnya langsung di website: https://tpcglobal.io/invoice/[nomor-invoice]. Bisa dicek kapanpun tanpa perlu chat admin."
    }
  ];

  const standardReply = `Halo,
TPC tidak pernah melayani pembelian lewat chat pribadi.

Silakan cek informasi resmi dan cara beli aman
langsung di website:
https://tpcglobal.io
Terima kasih.`;

  const safeBuyingSteps = [
    "Buka website resmi: https://tpcglobal.io",
    "Klik menu 'Buy TPC (Presale)'",
    "Isi data dengan benar dan ikuti petunjuk",
    "Setelah submit, sistem akan membuat INVOICE",
    "Invoice juga dikirim ke email Anda",
    "Admin TIDAK PERNAH chat duluan",
    "Semua proses bisa dicek sendiri lewat website"
  ];

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-6 text-gradient-gold">
            Cara Beli TPC Dengan Aman
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Panduan lengkap dan aman untuk pembelian TPC
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Anti-Scam Protection
          </Badge>
        </div>

        {/* Official Announcement */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <AlertTriangle className="h-5 w-5" />
                PENGUMUMAN RESMI TPC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-semibold">⚠️ PENGUMUMAN RESMI TPC</p>
              <p>TPC adalah komunitas edukasi & teknologi trading.</p>
              <p className="text-red-500 font-semibold">Kami TIDAK PERNAH menjanjikan profit, ROI, atau hasil pasti.</p>
              
              <div className="space-y-2">
                <p className="text-red-500">❌ Admin TIDAK pernah DM / WA / Telegram pribadi</p>
                <p className="text-red-500">❌ Tidak ada airdrop, giveaway, atau bonus via chat</p>
                <p className="text-red-500">❌ Tidak ada link di luar website resmi</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-green-600">✅ Informasi & pembelian resmi HANYA melalui:</p>
                <p className="text-blue-600 font-semibold">🌐 https://tpcglobal.io</p>
              </div>
              
              <p className="text-red-500 font-semibold">
                Jika ada yang mengatasnamakan TPC via chat pribadi, ITU BUKAN KAMI.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Safe Buying Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Cara Beli TPC yang AMAN:</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {safeBuyingSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
              
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  🚨 Jika ada yang menghubungi Anda lewat chat pribadi dan mengaku admin TPC — itu PENIPU.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Standard Reply Template */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Kalimat Standar Jawab DM</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(standardReply)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Salin
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-foreground">
                  {standardReply}
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Gunakan persis seperti ini, jangan improvisasi.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Official Links */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Link Resmi TPC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold">Website Resmi</p>
                  <p className="text-sm text-muted-foreground">https://tpcglobal.io</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://tpcglobal.io" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold">Verifikasi Wallet</p>
                  <p className="text-sm text-muted-foreground">https://tpcglobal.io/verified</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://tpcglobal.io/verified" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Disclaimer */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Education-Only • No Financial Advice • High Risk
          </p>
        </div>
      </div>
    </PremiumShell>
  );
};

export default AntiScamFaqPage;
