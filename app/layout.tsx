// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import BottomNav from "../components/BottomNav";
import TopNav from "../components/TopNav";
import { APP_NAME } from "../lib/const";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_NAME,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-800 antialiased font-sans">
        {/* PC用トップナビ（lg以上で表示） */}
        <TopNav />

        {/* メインコンテンツ（下ナビぶん余白確保） */}
        <div className="min-h-screen pb-16 lg:pb-0">{children}</div>

        {/* スマホ用ボトムナビ（lg未満で表示） */}
        <BottomNav />
      </body>
    </html>
  );
}
