import { Capacitor } from "@capacitor/core";
import {
  PushNotifications,
  type PushNotificationSchema,
  type ActionPerformed,
} from "@capacitor/push-notifications";
import {
  LocalNotifications,
  type PermissionStatus,
} from "@capacitor/local-notifications";

const PUSH_TOKEN_KEY = "kakeibo_push_token";
const NOTIFICATION_PROMPTED_KEY = "kakeibo_notification_prompted_v1";
let listenersRegistered = false;
let registrationPromise: Promise<{ registered: boolean; token?: string }> | null =
  null;
let activeRegistrationResolver:
  | ((result: { registered: boolean; token?: string }) => void)
  | null = null;

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export function getPushToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PUSH_TOKEN_KEY);
}

function setPushToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PUSH_TOKEN_KEY, token);
}

export async function checkPushPermission() {
  if (!isNativePlatform()) return { receive: "prompt" as const };
  return PushNotifications.checkPermissions();
}

export async function requestPushPermission() {
  if (!isNativePlatform()) return { receive: "prompt" as const };
  return PushNotifications.requestPermissions();
}

export async function registerPushNotifications() {
  if (!isNativePlatform()) return { registered: false };

  if (registrationPromise) {
    return registrationPromise;
  }

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") {
    return { registered: false };
  }

  registrationPromise = new Promise(async (resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finish = (result: { registered: boolean; token?: string }) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      activeRegistrationResolver = null;
      registrationPromise = null;
      resolve(result);
    };

    activeRegistrationResolver = finish;

    if (!listenersRegistered) {
      listenersRegistered = true;
      PushNotifications.addListener("registration", (token) => {
        setPushToken(token.value);
        activeRegistrationResolver?.({ registered: true, token: token.value });
      });
      PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration error", error);
        activeRegistrationResolver?.({ registered: false });
      });
      PushNotifications.addListener(
        "pushNotificationReceived",
        (notification: PushNotificationSchema) => {
          console.log("Push received", notification);
        }
      );
      PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (action: ActionPerformed) => {
          console.log("Push action", action);
        }
      );
    }

    try {
      await PushNotifications.register();
    } catch (error) {
      console.error("Push register call failed", error);
      finish({ registered: false });
      return;
    }

    timeoutId = setTimeout(() => {
      const token = getPushToken() ?? undefined;
      finish({ registered: !!token, token });
    }, 4000);
  });

  return registrationPromise;
}

export async function checkLocalNotificationPermission(): Promise<PermissionStatus> {
  if (!isNativePlatform()) return { display: "prompt" };
  return LocalNotifications.checkPermissions();
}

export async function requestLocalNotificationPermission(): Promise<PermissionStatus> {
  if (!isNativePlatform()) return { display: "prompt" };
  return LocalNotifications.requestPermissions();
}

export async function scheduleTestLocalNotification() {
  if (!isNativePlatform()) return false;
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return false;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now() % 100000,
        title: "通知テスト",
        body: "ローカル通知のテストです。",
        schedule: { at: new Date(Date.now() + 2000) },
      },
    ],
  });
  return true;
}

export async function requestInitialNotificationPermissionOnce() {
  if (!isNativePlatform()) return;
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(NOTIFICATION_PROMPTED_KEY)) return;
  try {
    await LocalNotifications.requestPermissions();
  } finally {
    window.localStorage.setItem(NOTIFICATION_PROMPTED_KEY, "1");
  }
}

export async function openAppSettings() {
  if (!isNativePlatform()) return false;
  if (typeof window === "undefined") return false;
  if (Capacitor.getPlatform() === "ios") {
    window.location.href = "app-settings:";
    return true;
  }
  window.location.href = "app-settings:";
  return true;
}
