"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type AppSettings,
  defaultSettings,
  loadAppSettings,
  saveAppSettings,
} from "../../../lib/settingsStorage";
import { requestInitialNotificationPermissionOnce } from "../../../lib/notifications";
import { useResolvedTheme } from "../../../lib/useResolvedTheme";

function formatTimeLabel(value: string) {
  const matched = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!matched) return "21:00";
  const h = Number(matched[1]);
  const m = Number(matched[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "21:00";
  const hh = String(Math.max(0, Math.min(23, h))).padStart(2, "0");
  const mm = String(Math.max(0, Math.min(59, m))).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function NotificationDetailPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const { isDark, themeClass } = useResolvedTheme(settings.theme);

  useEffect(() => {
    setSettings(loadAppSettings());
  }, []);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const next: AppSettings = {
      ...settings,
      [key]: value,
      notificationPreset: "custom",
      enableMidPeriodCheckReminder: false,
      enableCycleEndReviewReminder: false,
    };
    setSettings(next);
    saveAppSettings(next);
  };

  const reminderTimeValue = settings.reminderTime ?? "21:00";
  const reminderTimeLabel = formatTimeLabel(reminderTimeValue);

  return (
    <main
      className={`min-h-screen max-w-3xl mx-auto px-4 pt-3 pb-8 space-y-5 ${themeClass}`}
    >
      <header className="space-y-2">
        <Link
          href="/settings"
          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200"
        >
          ← 設定へ戻る
        </Link>
        <h1
          className={`text-lg font-semibold ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          通知の詳細設定
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          必要な項目だけ調整できます。通知時間はすべて共通です。
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                ポジティブ通知
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                継続や前進を称賛する通知
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-emerald-600"
              checked={!!settings.enableEncouragingMessages}
              onChange={(e) =>
                updateSetting("enableEncouragingMessages", e.target.checked)
              }
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                入力リマインド
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                入力が空いた時にやさしくリマインド
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-emerald-600"
              checked={!!settings.enableInputGapReminder}
              onChange={(e) => {
                const checked = e.target.checked;
                updateSetting("enableInputGapReminder", checked);
                if (checked) {
                  void requestInitialNotificationPermissionOnce();
                }
              }}
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                週次ふりかえり
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                週1で振り返りのきっかけを通知
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-emerald-600"
              checked={!!settings.enableWeeklySummaryReminder}
              onChange={(e) =>
                updateSetting("enableWeeklySummaryReminder", e.target.checked)
              }
            />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
            <label
              htmlFor="notification-time"
              className="text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              通知時間（共通）
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              すべての通知に共通で使う時間
            </p>
            <div className="relative mt-2 h-10 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="pointer-events-none flex h-full items-center justify-between px-3 text-sm text-slate-700 dark:text-slate-200">
                <span>{reminderTimeLabel}</span>
                <span className="text-slate-400 dark:text-slate-500">›</span>
              </div>
              <input
                id="notification-time"
                type="time"
                value={reminderTimeValue}
                onChange={(e) => updateSetting("reminderTime", e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
