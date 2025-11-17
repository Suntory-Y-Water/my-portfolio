---
title: もう少し楽にBranded Typeを使えるようにしたい
slug: i-want-make-easier-use-branded
date: 2025-01-11
description:
icon: 🆗
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/OK%20button/Flat/ok_button_flat.svg
tags:
  - TypeScript
---

# もう少し楽にBranded Typeを使えるようにしたい
と感じたので「Branded Type」を簡単に生成できるツールを作成しました。

https://branded-type-generator.pages.dev/

安直な理由ですが、「型定義ツール」のように、**Branded Type**も気軽に作れる環境があればもっと広まるんじゃないかな？と思ったからです。

特に最近の開発で、似たような名前の ID やデータを扱う機会が多く、以下のような問題がありました。

- 同じ型（string, number など）でも意味が異なるデータが混在してしまう
- 間違った型を使う可能性がある

たとえば以下のようなケースです。

### 同じ型でも異なる意味のデータ

- 投稿 ID: 投稿を一意に識別する UUID（型は `string`）
- ユーザーID: 各ユーザーに割り当てられた 8 桁の文字列（型は `string`）

どちらも型は `string` ですが、全く異なる用途で使います。この問題を少しでも軽減するために Branded Type が役立ちます。

## 使い方

このツールでは、以下のように**CSV形式**や**タブ形式**で項目を入力するだけで簡単に Branded Types を生成できます。

CSV 形式以外でタブ形式でも生成できるようにしたのは、現職で開発をするときに Confluence や Excel などドキュメントを元にコードを書いているので、ドキュメントからコピペで生成できると便利だと思ったからです。
もし他にも良い生成形式があればイシューにて起票してください！

生成するソースコードは、私が見た中で一番シンプルかつ分かりやすいと感じたこちらの記事を参考に生成しています。
https://qiita.com/uhyo/items/de4cb2085fdbdf484b83

# 生成例

どちらの値でも同じ結果を出力できます。

## タブ形式

```bash
postId	number
userId	string
body	string
```

## CSV形式

```bash
postId,number
userId,string
body,string
```

## 生成されるコード

```tsx
const postIdBrand = Symbol();

export type PostId = number & { [postIdBrand]: unknown };

export function createPostId(p: number): PostId {
  return p as PostId;
}

const userIdBrand = Symbol();

export type UserId = string & { [userIdBrand]: unknown };

export function createUserId(p: string): UserId {
  return p as UserId;
}

const bodyBrand = Symbol();

export type Body = string & { [bodyBrand]: unknown };

export function createBody(p: string): Body {
  return p as Body;
}
```

# ソースコード

このツールのソースコードは GitHub で公開しています。

https://github.com/Suntory-Y-Water/branded-type-generator