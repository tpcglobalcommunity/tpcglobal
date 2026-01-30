import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Globe, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const navItems = [
  { key: "nav.verified", path: "/verified" },
  { key: "nav.transparency", path: "/transparency" },
  { key: "nav.marketplace", path: "/marketplace" },
  { key: "nav.buyTpc", path: "/buytpc" },
  { key: "nav.whitepaper", path: "/whitepaper" },
  { key: "nav.dao", path: "/dao" },
  { key: "nav.antiScamFaq", path: "/anti-scam-faq" },
  { key: "nav.faq", path: "/faq" },
];

export const PublicHeader = () => {
  const { t, lang, setLang, withLang } = useI18n();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const toggleLang = () => {
    setLang(lang === "id" ? "en" : "id");
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(`/${lang}`, "") || "/";
    return currentPath === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <BrandLogo size="md" withText={true} />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={withLang(item.path)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{lang}</span>
            </Button>

            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <Link to={withLang("/login")}>{t("nav.login")}</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>
                    {lang === "en" ? "Navigation Menu" : "Menu Navigasi"}
                  </SheetTitle>
                  <SheetDescription>
                    {lang === "en" ? "Choose a page to continue." : "Pilih halaman untuk melanjutkan."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-bold text-gradient-gold">TPC Global</span>
                    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={withLang(item.path)}
                        onClick={() => setOpen(false)}
                        className={`block px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                    <div className="pt-4 border-t border-border mt-4">
                      <Link
                        to={withLang("/login")}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 rounded-lg bg-primary text-primary-foreground text-center font-medium"
                      >
                        {t("nav.login")}
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
