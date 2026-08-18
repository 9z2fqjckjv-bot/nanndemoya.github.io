# shared

Google サイトに埋め込む HTML が参照する共通ファイルです。

## ファイル

- `google-sites-embed.css`: 埋め込み HTML 用の共通スタイル
- `site.css`: 元サイトの共通スタイル
- `site-enhancements.js`: 元サイトのサイト内検索・リンク補正スクリプト
- `lead-form-popup.js`: 元サイトの問い合わせポップアップ

Google サイトの通常ページには、この CSS/JavaScript を直接適用できません。通常ページは Google サイトのテーマとレイアウト機能で調整し、JavaScript が必要な部分だけ `embeds/` と組み合わせて使います。
