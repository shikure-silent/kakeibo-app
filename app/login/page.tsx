"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { setFlashToast } from "../../lib/flashToast";
import { getActiveUserId, setActiveUserId } from "../../lib/accountScope";
import { clearKakeiboKeys, importKakeiboDump } from "../../lib/cloudSync";
import { loadKakeiboState } from "../../lib/kakeiboStateRepo";
import type { User } from "@supabase/supabase-js";

function safeNext(next: string | null) {
  // 外部URLへのopen redirectを避けるため、アプリ内パスだけ許可
  if (!next) return "/";
  return next.startsWith("/") ? next : "/";
}

function LoginPageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ 互換対応：/login?mode=signup で来たら /signup に飛ばす
  useEffect(() => {
    const mode = sp.get("mode");
    if (mode === "signup") {
      const next = sp.get("next");
      const q = next ? `?next=${encodeURIComponent(next)}` : "";
      router.replace(`/signup${q}`);
    }
  }, [sp, router]);

  const nextUrl = safeNext(sp.get("next"));
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.length > 0 && password.length > 0,
    [email, password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (!supabase) {
      setErrorText("Supabaseが未設定です。.env.local を確認してください。");
      return;
    }
    if (!canSubmit) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // supabase.auth.signInWithPassword は user を返さない場合があるので取得
      let user: User | null = null;
      const currentUser = await supabase.auth.getUser();
      user = currentUser.data.user ?? null;
      if (!user) {
        throw new Error("ユーザー情報の取得に失敗しました。");
      }

      // ログイン成功後（user が取れた直後）
      const prev = getActiveUserId();
      if (prev && prev !== user.id) {
        // ✅ 前のユーザーの端末データが残ってたらクリア
        clearKakeiboKeys({ includeSettings: true });
      }

      setActiveUserId(user.id);

      // ✅ クラウドに保存があるなら自動復元（なければ何もしない）
      const dump = await loadKakeiboState(supabase, user.id);
      if (dump) {
        importKakeiboDump(dump, { includeSettings: true, clearBefore: true });
      }
      if (!dump) {
        clearKakeiboKeys({ includeSettings: true });
      }

      // 画面を整える
      setFlashToast({ message: "ログインしました。", tone: "success" });
      router.push(nextUrl);
      router.refresh();
      return;
    } catch (err: any) {
      setErrorText(err?.message ?? "ログインに失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          ログイン
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          クラウド保存・複数端末利用に向けたアカウント機能です。
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
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

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              パスワード
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                aria-label={
                  showPassword ? "パスワードを非表示にする" : "パスワードを表示する"
                }
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      fill="currentColor"
                      d="M12 5c5.3 0 9.8 3.3 11.6 8a1 1 0 0 1 0 .8C21.8 18.7 17.3 22 12 22S2.2 18.7.4 13.8a1 1 0 0 1 0-.8C2.2 8.3 6.7 5 12 5Zm0 2C7.7 7 4 9.4 2.5 13 4 16.6 7.7 19 12 19s8-2.4 9.5-6C20 9.4 16.3 7 12 7Zm0 2.5A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm0 2A1.5 1.5 0 1 0 13.5 13 1.5 1.5 0 0 0 12 11.5Z"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
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

          <button
            type="submit"
            disabled={!canSubmit || busy || !supabase}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "処理中…" : "ログイン"}
          </button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/reset-password/request"
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
            >
              パスワードを忘れた？
            </Link>
          </div>

          <div className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            アカウントがない？{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(nextUrl)}`}
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
            >
              初めての方はこちら
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
          <div className="text-sm text-slate-500">読み込み中...</div>
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
