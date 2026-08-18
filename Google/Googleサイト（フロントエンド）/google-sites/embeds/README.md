# embeds

Google サイトの「挿入」>「埋め込む」で使う HTML 候補です。

## ファイル

- `price-simulator.html`: 基本料金・プレミアム料金シミュレーター
- `transport-cost-simulator.html`: 移動代金シミュレーター
- `forms.html`: フォーム一覧

## 調整内容

- 共通 CSS の参照を `../shared/google-sites-embed.css` に変更
- GitHub Pages 用のサイト内検索スクリプトを除外
- 全ページ表示時の問い合わせポップアップを除外
- Google Tag Manager の直書きコードを除外し、Apps Script 側の `tagConfig` で管理
- `transport-cost-simulator.html` の Google Maps API キー直書きを除外し、Apps Script 側の `routes` で取得

Google サイトへ直接 HTML ファイルをアップロードして動かすのではなく、Apps Script Web アプリ、GitHub Pages、Google Drive 公開ファイルなど、iframe として読める URL に配置して埋め込みます。

## Apps Script 連携

`transport-cost-simulator.html` の `APPS_SCRIPT_API_URL` に、Google Apps Script Web アプリの URL を設定すると、住所からの経路取得を Apps Script 経由で実行できます。

基本料金と移動代金の計算ロジックは `../../GoogleAppScript（バックエンド用）` 側にも移植済みです。フロント側で完全にサーバー計算へ寄せる場合は、`basicPrice` と `transportCost` action を呼び出してください。
