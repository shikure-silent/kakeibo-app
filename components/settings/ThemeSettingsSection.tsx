import { ThemeOption } from "../../lib/settingsStorage";

type Props = {
  theme: ThemeOption;
  onChangeTheme: (theme: ThemeOption) => void;
};

export function ThemeSettingsSection({ theme, onChangeTheme }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">テーマ設定</h2>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-slate-600">テーマカラー</p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {(["system", "light", "dark"] as ThemeOption[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChangeTheme(opt)}
              className={`px-3 py-1.5 rounded-full border ${
                theme === opt
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt === "system" && "端末の設定に合わせる"}
              {opt === "light" && "ライト"}
              {opt === "dark" && "ダーク"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400">
          ※ テーマの切り替えは今後のアップデートで反映予定です。
        </p>
      </div>
    </section>
  );
}
