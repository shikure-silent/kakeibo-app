"use client";

import React from "react";

export default function SettingsPage() {
  return (
    <main>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-4">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1">
            設定
          </h1>
          <p className="text-xs lg:text-sm text-slate-500">
            アプリ全体の初期値や表示方法を調整できる画面を、ここに作り込んでいきます。
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-4 lg:px-6 lg:py-5 text-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            将来的に追加できそうな設定項目（案）
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>デフォルトの都道府県</li>
            <li>月の開始日（1日 / 25日締めなど）</li>
            <li>通貨・表記（円／千円単位など）</li>
            <li>テーマカラー（グリーン / オレンジ切り替え）</li>
            <li>バックアップ・同期（将来 Supabase 連携など）</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
