# pages

Google サイトの各ページへ移す本文断片です。

各ファイルは `source/*.html` から `body` 内の内容を取り出し、Google Tag Manager、外部 CSS、外部 JavaScript など Google サイト側でそのまま使いにくい要素を除いたものです。

## 使い方

1. `planning/page-inventory.csv` で移行したい元ページを確認します。
2. 対応する `*.fragment.html` を開きます。
3. Google サイト上に同名または近い名前のページを作ります。
4. 見出し、文章、リスト、リンクを Google サイトの通常ブロックへ移します。

シミュレーターやフォームのように JavaScript が必要なページは、本文移行ではなく `../embeds/` のファイルを使います。
