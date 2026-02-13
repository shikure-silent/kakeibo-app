# App Store Privacy Answers Final

Last updated: 2026-02-13

App Store Connect > App Privacy に入力する最終案。

## 全体回答

- Data Used to Track You: No
- Data Not Linked to You: No
- Data Linked to You: Yes

## 収集データ（入力案）

1. Contact Info -> Email Address
- Collected: Yes
- Linked to User: Yes
- Used for Tracking: No
- Purposes:
  - App Functionality（ログイン、アカウント管理、再設定メール）

2. Identifiers -> User ID
- Collected: Yes
- Linked to User: Yes
- Used for Tracking: No
- Purposes:
  - App Functionality（クラウド同期データの紐付け）

3. User Content -> Other User Content
- Collected: Yes
- Linked to User: Yes
- Used for Tracking: No
- Purposes:
  - App Functionality（家計簿データの同期・復元）

## 非収集（入力案）

- Contact Info -> Name / Phone / Address / Other
- Health & Fitness
- Financial Info (payment card / bank data)
- Location
- Sensitive Info
- Contacts
- Browsing History
- Search History
- Purchases
- Diagnostics
- Usage Data
- Device ID (IDFA)

## 補足

- Push token は現状ローカル保持のみで、サーバー送信は未実装。
- Analytics SDK は未導入。
- 広告SDKは未導入。

## 根拠コード

- Auth & account:
  - /Users/taku/Desktop/kakeibo-app/app/login/page.tsx
  - /Users/taku/Desktop/kakeibo-app/app/signup/page.tsx
- Cloud sync persistence:
  - /Users/taku/Desktop/kakeibo-app/lib/kakeiboStateRepo.ts
  - /Users/taku/Desktop/kakeibo-app/lib/cloudSync.ts
- Privacy policy:
  - /Users/taku/Desktop/kakeibo-app/app/privacy/page.tsx
