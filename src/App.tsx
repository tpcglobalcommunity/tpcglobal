import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/i18n/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import MetaTags from "@/components/MetaTags";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";
import AppRoutes from "./routes";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <MetaTags />
        <AppErrorBoundary>
          <AppRoutes />
        </AppErrorBoundary>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
