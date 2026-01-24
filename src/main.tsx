import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import App from './App.tsx';
import ErrorBoundary from './components/system/ErrorBoundary.tsx';
import { I18nProvider } from './i18n';
import { setupChunkRecovery, clearChunkReloadFlag } from './utils/chunkRecovery';
import { getBuildInfo } from './lib/buildInfo';
import './index.css';

// Log build info (production proof)
console.info("[BUILD]", getBuildInfo());

// Setup chunk recovery for handling chunk load errors
setupChunkRecovery();

// Clear chunk reload flag on successful load
clearChunkReloadFlag();

// HARD UNREGISTER Service Worker and clear caches (production fix)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  
  // Clear caches created by SW
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}

// Service Worker: DISABLED for now to prevent caching issues
// if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch(() => {
//       // Service worker registration failed, continue without it
//     });
//   });
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <I18nProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </I18nProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
