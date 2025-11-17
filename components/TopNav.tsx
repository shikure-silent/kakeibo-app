"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ホーム" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/input", label: "入力" },
  { href: "/settings", label: "設定" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        hidden lg:block
        border-b border-slate-200
        bg-white/90 backdrop-blur
        sticky top-0 z-40
      "
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* 左：ロゴ＋アプリ名 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-sm text-white">
              ¥
            </div>
            <span className="text-[20px] font-semibold text-slate-700">
              無理なく貯金ができる家計簿アプリ
            </span>
          </div>

          {/* 中央：ナビタブ */}
          <div className="flex-1 flex justify-center">
            <div
              className="
                inline-flex items-center
                gap-4
                text-[13px]
                bg-slate-50 rounded-full px-6 py-1.5
                transform -translate-x-10
                min-w-[380px]
              "
            >
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-4 py-2 rounded-full
                      transition-colors
                      font-medium
                      ${
                        isActive
                          ? "bg-white text-emerald-700 font-semibold shadow-sm border border-emerald-100"
                          : "text-slate-500 hover:bg-slate-100"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右：ログインボタン */}
          <div className="flex items-center">
            <button
              type="button"
              className="
                inline-flex items-center gap-1.5
                text-sm font-semibold
                px-4 py-2
                rounded-full
                bg-emerald-500 text-white
                hover:bg-emerald-600
                shadow-sm
              "
            >
              <span>ログイン</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
