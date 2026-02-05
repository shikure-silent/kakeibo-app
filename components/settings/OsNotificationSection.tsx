"use client";

import { useEffect, useState } from "react";
import {
  checkLocalNotificationPermission,
  checkPushPermission,
  getPushToken,
  isNativePlatform,
  openAppSettings,
  scheduleTestLocalNotification,
} from "../../lib/notifications";

type Props = {
  isDark?: boolean;
};

const statusLabel = (status: string) => {
  if (status === "granted") return "許可";
  if (status === "denied") return "ブロック中";
  if (status === "prompt") return "未設定";
  if (status === "unavailable") return "非対応";
  return "未設定";
};

export function OsNotificationSection({ isDark = false }: Props) {
  const [isNative, setIsNative] = useState(false);
  const [pushStatus, setPushStatus] = useState("prompt");
  const [localStatus, setLocalStatus] = useState("prompt");
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const native = isNativePlatform();
    setIsNative(native);
    if (!native) return;
    checkPushPermission().then((p) => setPushStatus(p.receive ?? "prompt"));
    checkLocalNotificationPermission().then((p) =>
      setLocalStatus(p.display ?? "prompt")
    );
    setPushToken(getPushToken());
  }, []);

  const handleTestLocal = async () => {
    setBusy(true);
    try {
      const ok = await scheduleTestLocalNotification();
      if (!ok) {
        window.alert("通知の許可が必要です。");
      } else {
        window.alert("2秒後にテスト通知が届きます。");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleOpenSettings = async () => {
    setBusy(true);
    try {
      await openAppSettings();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className={`rounded-2xl border px-4 py-4 shadow-sm ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <h2 className="text-sm font-semibold">OS通知（準備中）</h2>
      <p
        className={`mt-1 text-[11px] ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        通知がオフの場合は、iPhone本体の設定から変更できます。Apple Developer Program加入後に本番Push通知を有効化します。
      </p>

      {!isNative && (
        <p className={`mt-3 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          OS通知はモバイルアプリでのみ利用できます。
        </p>
      )}

      {isNative && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium">Push通知:</span>
            <span className="text-[11px]">{statusLabel(pushStatus)}</span>
            {pushToken && (
              <span className="text-[10px] text-slate-500">登録済み</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium">ローカル通知:</span>
            <span className="text-[11px]">{statusLabel(localStatus)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleOpenSettings}
              className="inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold"
              style={{
                borderColor: isDark ? "#0f766e" : "#10b981",
                backgroundColor: isDark ? "#064e3b" : "#ecfdf5",
                color: isDark ? "#a7f3d0" : "#047857",
              }}
            >
              設定を開く
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleTestLocal}
              className="inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold"
              style={{
                borderColor: isDark ? "#7c3aed" : "#a78bfa",
                backgroundColor: isDark ? "#2e1065" : "#f5f3ff",
                color: isDark ? "#ddd6fe" : "#6d28d9",
              }}
            >
              テスト通知
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
