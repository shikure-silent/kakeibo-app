// lib/useSupabaseAuth.ts
"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabaseClient";

export function useSupabaseAuth() {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error(error);
          setUser(null);
        } else {
          setUser(data.session?.user ?? null);
        }
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setUser(null);
        setIsLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return { supabase, user, isLoading };
}
