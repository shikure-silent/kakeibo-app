"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { getActiveUserId, setActiveUserId } from "../../lib/accountScope";
import { clearKakeiboKeys, importKakeiboDump } from "../../lib/cloudSync";
import { loadKakeiboState } from "../../lib/kakeiboStateRepo";
import type { User } from "@supabase/supabase-js";

function safeNext(next: string | null) {
  // 外部URLへのopen redirectを避けるため、アプリ内パスだけ許可
  if (!next) return "/";
  return next.startsWith("/") ? next : "/";
}

export default function LoginPage() {
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
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="••••••••"
              required
            />
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

          <div className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            アカウントがない？{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(nextUrl)}`}
              className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
            >
              新規登録
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
