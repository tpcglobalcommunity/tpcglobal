/**
 * Chunk Load Recovery Utility
 * Handles ChunkLoadError for automatic recovery
 */

export function setupChunkRecovery() {
  // Only run in browser
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    const error = event.error;
    const errorMessage = error?.message || '';
    
    // Check for chunk loading errors
    if (
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('ChunkLoadError') ||
      errorMessage.includes('Failed to fetch dynamically imported module')
    ) {
      handleChunkError();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const errorMessage = error?.message || '';
    
    // Check for chunk loading errors in promises
    if (
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('ChunkLoadError') ||
      errorMessage.includes('Failed to fetch dynamically imported module')
    ) {
      handleChunkError();
    }
  });
}

function handleChunkError() {
  const DEBUG = import.meta.env.DEV && localStorage.getItem("tpc_debug") === "1";
  
  // Check if we already tried to reload
  const hasReloaded = sessionStorage.getItem("tpc_chunk_reload") === "1";
  
  if (!hasReloaded) {
    // Mark that we're about to reload
    sessionStorage.setItem("tpc_chunk_reload", "1");
    
    if (DEBUG) {
      console.log('[CHUNK RECOVERY] Reloading due to chunk error...');
    }
    
    // Hard reload to clear cache
    window.location.reload();
  } else {
    // Already reloaded once, show manual refresh message
    if (DEBUG) {
      console.error('[CHUNK RECOVERY] Already reloaded once, showing manual refresh message');
    }
    
    // Show user-friendly message (could be enhanced with toast)
    const message = 'Application updated. Please refresh the page.';
    
    // Try to show in console for debugging
    console.error(message);
    
    // Optionally show a simple alert (can be replaced with toast)
    if (!import.meta.env.DEV) {
      // In production, show a user-friendly way to refresh
      const existingOverlay = document.getElementById('tpc-chunk-error-overlay');
      if (!existingOverlay) {
        const overlay = document.createElement('div');
        overlay.id = 'tpc-chunk-error-overlay';
        overlay.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <div style="
              background: white;
              padding: 2rem;
              border-radius: 0.5rem;
              max-width: 400px;
              text-align: center;
            ">
              <h3 style="margin: 0 0 1rem 0; color: #333;">Application Updated</h3>
              <p style="margin: 0 0 1.5rem 0; color: #666;">${message}</p>
              <button onclick="window.location.reload()" style="
                background: #F0B90B;
                color: black;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.25rem;
                font-weight: 600;
                cursor: pointer;
              ">
                Refresh Page
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
      }
    }
  }
}

/**
 * Clear chunk reload flag (call on successful app load)
 */
export function clearChunkReloadFlag() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem("tpc_chunk_reload");
  }
}
