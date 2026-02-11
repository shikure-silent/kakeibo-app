"use client";

import { useCallback, useEffect, useRef } from "react";
import { exportKakeiboDump } from "./cloudSync";
import { saveKakeiboState } from "./kakeiboStateRepo";
import { useSupabaseAuth } from "./useSupabaseAuth";

export const LAST_CLOUD_SAVE_AT_KEY = "kakeibo_last_cloud_save_at";
export const CLOUD_AUTO_SAVED_EVENT = "kakeibo-cloud-autosaved";

type Options = {
  includeSettings?: boolean;
  throttleMs?: number;
  intervalMs?: number;
  enabled?: boolean;
};

export function useCloudAutoSaveOnLeave(options?: Options) {
  const { supabase, user } = useSupabaseAuth();
  const includeSettings = options?.includeSettings ?? true;
  const throttleMs = options?.throttleMs ?? 3000;
  const intervalMs = options?.intervalMs ?? 8000;
  const enabled = options?.enabled ?? true;
  const lastSavedRef = useRef(0);

  const saveNow = useCallback((force = false) => {
    if (!enabled || !supabase || !user) return;
    const now = Date.now();
    if (!force && now - lastSavedRef.current < throttleMs) return;
    lastSavedRef.current = now;
    const dump = exportKakeiboDump({ includeSettings });
    void (async () => {
      try {
        await saveKakeiboState(supabase, user.id, dump);
        if (typeof window !== "undefined") {
          localStorage.setItem(LAST_CLOUD_SAVE_AT_KEY, String(now));
          window.dispatchEvent(
            new CustomEvent(CLOUD_AUTO_SAVED_EVENT, { detail: { at: now } })
          );
        }
      } catch {
        // Ignore here; callers can still use manual restore path.
      }
    })();
  }, [enabled, supabase, user, includeSettings, throttleMs]);

  useEffect(() => {
    if (!enabled) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        saveNow(true);
      }
    };
    const onPageHide = () => saveNow(true);
    const onBeforeUnload = () => saveNow(true);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [saveNow, enabled]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        saveNow();
      }
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, saveNow]);
}
