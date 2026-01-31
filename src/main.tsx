import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "@/i18n/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import MetaTags from "@/components/MetaTags";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
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
        <App />
      </TooltipProvider>
    </I18nProvider>
  </BrowserRouter>
);
