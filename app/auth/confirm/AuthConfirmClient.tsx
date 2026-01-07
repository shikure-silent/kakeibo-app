"use client";

import { type EmailOtpType } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function AuthConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/";

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
      router.replace(error ? "/error" : next);
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
