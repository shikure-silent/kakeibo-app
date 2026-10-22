# 依存パッケージのセキュリティ対応

確認日: 2026年10月23日（日本時間）

## 適用した修正

Node.js 24.22.1、Next.js 16.4.2への更新後に検出された14件について、
修正版のある7件を解消した。全依存の`npm audit`にはhighが7件残り、
`npm audit --omit=dev`では0件だった。全依存の監査はまだ成功しない。

| 対象 | 対応 | 修正情報 |
| --- | --- | --- |
| Capacitor Android / iOS | core・CLI・両プラットフォームを8.5.3へ更新。iOSのSwift依存も同期 | [GHSA-rvm3-566m-v7fv](https://github.com/advisories/GHSA-rvm3-566m-v7fv) |
| compression（serve経由） | npm overridesで1.8.2以上の1系を指定 | [GHSA-vc2v-76pw-4v95](https://github.com/advisories/GHSA-vc2v-76pw-4v95) |
| postcss-selector-parser（Tailwind CSS / postcss-nested経由） | overridesで7.1.6以上の7系を指定 | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) |
| source-map-js | overridesで1.2.2以上の1系を指定 | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) |

Capacitor CLI更新で追加されたxcodeパッケージのuuidも、同パッケージに限定した
overrideで11.1.1以上の11系へ更新した。
[GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)

overridesは親パッケージが指定する古い依存を修正版へ置き換えるために必要。
CSS解析パッケージはメジャーバージョンが変わるため、実際の本番ビルドのCSSが
更新前とバイト単位で一致することを確認した。xcodeについては実際のプロジェクトの
解析とUUID生成を確認した。親パッケージが修正版を採用したらoverrideの削除を検討する。

## 残る7件: bracesの未修正アドバイザリ

[GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
は、深く入れ子になったbraceパターンによるスタック枯渇を報告している。
公開済みの最新版はbraces 3.0.3で、修正版は公開されていない。

監査の7件は別々の問題ではなく、同じ問題とその依存元を含む件数:
braces、micromatch、fast-glob、chokidar、tailwindcss、
@next/eslint-plugin-next、eslint-config-next。

このプロジェクトではTailwind CSSのソース走査やNext.jsのESLintルールを通じて
開発ツールから利用される。パターンはリポジトリの設定で管理しており、アプリの
ユーザー入力をglobパターンとして渡す処理は確認されなかった。
静的出力の`out`を配信する構成で、これらの開発ツールは配信時に動作しない。
ただし依存パッケージ自体の問題は未解消なので、信頼できないglobパターンを
開発ツールへ渡さず、修正版の公開時に更新して全依存の監査をやり直す。

アドバイザリの除外や監査の無効化は行っていない。
`npm audit fix --force`が提案する旧Next.js用ESLint設定への変更は、
Next.js 16との互換性を崩すため適用していない。

## 再確認とアプリへの反映

今回の検証では、クリーンインストール（`npm ci`）、ESLint、本番ビルド内の
TypeScriptチェック、22ページの静的生成が成功した。生成CSSの一致、長いCSS
セレクタの解析、gzip圧縮と主要4ページの配信、Xcodeプロジェクトの解析・UUID生成も確認した。
iOSは未署名のシミュレータ向けビルド、AndroidはDebugビルドが成功した。

このMacでは古いAndroid生成キャッシュの読み込みが止まったため、Androidの検証には
`/private/tmp/kakeibo-security-android-output`を出力先として使用した。
Gradleが破損を報告した変換キャッシュ1件も退避して再生成した。
Androidのリソース内にあった番号付きの重複コピー7ファイルは、通常名のファイルと
内容が一致することを確認してから
`/private/tmp/kakeibo-android-duplicate-res-C8YzrK`へ退避した。
退避先の`manifest.json`に元の位置を記録している。
`node_modules`内の重複したSwiftソースとAndroidリソースはクリーンインストールで解消した。

```sh
nvm use
npm ci
npm audit
npm audit --omit=dev
npm run lint
npm run build
npx cap sync
```

全依存の`npm audit`はbracesの修正版が入るまで非ゼロで終了する。
Webは再デプロイ、iOS / Androidはネイティブアプリの再ビルド・配布により
利用者の環境へ修正を反映する。既に配布済みのバイナリは依存更新だけでは変わらない。
