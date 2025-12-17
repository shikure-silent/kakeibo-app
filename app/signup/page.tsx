"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

function safeNext(next: string | null) {
  if (!next) return "/";
  return next.startsWith("/") ? next : "/";
}

export default function SignupPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextUrl = safeNext(sp.get("next"));
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorText(err?.message ?? "新規登録に失敗しました。");
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
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="••••••••"
              minLength={6}
              required
            />
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
