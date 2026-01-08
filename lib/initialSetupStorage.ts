export type InitialSetupState = {
  version: number;
  completed: boolean;
  completedAt?: string;
};

const INITIAL_SETUP_VERSION = 1;
const INITIAL_SETUP_KEY = "kakeibo_initial_setup_v1";
export const INITIAL_SETUP_EVENT = "kakeibo:initial-setup-complete";

export function loadInitialSetupState(): InitialSetupState {
  if (typeof window === "undefined") {
    return { version: INITIAL_SETUP_VERSION, completed: false };
  }
  try {
    const raw = window.localStorage.getItem(INITIAL_SETUP_KEY);
    if (!raw) {
      return { version: INITIAL_SETUP_VERSION, completed: false };
    }
    const parsed = JSON.parse(raw) as Partial<InitialSetupState>;
    return {
      version:
        typeof parsed.version === "number"
          ? parsed.version
          : INITIAL_SETUP_VERSION,
      completed: !!parsed.completed,
      completedAt:
        typeof parsed.completedAt === "string" ? parsed.completedAt : undefined,
    };
  } catch {
    return { version: INITIAL_SETUP_VERSION, completed: false };
  }
}

export function isInitialSetupComplete(): boolean {
  return loadInitialSetupState().completed;
}

export function saveInitialSetupComplete() {
  if (typeof window === "undefined") return;
  const next: InitialSetupState = {
    version: INITIAL_SETUP_VERSION,
    completed: true,
    completedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(INITIAL_SETUP_KEY, JSON.stringify(next));
  } catch {
    // noop
  } finally {
    window.dispatchEvent(new Event(INITIAL_SETUP_EVENT));
  }
}

export function clearInitialSetupState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(INITIAL_SETUP_KEY);
  } catch {
    // noop
  }
}
