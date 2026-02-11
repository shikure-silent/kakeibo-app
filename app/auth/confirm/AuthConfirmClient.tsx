"use client";

import { type EmailOtpType } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { setFlashToast } from "../../../lib/flashToast";

export default function AuthConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/";
    const hash =
      typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    const hashParams = new URLSearchParams(hash);
    const hashType = hashParams.get("type") as EmailOtpType | null;
    const hasHashTokens =
      !!hashType &&
      !!hashParams.get("access_token") &&
      !!hashParams.get("refresh_token");

    // Some links arrive with access/refresh tokens in hash instead of token_hash query.
    if ((!token_hash || !type) && hasHashTokens) {
      setSuccessToastIfNeeded(hashType);
      router.replace(hashType === "recovery" ? "/reset-password" : next);
      return;
    }

    if (!token_hash || !type) {
      router.replace("/error");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      router.replace("/error");
      return;
    }

    let cancelled = false;

    void (async () => {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash });
      if (cancelled) return;
      if (error) {
        // Avoid leaving a partial session if verification failed.
        await supabase.auth.signOut();
        router.replace("/error");
        return;
      }
      setSuccessToastIfNeeded(type);
      router.replace(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-10 space-y-2">
      <h1 className="text-xl font-semibold text-slate-900">確認中...</h1>
      <p className="text-sm text-slate-600">
        メールの確認リンクを検証しています。画面が切り替わるまでお待ちください。
      </p>
    </main>
  );
}
    const setSuccessToastIfNeeded = (otpType: EmailOtpType | null) => {
      if (otpType !== "signup") return;
      setFlashToast({
        message: "メール確認が完了し、ログインしました。",
        tone: "success",
      });
    };
