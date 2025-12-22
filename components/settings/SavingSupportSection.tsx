"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { AppSettings } from "../../lib/settingsStorage";
import { requestBrowserNotificationPermission } from "../../lib/savingSupport";

type OnChangeSetting = <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
) => void;

type Props = {
  settings: AppSettings;
  onChangeSetting: OnChangeSetting;
};

function pct(v: number | undefined) {
  const n = typeof v === "number" ? v : 0;
  return `${Math.round(n * 100)}%`;
}

const WEEKDAYS = [
  { value: 0, label: "日" },
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
];

function numOr(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

const normalizeDigits = (value: string) =>
  value
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");

export function SavingSupportSection({ settings, onChangeSetting }: Props) {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const detail = useMemo(() => {
    return {
      inputGapDays: numOr(settings.inputGapDays, 2),
      weeklySummaryWeekday: numOr(settings.weeklySummaryWeekday, 0),
      reminderTime:
        typeof settings.reminderTime === "string"
          ? settings.reminderTime
          : "21:00",
      midPeriodOffsetDays: numOr(settings.midPeriodOffsetDays, 14),
      cycleEndReviewDaysBefore: numOr(settings.cycleEndReviewDaysBefore, 2),
    };
  }, [settings]);

  type DetailInputKey =
    | "inputGapDays"
    | "midPeriodOffsetDays"
    | "cycleEndReviewDaysBefore";

  const [detailInputs, setDetailInputs] = useState(() => ({
    inputGapDays: String(detail.inputGapDays),
    midPeriodOffsetDays: String(detail.midPeriodOffsetDays),
    cycleEndReviewDaysBefore: String(detail.cycleEndReviewDaysBefore),
  }));

  useEffect(() => {
    setDetailInputs({
      inputGapDays: String(detail.inputGapDays),
      midPeriodOffsetDays: String(detail.midPeriodOffsetDays),
      cycleEndReviewDaysBefore: String(detail.cycleEndReviewDaysBefore),
    });
  }, [
    detail.inputGapDays,
    detail.midPeriodOffsetDays,
    detail.cycleEndReviewDaysBefore,
  ]);

  const handleDetailInputChange =
    (key: DetailInputKey) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = normalizeDigits(e.target.value);
      setDetailInputs((prev) => ({ ...prev, [key]: next }));
    };

  const handleDetailInputBlur =
    (
      key: DetailInputKey,
      min: number,
      max: number,
      fallback: number
    ) =>
    () => {
      const raw = detailInputs[key];
      if (!raw) {
        setDetailInputs((prev) => ({ ...prev, [key]: String(fallback) }));
        return;
      }
      let next = Number(raw);
      if (!Number.isFinite(next)) next = fallback;
      next = Math.min(max, Math.max(min, next));
      setDetailInputs((prev) => ({ ...prev, [key]: String(next) }));
      onChangeSetting(key, next as AppSettings[DetailInputKey]);
    };

  const permissionLabel =
    permission === "granted"
      ? "許可"
      : permission === "denied"
      ? "ブロック中"
      : permission === "default"
      ? "未設定"
      : "非対応";

  const handleRequestPermission = async () => {
    const p = await requestBrowserNotificationPermission();
    setPermission(p);
    if (p === "granted") {
      window.alert(
        "ブラウザ通知を許可しました。※タブが開いている間だけ動作します"
      );
    } else if (p === "denied") {
      window.alert(
        "ブラウザ通知がブロックされています（ブラウザ設定で変更できます）"
      );
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
        貯金サポート・通知設定
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Web版では「プッシュ通知」ではなく、アプリを開いた時にホーム/カレンダー上で
        “声かけカード”を表示するための設定です（通知の本実装はモバイル版で対応予定）。
      </p>

      <div className="mt-4 space-y-5">
        {/* A: リマインド */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            A. 入力＆振り返りリマインド
          </h3>

          <div className="mt-2 grid gap-3">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  数日入力が空いたときに声かけ
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  例：「最近入力が空いてるけど大丈夫？今日だけでも記録しよ〜」
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-emerald-600"
                checked={!!settings.enableInputGapReminder}
                onChange={(e) =>
                  onChangeSetting("enableInputGapReminder", e.target.checked)
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  週1ふりかえりカード
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  例：「今週の支出、ざっくり振り返ってみよう」
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-emerald-600"
                checked={!!settings.enableWeeklySummaryReminder}
                onChange={(e) =>
                  onChangeSetting(
                    "enableWeeklySummaryReminder",
                    e.target.checked
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  給料日サイクル中間のペース確認
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  例：「折り返し地点！今のペース、いい感じ？」
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-emerald-600"
                checked={!!settings.enableMidPeriodCheckReminder}
                onChange={(e) =>
                  onChangeSetting(
                    "enableMidPeriodCheckReminder",
                    e.target.checked
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  サイクル終了前のふりかえり
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  例：「あと少し！今月の振り返り、やっておくと来月ラク」
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-emerald-600"
                checked={!!settings.enableCycleEndReviewReminder}
                onChange={(e) =>
                  onChangeSetting(
                    "enableCycleEndReviewReminder",
                    e.target.checked
                  )
                }
              />
            </label>

            {/* 詳細設定 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                リマインド詳細
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    入力ギャップ判定（日）
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={detailInputs.inputGapDays}
                    onChange={handleDetailInputChange("inputGapDays")}
                    onBlur={handleDetailInputBlur(
                      "inputGapDays",
                      0,
                      30,
                      detail.inputGapDays
                    )}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    週1ふりかえりの曜日
                  </div>
                  <select
                    value={detail.weeklySummaryWeekday}
                    onChange={(e) =>
                      onChangeSetting(
                        "weeklySummaryWeekday",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    声かけの目安時刻
                  </div>
                  <input
                    type="time"
                    value={detail.reminderTime}
                    onChange={(e) =>
                      onChangeSetting("reminderTime", e.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    中間チェック（開始から何日後）
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={detailInputs.midPeriodOffsetDays}
                    onChange={handleDetailInputChange("midPeriodOffsetDays")}
                    onBlur={handleDetailInputBlur(
                      "midPeriodOffsetDays",
                      0,
                      31,
                      detail.midPeriodOffsetDays
                    )}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    終盤ふりかえり（終了何日前）
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={detailInputs.cycleEndReviewDaysBefore}
                    onChange={handleDetailInputChange(
                      "cycleEndReviewDaysBefore"
                    )}
                    onBlur={handleDetailInputBlur(
                      "cycleEndReviewDaysBefore",
                      0,
                      14,
                      detail.cycleEndReviewDaysBefore
                    )}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        ブラウザ通知（実験）
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        タブが開いている間だけ。権限：{permissionLabel}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-emerald-600"
                      checked={!!settings.enableBrowserNotifications}
                      onChange={(e) =>
                        onChangeSetting(
                          "enableBrowserNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </label>

                  {settings.enableBrowserNotifications && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                      >
                        通知を許可する
                      </button>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ※「ブロック中」の場合はブラウザ設定から許可に変更してね
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 予算アラート */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    予算アラート（消化率）
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    予算の消化が早い時に「ペース早めかも」カードを出す目安
                  </div>
                </div>
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                  {pct(settings.budgetAlertRate)}
                </div>
              </div>

              <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.05}
                value={numOr(settings.budgetAlertRate, 0.8)}
                onChange={(e) =>
                  onChangeSetting("budgetAlertRate", Number(e.target.value))
                }
                className="mt-3 w-full accent-emerald-600"
              />

              <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* C: メンタル */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            C. 貯金目標・メンタルサポート
          </h3>

          <div className="mt-2 grid gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    目標の貯金率
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    例：10%なら「今月は手取りの10%を貯金したい」目安として使う
                  </div>
                </div>
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                  {pct(settings.targetSavingRate)}
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={0.5}
                step={0.01}
                value={numOr(settings.targetSavingRate, 0.1)}
                onChange={(e) =>
                  onChangeSetting("targetSavingRate", Number(e.target.value))
                }
                className="mt-3 w-full accent-emerald-600"
              />

              <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  ポジティブな一言メッセージ
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  例：「いい感じ！続けられてるのがすでに強い」
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-emerald-600"
                checked={!!settings.enableEncouragingMessages}
                onChange={(e) =>
                  onChangeSetting("enableEncouragingMessages", e.target.checked)
                }
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
