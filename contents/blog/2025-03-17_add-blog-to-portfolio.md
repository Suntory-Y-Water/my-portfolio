---
title: ポートフォリオにブログページを追加しました
date: 2025-03-17
modified_time: 2025-03-17
description: ポートフォリオサイトにブログページを追加しました。今後はZennやQiitaで投稿していた内容を、こちらに集約する想定です。
icon: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Party%20popper/Flat/party_popper_flat.svg
icon_url: /icons/party_popper_flat.svg
tags:
  - ポートフォリオ
  - ブログ
slug: add-blog-to-portfolio
---


## ブログの作成背景

いままで簡単な経歴と自己紹介しか乗せていませんでしたが、作ってみることにしました。

このページは、[Next.js Minimal Blog](https://github.com/cakegaly/next-minimal-blog)を使用して作成しました。

https://zenn.dev/cakegaly/articles/next-minimal-blog-20250310

既存のリポジトリに処理を追加したので、まだ**posts**ページの内容も残っている混沌とした状態ですが、ひとまず動くようになったので公開しています。

## 今後のアクション

### postsページの廃止

**posts**ページの内容は**blog**ページ配下に過去の投稿という形で残そうと思います。

### レイアウトの微調整

参考にしているサイトからそっくりそのまま移行してきたので、まだレイアウトの調整が必要です。細かいところはボチボチ直しながら記事も投稿していきます。

### 目次の追加

まだ目次がないのでシンプルに見づらいです。改善します。

### ドメインの獲得

現在は vercel ドメインですが、個人ブログにするので独自ドメインを取得しようと考えてます。
取得先は未定ですが、Cloudflare Registrar かな？

https://www.cloudflare.com/ja-jp/products/registrar/

### notion-md-converterを使ってNotion→mdxへのコンバート

Notion から markdown に変換するライブラリが提供されているので、Notion で書く→なんやかんやして mdx にコンバート→自動で PR 発行するのが理想です。

エディタで書くのもよいですが、PC に触れていないとできないのはアウトプットの機会が減ってしまいます。触れる回数を増やすためにもこのあたりは実装していきたいですね。

#### こぼればなし : Notion使えばよくない？

「最初から Notion API を使えばよくね？」感はあると思いますが、`react-notion-x` を使ったブログリポジトリの実装が難しく一度折れています...
あとは実際のコミットログに投稿した記事があるのなんかよくないですか(?)

## おわりに

この投稿から数ヶ月なにも投稿が無い。なんてことが無いようにつらつら書いていきます⛵️。
