"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "../../lib/useSupabaseAuth";
import { clearKakeiboKeys } from "../../lib/cloudSync";
import { clearActiveUserId } from "../../lib/accountScope";
import { setFlashToast } from "../../lib/flashToast";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  const tail = local.length >= 3 ? local.slice(-1) : "";
  return `${head}${"*".repeat(
    Math.max(1, local.length - (head.length + tail.length)),
  )}${tail}@${domain}`;
}

export function AccountLoginSection() {
  const { supabase, user, isLoading } = useSupabaseAuth();

  const [mounted, setMounted] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayName = useMemo(() => {
    return (
      (user?.user_metadata?.display_name as string | undefined) ||
      (user?.email ? maskEmail(user.email) : "")
    );
  }, [user]);

  // mounted前はスケルトン固定（SSR/CSR一致）
  const showLoading = !mounted || isLoading;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
        アカウント
      </h2>

      {mounted && !supabase && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          Supabaseが未設定です（環境変数が必要）。今はゲスト（localStorage）運用として動きます。
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/30">
        {showLoading ? (
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        ) : user ? (
          <>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ログイン中：{displayName || "（表示名なし）"}
            </div>

            {user.email && (
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Email: {user.email}
              </div>
            )}
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              ページを閉じる/切り替えるときに、端末データが自動でクラウド保存されます。
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  アカウント情報の変更
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link
                    href="/reset-email/"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    メールアドレス再設定
                  </Link>

                  <Link
                    href="/reset-password/"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    パスワード再設定
                  </Link>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  セッション
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!supabase) return;

                      const ok = window.confirm(
                        "ログアウトします。\nこの端末の家計簿データは、別ユーザーに混ざらないよう一旦クリアします。\n（クラウドに保存済みなら後で復元できます）\n\n続けますか？",
                      );
                      if (!ok) return;

                      clearKakeiboKeys({ includeSettings: true });
                      clearActiveUserId();

                      await supabase.auth.signOut();

                      setFlashToast({
                        message: "ログアウトしました。",
                        tone: "info",
                      });
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    ログアウト
                  </button>

                  <button
                    type="button"
                    disabled={deletingAccount}
                    onClick={async () => {
                      if (!supabase || !user || deletingAccount) return;

                      const ok = window.confirm(
                        "アカウントを削除します。\n\n削除後はログインできなくなり、クラウド保存データ（復元用）も削除されます。\nこの操作は取り消せません。\n\n本当に削除しますか？"
                      );
                      if (!ok) return;

                      setDeletingAccount(true);
                      try {
                        const { data, error: sessionError } =
                          await supabase.auth.getSession();
                        if (sessionError || !data.session?.access_token) {
                          throw new Error(
                            "認証セッションを確認できませんでした。再ログインしてお試しください。"
                          );
                        }

                        const res = await fetch("/api/account/delete", {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${data.session.access_token}`,
                          },
                        });
                        if (!res.ok) {
                          const body = (await res.json().catch(() => null)) as
                            | { error?: string }
                            | null;
                          throw new Error(
                            body?.error ??
                              "アカウント削除に失敗しました。時間をおいて再度お試しください。"
                          );
                        }

                        clearKakeiboKeys({ includeSettings: true });
                        clearActiveUserId();
                        await supabase.auth.signOut();
                        setFlashToast({
                          message: "アカウントを削除しました。",
                          tone: "info",
                        });
                        window.location.href = "/signup/";
                      } catch (e) {
                        const message =
                          e instanceof Error
                            ? e.message
                            : "アカウント削除に失敗しました。";
                        window.alert(message);
                      } finally {
                        setDeletingAccount(false);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  >
                    {deletingAccount ? "削除中…" : "アカウント削除"}
                  </button>

                  <Link
                    href="/login/"
                    className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    別アカウントでログイン
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ゲストユーザーとして利用中
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              ログインすると、家計簿データは自動でクラウド保存されます。機種変更時などに便利です。
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/signup/"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                アカウントを作成
              </Link>
              <Link
                href="/login/"
                className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-950 dark:text-emerald-200 dark:hover:bg-emerald-950/30"
              >
                ログイン
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
