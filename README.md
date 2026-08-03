# 「何でも屋」公式サイト

埼玉発の代行・お手伝いサービス「何でも屋」の公式サイトです。引越し、買い物代行、子どもの送迎、書類整理などのサービス紹介、料金表、事業情報、問い合わせ導線を掲載しています。

現在のサイト上では、プレオープン中として事前相談・予約を受け付けています。

## 公開ページ

| ファイル | 公開ページ | 内容 |
| --- | --- | --- |
| `index.html` | [トップページ](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/) | サービス概要、強み、FAQ、事業史、ビジョン、問い合わせ導線 |
| `anytime_service_prices.html` | [利用料金表・料金シミュレーター](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/anytime_service_prices.html) | サービス別の料金表、基本料金シミュレーター、依頼例 |
| `service_pricing_tables.html` | [各サービスの料金体制](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/service_pricing_tables.html) | フリー、アシスタント、ビジネス、子ども向け、シニアなどの料金体制一覧 |
| `house.html` | [何でも屋ハウス](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/house.html) | 住まい・生活支援に関する福祉的サービスの案内 |
| `NCF.html` | [何でも屋基金](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/NCF.html) | 事業拠点、スマートフォン、電動三輪車、PCなどの基金案内 |
| `policy.html` | [事業情報・利用規約・プライバシーポリシー](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/policy.html) | 特定商取引法に基づく表記、利用規約、プライバシーポリシー |
| `information.html` | [連絡先一覧](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/information.html) | 住所、電話番号、オンライン問い合わせ先 |
| `site-links.html` | [サイトリンク](https://9z2fqjckjv-bot.github.io/nanndemoya.github.io/site-links.html) | サイト内外の関連リンク一覧 |

## 共通機能

- 各ページに Google Tag Manager（`GTM-P56Q566B`）を設置しています。
- `lead-form-popup.js` で、問い合わせフォームや Google ログイン導線を含むリード獲得用ポップアップを表示します。
- 問い合わせは主に Google フォーム、メール、WhatsApp へのリンクから受け付ける構成です。
- GitHub Pages でそのまま公開できる、ビルド不要の静的 HTML サイトです。

## リポジトリ構成

```text
.
├── index.html
├── anytime_service_prices.html
├── service_pricing_tables.html
├── house.html
├── NCF.html
├── policy.html
├── information.html
├── site-links.html
├── lead-form-popup.js
└── README.md
```

## 更新方法

1. 対象ページの HTML ファイルを直接編集します。
2. 共通のポップアップ表示や問い合わせ導線を変更する場合は `lead-form-popup.js` を編集します。
3. ブラウザで対象 HTML を開き、表示崩れ、リンク、フォーム導線を確認します。
4. `main` ブランチへ反映すると GitHub Pages に公開されます。

## 注意事項

- 料金、事業状態、連絡先、規約の内容は複数ページに掲載されているため、変更時は `index.html`、`anytime_service_prices.html`、`policy.html`、`information.html` もあわせて確認してください。
- 外部リンクには Google フォーム、YouTube、PayPal、WhatsApp、Google ドキュメントなどが含まれます。
- 事業情報やポリシーは利用者への案内に直結するため、公開前に最新内容との整合性を確認してください。

© 2026 Nanndemoya | Anyways, Anywhere, Anytimes
