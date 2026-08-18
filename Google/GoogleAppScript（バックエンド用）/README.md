# GoogleAppScript（バックエンド用）

このフォルダは、Google サイト側から呼び出すバックエンド処理を Google Apps Script として管理するための雛形です。

## ファイル

- `appsscript.json`: Apps Script プロジェクトのマニフェスト
- `Code.gs`: Web アプリとして公開できる最小 API
- `Config.gs`: スクリプトプロパティから公開設定・機密設定を読む共通処理
- `GoogleTag.gs`: Google Tag Manager 埋め込みコードを設定値から生成
- `PriceSimulator.gs`: 基本料金・プレミアム料金シミュレーターの計算処理
- `TransportSimulator.gs`: 移動代金シミュレーターの計算処理
- `Routes.gs`: Google Routes API をサーバー側から呼ぶ経路取得処理
- `Security.md`: フロントへ直書きしない値の一覧

## 想定用途

- Google サイトからの問い合わせ・申込データ受付
- Google スプレッドシートへの保存
- 自動返信メールや管理者通知
- Google フォームでは足りない独自バリデーション
- シミュレーター計算処理のバックエンド化
- Google Maps / Routes API キーの秘匿
- Google Tag Manager ID など設定値の一元管理

## 初期設定

1. Google Apps Script で新規プロジェクトを作成します。
2. `appsscript.json` と `Code.gs` の内容を反映します。
3. 必要な `.gs` ファイルを同じ Apps Script プロジェクトに追加します。
4. スクリプトプロパティを設定します。
5. Web アプリとしてデプロイし、発行された URL を Google サイト側に設定します。

## スクリプトプロパティ

| プロパティ | 用途 |
| --- | --- |
| SPREADSHEET_ID | 問い合わせ保存先の Google スプレッドシート ID |
| GOOGLE_TAG_MANAGER_ID | Google Tag Manager のコンテナ ID |
| GOOGLE_MAPS_API_KEY | Google Routes API 用キー |
| ESTIMATE_EMAIL_TO | 見積書送付先メールアドレス |
| GOOGLE_CLIENT_ID | Google Identity Services のクライアント ID |
| LEAD_FORM_URL | 事前入力・問い合わせ用 Google フォーム URL |
| GOOGLE_NAME_ENTRY_KEY | Google フォームの氏名 entry キー |
| GOOGLE_EMAIL_ENTRY_KEY | Google フォームのメール entry キー |

## Web API

`doPost` に JSON 文字列を送ると、`action` に応じて処理を分岐します。Google サイトの埋め込み HTML から呼ぶ場合は、CORS 回避のため `Content-Type: text/plain;charset=utf-8` で送信します。

| action | 処理 |
| --- | --- |
| inquiry | 問い合わせデータをスプレッドシートへ保存 |
| basicPrice | 基本料金・プレミアム料金を計算 |
| transportCost | 移動代金を計算 |
| routes | Google Routes API から経路候補を取得 |
| tagConfig | Google Tag Manager の埋め込みコードを生成 |
