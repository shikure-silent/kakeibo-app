import { ThemeOption } from "../../lib/settingsStorage";

type Props = {
  theme: ThemeOption;
  onChangeTheme: (theme: ThemeOption) => void;
  isDark?: boolean;
};

export function ThemeSettingsSection({
  theme,
  onChangeTheme,
  isDark = false,
}: Props) {
  return (
    <section
      className={`rounded-2xl border shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-4 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-100 text-slate-900"
      }`}
    >
      <h2
        className={`text-sm font-semibold ${
          isDark ? "text-slate-100" : "text-slate-800"
        }`}
      >
        テーマ設定
      </h2>

      <div className="space-y-1.5">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          テーマカラー
        </p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {(["system", "light", "dark"] as ThemeOption[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChangeTheme(opt)}
              className={`px-3 py-1.5 rounded-full border ${
                theme === opt
                  ? isDark
                    ? "bg-emerald-900/40 border-emerald-400 text-emerald-100"
                    : "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : isDark
                    ? "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt === "system" && "端末の設定に合わせる"}
              {opt === "light" && "ライト"}
              {opt === "dark" && "ダーク"}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
