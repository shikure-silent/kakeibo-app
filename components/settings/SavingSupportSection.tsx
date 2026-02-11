"use client";

import Link from "next/link";
import type {
  AppSettings,
  NotificationPresetOption,
} from "../../lib/settingsStorage";

type OnChangeSetting = <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
) => void;

type Props = {
  settings: AppSettings;
  onChangeSetting: OnChangeSetting;
  showHeader?: boolean;
};

type PresetDefinition = {
  key: Exclude<NotificationPresetOption, "custom">;
  label: string;
  description: string;
  values: Pick<
    AppSettings,
    | "notificationPreset"
    | "enableEncouragingMessages"
    | "enableInputGapReminder"
    | "enableWeeklySummaryReminder"
    | "enableMidPeriodCheckReminder"
    | "enableCycleEndReviewReminder"
    | "inputGapDays"
  >;
};

const PRESETS: PresetDefinition[] = [
  {
    key: "recommended",
    label: "おまかせ（推奨）",
    description: "ポジティブ通知 + 入力リマインド + 週次ふりかえり",
    values: {
      notificationPreset: "recommended",
      enableEncouragingMessages: true,
      enableInputGapReminder: true,
      enableWeeklySummaryReminder: true,
      enableMidPeriodCheckReminder: false,
      enableCycleEndReviewReminder: false,
      inputGapDays: 2,
    },
  },
  {
    key: "minimal",
    label: "最小限",
    description: "ポジティブ通知のみ",
    values: {
      notificationPreset: "minimal",
      enableEncouragingMessages: true,
      enableInputGapReminder: false,
      enableWeeklySummaryReminder: false,
      enableMidPeriodCheckReminder: false,
      enableCycleEndReviewReminder: false,
      inputGapDays: 2,
    },
  },
  {
    key: "intensive",
    label: "しっかり",
    description: "ポジティブ通知 + 毎日に近い入力リマインド + 週次ふりかえり",
    values: {
      notificationPreset: "intensive",
      enableEncouragingMessages: true,
      enableInputGapReminder: true,
      enableWeeklySummaryReminder: true,
      enableMidPeriodCheckReminder: false,
      enableCycleEndReviewReminder: false,
      inputGapDays: 1,
    },
  },
];

function applyPreset(
  presetKey: Exclude<NotificationPresetOption, "custom">,
  onChangeSetting: OnChangeSetting
) {
  const preset = PRESETS.find((item) => item.key === presetKey);
  if (!preset) return;
  const entries = Object.entries(preset.values) as [
    keyof PresetDefinition["values"],
    PresetDefinition["values"][keyof PresetDefinition["values"]]
  ][];
  entries.forEach(([key, value]) =>
    onChangeSetting(key as keyof AppSettings, value as AppSettings[keyof AppSettings])
  );
}

export function SavingSupportSection({
  settings,
  onChangeSetting,
  showHeader = true,
}: Props) {
  const selectedPreset = settings.notificationPreset ?? "recommended";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {showHeader && (
        <>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            貯金サポート・通知設定
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            初期表示は通知プリセットのみです。細かく調整したい場合は詳細設定へ進んでください。
          </p>
        </>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            通知プリセット
          </p>
          {selectedPreset === "custom" && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              現在は「カスタム」です。プリセットを選び直すと上書きされます。
            </div>
          )}
          <div className="mt-2 grid gap-2">
            {PRESETS.map((preset) => {
              const selected = selectedPreset === preset.key;
              return (
                <label
                  key={preset.key}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
                    selected
                      ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/30"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {preset.label}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {preset.description}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="notificationPreset"
                    className="mt-1 h-4 w-4 accent-emerald-600"
                    checked={selected}
                    onChange={() => applyPreset(preset.key, onChangeSetting)}
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              詳細設定
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ポジティブ通知・入力リマインド・週次ふりかえり・通知時間を調整
            </p>
          </div>
          <Link
            href="/settings/notifications"
            className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-emerald-300/70 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] font-semibold leading-none text-emerald-700/90 transition-colors hover:bg-emerald-100/70 dark:border-emerald-400/50 dark:bg-emerald-900/20 dark:text-emerald-200/90 dark:hover:bg-emerald-900/35"
          >
            詳細設定を開く
          </Link>
        </div>
      </div>
    </section>
  );
}
