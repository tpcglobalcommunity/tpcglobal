// src/components/Router.tsx (REPLACE ALL - FINAL SINGLE SOURCE OF TRUTH)

import React, { useEffect, useMemo, useState } from "react";
import type { Language } from "@/i18n";
import { getLanguageFromPath } from "@/i18n";
import { normalizePathname } from "@/utils/langPath";

// -------------------------
// URL helpers
// -------------------------
function splitUrl(url: string) {
  const hashIndex = url.indexOf("#");
  const qIndex = url.indexOf("?");
  const cut = (i: number) => (i >= 0 ? i : Infinity);

  const endPath = Math.min(cut(qIndex), cut(hashIndex));
  const pathname = url.slice(0, endPath === Infinity ? url.length : endPath) || "/";
  const search = qIndex >= 0 ? url.slice(qIndex, hashIndex >= 0 ? hashIndex : url.length) : "";
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  return { pathname, search, hash };
}

function getFullCurrentUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

// -------------------------
// Router hook (single source of truth)
// -------------------------
export default function Router() {
  const [url, setUrl] = useState<string>(() => getFullCurrentUrl());

  useEffect(() => {
    const onChange = () => setUrl(getFullCurrentUrl());
    window.addEventListener("popstate", onChange);
    window.addEventListener("hashchange", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("hashchange", onChange);
    };
  }, []);

  const { pathname, search, hash } = useMemo(() => splitUrl(url), [url]);

  // Normalize pathname using ONE canonical utility
  const normalized = useMemo(() => normalizePathname(pathname), [pathname]);

  const lang = useMemo<Language>(() => {
    // Prefix always wins; fallback to storage/default inside getLanguageFromPath
    return getLanguageFromPath(normalized.pathname);
  }, [normalized.pathname]);

  // Hard redirect gate (replace only if needed)
  useEffect(() => {
    if (!normalized.redirect) return;

    const nextUrl = `${normalized.pathname}${search}${hash}`;
    window.history.replaceState({}, "", nextUrl);
    setUrl(nextUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized.redirect, normalized.pathname, search, hash]);

  // Keep routes map if needed
  const routes: Record<string, React.ComponentType<{ lang: Language }>> = {};

  return { currentPath: `${normalized.pathname}${search}${hash}`, lang, routes };
}

// -------------------------
// Navigation utilities
// -------------------------
function normalizeNavTarget(to: string) {
  const { pathname, search, hash } = splitUrl(to);
  const normalized = normalizePathname(pathname);
  return { pathname: normalized.pathname, search, hash };
}

export const Link = ({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // external link fallback
    if (/^https?:\/\//i.test(to) || /^mailto:/i.test(to) || /^tel:/i.test(to)) return;

    e.preventDefault();

    const { pathname, search, hash } = normalizeNavTarget(to);
    const current = getFullCurrentUrl();
    const next = `${pathname}${search}${hash}`;

    if (current !== next) {
      window.history.pushState({}, "", next);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    onClick?.();
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export const useNavigate = () => {
  return (to: string) => {
    if (!to) return;

    if (/^https?:\/\//i.test(to) || /^mailto:/i.test(to) || /^tel:/i.test(to)) {
      window.location.href = to;
      return;
    }

    const { pathname, search, hash } = normalizeNavTarget(to);
    const current = getFullCurrentUrl();
    const next = `${pathname}${search}${hash}`;

    if (current !== next) {
      window.history.pushState({}, "", next);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };
};
