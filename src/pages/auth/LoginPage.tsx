import { useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";
import { PRIMARY_SITE_URL } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { PremiumShell } from "@/components/layout/PremiumShell";

const LoginPage = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${PRIMARY_SITE_URL}/dashboard`,
      },
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success(t("auth.checkEmail"));
    }
  };

  return (
    <PremiumShell showBottomNav={false}>
      <div className="container-app section-spacing">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">{t("auth.loginTitle")}</h1>
            <p className="text-muted-foreground">{t("auth.loginSubtitle")}</p>
          </div>

          {sent ? (
            <div className="card-premium p-8 text-center">
              <p className="text-success">{t("auth.checkEmail")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-gold-glow" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                {t("auth.sendMagicLink")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PremiumShell>
  );
};

export default LoginPage;
