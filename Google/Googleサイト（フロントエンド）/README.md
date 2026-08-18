# Googleサイト（フロントエンド）

このフォルダは、既存の `nanndemoya.github.io` を Google サイトへ移行するためのフロントエンド作業領域です。

## 推奨構成

- `google-sites/`: Google サイト向けに整理した移行用フォルダ
- `source/`: GitHub Pages 版の完全コピー。移行元アーカイブとして保持

## Google サイトで使う場所

- ページ本文の移行: `google-sites/pages/`
- 料金計算などの動的パーツ: `google-sites/embeds/`
- CSS/JavaScript の参照元: `google-sites/shared/`
- Google ドライブへ置く資料: `google-sites/drive-assets/`
- 移行管理表とページ一覧: `google-sites/planning/`

Google サイトは、通常の Web サーバーのように複数 HTML、CSS、JavaScript をそのまま公開する構成に向いていません。そのため、通常ページは Google サイトのページとして作り、シミュレーターやフォームなど動的な部分だけを埋め込みで扱う構成にしています。
