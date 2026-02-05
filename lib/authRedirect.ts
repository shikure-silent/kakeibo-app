"use client";

import { Capacitor } from "@capacitor/core";

export function getAuthRedirectUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (Capacitor.isNativePlatform()) {
    return `capacitor://localhost${normalizedPath}`;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (typeof window === "undefined") {
    return appUrl ? `${appUrl}${normalizedPath}` : normalizedPath;
  }
  return `${window.location.origin}${normalizedPath}`;
}
