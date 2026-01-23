import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext.tsx';
import App from './App.tsx';
import ErrorBoundary from './components/system/ErrorBoundary.tsx';
import { setupChunkRecovery, clearChunkReloadFlag } from './utils/chunkRecovery';
import './index.css';

// Setup chunk recovery for handling chunk load errors
setupChunkRecovery();

// Clear chunk reload flag on successful load
clearChunkReloadFlag();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, continue without it
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
