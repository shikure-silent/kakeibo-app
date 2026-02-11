# APNs Onboarding Checklist (After Apple Developer Program Enrollment)

This project already has basic native notification code in place.
Use this checklist after enrollment to enable iPhone OS push notifications quickly.

## 1. Apple Developer portal setup

1. Confirm the App ID uses this bundle identifier:
`com.murikake`
2. Enable `Push Notifications` capability on the App ID.
3. Create an APNs Auth Key (`.p8`) for server-side sending.
4. Save values for backend config:
- Key ID
- Team ID
- Bundle ID (`com.murikake`)
- Private key content (`.p8`)

## 2. Xcode project setup

1. Open `/Users/taku/Desktop/kakeibo-app/ios/App/App.xcodeproj` in Xcode.
2. Select target `App` -> `Signing & Capabilities`.
3. Add capability: `Push Notifications`.
4. (Optional) Add `Background Modes` -> `Remote notifications` if silent push will be used.
5. Ensure correct signing team/profile for device build.

## 3. App behavior checks

1. Build and run on a real iPhone (simulator cannot receive APNs push).
2. Open app settings screen and press `Push登録`.
3. Confirm token registration succeeds and UI shows `Push通知: 許可` and `登録済み`.

## 4. Backend integration (required for actual APNs delivery)

1. Implement API to receive and store per-user APNs token.
2. Send APNs push via HTTP/2 using the APNs Auth Key.
3. Include topic header: `com.murikake`.
4. Handle invalid token cleanup from APNs error responses.

## 5. Existing code entry points

- Push/local notification helper:
`/Users/taku/Desktop/kakeibo-app/lib/notifications.ts`
- OS notification settings UI:
`/Users/taku/Desktop/kakeibo-app/components/settings/OsNotificationSection.tsx`
- iOS APNs callbacks:
`/Users/taku/Desktop/kakeibo-app/ios/App/App/AppDelegate.swift`
