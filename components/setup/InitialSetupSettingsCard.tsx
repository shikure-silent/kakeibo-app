"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import {
  AppSettings,
  defaultSettings,
  loadAppSettings,
  saveAppSettings,
} from "../../lib/settingsStorage";
import { useResolvedTheme } from "../../lib/useResolvedTheme";

const normalizeDigits = (value: string) =>
  value
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InitialSetupSettingsCard() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [inputGapDays, setInputGapDays] = useState("2");

  useEffect(() => {
    const loaded = loadAppSettings();
    setSettings(loaded);
    setInputGapDays(String(loaded.inputGapDays ?? 2));
  }, []);

  useEffect(() => {
    setInputGapDays(String(settings.inputGapDays ?? 2));
  }, [settings.inputGapDays]);

  const { isDark } = useResolvedTheme(settings.theme);

  const handleChangeSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveAppSettings(next);
  };

  const handleInputGapChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputGapDays(normalizeDigits(e.target.value));
  };

  const handleInputGapBlur = () => {
    if (!inputGapDays) {
      const fallback = settings.inputGapDays ?? 2;
      setInputGapDays(String(fallback));
      handleChangeSetting("inputGapDays", fallback);
      return;
    }
    let next = Number(inputGapDays);
    if (!Number.isFinite(next)) {
      next = settings.inputGapDays ?? 2;
    }
    next = clampNumber(next, 0, 30);
    setInputGapDays(String(next));
    handleChangeSetting("inputGapDays", next);
  };

  return (
    <section
      className={`rounded-2xl border shadow-sm px-4 py-4 lg:px-5 lg:py-5 space-y-4 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <div>
        <h2 className="text-sm font-semibold">集計・通知の初期設定</h2>
        <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          あとから設定ページでいつでも変更できます。
        </p>
      </div>

      <div className="space-y-1.5">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          集計開始日（給料日）
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-[12px]">
          <select
            value={settings.payday ?? 1}
            onChange={(e) =>
              handleChangeSetting("payday", Number(e.target.value) || 1)
            }
            className="border rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 w-full sm:w-auto"
            style={{
              backgroundColor: isDark ? "#0f172a" : "white",
              color: isDark ? "#e2e8f0" : "#334155",
              borderColor: isDark ? "#475569" : "#cbd5e1",
            }}
          >
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              return (
                <option key={day} value={day}>
                  {day}日
                </option>
              );
            })}
          </select>
          <span
            className={`text-[11px] ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            例：25日に給料日の場合は「25日」を選択
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-[12px]">
          <div>
            <p className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              入力忘れ防止通知
            </p>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              数日入力が空いたときに声かけを出します。
            </p>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-emerald-600"
            checked={!!settings.enableInputGapReminder}
            onChange={(e) =>
              handleChangeSetting("enableInputGapReminder", e.target.checked)
            }
          />
        </div>

        <div className="flex items-center gap-3 text-[12px]">
          <span
            className={`text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            何日空いたら通知する？
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputGapDays}
            onChange={handleInputGapChange}
            onBlur={handleInputGapBlur}
            disabled={!settings.enableInputGapReminder}
            className={`h-9 w-20 rounded-full border px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
              isDark
                ? "bg-slate-950 border-slate-600 text-slate-100"
                : "bg-white border-slate-200 text-slate-700"
            } ${settings.enableInputGapReminder ? "" : "opacity-60"}`}
          />
          <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            日
          </span>
        </div>
      </div>
    </section>
  );
}
