---
title: Markdown移行後のサンプルブログ
slug: markdown-migrate-sample-blog
date: 2025-11-15
description: Markdown移行後のサンプルブログです。出力されている値を確認するのが目的です。
icon: 💉
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Syringe/Flat/syringe_flat.svg
tags:
  - ClaudeCode
---

## 見出し２

見出し２の内容です。

### 見出し３

見出し３の内容です。
改行改行

カード形式

https://nextjs.org/docs/app/guides/incremental-static-regeneration

URL

[これはリンクに遷移できるやつ](https://nextjs.org/docs/app/guides/incremental-static-regeneration)


> [!NOTE]
> これはノートのプレビューです。


エラー

> [!CAUTION]
> これはエラーのプレビューです。


## コードベースのタイトルテスト
コードベーステスト
```ts
// これはタイトルなし
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

タイトルありで`title="utils.ts"`
```ts title="utils.ts"
// これはタイトルあり
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

タイトルありで`ts utils.ts`
```ts utils.ts
// これはタイトルあり
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```