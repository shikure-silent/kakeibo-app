"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { toJapaneseAuthErrorMessage } from "../../lib/authErrorMessageJa";
import { setFlashToast } from "../../lib/flashToast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [mounted, setMounted] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!supabase) return;

    let mounted = true;
    const syncAuthStateFromUrl = async () => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
      const hashParams = new URLSearchParams(hash);
      const searchParams = url.searchParams;

      const accessToken =
        hashParams.get("access_token") ?? searchParams.get("access_token");
      const refreshToken =
        hashParams.get("refresh_token") ?? searchParams.get("refresh_token");
      const tokenHash =
        searchParams.get("token_hash") ?? hashParams.get("token_hash");
      const type = (searchParams.get("type") ??
        hashParams.get("type")) as EmailOtpType | null;

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error && mounted) {
          setErrorText(
            toJapaneseAuthErrorMessage(
              error.message,
              "再設定リンクの検証に失敗しました。再度お試しください。"
            )
          );
        }
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        if (error && mounted) {
          setErrorText(
            toJapaneseAuthErrorMessage(
              error.message,
              "再設定リンクの検証に失敗しました。再度お試しください。"
            )
          );
        }
      }

      // Remove auth tokens from URL after processing.
      if (window.location.search || window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };

    void syncAuthStateFromUrl().then(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setHasSession(!!data.session);
      });
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

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      setFlashToast({
        message: "パスワードを更新しました。再ログインしてください。",
        tone: "success",
      });
      setNewPassword("");
      setConfirmPassword("");
      router.replace("/login");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "パスワード更新に失敗しました。";
      setErrorText(
        toJapaneseAuthErrorMessage(message, "パスワード更新に失敗しました。")
      );
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
              <div className="mt-1 relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  aria-label={
                    showNewPassword
                      ? "パスワードを非表示にする"
                      : "パスワードを表示する"
                  }
                >
                  {showNewPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                      <path
                        fill="currentColor"
                        d="M12 5c5.3 0 9.8 3.3 11.6 8a1 1 0 0 1 0 .8C21.8 18.7 17.3 22 12 22S2.2 18.7.4 13.8a1 1 0 0 1 0-.8C2.2 8.3 6.7 5 12 5Zm0 2C7.7 7 4 9.4 2.5 13 4 16.6 7.7 19 12 19s8-2.4 9.5-6C20 9.4 16.3 7 12 7Zm0 2.5A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm0 2A1.5 1.5 0 1 0 13.5 13 1.5 1.5 0 0 0 12 11.5Z"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                      <path
                        fill="currentColor"
                        d="M2.1 3.5a1 1 0 0 1 1.4-1.4l17 17a1 1 0 1 1-1.4 1.4l-2.2-2.2A10.9 10.9 0 0 1 12 20C6.7 20 2.2 16.7.4 12a1 1 0 0 1 0-.8 11.8 11.8 0 0 1 4.2-5.1L2.1 3.5Zm7.4 7.4 2.9 2.9a2 2 0 0 0-2.9-2.9Zm4.1 4.1 2.3 2.3A6 6 0 0 1 6.6 7.4l2.1 2.1a4 4 0 0 0 5 5.5ZM12 4c5.3 0 9.8 3.3 11.6 8a1 1 0 0 1 0 .8 11.7 11.7 0 0 1-3.5 4.4l-1.4-1.4a9.8 9.8 0 0 0 2.9-3.8C20 8.3 16.3 6 12 6a8.7 8.7 0 0 0-2 .2L8.3 4.5A10.8 10.8 0 0 1 12 4Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                新しいパスワード（確認）
              </label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  aria-label={
                    showConfirmPassword
                      ? "パスワードを非表示にする"
                      : "パスワードを表示する"
                  }
                >
                  {showConfirmPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                      <path
                        fill="currentColor"
                        d="M12 5c5.3 0 9.8 3.3 11.6 8a1 1 0 0 1 0 .8C21.8 18.7 17.3 22 12 22S2.2 18.7.4 13.8a1 1 0 0 1 0-.8C2.2 8.3 6.7 5 12 5Zm0 2C7.7 7 4 9.4 2.5 13 4 16.6 7.7 19 12 19s8-2.4 9.5-6C20 9.4 16.3 7 12 7Zm0 2.5A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm0 2A1.5 1.5 0 1 0 13.5 13 1.5 1.5 0 0 0 12 11.5Z"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                      <path
                        fill="currentColor"
                        d="M2.1 3.5a1 1 0 0 1 1.4-1.4l17 17a1 1 0 1 1-1.4 1.4l-2.2-2.2A10.9 10.9 0 0 1 12 20C6.7 20 2.2 16.7.4 12a1 1 0 0 1 0-.8 11.8 11.8 0 0 1 4.2-5.1L2.1 3.5Zm7.4 7.4 2.9 2.9a2 2 0 0 0-2.9-2.9Zm4.1 4.1 2.3 2.3A6 6 0 0 1 6.6 7.4l2.1 2.1a4 4 0 0 0 5 5.5ZM12 4c5.3 0 9.8 3.3 11.6 8a1 1 0 0 1 0 .8 11.7 11.7 0 0 1-3.5 4.4l-1.4-1.4a9.8 9.8 0 0 0 2.9-3.8C20 8.3 16.3 6 12 6a8.7 8.7 0 0 0-2 .2L8.3 4.5A10.8 10.8 0 0 1 12 4Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
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
