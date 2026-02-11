"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "../../lib/useSupabaseAuth";
import { importKakeiboDump } from "../../lib/cloudSync";
import { loadKakeiboState } from "../../lib/kakeiboStateRepo";
import {
  CLOUD_AUTO_SAVED_EVENT,
  LAST_CLOUD_SAVE_AT_KEY,
} from "../../lib/useCloudAutoSaveOnLeave";

export function CloudSyncSection() {
  const { supabase, user, isLoading } = useSupabaseAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const canUse = !!supabase && !!user;
  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) return "未保存";
    return new Date(lastSavedAt).toLocaleString("ja-JP");
  }, [lastSavedAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(LAST_CLOUD_SAVE_AT_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        setLastSavedAt(parsed);
      }
    }

    const onSaved = (event: Event) => {
      const custom = event as CustomEvent<{ at?: number }>;
      const at = custom.detail?.at;
      if (typeof at === "number" && Number.isFinite(at)) {
        setLastSavedAt(at);
      } else {
        const latest = localStorage.getItem(LAST_CLOUD_SAVE_AT_KEY);
        const parsed = latest ? Number(latest) : NaN;
        if (!Number.isNaN(parsed)) setLastSavedAt(parsed);
      }
    };

    window.addEventListener(CLOUD_AUTO_SAVED_EVENT, onSaved);
    return () => window.removeEventListener(CLOUD_AUTO_SAVED_EVENT, onSaved);
  }, []);

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
        setErr("クラウドに保存データが見つかりませんでした。");
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
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">クラウド復元</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        ログイン中は家計簿データが自動でクラウド保存されます。必要なときだけ復元してください。
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
            <div className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <p>
                ログイン中：<span className="font-semibold">{user.email}</span>
              </p>
              <p>
                自動クラウド保存：<span className="font-semibold">{lastSavedLabel}</span>
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
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
