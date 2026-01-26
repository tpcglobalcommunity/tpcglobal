import { useEffect, useMemo, useState } from "react";
import { normalizePathname, storeLanguage, type Language } from "./utils/langPath";

import AppHeader from "./components/AppHeader";
import LegalFooter from "./components/LegalFooter";
import BottomNav from "./components/BottomNav";
import AuthLayout from "./components/auth/AuthLayout";
import GlobalBanner from "./components/system/GlobalBanner";
import ToastHost from "./components/ui/ToastHost";

import Home from "./pages/home/Home";
import Docs from "./pages/Docs";
import DAOLite from "./pages/DAOLite";
import Transparency from "./pages/transparency/Transparency";
import CommunityFund from "./pages/CommunityFund";
import Legal from "./pages/legal/Legal";
import LaunchChecklist from "./pages/LaunchChecklist";
import Security from "./pages/Security";
import Support from "./pages/Support";
import Whitepaper from "./pages/Whitepaper";
import Roadmap from "./pages/Roadmap";
import FaqPage from "./pages/FaqPage";
import MarketplaceList from "./pages/marketplace/MarketplaceList";
import MarketplaceDetail from "./pages/marketplace/MarketplaceDetail";

import SignUpPage from "./pages/auth/SignUpPage";
import SignIn from "./pages/auth/SignIn";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import CheckEmailPage from "./pages/auth/CheckEmailPage";

import VerifyPage from "./pages/VerifyPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";

import MaintenancePage from "./pages/system/MaintenancePage";

import CompleteProfile from "./pages/member/CompleteProfilePage";
import WelcomePage from "./pages/member/WelcomePage";
import MemberHome from "./pages/member/MemberHome";
import MemberDashboardPage from "./pages/member/MemberDashboardPage";
import ProgramsPage from "./pages/member/ProgramsPage";
import MemberVerifyPage from "./pages/member/VerifyPage";
import UpdateProfit from "./pages/member/UpdateProfit";
import NotificationsPage from "./pages/member/NotificationsPage";
import MemberSettingsPage from "./pages/member/MemberSettingsPage";
import WalletPage from "./pages/member/WalletPage";
import Services from "./pages/member/Services";
import SecurityPage from "./pages/member/SecurityPage";
import ProfilePage from "./pages/member/ProfilePage";
import AnnouncementsPage from "./pages/member/AnnouncementsPage";
import ReferralsPage from "./pages/member/ReferralsPage";
import DirectoryPage from "./pages/member/DirectoryPage";
import ApplyVendor from "./pages/member/vendor/ApplyVendor";

import MemberGate from "./components/guards/MemberGuard";
import ProfileGate from "./components/guards/ProfileGate";
import MemberStatusGuard from "./components/member/MemberGuard";
import AdminGuard from "./components/guards/AdminGuard";
import AdminLayout from "./layouts/AdminLayout";

import NewsEditorPage from "./pages/admin/NewsEditorPage";
import NewsAdminListPage from "./pages/admin/NewsAdminListPage";
import AnnouncementsAdminListPage from "./pages/admin/AnnouncementsAdminListPage";
import AnnouncementEditorPage from "./pages/admin/AnnouncementEditorPage";
import AuthLogsPage from "./pages/admin/AuthLogsPage";
import VerificationQueuePage from "./pages/admin/VerificationQueuePage";
import MemberDetailPage from "./pages/admin/MemberDetailPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import EmailQueuePage from "./pages/admin/EmailQueuePage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminBroadcastCenter from "./pages/admin/AdminBroadcastCenter";
import AdminTransparencyPage from "./pages/admin/AdminTransparencyPage";
import WalletTiersPage from "./pages/admin/WalletTiersPage";
import VendorReview from "./pages/admin/vendors/VendorReview";
import RouteRedirect from "./components/RouteRedirect";

// New admin pages
import AdminIndex from "./pages/admin/AdminIndex";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import VerificationRequired from "./pages/member/VerificationRequired";


