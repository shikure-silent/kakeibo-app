"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { active: boolean }) => JSX.Element;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/input",
    label: "入力",
    icon: ({ active }) => (
        <svg
          viewBox="0 0 24 24"
          className={`h-6 w-6 ${active ? "text-emerald-600" : "text-slate-500"}`}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 16v4z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.5 6.5l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/calendar",
    label: "カレンダー",
    icon: ({ active }) => (
      <svg
        viewBox="0 0 24 24"
        className={`h-6 w-6 ${active ? "text-emerald-600" : "text-slate-500"}`}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/data",
    label: "データ",
    icon: ({ active }) => (
      <svg
        viewBox="0 0 24 24"
        className={`h-6 w-6 ${active ? "text-emerald-600" : "text-slate-500"}`}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 20h16" strokeLinecap="round" />
        <path d="M6 20V11" strokeLinecap="round" />
        <path d="M12 20V5" strokeLinecap="round" />
        <path d="M18 20v-6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "設定",
    icon: ({ active }) => (
        <svg
          viewBox="0 0 24 24"
          className={`h-6 w-6 ${active ? "text-emerald-600" : "text-slate-500"}`}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M10.2 3h3.6l.6 2.2a7.6 7.6 0 0 1 1.7.9l2.1-1 1.8 3.1-1.7 1.6c.1.6.2 1.2.2 1.8s-.1 1.2-.2 1.8l1.7 1.6-1.8 3.1-2.1-1a7.6 7.6 0 0 1-1.7.9l-.6 2.2h-3.6l-.6-2.2a7.6 7.6 0 0 1-1.7-.9l-2.1 1-1.8-3.1 1.7-1.6a7.6 7.6 0 0 1 0-3.6L3.1 8.2l1.8-3.1 2.1 1a7.6 7.6 0 0 1 1.7-.9L10.2 3z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isSetupFlow =
    pathname.startsWith("/setup") || pathname.startsWith("/welcome");
  const isPasswordRecoveryFlow =
    pathname.startsWith("/reset-password") || pathname.startsWith("/auth/confirm");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const viewport = window.visualViewport;
    const KEYBOARD_THRESHOLD = 120;
    const getViewportHeight = () =>
      viewport ? viewport.height : window.innerHeight;
    let baseHeight = getViewportHeight();

    const updateOffset = () => {
      const current = getViewportHeight();
      const diff = baseHeight - current;
      if (diff >= KEYBOARD_THRESHOLD) {
        root.style.setProperty("--keyboard-offset", `${diff}px`);
        return;
      }
      if (Math.abs(diff) > 1) {
        baseHeight = current;
      }
      root.style.setProperty("--keyboard-offset", "0px");
    };

    const resetBase = () => {
      baseHeight = getViewportHeight();
      root.style.setProperty("--keyboard-offset", "0px");
    };

    updateOffset();
    if (viewport) {
      viewport.addEventListener("resize", updateOffset);
      viewport.addEventListener("scroll", updateOffset);
    }
    window.addEventListener("orientationchange", resetBase);
    return () => {
      if (viewport) {
        viewport.removeEventListener("resize", updateOffset);
        viewport.removeEventListener("scroll", updateOffset);
      }
      window.removeEventListener("orientationchange", resetBase);
      root.style.setProperty("--keyboard-offset", "0px");
    };
  }, []);

  if (isSetupFlow || isPasswordRecoveryFlow) {
    return null;
  }

  return (
    <>
      <div
        className="bottom-nav-spacer h-[calc(4rem+env(safe-area-inset-bottom))] bg-slate-50 lg:hidden"
        aria-hidden="true"
      />
      <nav
        style={{ transform: "translateY(var(--keyboard-offset, 0px))" }}
        className="
          fixed bottom-0 inset-x-0 z-50
          border-t border-slate-200
          bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur
          shadow-[0_-1px_3px_rgba(15,23,42,0.08)]
          lg:hidden
        "
      >
        <div className="max-w-6xl mx-auto px-2">
          <div className="flex items-center justify-between gap-1 pt-0.5 pb-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 text-[9px] font-medium transition ${
                    isActive
                      ? "text-emerald-700"
                      : "text-slate-600 hover:text-emerald-600"
                  }`}
                >
                  {item.icon({ active: isActive })}
                  <span className="leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
