"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const supabase = getSupabaseClient();

  const [mounted, setMounted] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(!!data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(!!session);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const canUpdate = useMemo(() => {
    if (newPassword.length < 6) return false;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setMessage(null);

    if (!supabase) {
      setErrorText("Supabaseが未設定です。.env.local を確認してください。");
      return;
    }
    if (!canUpdate) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setMessage("パスワードを更新しました。ログインし直してください。");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorText(err?.message ?? "パスワード更新に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          パスワード再設定
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          メールで再設定リンクを受け取るか、リンクから新しいパスワードを設定します。
        </p>

        {mounted && !supabase && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
            Supabaseが未設定です（環境変数が必要）。
          </div>
        )}

        {!mounted ? (
          <div className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            読み込み中...
          </div>
        ) : hasSession ? (
          <form onSubmit={handleUpdate} className="mt-5 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                新しいパスワード（6文字以上）
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="••••••••"
                minLength={6}
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
              disabled={!canUpdate || busy || !supabase}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "更新中…" : "パスワードを更新"}
            </button>

            <div className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/login"
                className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
              >
                ログイン画面へ
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              このページは再設定メールのリンクから開くと、新しいパスワードを設定できます。
            </p>
            <Link
              href="/reset-password/request"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              再設定メールを送信する
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
