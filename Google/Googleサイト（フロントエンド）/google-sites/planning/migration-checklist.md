# Google サイト移行チェックリスト

## 1. ページ構成

- トップページ: `pages/index.fragment.html`
- サービス: `pages/service.fragment.html`
- 料金: `embeds/price-simulator.html`
- 移動代金: `embeds/transport-cost-simulator.html`
- フォーム: `embeds/forms.html`
- ヘルプ: `pages/helps__help-document.fragment.html` と `pages/helps__articles__*.fragment.html`
- 規約: `pages/policy.fragment.html` と `pages/guide__policy__*.fragment.html`
- 資料: `drive-assets/documet/`

## 2. Google サイト側の作業

- Google サイトで主要ページを作成する
- `planning/page-inventory.csv` を見ながらページ本文を移す
- 資料は Google ドライブへアップロードして、Drive 挿入または共有リンクへ置き換える
- 料金・移動代金・フォームは埋め込み URL として配置する
- 旧 GitHub Pages 用の `.github/`、`CNAME`、`.gitignore` は Google サイトには移さない

## 3. 公開前確認

- スマートフォン幅で見出しとボタンが折り返されるか確認する
- 外部フォーム、PDF、動画リンクが開けるか確認する
- Google Apps Script の Web アプリ URL がフォーム送信先として正しいか確認する
- 公開範囲が「リンクを知っている全員」または意図した権限になっているか確認する

## 4. Apps Script 化した要素

- Google Tag Manager: `GoogleAppScript（バックエンド用）/GoogleTag.gs` の `tagConfig`
- 基本料金シミュレーター: `GoogleAppScript（バックエンド用）/PriceSimulator.gs` の `basicPrice`
- 移動代金シミュレーター: `GoogleAppScript（バックエンド用）/TransportSimulator.gs` の `transportCost`
- 経路取得: `GoogleAppScript（バックエンド用）/Routes.gs` の `routes`
- 機密値管理: `GoogleAppScript（バックエンド用）/Config.gs` と `Security.md`

## 5. 削除・整理した要素

- Google サイト最適化先からサイト内検索機能を削除
- 誤った表記を「シミュレーター」に統一
- Google サイト最適化先から Google Maps API キー、Google Identity クライアント ID、Google Form entry キーの直書きを削除
