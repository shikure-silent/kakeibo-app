const MAIN_BELL_PATHS = ["/input", "/calendar", "/data", "/settings"] as const;

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function shouldShowSupportBell(pathname: string) {
  const normalized = normalizePath(pathname);
  return MAIN_BELL_PATHS.some((path) => path === normalized);
}

