# 機密性確保が必要な値

以下はフロントエンドに直書きせず、Google Apps Script のスクリプトプロパティで管理します。

このファイルには実値を含みます。公開リポジトリへコミットしないでください。Apps Script のスクリプトプロパティへ転記した後は、実値を削除したテンプレートへ戻す運用を推奨します。

公開してよい値でも、差し替えや権限管理が必要なものはプロパティ化しています。Google Maps API キーは必ず HTTP リファラー制限または API 制限も設定してください。

## 参照元

| 値 | 参照元 |
| --- | --- |
| GOOGLE_TAG_MANAGER_ID | 各 HTML の Google Tag Manager 埋め込みコード |
| GOOGLE_MAPS_API_KEY | `transport_cost_simulator.html` の `GOOGLE_MAPS_API_KEY` |
| ESTIMATE_EMAIL_TO | `transport_cost_simulator.html` の `ESTIMATE_EMAIL_TO` |
| GOOGLE_CLIENT_ID | `lead-form-popup.js` の `GOOGLE_CLIENT_ID` |
| LEAD_FORM_URL | `lead-form-popup.js` の `REDIRECT_URL` |
| GOOGLE_NAME_ENTRY_KEY | `lead-form-popup.js` の `GOOGLE_NAME_ENTRY_KEY` |
| GOOGLE_EMAIL_ENTRY_KEY | `lead-form-popup.js` の `GOOGLE_EMAIL_ENTRY_KEY` |
| SPREADSHEET_ID | 明示 ID は検出できず。`documet/1.md` 内のサンプルは `SpreadsheetApp.getActiveSpreadsheet()` を利用 |
