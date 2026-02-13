# iOS Release QA Checklist Final

Last updated: 2026-02-13

TestFlight / App Store提出前の最終確認用。

## 実行環境

- [x] Build command confirmed:
  - `npm run build`
  - `npx cap sync ios`
- [x] Xcode project opens:
  - `/Users/taku/Desktop/kakeibo-app/ios/App/App.xcworkspace`
- [ ] Test device:
  - iPhone model: __________
  - iOS version: __________

## 1) Build / release foundation

- [x] `capacitor.config.ts` values are correct (`appId`, `appName`, `webDir=out`)
- [x] `next.config.js` static export settings are correct
- [x] Version rule is fixed (1.0.0 -> 1.0.1 ...)
- [ ] Build number update done (`CFBundleVersion` incremented)

## 2) Auth / mail links (Supabase)

- [x] Redirect URLs include production and capacitor scheme
- [x] Signup -> mail verify flow works（メール+パスワード）
- [x] Password reset mail -> update flow works
- [ ] Native deep link return path final check on production-like build

## 3) Save / backup

- [x] Offline input -> online return keeps data
- [x] Background / foreground transition keeps data
- [x] App reinstall behavior confirmed:
  - [x] local-only data cleared
  - [x] cloud data restored after login
- [x] Backup create / restore works

## 4) Notifications / reminders

- [x] In-app support cards display correctly
- [x] Notification permission prompt behavior confirmed
- [x] Local notification test works (if enabled)
- [ ] Push (APNs) final test done (after enrollment)

## 5) Privacy / store requirements

- [x] Privacy policy URL is public:
  - `https://kakeibo-app-orcin.vercel.app/privacy/`
- [x] Terms URL is public:
  - `https://kakeibo-app-orcin.vercel.app/terms/`
- [x] Contact URL is public:
  - `https://kakeibo-app-orcin.vercel.app/contact/`
- [ ] App Privacy answers entered in App Store Connect

## 6) Assets

- [x] Home icon looks correct on iOS
- [x] Splash screen looks correct on iOS
- [x] No clipping / blur issues on notch devices

## 7) UI / behavior regression

- [x] Input page layout and keyboard behavior
- [x] Calendar page layout
- [x] Data page layout
- [x] Settings page layout
- [x] No critical crash in major flows

## Sign-off

- QA date: __________
- Tester: __________
- Result:
  - [ ] PASS
  - [x] CONDITIONAL PASS
  - [ ] FAIL
- Notes: ____________________________________________
