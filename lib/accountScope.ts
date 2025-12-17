// lib/accountScope.ts
const ACTIVE_USER_KEY = "kakeibo_active_user_id_v1";

export function getActiveUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_USER_KEY);
}

export function setActiveUserId(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export function clearActiveUserId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_USER_KEY);
}
