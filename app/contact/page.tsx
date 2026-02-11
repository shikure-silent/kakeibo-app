"use client";

import Link from "next/link";

const CONTACT_EMAIL = "allora.office.info@gmail.com";
const CONTACT_SUBJECT = "【無理かけ】お問い合わせ";

export default function ContactPage() {
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`;

  return (
    <main className="min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            お問い合わせ
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            ご意見・不具合報告はメールで受け付けています。
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-[12px] leading-relaxed text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <p>
            不具合報告の際は、発生した画面・操作手順・表示されたメッセージを添えていただくと確認がスムーズです。
          </p>

          <div className="mt-4">
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              連絡先メールアドレス
            </p>
            <a
              href={mailtoHref}
              className="mt-1 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              {CONTACT_EMAIL} にメールする
            </a>
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
