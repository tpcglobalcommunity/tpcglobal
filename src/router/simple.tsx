// =========================================================
// SIMPLE ROUTING SETUP
// Langsung gunakan OnboardingPage tanpa wrapper
// =========================================================

import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Import pages
import SignUpPage from "@/pages/auth/SignUp";
import SignInPage from "@/pages/auth/SignIn";
import OnboardingPage from "@/pages/member/OnboardingPage";
import DashboardPage from "@/pages/member/Dashboard";
import NotFoundPage from "@/pages/NotFound";

// =========================================================
// SIMPLE ROUTER CONFIG
// =========================================================

const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <div>Home Page</div>,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/signin",
    element: <SignInPage />,
  },

  // Member routes (dengan built-in guard logic)
  {
    path: "/member/onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "/member/dashboard",
    element: <DashboardPage />,
  },

  // 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

// =========================================================
// ALTERNATIVE: DENGAN GUARD (jika perlu)
// =========================================================

import MemberGuard from "@/components/guards";

const routerWithGuard = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <div>Home Page</div>,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/signin",
    element: <SignInPage />,
  },

  // Member routes dengan guard
  {
    path: "/member/onboarding",
    element: (
      <MemberGuard>
        <OnboardingPage />
      </MemberGuard>
    ),
  },
  {
    path: "/member/dashboard",
    element: (
      <MemberGuard>
        <DashboardPage />
      </MemberGuard>
    ),
  },

  // 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

// =========================================================
// ONBOARDING DENGAN AUTO-REDIRECT
// =========================================================

export default function AppWithAutoRedirect() {
  return (
    <RouterProvider router={routerWithGuard} />
  );
}

// =========================================================
// LAZY LOADING ROUTES (Performance)
// =========================================================

import { lazy, Suspense } from "react";

// Lazy load pages
const LazySignUp = lazy(() => import("@/pages/auth/SignUp"));
const LazySignIn = lazy(() => import("@/pages/auth/SignIn"));
const LazyOnboarding = lazy(() => import("@/pages/member/OnboardingPage"));
const LazyDashboard = lazy(() => import("@/pages/member/Dashboard"));

const routerWithLazy = createBrowserRouter([
  {
    path: "/",
    element: <div>Home Page</div>,
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazySignUp />
      </Suspense>
    ),
  },
  {
    path: "/signin",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazySignIn />
      </Suspense>
    ),
  },
  {
    path: "/member/onboarding",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyOnboarding />
      </Suspense>
    ),
  },
  {
    path: "/member/dashboard",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyDashboard />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

// =========================================================
// ROUTE CONFIG OBJECT (Easy management)
// =========================================================

const routes = [
  {
    path: "/",
    element: () => import("@/pages/Home"),
    public: true,
  },
  {
    path: "/signup",
    element: () => import("@/pages/auth/SignUp"),
    public: true,
  },
  {
    path: "/signin",
    element: () => import("@/pages/auth/SignIn"),
    public: true,
  },
  {
    path: "/member/onboarding",
    element: () => import("@/pages/member/OnboardingPage"),
    guard: "MemberGuard",
  },
  {
    path: "/member/dashboard",
    element: () => import("@/pages/member/Dashboard"),
    guard: "MemberGuard",
  },
];

// Generate router dari config
function createRouterFromConfig(routeConfig) {
  return createBrowserRouter(
    routeConfig.map(route => ({
      path: route.path,
      element: route.guard ? (
        <route.guard>
          <route.element />
        </route.guard>
      ) : (
        <route.element />
      ),
      lazy: true,
    }))
  );
}

// =========================================================
// ROUTE HELPERS
// =========================================================

export const routePaths = {
  home: "/",
  signup: "/signup",
  signin: "/signin",
  onboarding: "/member/onboarding",
  dashboard: "/member/dashboard",
};

export const isMemberRoute = (pathname) => {
  return pathname.startsWith("/member");
};

export const isPublicRoute = (pathname) => {
  return ["/", "/signup", "/signin"].includes(pathname);
};

export const getRequiredAuth = (pathname) => {
  if (isPublicRoute(pathname)) return "none";
  if (isMemberRoute(pathname)) return "member";
  return "unknown";
};
