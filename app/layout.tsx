// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import BottomNav from "../components/BottomNav";
import TopNav from "../components/TopNav";
import FlashToast from "../components/FlashToast";
import { APP_NAME } from "../lib/const";
import ThemeRoot from "../components/ThemeRoot";
import InitialSetupGate from "../components/InitialSetupGate";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_NAME,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-800 antialiased font-sans">
        <ThemeRoot>
          <InitialSetupGate>
            {/* PC用トップナビ（lg以上で表示） */}
            <TopNav />
            <FlashToast />

            {/* メインコンテンツ（下ナビぶん余白確保） */}
            <div className="min-h-screen">{children}</div>

            {/* スマホ用ボトムナビ（lg未満で表示） */}
            <BottomNav />
          </InitialSetupGate>
        </ThemeRoot>
      </body>
    </html>
  );
}
