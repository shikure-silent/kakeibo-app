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
            最終更新日：2026年2月12日
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
                <li>アカウント情報（メールアドレス）</li>
                <li>家計簿の入力内容（支出・収入・カテゴリ・メモなど）</li>
                <li>クラウド同期時の識別情報（ユーザーID）</li>
                <li>お問い合わせ時に利用者が任意で送信する情報</li>
              </ul>
              <p className="mt-1 text-[12px]">
                本アプリは、広告識別子（IDFA）や他社サイト・他社アプリを横断するトラッキング情報を取得しません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                2. 取得方法と利用目的
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>
                  利用者が入力した情報を、家計簿機能の提供・表示・集計のために利用します。
                </li>
                <li>
                  ログイン機能を利用した場合、認証・アカウント管理のためにメールアドレス等を利用します。
                </li>
                <li>
                  クラウド同期機能を利用した場合、複数端末でのデータ引き継ぎ・復元のためにクラウド保存を行います。
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                3. 情報の保存場所
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>
                  未ログイン時の家計簿データは、端末内（localStorage）に保存されます。
                </li>
                <li>
                  ログイン時は、端末保存に加えてクラウド（Supabase）に保存されます。
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                4. 第三者提供・外部サービス利用
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>
                  Supabase：認証・クラウド同期のために、メールアドレス、ユーザーID、同期データを取り扱います。
                  <br />
                  参考：
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
                  >
                    Supabase Privacy Policy
                  </a>
                </li>
                <li>
                  Resend（またはSMTP事業者）：確認メール・再設定メール送信のために、メールアドレスを利用します。
                  <br />
                  参考：
                  <a
                    href="https://resend.com/legal/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
                  >
                    Resend Privacy Policy
                  </a>
                </li>
                <li>
                  e-Stat
                  API：支出平均データ取得のために利用します（個人情報は送信しません）。
                  <br />
                  参考：
                  <a
                    href="https://www.e-stat.go.jp/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
                  >
                    e-Stat プライバシーポリシー
                  </a>
                </li>
              </ul>
              <p className="mt-1 text-[12px]">
                法令に基づく場合を除き、上記目的以外で個人情報を第三者へ提供することはありません。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                5. データ保持期間・削除方法
              </h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>
                  端末内データは、利用者が削除するまで端末内に保持されます。
                </li>
                <li>クラウドデータは、アカウントが有効な間保持されます。</li>
                <li>
                  端末内データは、設定ページの「データ管理」から削除できます。クラウド復元を行うと、クラウド上のデータで上書きされます。
                </li>
                <li>
                  クラウドデータの削除を希望する場合は、本ポリシー記載の問い合わせ窓口へご連絡ください。本人確認の上、合理的な期間内に対応します。
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                6. アカウント削除とデータ処理
              </h2>
              <p className="mt-1 text-[12px]">
                利用者は、アプリ内の「設定 &gt; アカウント &gt;
                アカウント削除」から、退会（アカウント削除）を申請できます。
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px]">
                <li>
                  アカウント削除後は、同じアカウントでのログインはできなくなります。
                </li>
                <li>
                  クラウド同期用のアカウント情報およびクラウド保存データは削除されます。
                </li>
                <li>
                  端末内データは、端末側に残っている場合があります。必要に応じて「データ管理」から削除してください。
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                7. 開示・訂正・削除等の請求
              </h2>
              <p className="mt-1 text-[12px]">
                利用者は、自己の個人情報に関する開示、訂正、削除等を希望する場合、下記のお問い合わせ窓口からご連絡ください。本人確認の上、法令に従って対応します。
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                8. お問い合わせ窓口
              </h2>
              <p className="mt-1 text-[12px]">
                プライバシーに関するお問い合わせは、以下までご連絡ください。
              </p>
              <p className="mt-1 text-[12px] font-semibold">
                メールアドレス：allora.office.info@gmail.com
              </p>
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                9. 改定
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
