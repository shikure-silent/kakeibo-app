"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSupabaseAuth } from "../lib/useSupabaseAuth"; // ←パス調整
import { setFlashToast } from "../lib/flashToast";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ホーム" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/input", label: "入力" },
  { href: "/settings", label: "設定" },
];

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  const tail = local.length >= 3 ? local.slice(-1) : "";
  return `${head}${"*".repeat(
    Math.max(1, local.length - (head.length + tail.length))
  )}${tail}@${domain}`;
}

function getInitials(nameOrEmail?: string | null) {
  if (!nameOrEmail) return "U";
  const s = nameOrEmail.trim();
  if (!s) return "U";
  // 日本語表示名なら先頭1文字、英語なら頭文字
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s[0].toUpperCase();
}

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);

  return ref;
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase, user, isLoading } = useSupabaseAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpenMenu(false));

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.email ? maskEmail(user.email) : "");

  const avatarText = getInitials(
    (user?.user_metadata?.display_name as string | undefined) || user?.email
  );

  const onLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setFlashToast({ message: "ログアウトしました。", tone: "info" });
    setOpenMenu(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* 左：ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-bold">
              ¥
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                無理なく貯金ができる家計簿アプリ
              </div>
            </div>
          </Link>

          {/* 中：ナビ（PC） */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-900">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "px-4 py-2 text-sm rounded-full font-medium transition",
                      isActive
                        ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-950 dark:text-emerald-200"
                        : "text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 右：認証 */}
          <div className="flex items-center gap-1.5 ml-auto">
            {isLoading ? (
              <div className="h-10 w-32 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setOpenMenu((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <div className="h-9 w-9 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-bold">
                    {avatarText}
                  </div>
                  <div className="hidden sm:block max-w-[180px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {displayName || "ログイン中"}
                  </div>
                  <div className="hidden sm:block text-slate-400">▾</div>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.user_metadata?.display_name ?? "アカウント"}
                      </div>
                      {user.email && (
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <MenuLink
                        href="/settings"
                        onClick={() => setOpenMenu(false)}
                      >
                        設定
                      </MenuLink>
                      <MenuLink
                        href="/settings#account"
                        onClick={() => setOpenMenu(false)}
                      >
                        アカウント
                      </MenuLink>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="w-full text-left rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      >
                        ログアウト
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center whitespace-nowrap rounded-full bg-emerald-600 px-2.5 py-2 text-[10px] font-semibold text-white hover:bg-emerald-700 sm:px-4 sm:text-sm"
                >
                  初めての方はこちら
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-emerald-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-950 dark:text-emerald-200 dark:hover:bg-emerald-950/30 sm:px-4 sm:text-sm"
                >
                  ログイン
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {children}
    </Link>
  );
}
