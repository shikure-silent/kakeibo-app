"use client";

import { Capacitor } from "@capacitor/core";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getSupabaseClient } from "../lib/supabaseClient";

type ParsedDeepLink = {
  rawPath: string;
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
  tokenHash: string | null;
  next: string | null;
};

function parseDeepLink(url: string): ParsedDeepLink | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith("/")) return null;

    const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
    const hashParams = new URLSearchParams(hash);
    const searchParams = parsed.searchParams;

    const accessToken =
      hashParams.get("access_token") ?? searchParams.get("access_token");
    const refreshToken =
      hashParams.get("refresh_token") ?? searchParams.get("refresh_token");
    const type = hashParams.get("type") ?? searchParams.get("type");
    const tokenHash =
      hashParams.get("token_hash") ?? searchParams.get("token_hash");
    const next = hashParams.get("next") ?? searchParams.get("next");

    return {
      rawPath: `${parsed.pathname}${parsed.search}${parsed.hash}`,
      accessToken,
      refreshToken,
      type,
      tokenHash,
      next,
    };
  } catch {
    return null;
  }
}

function resolveAppPath(link: ParsedDeepLink): string | null {
  if (!link.type) return null;

  // Newer recovery links include access/refresh tokens in hash.
  // In that case, skip /auth/confirm and go straight to reset-password.
  if (
    link.type === "recovery" &&
    link.accessToken &&
    link.refreshToken
  ) {
    return "/reset-password";
  }

  if (link.tokenHash) {
    const params = new URLSearchParams({
      type: link.type,
      token_hash: link.tokenHash,
    });
    if (link.type === "recovery") {
      params.set("next", "/reset-password");
    } else if (link.next) {
      params.set("next", link.next);
    }
    return `/auth/confirm?${params.toString()}`;
  }

  if (link.type === "recovery") {
    if (link.rawPath.startsWith("/reset-password")) return link.rawPath;
    return "/reset-password";
  }

  // signup / email_change / magiclink etc.
  if (link.rawPath.startsWith("/auth/confirm")) return link.rawPath;
  return "/auth/confirm";
}

export default function AuthDeepLinkHandler() {
  const router = useRouter();
  const lastHandledUrlRef = useRef<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleUrl = async (url: string) => {
      if (!url || lastHandledUrlRef.current === url) return;
      lastHandledUrlRef.current = url;

      const link = parseDeepLink(url);
      if (!link) return;
      const appPath = resolveAppPath(link);
      if (!appPath) return;

      try {
        if (supabase && link.accessToken && link.refreshToken) {
          await supabase.auth.setSession({
            access_token: link.accessToken,
            refresh_token: link.refreshToken,
          });
        }
      } catch (error) {
        console.error("Failed to restore auth session from deep link:", error);
      }

      router.replace(appPath);
    };

    let mounted = true;
    let removeListener: (() => void) | null = null;

    void (async () => {
      try {
        const { App: CapacitorApp } = await import("@capacitor/app");
        const launch = await CapacitorApp.getLaunchUrl();
        if (mounted && launch?.url) {
          await handleUrl(launch.url);
        }

        const listener = await CapacitorApp.addListener("appUrlOpen", (event) => {
          void handleUrl(event.url);
        });
        removeListener = () => listener.remove();
      } catch (error) {
        console.error("Failed to initialize app deep link listener:", error);
      }
    })();

    return () => {
      mounted = false;
      if (removeListener) removeListener();
    };
  }, [router, supabase]);

  return null;
}
