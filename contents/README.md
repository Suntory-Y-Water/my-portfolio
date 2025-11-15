# Contents

- `/blog`: ブログ記事の一覧。
- `/slides`: スライドの一覧。`/<イベント名>/<スライド名>.md` で保存する。[marp](https://marpit.marp.app/) のスライド記法を使用している。

## スライドをローカルで表示

```bash
bun run dev
```

## スライドを PDF にエクスポート

```bash
bun run build:pdf -- slides/<スライドのパス>.md
```