import { getAppSettings, type AppSettings } from "./lib/settings";
import { supabase } from "./lib/supabase";

function getFullPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function normalizeFullUrl(): { full: string; lang: Language; redirected: boolean } {
  const { pathname, search, hash } = window.location;
  const norm = normalizePathname(pathname);

  // persist lang always
  storeLanguage(norm.lang);

  const full = `${norm.pathname}${search ?? ""}${hash ?? ""}`;
  const current = `${pathname}${search ?? ""}${hash ?? ""}`;
  return { full, lang: norm.lang, redirected: norm.redirect && full !== current };
}

export default function App() {
  const [currentFullPath, setCurrentFullPath] = useState<string>(() => getFullPath());
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // HARD LOCK: Normalize on every navigation (initial + popstate + pushState/replaceState)
  useEffect(() => {
    const apply = () => {
      const { full, redirected } = normalizeFullUrl();
      if (redirected) {
        window.history.replaceState({}, "", full);
      }
      setCurrentFullPath(full);
    };

    // initial
    apply();

    // back/forward
    window.addEventListener("popstate", apply);

    // patch pushState/replaceState so SPA navigations also normalize
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;

    window.history.pushState = function (...args: any[]) {
      origPush.apply(window.history, args as any);
      apply();
    } as any;

    window.history.replaceState = function (...args: any[]) {
      origReplace.apply(window.history, args as any);
      apply();
    } as any;

    return () => {
      window.removeEventListener("popstate", apply);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  // Extract lang from normalized path (guaranteed)
  const lang = useMemo(() => {
    const m = currentFullPath.match(/^\/(en|id)(\/|$)/);
    return ((m?.[1] as Language) ?? "en");
  }, [currentFullPath]);

  // Only pathname for route decisions
  const currentPath = useMemo(() => {
    const pathnameOnly = currentFullPath.split("?")[0].split("#")[0];
    return pathnameOnly;
  }, [currentFullPath]);

  const pathWithoutLang = useMemo(
    () => currentPath.replace(/^\/(en|id)(?=\/|$)/, "") || "/",
    [currentPath]
  );

  // Fetch settings once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await getAppSettings(supabase);
        if (!alive) return;
        setAppSettings(s);
      } catch {
        if (!alive) return;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Maintenance redirect (keep lang, SPA replace)
  useEffect(() => {
    if (!appSettings) return;
    if (appSettings.maintenance_mode === true && !currentPath.includes("/maintenance")) {
      const target = `/${lang}/maintenance`;
      window.history.replaceState({}, "", target);
      setCurrentFullPath(target);
    }
  }, [appSettings, lang, currentPath]);

  const isAuthPage = useMemo(() => {
    return ["/signin", "/signup", "/forgot", "/reset"].includes(pathWithoutLang);
  }, [pathWithoutLang]);

  const isAdminPage = useMemo(() => {
    return pathWithoutLang.startsWith("/admin");
  }, [pathWithoutLang]);

  const shouldShowBottomNav = !isAuthPage && !isAdminPage;

  // Maintenance gate - FINAL RULE
  const maintenanceOn = appSettings?.maintenance_mode === true;
  const isMaintenanceRoute = pathWithoutLang === "/maintenance";
  const authBypassRoutes = ["/login", "/signup", "/forgot", "/verify", "/invite", "/magic"];
  const isAuthBypassRoute = authBypassRoutes.includes(pathWithoutLang);

  if (maintenanceOn && !isAdminPage && !isMaintenanceRoute && !isAuthBypassRoute) {
    return <MaintenancePage lang={lang} />;
  }

  const renderPage = () => {
    // MARKETPLACE ADMIN REDIRECT ALIASES - Must be checked BEFORE marketplace detail
    if (pathWithoutLang === "/marketplace/admin/vendor") {
      return (
        <RouteRedirect to={`/${lang}/admin/vendors`} />
      );
    }
    if (pathWithoutLang === "/marketplace/admin/vendors") {
      return (
        <RouteRedirect to={`/${lang}/admin/vendors`} />
      );
    }
    if (pathWithoutLang === "/marketplace/admin/control") {
      return (
        <RouteRedirect to={`/${lang}/admin/control`} />
      );
    }
    if (pathWithoutLang === "/marketplace/admin") {
      return (
        <RouteRedirect to={`/${lang}/admin/vendors`} />
      );
    }

    // MARKETPLACE DETAIL ROUTE - HIGHEST PRIORITY (must be checked first)
    if (pathWithoutLang.startsWith("/marketplace/") && pathWithoutLang !== "/marketplace") {
      const slug = pathWithoutLang.replace("/marketplace/", "");
      return <MarketplaceDetail lang={lang} slug={slug} />;
    }

    // HOME: /en or /id (index)
    if (pathWithoutLang === "/" || pathWithoutLang === "" || pathWithoutLang === "/home") {
      return <Home lang={lang} />;
    }

    // Admin special routes first
    if (pathWithoutLang === "/admin/news") return <NewsAdminListPage />;
    if (pathWithoutLang === "/admin/news/new") return <NewsEditorPage />;
    if (pathWithoutLang.startsWith("/admin/news/") && pathWithoutLang.endsWith("/edit")) {
      const postId = pathWithoutLang.replace("/admin/news/", "").replace("/edit", "");
      return <NewsEditorPage postId={postId} />;
    }

    if (pathWithoutLang === "/admin/announcements") return <AnnouncementsAdminListPage lang={lang} />;
    if (pathWithoutLang === "/admin/announcements/new") return <AnnouncementEditorPage lang={lang} />;
    if (pathWithoutLang.startsWith("/admin/announcements/") && pathWithoutLang.endsWith("/edit")) {
      const announcementId = pathWithoutLang.replace("/admin/announcements/", "").replace("/edit", "");
      return <AnnouncementEditorPage lang={lang} announcementId={announcementId} />;
    }

    // Public profile
    if (pathWithoutLang.startsWith("/u/")) {
      const username = pathWithoutLang.replace("/u/", "");
      return <PublicProfilePage lang={lang} username={username} />;
    }

    // News detail
    if (pathWithoutLang.startsWith("/news/")) {
      const slug = pathWithoutLang.replace("/news/", "");
      return <NewsDetailPage slug={slug} />;
    }

    switch (pathWithoutLang) {
      case "/docs":
        return <Docs lang={lang} />;
      case "/dao":
        return <DAOLite lang={lang} />;
      case "/transparency":
        return <Transparency lang={lang} />;
      case "/fund":
        return <CommunityFund lang={lang} />;
      case "/legal":
        return <Legal lang={lang} />;
      case "/whitepaper":
        return <Whitepaper lang={lang} />;
      case "/roadmap":
        return <Roadmap lang={lang} />;
      case "/faq":
        return <FaqPage lang={lang} />;
      case "/launch":
        return <LaunchChecklist lang={lang} />;
      case "/security":
        return <Security lang={lang} />;
      case "/support":
        return <Support lang={lang} />;

      // Marketplace list route (detail handled above)
      case "/marketplace":
        return <MarketplaceList lang={lang} />;

      case "/signup":
        return <SignUpPage lang={lang} />;
      case "/signin":
        return <SignIn />;
      case "/admin/login":
        return <SignIn lang={lang} />;
      case "/forgot":
        return <ForgotPassword lang={lang} />;
      case "/reset":
        return <ResetPassword lang={lang} />;
      case "/check-email":
        return <CheckEmailPage lang={lang} />;

      // Verify
      case "/verify":
        return <VerifyPage lang={lang} />;

      // News list
      case "/news":
        return <NewsPage />;

      // Maintenance route
      case "/maintenance":
        return <MaintenancePage lang={lang} />;

      // Profile completion
      case "/complete-profile":
      case "/member/complete-profile":
        return <CompleteProfile lang={lang} />;

      // MEMBER AREA
      case "/member":
        return (
          <MemberGate>
            <ProfileGate>
              <MemberHome lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/welcome":
        return <WelcomePage lang={lang} />;

      case "/member/dashboard":
        return (
          <MemberStatusGuard lang={lang} allowPending={true}>
            <MemberDashboardPage lang={lang} />
          </MemberStatusGuard>
        );

      case "/member/update-profit":
        return (
          <MemberStatusGuard lang={lang} allowPending={false}>
            <UpdateProfit lang={lang} />
          </MemberStatusGuard>
        );

      case "/member/programs":
        return (
          <MemberStatusGuard lang={lang}>
            <ProgramsPage lang={lang} />
          </MemberStatusGuard>
        );

      case "/member/verify":
        return (
          <MemberStatusGuard lang={lang}>
            <MemberVerifyPage lang={lang} />
          </MemberStatusGuard>
        );

      case "/member/notifications":
        return (
          <MemberStatusGuard lang={lang}>
            <NotificationsPage lang={lang} />
          </MemberStatusGuard>
        );

      case "/member/settings":
        return (
          <MemberStatusGuard lang={lang}>
            <MemberSettingsPage lang={lang} />
          </MemberStatusGuard>
        );

      case "/member/wallet":
        return (
          <MemberStatusGuard lang={lang}>
            <WalletPage />
          </MemberStatusGuard>
        );

      case "/member/security":
        return (
          <MemberGate>
            <ProfileGate>
              <SecurityPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/profile":
        return (
          <MemberGate>
            <ProfileGate>
              <ProfilePage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/announcements":
        return (
          <MemberGate>
            <ProfileGate>
              <AnnouncementsPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/referrals":
        return (
          <MemberGate>
            <ProfileGate>
              <ReferralsPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/directory":
        return (
          <MemberGate>
            <ProfileGate>
              <DirectoryPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/vendor/apply":
        return (
          <MemberGate>
            <ProfileGate>
              <ApplyVendor lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/verification":
        return (
          <MemberGate>
            <ProfileGate>
              <VerificationRequired lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      case "/member/services":
        return (
          <MemberGate>
            <ProfileGate>
              <Services lang={lang} />
            </ProfileGate>
          </MemberGate>
        );

      // ADMIN PAGES (guarded with AdminLayout)
      case "/admin":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AdminIndex lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/control":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <RouteRedirect to={`/${lang}/admin`} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/members":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AdminMembers lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/vendors":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <VendorReview lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/vendors/review":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <RouteRedirect to={`/${lang}/admin/vendors`} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/marketplace":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AdminMarketplace lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/settings":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AdminSettingsPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      // Legacy admin pages (keep existing ones for compatibility)
      case "/admin/auth-logs":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AuthLogsPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/verification":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <VerificationQueuePage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/member":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <MemberDetailPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/audit":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AuditLogPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/email-queue":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <EmailQueuePage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      case "/admin/broadcast":
        return (
          <AdminGuard lang={lang}>
            <AdminBroadcastCenter />
          </AdminGuard>
        );

      case "/admin/wallet-tiers":
        return (
          <AdminGuard lang={lang}>
            <WalletTiersPage lang={lang} />
          </AdminGuard>
        );

      case "/admin/transparency-input":
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AdminTransparencyPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );

      default:
        return <Home lang={lang} />;
    }
  };

  if (isAuthPage) {
    return <AuthLayout lang={lang}>{renderPage()}</AuthLayout>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalBanner lang={lang} />
      <AppHeader lang={lang} currentPath={currentPath} />
      <main className={`flex-1 ${shouldShowBottomNav ? "pb-[calc(72px+env(safe-area-inset-bottom)+16px)] xl:pb-0" : ""}`}>
        {renderPage()}
      </main>
      <LegalFooter lang={lang} />
      <ToastHost lang={lang} />
      {shouldShowBottomNav && <BottomNav lang={lang} currentPath={currentPath} />}
    </div>
  );
}
