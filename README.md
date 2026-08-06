# 「何でも屋」公式サイト

埼玉発の代行・お手伝いサービス「何でも屋」の公式サイトです。サービス紹介、料金表、移動代金シミュレーター、事業情報、問い合わせ導線を静的HTMLで構成しています。

現在はプレオープン中として、事前相談・見積もり・予約受付を案内しています。

## 公開ページ

| ファイル | 公開ページ | 内容 |
| --- | --- | --- |
| `index.html` | [トップページ](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/) | サービス概要、強み、FAQ、事業史、ビジョン、問い合わせ導線 |
| `anytime_service_prices.html` | [利用料金表・基本料金シミュレーター](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/anytime_service_prices.html) | サービス別の料金表、基本料金シミュレーター、依頼例 |
| `transport_cost_simulator.html` | [移動代金シミュレーター](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/transport_cost_simulator.html) | Google Maps API連携による距離・所要時間取得、交通手段別の移動代金概算 |
| `service_pricing_tables.html` | [各サービスの料金体制](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/service_pricing_tables.html) | フリー、アシスタント、ビジネス、子ども向け、シニアなどの料金体制一覧 |
| `house.html` | [何でも屋ハウス](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/house.html) | 住まい・生活支援に関する福祉的サービスの案内 |
| `NCF.html` | [何でも屋基金](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/NCF.html) | 事業拠点、スマートフォン、電動三輪車、PCなどの基金案内 |
| `policy.html` | [事業情報・利用規約・プライバシーポリシー](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/policy.html) | 特定商取引法に基づく表記、利用規約、プライバシーポリシー |
| `information.html` | [連絡先一覧](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/information.html) | 住所、電話番号、オンライン問い合わせ先 |
| `site-links.html` | [サイトリンク](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/site-links.html) | サイト内外の関連リンク一覧 |

## 主な機能

- Google Tag Manager（`GTM-P56Q566B`）による計測タグを各ページに設置
- `lead-form-popup.js` による問い合わせフォーム・Googleログイン導線のポップアップ表示
- 基本料金シミュレーターと移動代金シミュレーターによる概算見積もり
- Googleフォーム、メール、WhatsAppなど外部サービスへの問い合わせ導線
- GitHub Pagesでそのまま公開できる、ビルド不要の静的サイト

## Google Maps API連携

`transport_cost_simulator.html` は Maps JavaScript API の `DirectionsService` と Places Autocomplete を利用します。ブラウザから Routes REST API を直接呼び出す構成ではなく、静的サイトで動作しやすいクライアント向けAPIに接続しています。

公開前に Google Cloud Console で以下を確認してください。

1. APIキーにHTTPリファラー制限を設定する
2. Maps JavaScript API、Places API、Directions APIを有効化する
3. 1日あたりの割り当て上限と予算アラートを設定する
4. 公開ドメインで住所入力、距離取得、手動入力フォールバックを確認する

## リポジトリ構成

```text
.
├── index.html
├── anytime_service_prices.html
├── transport_cost_simulator.html
├── service_pricing_tables.html
├── house.html
├── NCF.html
├── policy.html
├── information.html
├── site-links.html
├── lead-form-popup.js
├── gmapi.md
└── README.md
```

## 更新時の確認ポイント

1. 対象ページのHTMLを編集する
2. 共通ポップアップや問い合わせ導線を変更する場合は `lead-form-popup.js` も確認する
3. 料金・事業状態・連絡先・規約を変更した場合は、関連ページ間の表記ゆれを確認する
4. ブラウザで表示崩れ、リンク、フォーム導線、シミュレーターの計算結果を確認する
5. `main` ブランチへ反映するとGitHub Pagesに公開される

## 注意事項

- APIキーは公開HTMLに含まれるため、必ずHTTPリファラー制限と利用API制限を設定してください。
- 外部リンクには Googleフォーム、YouTube、PayPal、WhatsApp、Googleドキュメントなどが含まれます。
- 事業情報やポリシーは利用者への案内に直結するため、公開前に最新内容との整合性を確認してください。

© 2026 Nanndemoya | Anyways, Anywhere, Anytimes
