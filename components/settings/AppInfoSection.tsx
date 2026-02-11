import Link from "next/link";

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
          ログインしていない場合、家計簿データはこの端末内に保存されます。
          ログインしている場合は、端末内保存に加えてクラウドへ自動保存され、機種変更時も同じアカウントで引き継げます。
        </p>
        <p
          className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}
        >
          端末データはブラウザの「サイトデータの削除」で消えるためご注意ください。必要なときは「クラウド復元」を利用できます。
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
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          <Link
            href="/terms"
            className={`font-semibold ${
              isDark ? "text-emerald-200" : "text-emerald-700"
            } hover:underline`}
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className={`font-semibold ${
              isDark ? "text-emerald-200" : "text-emerald-700"
            } hover:underline`}
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/contact"
            className={`font-semibold ${
              isDark ? "text-emerald-200" : "text-emerald-700"
            } hover:underline`}
          >
            お問い合わせ
          </Link>
        </div>
      </div>
    </section>
  );
}
