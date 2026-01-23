import React from "react";

type Props = { title?: string; message?: string };

export default function RouterSafeErrorFallback({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try refreshing the page or return to the home page.",
}: Props) {
  const goHome = () => {
    // Always land on language root if present, else /
    const p = window.location.pathname || "/";
    const m = p.match(/^\/(en|id)(\/|$)/);
    const langRoot = m ? `/${m[1]}` : "/";
    window.location.assign(langRoot);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 18, border: "1px solid rgba(255,255,255,.12)", padding: 18 }}>
        <div style={{ display: "grid", gap: 10, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{title}</div>
          <div style={{ opacity: 0.8, lineHeight: 1.5 }}>{message}</div>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ height: 44, borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700 }}
            >
              Reload Page
            </button>
            <button
              onClick={goHome}
              style={{ height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "transparent", cursor: "pointer", fontWeight: 700 }}
            >
              Go Home
            </button>
          </div>

          <div style={{ marginTop: 10, opacity: 0.6, fontSize: 12 }}>
            If this problem persists, please contact support or join our community.
          </div>
        </div>
      </div>
    </div>
  );
}
