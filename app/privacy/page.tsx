"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            プライバシーポリシー
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            最終更新日：2026年1月31日
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-[12px] leading-relaxed text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <p>
            本アプリ（家計簿アプリ）では、利用者のプライバシーを尊重し、以下の方針で情報を取り扱います。
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                1. 取得する情報
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>
                  家計簿の入力内容（支出・収入・カテゴリ・メモなど）
                </li>
                <li>
                  ログイン機能を利用した場合のアカウント情報（メールアドレス等）
                </li>
                <li>
                  クラウド同期時の識別情報（ユーザーID）
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                2. 情報の保存場所
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>
                  家計簿データは、原則として端末のブラウザ内（localStorage）に保存されます。
                </li>
                <li>
                  ログイン機能でクラウド同期を利用した場合、家計簿データはクラウド（Supabase）に保存されます。
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                3. 利用目的
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>家計簿機能の提供・表示</li>
                <li>クラウド同期・復元の提供（利用時のみ）</li>
                <li>アプリ内の統計表示・改善のため</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                4. 第三者提供
              </h2>
              <p className="mt-1 text-[12px]">
                法令に基づく場合を除き、取得した情報を第三者へ提供することはありません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                5. 追跡・広告識別子
              </h2>
              <p className="mt-1 text-[12px]">
                本アプリは、他社アプリやWebサイトを横断したトラッキング、広告配信目的の識別子取得は行いません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                6. 外部サービス
              </h2>
              <p className="mt-1 text-[12px]">
                ログインやクラウド同期に Supabase を利用します。年代別支出の参考データ取得に e-Stat
                API を利用します（個人情報は送信しません）。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                7. データの削除
              </h2>
              <p className="mt-1 text-[12px]">
                設定ページのデータ管理機能から、端末内データの削除が可能です。クラウド同期を利用している場合は、ログアウトや再同期時に上書きされることがあります。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                8. 改定
              </h2>
              <p className="mt-1 text-[12px]">
                本ポリシーは必要に応じて変更されることがあります。重要な変更がある場合は、アプリ内で告知します。
              </p>
            </div>
          </div>
        </section>

        <div className="text-right">
          <Link
            href="/settings"
            className="text-[12px] font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
          >
            設定へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
