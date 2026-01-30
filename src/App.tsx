import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/i18n/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import MetaTags from "@/components/MetaTags";
import { AppRoutes } from "./routes";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <MetaTags />
          <AppRoutes />
        </TooltipProvider>
      </I18nProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
