import { useRef } from "react";

type Props = {
  onResetKakeiboData: () => void;
  onCreateBackup: () => void;
  onImportBackup: (file: File) => void;
  isDark?: boolean;
};

export function DataManagementSection({
  onResetKakeiboData,
  onCreateBackup,
  onImportBackup,
  isDark = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        データ管理
      </h2>

      <div className="space-y-2">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}
        >
          バックアップの作成・復元
        </p>
        <p
          className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          端末内の家計簿データと設定を「バックアップファイル」として保存します。復元すると現在のデータが上書きされます。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCreateBackup}
            className="inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold"
            style={{
              borderColor: isDark ? "#0f766e" : "#10b981",
              backgroundColor: isDark ? "#064e3b" : "#ecfdf5",
              color: isDark ? "#a7f3d0" : "#047857",
            }}
          >
            バックアップ作成
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold"
            style={{
              borderColor: isDark ? "#1d4ed8" : "#60a5fa",
              backgroundColor: isDark ? "#0b1f3a" : "#eff6ff",
              color: isDark ? "#bfdbfe" : "#2563eb",
            }}
          >
            復元する
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportBackup(file);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}
        >
          家計簿データをリセット
        </p>
        <p
          className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          この端末のブラウザに保存されている予算・日別の支出／収入明細・固定費などの
          家計簿データをすべて削除します。テーマや給料日、カテゴリ・支出元プリセットの設定は残ります。
        </p>
        <button
          type="button"
          onClick={onResetKakeiboData}
          className="mt-1 inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold"
          style={{
            borderColor: isDark ? "#7f1d1d" : "#f87171",
            backgroundColor: isDark ? "#450a0a" : "#fef2f2",
            color: isDark ? "#fecdd3" : "#b91c1c",
          }}
        >
          家計簿データをすべて削除する
        </button>
      </div>

      <p
        className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}
      >
        ※ 誤って削除した場合、データを元に戻すことはできません。
      </p>
    </section>
  );
}
