"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            利用規約
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            最終更新日：2026年2月12日
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-[12px] leading-relaxed text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <p>
            本規約は、「無理なく貯金ができる家計簿アプリ」（以下「本アプリ」）の利用条件を定めるものです。利用者は、本アプリを利用することで本規約に同意したものとみなされます。
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                1. 当事者
              </h2>
              <p className="mt-1 text-[12px]">
                本規約は、利用者と本アプリの開発者（以下「運営者」）との間で適用されます。
              </p>
              <p className="mt-1 text-[12px]">
                なお、iOS版に関しては Apple Inc.
                およびその子会社（以下「Apple」）は本規約の当事者ではありません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                2. 使用許諾の範囲
              </h2>
              <p className="mt-1 text-[12px]">
                運営者は、利用者に対し、利用者が正当に利用権限を有する端末・OS・ブラウザ上で、本アプリを個人的かつ非商用目的で利用する、非独占的・譲渡不能・再許諾不能の限定的な使用権を許諾します。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                3. メンテナンスおよびサポート
              </h2>
              <p className="mt-1 text-[12px]">
                本アプリに関するメンテナンスおよびサポートは運営者が提供します。iOS版に関して、Appleは本アプリに関する保守・サポート義務を負いません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                4. 保証
              </h2>
              <p className="mt-1 text-[12px]">
                本アプリは現状有姿で提供され、明示または黙示を問わず、特定目的適合性・有用性・完全性・継続性等を含む一切の保証を行いません。iOS版に関して、Appleは本アプリに関する保証責任を負いません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                5. 製品に関する請求
              </h2>
              <p className="mt-1 text-[12px]">
                本アプリに関する苦情、請求、問い合わせ（製造物責任請求、法令適合性、消費者保護関連の請求を含みますがこれに限りません）は、運営者が対応します。iOS版に関して、Appleは責任を負いません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                6. 知的財産権
              </h2>
              <p className="mt-1 text-[12px]">
                本アプリおよび関連コンテンツの知的財産権は運営者または正当な権利者に帰属します。本アプリの利用に関して第三者の知的財産権侵害請求がなされた場合、運営者が合理的範囲で対応します。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                7. 法令遵守・輸出管理
              </h2>
              <p className="mt-1 text-[12px]">
                利用者は、適用される法令および輸出管理規制を遵守して本アプリを利用するものとします。利用者は、米国法その他適用法令で禁輸対象または制裁対象に指定された国・地域に所在せず、また当該制裁対象者リストに掲載されていないことを表明し保証します。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                8. 登録情報およびパスワード管理
              </h2>
              <p className="mt-1 text-[12px]">
                利用者は、登録情報（メールアドレス等）を正確かつ最新の状態に保つものとし、自己の責任でログイン情報を管理するものとします。第三者への共有は禁止します。
              </p>
              <p className="mt-1 text-[12px]">
                パスワードを忘れた場合は、アプリのパスワード再設定機能を利用してください。運営者は利用者のパスワードを保管していないため、個別に元のパスワードをお知らせすることはできません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                9. 禁止事項
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>法令または公序良俗に反する行為</li>
                <li>本アプリの運営を妨害する行為</li>
                <li>不正アクセス、またはそれを試みる行為</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                10. アカウント削除（退会）
              </h2>
              <p className="mt-1 text-[12px]">
                利用者は、アプリ内の「設定 &gt; アカウント &gt;
                アカウント削除」から、いつでもアカウント削除を申請できます。
              </p>
              <p className="mt-1 text-[12px]">
                アカウント削除が完了すると、クラウド同期用のアカウント情報およびクラウド保存データは削除され、同じアカウントでのログインはできなくなります。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                11. 連絡先（運営者情報）
              </h2>
              <p className="mt-1 text-[12px]">運営者名：株式会社Allora</p>
              <p className="mt-1 text-[12px]">
                所在地：東京都小平市（詳細な住所は請求があった場合に遅滞なく開示します）
              </p>
              <p className="mt-1 text-[12px]">
                連絡先：allora.office.info@gmail.com
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                12. 第三者受益者
              </h2>
              <p className="mt-1 text-[12px]">
                iOS版の利用者は、AppleおよびAppleの子会社が本規約の第三者受益者であり、利用者が本規約に同意した時点で、Appleが利用者に対して本規約を強制する権利を有することに同意します。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                13. 配信プラットフォーム規約
              </h2>
              <p className="mt-1 text-[12px]">
                本アプリを各プラットフォーム（Web、iOS、Android等）で利用する場合、利用者は本規約に加えて、当該プラットフォーム運営者の利用規約・ポリシーにも従うものとします。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                14. 規約変更
              </h2>
              <p className="mt-1 text-[12px]">
                本規約は、必要に応じて変更されることがあります。変更後の規約は本アプリに掲示した時点で効力を生じます。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                15. 準拠法・管轄
              </h2>
              <p className="mt-1 text-[12px]">
                本規約は日本法に準拠し、本アプリに関して生じる紛争は、運営者所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </div>
          </div>
        </section>

        <div className="text-right">
          <Link
            href="/settings/"
            className="text-[12px] font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
          >
            設定へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
