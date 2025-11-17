---
title: Hono Service bindings入門
slug: hono-service-bindings
date: 2024-07-08
description: 
icon: 📡
icon_url: 
tags:
  - cloudflare
  - cloudflareworkers
  - hono
---

# はじめに

Cloudflare Workers にはパブリックにアクセス可能なURLを経由せず別のWorkersを呼び出すことができます。

今回はCloudflare Network 内で通信できる Service Bindings の機能を使って、複数のWorkersを連携したいと思います。

内容としてはクライアントからのエンドポイントを想定したWebhookという名前のエンドポイントをHonoで作成し、エンドポイントごとに別のWorkersを呼び出す構成です。

記事の作成にはこちらの投稿を参考にさせていただきました。

https://zenn.dev/monica/articles/feff72caee5e6b

# この記事の対象者

Honoで別のWorkersを連携したい人

# 成果物

https://github.com/Suntory-Y-Water/hono-service-binding

# Monorepo環境を構築

参考にさせていただいた記事と同じ構成のほうが、誤ったときに原因をつきとめやすいので同じ構成にさせていただきます。
複数の Cloudflare Workers を 1 つのリポジトリで管理するために、Monorepo を作成し、turborepoで環境構築します。
パッケージ共通のツールはプロジェクトルートにインストールしておきます。

```json:package.json
{
  "devDependencies": {
    "turbo": "^1.10.9",
    "wrangler": "^3.1.2"
  },
  "scripts": {
    "dev": "turbo dev"
  }
}
```

`pnpm run dev`でパッケージを平行に起動するために、turborepo を設定します。

```json:turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": {
      "dependsOn": ["^dev"]
    }
  }
}
```

Workers のコードは、`workers` ディレクトリにパッケージとして配置します。
```yaml:pnpm-workspace.yaml
packages:
  - "workers/*"
```

```bash:.gitignore
node_modules
.wrangler
.turbo
```

# webhook アプリを作成

クライアントからのリクエストを想定したwebhookアプリを作成します。
他の内部プライベートサービスと通信する役割を担っています。

```bash
cd workers/
create hono@latest
```

# Service Bindingの設定を行う

## webhookのService Binding設定

Service Binding を設定するために、webhook の `wrangler.toml` に `services` フィールドを追加します。
名前はなんでもいいですが、分かりやすく`HTTP_SERVICE`と`RPC_SERVICE`に設定します。
compatibility_dateは2024-07-01に設定します。

```toml
name = "webhook"
compatibility_date = "2024-07-01"
services = [
    { binding = "HTTP_SERVICE", service = "http-service" },
    { binding = "RPC_SERVICE", service = "rpc-service" },
]
```

## rpc-serviceのService Binding設定

Cloudflare WorkersのService BindingにはRPCとHTTPの2通りあります。
RPCの場合、別のworkerをJavaScriptの関数のように使用することができます。

workersディレクトリに到達したら、`pnpm create cloudflare@latest rpc-service`でrpcで使用するworkerを作成していきます。
`rpc-service`が作成できたら、`wrangler.toml`の内容を編集していきます。

```toml
name = "rpc-service"
main = "src/index.ts"
compatibility_date = "2024-07-01"

[dev]
port = 8888
```

ポート番号は初期設定の8787以外であれば被らなそうなものにしましょう

## http-serviceのService Binding設定

http-serviceはHonoで作成します。`pnpm create hono@latest`で作成後、`wrangler.toml`の内容を編集していきます。

```toml
name = "http-service"
compatibility_date = "2024-07-01"

[dev]
port = 9999
```

# ロジックの作成

各workerのロジックを書いていきます。どのworkerが動いているか分かれば良いので、内容は適当です。

http-serviceではテキストをレスポンスします。

```tsx:http-service/src/index.ts
import { Hono } from "hono";

const app = new Hono().basePath("/http");

app.get("/", (c) => c.text("Hello Http Service Worker!"));

export default app;
```

rpc-serviceではService Bindingを介して、同じ Cloudflare アカウント上の他のworkerから呼び出すことができるmethodを実装します。
https://developers.cloudflare.com/workers/runtime-apis/rpc#class-instances
WorkerEntrypoint を継承したRpcServiceをExportします。

```tsx:rpc-service/src/index.ts
import { WorkerEntrypoint } from "cloudflare:workers";

export class RpcService extends WorkerEntrypoint {
  async fetch(request: Request): Promise<Response> {
    return new Response("Hello Rpc Service Worker!");
  }

  add(a: number, b: number): number {
    return a + b;
  }
}

export default RpcService;
```

webhook/src/index.tsでExportした Service Binding を型安全に使用します。
https://hono.dev/docs/getting-started/cloudflare-workers#bindings
Bindings という型を定義して、Hono の Generics に渡します。

このとき、`Bindings`のキーは`wrangler.toml`の`services`フィールドに設定した`binding`の値と同じにしておきます。

```tsx:webhook/src/index.ts
import { Hono } from "hono";
import type { RpcService } from "../../rpc-service/src";

type Bindings = {
  // RPCの場合、Service<T>で使用する必要があります。
  RPC_SERVICE: Service<RpcService>;
  HTTP_SERVICE: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/rpc", async (c) => {
  // 呼び出し元が非同期関数ではなくても非同期扱いになる。
  const res = await c.env.RPC_SERVICE.add(1, 2);
  return c.text(`add result: ${res}`);
});

app.get("/http", async (c) => {
  const res = await c.env.HTTP_SERVICE.fetch(c.req.raw);
  const text = await res.text();
  return c.text(text);
});

export default app;

```

注意点を上げるとすれば、以下2つです。

1. RPCで呼び出すメソッドが非同期関数ではなくても、非同期扱いになります。  
2. type BindingsでRPCを型安全に使用するときは、`Service<T>`で使用する必要があります。

https://developers.cloudflare.com/workers/runtime-apis/rpc#all-calls-are-asynchronous

# デプロイする

各workerを`pnpm run deploy`します。

デプロイ後、`https://webhook.ドメイン名.workers.dev/http`にアクセスすれば「Hello Http Service Worker!」と表示されます。

`https://webhook.ドメイン名.workers.dev/rpc`にアクセスすれば、「add result: 3」と表示され、正常に呼び出されていることが確認できると思います。

実運用のするときは参考にさせていただいた記事のようなトークンの検証などを設けたほうが良いですね。

# おわりに
いかがでしたでしょうか。
既にこのテーマで記事を書いている人や、公式ドキュメントが丁寧に書かれているのもあり開発体験がとても良かったです。
次作成するアプリの規模によりますが取り入れてみたいですね！
以上になります！

# 参考

https://zenn.dev/monica/articles/feff72caee5e6b
https://zenn.dev/sh1n4ps/articles/062d5b51bf75ad
https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/
https://github.com/cloudflare/js-rpc-and-entrypoints-demo