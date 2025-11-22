---
title: Vercelで独自ドメインを設定する
date: 2025-03-22
modified_time: 2025-03-22
icon: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Water%20wave/Flat/water_wave_flat.svg
icon_url: /icons/water_wave_flat.svg
slug: cloudflare-get-domain-vercel
tags:
  - Cloudflare
  - Vercel
description: 独自ドメインを購入し、Vercelにデプロイされたウェブサイトに設定する方法を紹介します。Next.jsで作成したポートフォリオサイトを例に、Cloudflareでドメインを購入から設定完了までの手順を解説します。
---


## 前提条件

- Vercel アカウントを持っていること
- Cloudflare アカウントを持っていること
- すでに Vercel にデプロイされた Web サイトや Web アプリがあること

## Cloudflareでドメインを購入する

Cloudflare でドメインを購入するには、以下の手順に従います。

1. [Cloudflare](https://www.cloudflare.com/ja-jp/)にログインします
2. ダッシュボードから「ドメイン登録」→「ドメインの登録」を選択します
3. 購入したいドメイン名を検索ボックスに入力します（例: `suntory-n-water.com`）
4. 利用可能なドメインが表示されるので、購入したいドメインを選択します
5. 支払い情報を入力して購入手続きを完了します

購入が完了すると、下図のようにドメイン一覧にあなたのドメインが表示されます。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-1742693786925.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-1742693786925.png)

## Cloudflareで必要なDNSレコードを設定する

1. Cloudflare ダッシュボードで購入したドメインを選択します
2. 左側メニューから「DNS」タブをクリックします
3. 「Add record」ボタンをクリックし、以下の内容でレコードを追加します。
   - タイプ: `CNAME`
   - 名前: `www`（またはご希望のサブドメイン名）
   - ターゲット: `cname.vercel-dns.com`
   - TTL: Auto
   - Proxy status: Proxied（CDN 機能を使用する場合）または DNS only

下図のように設定されていることを確認してください。

![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-1742693788045.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-1742693788045.png)

## Vercelでドメインをプロジェクトに追加する

Vercel のプロジェクトに購入したドメインを紐づけます。

1. [Vercel Dashboard](https://vercel.com/dashboard)にログインします
2. ドメインを設定したいプロジェクトを選択します
3. 上部メニューから「Settings」タブをクリックします
4. 左側のメニューから「Domains」を選択します
5. 「Add Domain」ボタンをクリックします
6. 購入したドメイン（例: `suntory-n-water.com`）を入力します
7. 「Add」ボタンをクリックして確定します

設定後は、下図のように初期設定のドメインから購入したドメインへのリダイレクトが設定されます。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-1742693789166.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-1742693789166.png)

## Vercelの検証を確認する

Vercel はドメインの所有権を検証します。正しく DNS 設定ができていれば、自動的に検証が完了します。
「Valid Configuration」と表示されていることを確認してください。しばらく時間が経過した後、購入したドメインにアクセスしてウェブサイトが表示されれば設定完了です。

## 環境変数の更新

ドメインの設定が完了したら、`NEXT_PUBLIC_APP_URL` といった環境変数を更新します。

```bash
NEXT_PUBLIC_APP_URL=https://sui-portfolio.com
```

環境変数を更新したら、Vercel Dashboard で「Redeploy」ボタンをクリックし、新しい設定で再デプロイしましょう。

## まとめ

この記事では、Cloudflare でドメインを購入し、Vercel にデプロイされたウェブサイトに設定する方法を解説しました。
