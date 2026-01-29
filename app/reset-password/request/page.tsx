"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabaseClient";

function formatAuthErrorMessage(message: string) {
  const match = message.match(/after\s+(\d+)\s+seconds?/i);
  if (message.includes("For security purposes") && match) {
    return `セキュリティのため、次のリクエストは${match[1]}秒後に再試行してください。`;
  }
  if (message.includes("For security purposes")) {
    return "セキュリティのため、しばらく待ってから再試行してください。";
  }
  return message;
}

export default function ResetPasswordRequestPage() {
  const supabase = getSupabaseClient();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canRequest = useMemo(() => email.length > 0, [email]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setMessage(null);

    if (!supabase) {
      setErrorText("Supabaseが未設定です。.env.local を確認してください。");
      return;
    }
    if (!canRequest) return;

    setBusy(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;

      setMessage(
        "再設定メールを送信しました。メール内リンクからパスワードを更新してください。"
      );
    } catch (err) {
      const rawMessage =
        err instanceof Error ? err.message : "再設定メールの送信に失敗しました。";
      setErrorText(formatAuthErrorMessage(rawMessage));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          パスワード再設定メール
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          登録済みのメールアドレスに再設定リンクを送信します。
        </p>

        {mounted && !supabase && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
            Supabaseが未設定です（環境変数が必要）。
          </div>
        )}

        <form onSubmit={handleRequest} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              メールアドレス
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="example@gmail.com"
              required
            />
          </div>

          {errorText && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
              {errorText}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!canRequest || busy || !supabase}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "送信中…" : "再設定メールを送信"}
          </button>

          <div className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/login"
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
            >
              ログイン画面へ戻る
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
