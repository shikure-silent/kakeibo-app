"use client";

import { Capacitor } from "@capacitor/core";

export function getAuthRedirectUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (Capacitor.isNativePlatform()) {
    return `capacitor://localhost${normalizedPath}`;
  }

  // For web runtime, prefer explicit app URL (e.g. production custom domain).
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}${normalizedPath}`;
  }
  if (typeof window === "undefined") {
    return normalizedPath;
  }
  return `${window.location.origin}${normalizedPath}`;
}
