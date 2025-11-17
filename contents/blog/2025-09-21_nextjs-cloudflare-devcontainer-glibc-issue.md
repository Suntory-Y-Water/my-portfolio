---
title: Next.js + OpenNext.js をdevcontainerで起動しようとしたときにハマったこと
date: 2025-09-21
icon: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wrench/Flat/wrench_flat.svg
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wrench/Flat/wrench_flat.svg
slug: nextjs-cloudflare-devcontainer-glibc-issue
tags:
  - Next.js
  - Cloudflare
  - OpenNext.js
  - Docker
  - DevConatainers
description: Debian 11 bullseyeベースのdevcontainerでNext.js 15 + OpenNext.jsの開発サーバーが起動せず、Debian 12 bookwormベースに変更して解決した事例。glibcバージョン要件とworkerdの実行互換について整理。
---



## TL;DR

devcontainer で Next.js 15 + Cloudflare 環境が起動しない問題に遭遇しました。
原因は Debian 11 bullseye(glibc 2.31)では Cloudflare の workerd が要求する glibc 2.35+の要件を満たせないことで、ベースイメージを Debian 12 bookworm(glibc 2.36)に変更することで解決しました。
Cloudflare Workers 関連ツールを使用する際は、開発環境の glibc 要件も考慮する必要があります。

## この記事について

Next.js と Cloudflare を組み合わせた開発環境で、devcontainer が突然動かなくなって困ったときに見る記事です。
最近、Debian11 bullseye ベースの devcontainer で Next.js 15 + OpenNext.js の開発サーバーが起動せず、数時間悩まされました。結果的に Debian 12 bookworm ベースに変更することで解決しましたが、その過程で学んだことを共有します。
**想定読者**
- Docker/devcontainer 上で Next.js と Cloudflare 連携ツールチェーンを利用する開発者
- Debian 系ベースイメージの互換性について知りたい方
- 似たようなエラーで困っている開発者

**解決できる問題**
- devcontainer 内で Cloudflare Workers ローカル開発環境が起動しない
- glibc バージョン要件によるネイティブバイナリ実行エラー
- Debian 世代選択の判断基準

**前提知識**
- Docker と devcontainer の基本的な使い方
- Next.js プロジェクトの開発経験

## 遭遇した問題


### 突然動かなくなった開発環境

ホストは macOS で、devcontainer のベースイメージに `mcr.microsoft.com/devcontainers/javascript-node:20-bullseye` を使用していました。
プロジェクトは Next.js に `@opennextjs/cloudflare` を含む構成です。
不思議なことに、ローカルでは正常に動作するのに、開発コンテナ内だけで失敗していました。「ローカルでは動くのに...」という、開発者なら一度は経験する厄介なパターンです。

### 観測されたエラー内容

最初に遭遇したのは、Miniflare 実行時の EPIPE エラーでした。

```bash
node ➜ /workspaces/cc-vault (feature-devcontainer-settings-setup) $ pnpm run dev
> cc-vault@0.0.1 dev /workspaces/cc-vault
> next dev --turbopack

Using vars defined in .env.local
▲ Next.js 15.5.0 (Turbopack)
- Local:        <http://localhost:3000>
- Network:      <http://172.17.0.2:3000>
- Environments: .env.local

✓ Starting...

node:internal/process/promises:391
        triggerUncaughtException(err, true /* fromPromise */);
        ^

Error: write EPIPE
    at afterWriteDispatched (node:internal/stream_base_commons:161:15)
    at writeGeneric (node:internal/stream_base_commons:152:3)
    at Socket._writeGeneric (node:net:958:11)
    at Socket._write (node:net:970:8)
    at writeOrBuffer (node:internal/streams/writable:572:12)
    at _write (node:internal/streams/writable:501:10)
    at Writable.write (node:internal/streams/writable:510:10)
    at Runtime.updateConfig (/workspaces/cc-vault/node_modules/.pnpm/miniflare@4.20250816.1/node_modules/miniflare/dist/src/index.js:48453:26)
    at async #assembleAndUpdateConfig (/workspaces/cc-vault/node_modules/.pnpm/miniflare@4.20250816.1/node_modules/miniflare/dist/src/index.js:60316:30)
    at async Mutex.runWith (/workspaces/cc-vault/node_modules/.pnpm/miniflare@4.20250816.1/node_modules/miniflare/dist/src/index.js:38754:48)
{
  errno: -32,
  code: 'EPIPE',
  syscall: 'write'
}

Node.js v20.19.4

```

EPIPE エラーは「パイプが壊れた」ことを示しますが、根本原因が見えませんでした。
そこで環境変数ファイル(.env*)を外して再実行すると、今度は明確なエラーメッセージが表示されました。

```bash
/workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd:
  /lib/aarch64-linux-gnu/libc.so.6: version `GLIBC_2.32' not found
  (required by /workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd)

/workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd:
  /lib/aarch64-linux-gnu/libc.so.6: version `GLIBC_2.33' not found
  (required by /workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd)

/workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd:
  /lib/aarch64-linux-gnu/libc.so.6: version `GLIBC_2.34' not found
  (required by /workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd)

/workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd:
  /lib/aarch64-linux-gnu/libc.so.6: version `GLIBC_2.35' not found
  (required by /workspaces/cc-vault/node_modules/.pnpm/@cloudflare+workerd-linux-arm64@1.20250917.0/node_modules/@cloudflare/workerd-linux-arm64/bin/workerd)

```

どうやら glibc のバージョン問題が関係してきそうです。ネイティブバイナリの workerd が、実行環境の glibc より新しいバージョンを要求していたのです。

## 解決までにやったこと


### ベースイメージを変更してみる

問題が glibc のバージョンにあることが分かったので、より新しい Debian 系のベースイメージを試してみることにしました。
devcontainer.json の設定を以下のように変更しました。
**変更前**

```json
"image": "mcr.microsoft.com/devcontainers/javascript-node:20-bullseye"
```

**変更後**

```json
"image": "mcr.microsoft.com/devcontainers/javascript-node:20-bookworm"
```

コンテナを再ビルドして同じプロジェクトを実行すると見事に起動できました 🎉

## 技術的な背景を調べてみた


### なぜbullseyeでは動かなかったのか

解決はしましたが、なぜこの変更で問題が解決したのかを理解するために、公式情報を調べました。
**Debian 11 bullseyeのglibc**
Debian 公式パッケージ情報によると、bullseye は **glibc 2.31系**(`2.31-13+deb11u13`)を提供しています。

https://packages.debian.org/source/bullseye/glibc

**Debian 12 bookwormのglibc**
一方、bookworm は **glibc 2.36系**(`2.36-9+deb12u13`)を提供しています。

https://launchpad.net/debian/bookworm/%2Bsource/glibc

### Cloudflare workerdの要件変化

Cloudflare Workers SDK の GitHub リポジトリの Issue を調べると、興味深い情報が見つかりました。
近年の workerd では **glibc 2.35以上**を要求するようになっており、Ubuntu 20.04(glibc 2.31)などの古い環境での非対応化が議論されています。

https://github.com/cloudflare/workers-sdk/issues/9336

また、「あなたの OS は glibc 2.35+をサポートしていないようだ」というメンテナからのコメントもある別の Issue も確認できました。

https://github.com/cloudflare/workers-sdk/issues/9446

### 技術的な背景の整理

エラーメッセージと調査結果から以下のような事象が起きたと考えられます。
**事実**
- workerd の実行時に `GLIBC_2.32`〜`GLIBC_2.35` が見つからないエラーが発生
- Debian 11 bullseye は glibc 2.31 系を提供([Debian Packages](https://packages.debian.org/source/bullseye/glibc))
- Debian 12 bookworm は glibc 2.36 系を提供([Launchpad](https://launchpad.net/debian/bookworm/%2Bsource/glibc))
- Cloudflare の Issue で workerd が glibc 2.35 以上を要求する旨の議論がある([GitHub Issue](https://github.com/cloudflare/workers-sdk/issues/9336))
**原因**
workerd バイナリが glibc 2.35 付近の機能を要求していたのに対し、bullseye の glibc 2.31 ではこの要件を満たせず、実行に失敗した可能性があります。
bookworm の glibc 2.36 系では必要な機能が含まれているため、正常に実行できるようになったと考えられます。
EPIPE エラーについては、workerd の実行失敗により親プロセス(Next.js)との通信が切断されたことが原因と推測されます。

## 他の開発者への参考情報


### devcontainerベースイメージの選び方

今回の経験から学んだのは、**同じNode 20系でもベースOSの世代によってglibc系列が大きく異なる**ということです。
Microsoft 提供の devcontainer イメージでは、以下のような命名規則になっています。
- `...:20-bullseye` → Debian 11 ベース(glibc 2.31 系)
- `...:20-bookworm` → Debian 12 ベース(glibc 2.36 系)
Node 公式の Docker イメージも同様のタグ体系を採用しています。([Docker Hub](https://hub.docker.com/_/node))

## まとめ

devcontainer で Next.js + Cloudflare 環境が起動しない場合、ベース OS の glibc 系列と workerd の要求バージョンの不整合が原因の可能性があります。具体的には、bullseye の glibc 2.31 系では、workerd が要求する glibc 2.35+の要件を満たせません。
Cloudflare Workers 関連のツールを使用する際は、開発環境の glibc 要件も考慮に入れる必要があります。特に、長期間メンテナンスしているプロジェクトでは、依存ツールの要件変化に注意が必要です。

## 参考資料

- [Debian 11 bullseyeのglibcパッケージ情報](https://packages.debian.org/source/bullseye/glibc)
- [Debian 12 bookwormのglibcパッケージ情報](https://launchpad.net/debian/bookworm/%2Bsource/glibc)
- [Cloudflare Workers SDKのglibc 2.35要件に関するIssue](https://github.com/cloudflare/workers-sdk/issues/9336)
- [glibc 2.35+前提に関するIssue](https://github.com/cloudflare/workers-sdk/issues/9446)
- [Ubuntu 20.04非対応化に関するIssue](https://github.com/cloudflare/workers-sdk/issues/8086)
- [Node公式Dockerイメージのタグ情報](https://hub.docker.com/_/node)
