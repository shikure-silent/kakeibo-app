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

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-50
        border-t border-slate-200
        bg-white/95 backdrop-blur
        shadow-[0_-1px_3px_rgba(15,23,42,0.08)]
        lg:hidden
      "
    >
      <div className="max-w-6xl mx-auto px-3 py-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-900 w-full justify-between">
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
                  flex-1 text-center rounded-full px-3 py-2 text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-950 dark:text-emerald-200"
                      : "text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
