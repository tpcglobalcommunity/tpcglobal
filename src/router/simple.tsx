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
// ROUTE HELPERS
// =========================================================

export const routePaths = {
  home: "/",
  signup: "/signup",
  signin: "/signin",
  onboarding: "/member/onboarding",
  dashboard: "/member/dashboard",
};

export const isMemberRoute = (pathname: string): boolean => {
  return pathname.startsWith("/member");
};

export const isPublicRoute = (pathname: string): boolean => {
  return ["/", "/signup", "/signin"].includes(pathname);
};

export const getRequiredAuth = (pathname: string): string => {
  if (isPublicRoute(pathname)) return "none";
  if (isMemberRoute(pathname)) return "member";
  return "unknown";
};
