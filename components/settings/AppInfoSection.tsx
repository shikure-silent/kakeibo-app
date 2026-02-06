type Props = {
  version: string;
  isDark?: boolean;
};

export function AppInfoSection({ version, isDark = false }: Props) {
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
        アプリ情報・ヘルプ
      </h2>

      <div className="space-y-1">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          アプリ名
        </p>
        <p
          className={`text-[12px] ${isDark ? "text-slate-200" : "text-slate-800"}`}
        >
          無理なく貯金ができる家計簿アプリ
        </p>
      </div>

      <div className="space-y-1">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          バージョン
        </p>
        <p
          className={`text-[12px] ${isDark ? "text-slate-200" : "text-slate-800"}`}
        >
          {version}
        </p>
      </div>

      <div className="space-y-1">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          データの保存について
        </p>
        <p
          className={`text-[11px] leading-snug ${isDark ? "text-slate-300" : "text-slate-500"}`}
        >
          このアプリの家計簿データは、この端末のブラウザ内（localStorage）にのみ保存されます。
          開発者側のサーバーには送信されません。
        </p>
        <p
          className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}
        >
          ブラウザの「サイトデータの削除」などを行うと家計簿データも消えるため、ご注意ください。
        </p>
      </div>

      <div className="space-y-1">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          このアプリについて
        </p>
        <p
          className={`text-[11px] leading-snug ${isDark ? "text-slate-300" : "text-slate-500"}`}
        >
          「全国×年代別の支出平均値」をベースに、無理なく貯金できるペースをつかむことを目指した家計簿アプリです。
          まだベータ版のため、仕様は今後も変更される可能性があります。
        </p>
      </div>

      <div className="space-y-1">
        <p
          className={`text-[11px] font-medium ${
            isDark ? "text-slate-200" : "text-slate-600"
          }`}
        >
          ポリシー
        </p>
        <a
          href="/privacy"
          className={`text-[12px] font-semibold ${
            isDark ? "text-emerald-200" : "text-emerald-700"
          } hover:underline`}
        >
          プライバシーポリシー
        </a>
      </div>
    </section>
  );
}
