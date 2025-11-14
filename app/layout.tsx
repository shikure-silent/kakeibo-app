// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // 普通 / 中 / 太字
});

export const metadata: Metadata = {
  title: "貯金ができる家計簿アプリ",
  description: "貯金ができる家計簿アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJp.className} bg-slate-50 text-slate-800 antialiased`}
      >
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
