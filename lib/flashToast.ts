type FlashPayload = {
  message: string;
  tone?: "success" | "info" | "error";
};

const STORAGE_KEY = "flash:toast";

export function setFlashToast(payload: FlashPayload) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent<FlashPayload>("flash-toast", {
    detail: payload,
  }));
}

export function getFlashToast() {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as FlashPayload;
    if (parsed && typeof parsed.message === "string") {
      return parsed;
    }
  } catch {
    // fall through
  }

  return { message: raw } as FlashPayload;
}

export function clearFlashToast() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
