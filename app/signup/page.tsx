"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { setFlashToast } from "../../lib/flashToast";

function safeNext(next: string | null) {
  if (!next) return "/";
  return next.startsWith("/") ? next : "/";
}

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

function SignupPageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextUrl = safeNext(sp.get("next"));
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 任意：表示名（TopNavで表示名優先にしてるなら便利）
  const [displayName, setDisplayName] = useState("");

  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    return password.length >= 6;
  }, [email, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setMessage(null);

    if (!supabase) {
      setErrorText("Supabaseが未設定です。.env.local を確認してください。");
      return;
    }
    if (!canSubmit) return;

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || undefined,
          },
        },
      });
      if (error) throw error;

      // Email確認ONだと session が null のことが多い
      if (!data.session) {
        setMessage(
          "確認メールを送信しました。メール内リンクから登録を完了してください。"
        );
      } else {
        setFlashToast({ message: "ログインしました。", tone: "success" });
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err) {
      const rawMessage =
        err instanceof Error ? err.message : "新規登録に失敗しました。";
      setErrorText(formatAuthErrorMessage(rawMessage));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          新規登録
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          登録後はクラウド保存・複数端末利用に繋げられます。
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
              パスワード（6文字以上）
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="••••••••"
                minLength={6}
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

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              表示名（任意）
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="山田 太郎"
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
            {busy ? "処理中…" : "新規登録"}
          </button>

          <div className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            すでにアカウントがある？{" "}
            <Link
              href={`/login?next=${encodeURIComponent(nextUrl)}`}
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
            >
              ログイン
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
          <div className="text-sm text-slate-500">読み込み中...</div>
        </main>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}
