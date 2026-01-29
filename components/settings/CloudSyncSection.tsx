"use client";

import { useState } from "react";
import { useSupabaseAuth } from "../../lib/useSupabaseAuth";
import { exportKakeiboDump, importKakeiboDump } from "../../lib/cloudSync";
import { loadKakeiboState, saveKakeiboState } from "../../lib/kakeiboStateRepo";

export function CloudSyncSection() {
  const { supabase, user, isLoading } = useSupabaseAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canUse = !!supabase && !!user;

  const onSave = async () => {
    setMsg(null);
    setErr(null);
    if (!supabase || !user) return;

    setBusy(true);
    try {
      const dump = exportKakeiboDump({ includeSettings: true });
      await saveKakeiboState(supabase, user.id, dump);
      setMsg("クラウドに保存しました（kakeibo_state）。");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "保存に失敗しました。";
      setErr(message);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setMsg(null);
    setErr(null);
    if (!supabase || !user) return;

    const ok = window.confirm(
      "クラウドから復元します。\n現在の端末(localStorage)の内容は上書きされます。よろしいですか？"
    );
    if (!ok) return;

    setBusy(true);
    try {
      const dump = await loadKakeiboState(supabase, user.id);
      if (!dump) {
        setErr(
          "クラウドに保存データが見つかりませんでした。先に『保存』してください。"
        );
        return;
      }
      importKakeiboDump(dump, { includeSettings: true, clearBefore: true });
      setMsg("クラウドから復元しました。画面を更新します。");
      window.location.reload();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "復元に失敗しました。";
      setErr(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
        クラウド同期
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        ログインしている場合、現在の端末データをクラウドに保存/復元できます。
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/30">
        {isLoading ? (
          <p className="text-sm text-slate-500">読み込み中…</p>
        ) : !canUse ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            使うにはログインが必要です。
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              ログイン中：<span className="font-semibold">{user.email}</span>
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                disabled={busy}
                onClick={onSave}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                クラウドに保存
              </button>
              <button
                disabled={busy}
                onClick={onRestore}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                クラウドから復元
              </button>
            </div>
          </>
        )}

        {msg && (
          <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-200">
            {msg}
          </p>
        )}
        {err && (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{err}</p>
        )}
      </div>
    </section>
  );
}
