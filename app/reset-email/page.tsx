"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSupabaseAuth } from "../../lib/useSupabaseAuth";

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

export default function ResetEmailPage() {
  const { supabase, user, isLoading } = useSupabaseAuth();

  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => newEmail.length > 0, [newEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setMessage(null);

    if (!supabase) {
      setErrorText("Supabaseが未設定です。.env.local を確認してください。");
      return;
    }
    if (!user) {
      setErrorText("ログインが必要です。");
      return;
    }
    if (!canSubmit) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });
      if (error) throw error;

      setMessage(
        "確認メールを送信しました。メール内リンクで変更を完了してください。"
      );
      setNewEmail("");
    } catch (err: any) {
      const rawMessage = err?.message ?? "メールアドレス更新に失敗しました。";
      setErrorText(formatAuthErrorMessage(rawMessage));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          メールアドレス再設定
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          新しいメールアドレスへ確認メールを送信します。
        </p>

        {!supabase && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
            Supabaseが未設定です（環境変数が必要）。
          </div>
        )}

        {isLoading ? (
          <div className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            読み込み中...
          </div>
        ) : user ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              現在のメールアドレス：<span className="font-semibold">{user.email}</span>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                新しいメールアドレス
              </label>
              <input
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
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
              disabled={!canSubmit || busy || !supabase}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "送信中…" : "確認メールを送信"}
            </button>

            <div className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/settings"
                className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
              >
                設定へ戻る
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              メールアドレスの変更にはログインが必要です。
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              ログインへ
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
