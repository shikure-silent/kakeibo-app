"use client";

import { useCallback, useEffect, useRef } from "react";
import { exportKakeiboDump } from "./cloudSync";
import { saveKakeiboState } from "./kakeiboStateRepo";
import { useSupabaseAuth } from "./useSupabaseAuth";

type Options = {
  includeSettings?: boolean;
  throttleMs?: number;
  enabled?: boolean;
};

export function useCloudAutoSaveOnLeave(options?: Options) {
  const { supabase, user } = useSupabaseAuth();
  const includeSettings = options?.includeSettings ?? true;
  const throttleMs = options?.throttleMs ?? 3000;
  const enabled = options?.enabled ?? true;
  const lastSavedRef = useRef(0);

  const saveNow = useCallback(() => {
    if (!enabled || !supabase || !user) return;
    const now = Date.now();
    if (now - lastSavedRef.current < throttleMs) return;
    lastSavedRef.current = now;
    const dump = exportKakeiboDump({ includeSettings });
    void saveKakeiboState(supabase, user.id, dump);
  }, [enabled, supabase, user, includeSettings, throttleMs]);

  useEffect(() => {
    if (!enabled) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") saveNow();
    };
    window.addEventListener("pagehide", saveNow);
    window.addEventListener("beforeunload", saveNow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pagehide", saveNow);
      window.removeEventListener("beforeunload", saveNow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [saveNow, enabled]);
}
