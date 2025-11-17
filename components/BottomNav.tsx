"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/calendar", label: "カレンダー", icon: "📅" },
  { href: "/input", label: "入力", icon: "✍️" },
  { href: "/settings", label: "設定", icon: "⚙️" },
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
      <div className="max-w-6xl mx-auto px-3 py-1.5">
        <div className="flex justify-between">
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
                  flex-1 flex flex-col items-center justify-center
                  py-1.5 gap-0.5
                  text-[10px] font-medium
                  ${
                    isActive
                      ? "text-emerald-600"
                      : "text-slate-400 hover:text-slate-700"
                  }
                `}
              >
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center mb-0.5
                    text-base
                    ${isActive ? "bg-emerald-50" : "bg-slate-50"}
                  `}
                >
                  <span>{item.icon}</span>
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
