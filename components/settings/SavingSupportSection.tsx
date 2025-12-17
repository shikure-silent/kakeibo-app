"use client";

import type { AppSettings } from "../../lib/settingsStorage";

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

export function SavingSupportSection({ settings, onChangeSetting }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
        貯金サポート・通知設定
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Web版では「プッシュ通知」ではなく、アプリを開いた時にホーム/カレンダー上で
        “声かけカード”を表示するための設定です（通知の本実装はモバイル版で対応予定）。
      </p>

      <div className="mt-4 space-y-4">
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
                value={
                  typeof settings.budgetAlertRate === "number"
                    ? settings.budgetAlertRate
                    : 0.8
                }
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
                value={
                  typeof settings.targetSavingRate === "number"
                    ? settings.targetSavingRate
                    : 0.1
                }
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
