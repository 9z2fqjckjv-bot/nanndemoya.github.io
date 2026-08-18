# 「何でも屋」公式サイト

「何でも屋」の公式サイトです。サービス案内、料金シミュレーター、移動代金シミュレーター、何でも屋ハウス、何でも屋基金、各種ポリシー、問い合わせ導線を静的HTMLで構成しています。

GitHub Pagesでそのまま公開できる、ビルド不要のサイトです。

## 公開ページ

| ファイル | 内容 |
| --- | --- |
| `index.html` | トップページ。主要ページへの導線を掲載します。 |
| `service.html` | サービス一覧。各サービスの料金ページ、デジタルサービス、ライフイベント支援へ移動できます。 |
| `anytime_service_prices.html` | 基本料金・プレミアム料金シミュレーター。サービス、料金区分、時間帯、給料単位、数量から概算料金を計算します。 |
| `transport_cost_simulator.html` | 移動代金シミュレーター。Google Maps APIを使い、距離・所要時間・交通手段から移動代金を概算します。 |
| `house.html` | 何でも屋ハウスの案内と利用規約です。 |
| `NCF.html` | 何でも屋基金のトップページです。各基金ページへのリンクと基金規定を掲載します。 |
| `policy.html` | ポリシートップ。特定商取引法に基づく表記、プライバシーポリシー、利用規約へ移動できます。 |
| `information.html` | 連絡先、所在地、問い合わせ先の案内です。 |
| `site-links.html` | サイト内外の関連リンク一覧です。 |
| `templete.html` | 新規ページ作成時の共通HTMLテンプレートです。 |

## 下層ページ

| フォルダ | 内容 |
| --- | --- |
| `guide/service/main/` | フリーサービス、アシスタントサービス、ビジネスアシスタントサービス、子ども向けサービス、シニアサービスの詳細と料金表。 |
| `guide/service/digital-service/` | MacStudioShere's の案内ページ。 |
| `guide/service/Life-Events/` | ライフイベント支援の案内と贈与対象要件。 |
| `guide/house/` | 何でも屋ハウスの概要、申込方法、オプション、利用特典、契約更新方法。 |
| `guide/N.C.F~Nanndemoya_Crowd_Funding/` | 事業拠点、広告、資本、電動三輪車、何でも屋ハウス、ライフイベント支援、生活・事業費、PC、スマートフォン、スポンサー枠などの基金ページ。 |
| `guide/policy/` | 特定商取引法に基づく表記、プライバシーポリシー、利用規約。 |

## 共通ファイル

| ファイル | 役割 |
| --- | --- |
| `assets/site.css` | `templete.html` のスタイルに合わせた共通CSS。カード、ページ内メニュー、関連リンク、表、シミュレーターUIなどを整えます。 |
| `assets/site-enhancements.js` | ページ内メニュー、関連リンク、ページ上部へ戻るボタンを補助する共通JS。 |
| `lead-form-popup.js` | ページ読み込み完了後30秒で問い合わせポップアップを表示します。閉じた場合は24時間非表示になります。 |
| `lead-form-popup.js` 内のGoogleログイン導線 | Google Identity Servicesを読み込み、Googleフォームへの問い合わせ導線を提供します。 |

## 資料フォルダ

`documet/` には、Webページの内容確認に使う資料・動画・画像を置いています。料金やサービス内容の根拠確認では、公開向けに確認しやすいPDFを優先します。

主な資料は以下です。

- `何でも屋｜利用料金表.pdf` / `.numbers`
- `「何でも屋」　〜事業方針、目的、サービス、基金、そしてメッセージ〜.pdf` / `.key`
- `ライフイベント支援基金と何でも屋ハウス基金.pdf` / `.mp4` / `.jpg`
- 各サービス紹介動画
- 何でも基金紹介動画
- `AINOHOT-ST3.png`
- `DIGNOSX5.png`

## 主な機能

- Google Tag Manager（`GTM-P56Q566B`）を各ページに設置
- `lead-form-popup.js` による30秒後の問い合わせポップアップ表示
- 基本料金・プレミアム料金シミュレーター
- Google Maps API連携の移動代金シミュレーター
- Googleフォーム、メール、外部サービスへの問い合わせ導線
- 共通CSSと補助JSによるページ内メニュー、関連リンク、トップへ戻る導線

## Google Maps API連携

`transport_cost_simulator.html` は、Google Maps APIを使って住所から距離・所要時間を取得します。公開前に Google Cloud Console で以下を確認してください。

1. APIキーにHTTPリファラー制限を設定する
2. 必要なGoogle Maps関連APIを有効化する
3. 予算アラートと利用上限を設定する
4. 公開ドメインで住所入力、距離取得、手動入力フォールバックを確認する

## リポジトリ構成

```text
.
├── index.html
├── service.html
├── anytime_service_prices.html
├── transport_cost_simulator.html
├── house.html
├── NCF.html
├── policy.html
├── information.html
├── site-links.html
├── templete.html
├── lead-form-popup.js
├── assets/
│   ├── site.css
│   └── site-enhancements.js
├── documet/
│   ├── 何でも屋｜利用料金表.pdf
│   ├── 何でも屋｜利用料金表.numbers
│   ├── 「何でも屋」　〜事業方針、目的、サービス、基金、そしてメッセージ〜.pdf
│   ├── 「何でも屋」　〜事業方針、目的、サービス、基金、そしてメッセージ〜.key
│   ├── ライフイベント支援基金と何でも屋ハウス基金.pdf
│   ├── ライフイベント支援基金と何でも屋ハウス基金.mp4
│   ├── ライフイベント支援基金と何でも屋ハウス基金.jpg
│   ├── 1分サービス紹介 *.mp4
│   ├── 1分紹介 何でも基金編 *.mp4
│   ├── AINOHOT-ST3.png
│   └── DIGNOSX5.png
├── guide/
│   ├── house/
│   ├── N.C.F~Nanndemoya_Crowd_Funding/
│   ├── policy/
│   └── service/
└── README.md
```

## 更新時の確認ポイント

1. HTMLを追加・変更した場合は、`assets/site.css`、`assets/site-enhancements.js`、`lead-form-popup.js` の読み込みパスを確認する
2. 料金を変更した場合は、`documet/何でも屋｜利用料金表.pdf` と各サービス料金ページ、`anytime_service_prices.html` の数値を突き合わせる
3. 移動代金シミュレーターを変更する場合は、下部のAPI連携用 `<script>` に影響がないか確認する
4. 連絡先、規約、ポリシーを変更した場合は、`information.html`、`policy.html`、`guide/policy/` の表記ゆれを確認する
5. ブラウザで表示崩れ、リンク、フォーム導線、シミュレーターの計算結果を確認する

## 注意事項

- APIキーを公開HTMLに含める場合は、必ずHTTPリファラー制限と利用API制限を設定してください。
- `documet/` のPDF、Keynote、Numbers、動画で内容が重複する場合は、PDFを優先してWebページへ反映します。
- `documet` はフォルダ名の綴りが現在の実ディレクトリに合わせて `documet/` になっています。
- 事業情報、料金、ポリシーは利用者への案内に直結するため、公開前に最新内容との整合性を確認してください。

© 2026 Nanndemoya | Anyways, Anywhere, Anytimes
