// =========================================================
// COMPLETE ROUTING SETUP WITH GUARDS
// React Router v6 configuration dengan guards
// =========================================================

import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";
import { MemberGuard, PublicGuard } from "../components/guards";

// Import pages (sesuaikan dengan struktur project Anda)
import SignUpPage from "../pages/auth/SignUp";
import SignInPage from "../pages/auth/SignIn";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import AuthCallbackPage from "../pages/auth/AuthCallback";
import OnboardingPage from "../pages/member/Onboarding";
import DashboardPage from "../pages/member/Dashboard";
// import ProfilePage from "../pages/member/Profile"; // TODO: Create this file
// import TeamPage from "../pages/member/Team"; // TODO: Create this file
// import AdminDashboard from "../pages/admin/Dashboard"; // TODO: Create this file
// import AdminUsers from "../pages/admin/Users"; // TODO: Create this file
// import AdminSettings from "../pages/admin/Settings"; // TODO: Create this file
// import NotFoundPage from "../pages/NotFound"; // TODO: Create this file
import HomePage from "../pages/Home";

// =========================================================
// ROUTER CONFIGURATION
// =========================================================

const router = createBrowserRouter([
  // PUBLIC ROUTES (tanpa auth)
  {
    path: "/",
    element: (
      <PublicGuard>
        <HomePage />
      </PublicGuard>
    ),
  },

  // AUTH ROUTES (public only, redirect jika sudah login)
  {
    path: "/signin",
    element: (
      <PublicGuard redirectTo="/member/dashboard">
        <SignInPage />
      </PublicGuard>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicGuard redirectTo="/member/dashboard">
        <SignUpPage />
      </PublicGuard>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicGuard>
        <ForgotPasswordPage />
      </PublicGuard>
    ),
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/:lang/auth/callback",
    element: <AuthCallbackPage />,
  },

  // MEMBER ROUTES (memerlukan auth + profile)
  {
    path: "/member/dashboard",
    element: (
      <MemberGuard>
        <DashboardPage />
      </MemberGuard>
    ),
  },
  {
    path: "/member/onboarding",
    element: (
      <MemberGuard>
        <OnboardingPage />
      </MemberGuard>
    ),
  },
  {
    path: "/:lang/onboarding",
    element: (
      <MemberGuard>
        <OnboardingPage />
      </MemberGuard>
    ),
  },
  // {
  //   path: "/member/profile",
  //   element: (
  //     <MemberGuard>
  //       <ProfilePage />
  //     </MemberGuard>
  //   ),
  // },
  // {
  //   path: "/member/team",
  //   element: (
  //     <MemberGuard>
  //       <TeamPage />
  //     </MemberGuard>
  //   ),
  // },

  // ADMIN ROUTES (admin only)
  // {
  //   path: "/admin",
  //   element: (
  //     <AdminGuard>
  //       <AdminDashboard />
  //     </AdminGuard>
  //   ),
  // },
  // {
  //   path: "/admin/users",
  //   element: (
  //     <AdminGuard>
  //       <AdminUsers />
  //     </AdminGuard>
  //   ),
  // },
  // {
  //   path: "/admin/settings",
  //   element: (
  //     <AdminGuard>
  //       <AdminSettings />
  //     </AdminGuard>
  //   ),
  // },

  // LEGACY ROUTES (redirect ke yang baru)
  {
    path: "/dashboard",
    loader: () => redirect("/member/dashboard"),
  },
  {
    path: "/admin/dashboard",
    loader: () => redirect("/admin"),
  },

  // 404 NOT FOUND
  {
    path: "*",
    element: <div className="min-h-screen flex items-center justify-center text-white/70">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p>Page not found</p>
      </div>
    </div>,
  },
]);

// =========================================================
// APP COMPONENT WITH ROUTER
// =========================================================

export default function App() {
  return <RouterProvider router={router} />;
}

// =========================================================
// ALTERNATIVE: NESTED ROUTES (jika menggunakan layout)
// =========================================================

// Layout components (not used in current router config)
// import { Outlet } from "react-router-dom";

// function MemberLayout() {
//   return (
//     <MemberGuard>
//       <Outlet />
//     </MemberGuard>
//   );
// }

// function AdminLayout() {
//   return (
//     <AdminGuard>
//       <Outlet />
//     </AdminGuard>
//   );
// }

// function PublicLayout() {
//   return (
//     <PublicGuard>
//       <Outlet />
//     </PublicGuard>
//   );
// }

// Nested router configuration (DISABLED - using components that don't exist)
// const nestedRouter = createBrowserRouter([
//   {
//     path: "/",
//     element: <PublicLayout />,
//     children: [
//       { index: true, element: <HomePage /> },
//       { path: "signin", element: <SignInPage /> },
//       { path: "signup", element: <SignUpPage /> },
//       { path: "forgot-password", element: <ForgotPasswordPage /> },
//     ],
//   },
//   {
//     path: "/member",
//     element: <MemberLayout />,
//     children: [
//       { index: true, loader: () => redirect("/member/dashboard") },
//       { path: "dashboard", element: <DashboardPage /> },
//       { path: "onboarding", element: <OnboardingPage /> },
//       { path: "profile", element: <ProfilePage /> },
//       { path: "team", element: <TeamPage /> },
//     ],
//   },
//   {
//     path: "/admin",
//     element: <AdminLayout />,
//     children: [
//       { index: true, element: <AdminDashboard /> },
//       { path: "users", element: <AdminUsers /> },
//       { path: "settings", element: <AdminSettings /> },
//     ],
//   },
//   {
//     path: "*",
//     element: <NotFoundPage />,
//   },
// ]);

// =========================================================
// ROUTE GUARDS HOOKS
// =========================================================

import { useLocation, useParams } from "react-router-dom";

/**
 * Hook untuk mendapatkan current route info
 */
export function useRouteInfo() {
  const location = useLocation();
  const params = useParams();

  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    key: location.key,
    params,
    // Helper functions
    isMemberRoute: location.pathname.startsWith("/member"),
    isAdminRoute: location.pathname.startsWith("/admin"),
    isAuthRoute: ["/signin", "/signup", "/forgot-password"].includes(location.pathname),
    isPublicRoute: !location.pathname.startsWith("/member") && !location.pathname.startsWith("/admin"),
  };
}

// =========================================================
// REDIRECT HELPERS
// =========================================================

/**
 * Loader function untuk auto-redirect
 */
export function createRedirectLoader(to: string) {
  return () => redirect(to);
}

/**
 * Common redirect loaders
 */
export const redirectLoaders = {
  toDashboard: createRedirectLoader("/member/dashboard"),
  toAdmin: createRedirectLoader("/admin"),
  toOnboarding: createRedirectLoader("/member/onboarding"),
  toSignIn: createRedirectLoader("/signin"),
};
