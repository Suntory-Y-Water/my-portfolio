---
title: Cloudflare Workers環境で「Illegal invocation」エラーが起きたときに試したこと
slug: cloudflare-workersillegal-invocation
date: 2025-06-08
description: 
icon: 🗼
icon_url: 
tags:
  - mcp
  - cloudflareworkers
  - notionapi
---

## この記事について

Cloudflare Workers上でMCPサーバーを構築し、Notion APIを使用してデータベース検索機能を実装する際に「TypeError: Illegal invocation」エラーに遭遇しました。

この記事では、エラーの根本原因の特定から解決までの検証プロセスを、実際の体験をもとに詳しく解説します。

### 想定読者
- Cloudflare Workersでの開発経験がある
- Notion APIまたは外部APIクライアントライブラリを使用している
- 「Illegal invocation」エラーに遭遇している

### この記事で得られること
- Cloudflare Workers環境特有の`this`コンテキスト問題の理解
- `fetch.bind(globalThis)`による根本的な解決方法

## システム概要と目標

Cloudflare Workers上でMCP(Model Context Protocol)サーバーを構築し、Notion APIを使ってデータベース検索を行う開発でした。

### 技術スタック
- Cloudflare Workers
- MCP SDK
- @notionhq/client(Notion公式クライアント)

### 実装したかった機能
MCPとしてNotionのデータベースから必要な情報を検索することが目標でした。
```typescript
// MCPツールとしてNotion検索機能を提供
const searchResult = await searchSites(apiKey, databaseId, "検索クエリ");
```

## 発生した問題

### 初期実装とエラーの発生

最初は標準的な方法でNotionクライアントを実装しました。
このコードの場合、Notionのデータベースに設定されている`title`プロパティに設定されている単語の記事を返却するようなコードです。
例として`LINE`と入力した場合、データベースから`title`プロパティに`LINE`と入っている記事を返却することが望まれます。

```typescript
import { Client } from '@notionhq/client';

export async function searchSites(
  apiKey: string,
  databaseId: string,
  query: string,
): Promise<NotionResponse[]> {
  const client = new Client({ auth: apiKey });
  
  const response = await client.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        {
          property: 'title',
          rich_text: { contains: query },
        },
        {
          property: 'description',
          rich_text: { contains: query },
        },
      ],
    },
  });
  
  return response.results;
}
```

以下はMCPサーバー側のサンプルコードです。
Notion APIの環境変数は`McpAgent<Env>`と実装することでCloudflareの`.dev.vars`に実装されている値を受け取ることができます。
```ts
import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  searchSites,
  extractSiteName,
  extractDescription,
} from './services/notion';

export class MyMCP extends McpAgent<Env> {
  server = new McpServer({
    name: 'Notion Search MCP Server',
    version: '1.0.0',
  });

  async init() {
    this.server.tool(
      'site_search',
      'Notionデータベースからサイト名やキーワードで検索します',
      {
        query: z.string().describe('検索したいサイト名やキーワード'),
      },
      async ({ query }) => {
        const notionApiKey = this.env.NOTION_API_KEY;
        const databaseId = this.env.NOTION_DATABASE_ID;
        const sites = await searchSites(notionApiKey, databaseId, query);

        if (sites.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `「${query}」に関連するサイトが見つかりませんでした。`,
              },
            ],
          };
        }

        const results = sites.map((site) => ({
          name: extractSiteName(site),
          description: extractDescription(site),
        }));

        const resultText = results
          .map(
            (result) =>
              `**${result.name}**\n` + `説明: ${result.description}\n`,
          )
          .join('\n---\n');

        return {
          content: [
            {
              type: 'text',
              text: `${sites.length}件のサイトが見つかりました:\n\n${resultText}`,
            },
          ],
        };
      },
    );
  }
}

```

しかし、実際に実行すると以下のエラーが発生しました。

```bash
TypeError: Illegal invocation: function called with incorrect 'this' reference
```

### 直接API呼び出しでの動作確認

まず、Notion API自体に問題がないことを確認するため、curlで直接APIを呼び出してテストしました。

```bash
curl -X POST https://api.notion.com/v1/databases/databaseid/query \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d '{
    "filter": {
      "or": [
        {
          "property": "title",
          "rich_text": { "contains": "LINE" }
        }
      ]
    }
  }'
```

実行した結果、APIは正常に動作し期待通りのレスポンスを取得できました。
これにより問題はNotion API自体ではなく、Cloudflare Workers環境でのクライアントライブラリの使用方法にあることが判明します。

## 検証プロセスと仮説

### 当初の仮説

エラーメッセージから、Notionクライアントの設定に不備があるのでは？と考えました。
curlでAPIが実行できていることから環境変数に不備があるとは考えづらいですが、そのあたりも視野に入れてデバッグ実行してみることにしました。

### 段階的なデバッグ実装

問題を特定するため、段階的にログを追加して検証しました。
```typescript
export async function searchSites(
  apiKey: string,
  databaseId: string,
  query: string,
): Promise<NotionResponse[]> {
  console.log('=== Notion API デバッグ情報 ===');
  console.log(`APIキー: ${apiKey ? `${apiKey.substring(0, 10)}...` : '未定義'}`);
  console.log(`データベースID: ${databaseId}`);
  console.log(`検索クエリ: "${query}"`);

  try {
    console.log('--- ステップ1: Notionクライアント初期化 ---');
    const client = new Client({ auth: apiKey });
    console.log('Notionクライアント初期化成功');

    console.log('--- ステップ2: データベースオブジェクトの確認 ---');
    console.log('client.databases:', typeof client.databases);
    console.log('client.databases.query:', typeof client.databases.query);

    console.log('--- ステップ3: クエリ実行 ---');
    const response = await client.databases.query(queryParams);
    
    return response.results;
  } catch (error) {
    console.error('Notion APIエラー:', error);
    return [];
  }
}
```

### 検証で判明した事実

デバッグログを出力すると以下のような内容が記載されており、**メソッド呼び出し時の`this`コンテキストの喪失**であることが推測できました。
```bash
✘ [ERROR] Notion APIエラー: TypeError: Illegal invocation: function called with incorrect `this` reference. See https://developers.cloudflare.com/workers/observability/errors/#illegal-invocation-errors for details.
```

## 解決策の発見

### Cloudflare公式ドキュメントでの調査

Cloudflare Workersの公式エラードキュメントを調査したところ、「Illegal invocation」エラーについて以下の説明を発見しました。

> This is typically caused by calling a function that calls `this`, but the value of `this` has been lost.
> 
> In practice, this is often seen when destructuring runtime provided Javascript objects that have functions that rely on the presence of `this`, such as `ctx`.

https://developers.cloudflare.com/workers/observability/errors/#illegal-invocation-errors
### Supabaseでの類似事例

さらに調査を進めると、Supabaseクライアントでも同じ問題が発生しており、`fetch.bind(globalThis)`を使用する解決策が提示されていることを発見しました。

```typescript
const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key', { 
  fetch: fetch.bind(globalThis) 
})
```

https://github.com/supabase/supabase/issues/4417
### 解決策の実装

Supabaseの事例を参考に、Notionクライアントでも同様の対処を実装しました。
以下は修正後のコードです。
```typescript
export async function searchSites(
  apiKey: string,
  databaseId: string,
  query: string,
): Promise<NotionResponse[]> {
  try {
    // fetch.bind(globalThis)でthisコンテキストを明示的に設定
    const client = new Client({ 
      auth: apiKey,
      fetch: fetch.bind(globalThis)
    });

    const response = await client.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: 'title',
            rich_text: { contains: query },
          },
          {
            property: 'description',
            rich_text: { contains: query },
          },
        ],
      },
    });

    return response.results;
  } catch (error) {
    console.error('Notion APIエラー:', error);
    return [];
  }
}
```

### 動作確認

修正後にMCPインスペクターでテストを実行したところ、データベースの中身を検索して正しく取得することができました🎉
![MCPインスペクターで正しく取得できたときの画像](https://pub-151065dba8464e6982571edb9ce95445.r2.dev/images/4c71646f40bc0c7a714b9274b81851c4.png)

## 根本原因の分析

### 技術的な詳細

今回の問題の根本原因はデバッグログに記載があった通り、**Cloudflare Workers環境での`this`コンテキストの喪失**でした。

**問題の考察**
Cloudflare WorkersはV8 isolateという独自の実行環境を使用しており、標準的なブラウザやNode.js環境とは異なる`this`の扱いをします。
Notionクライアントライブラリが内部で`fetch`を呼び出す際、`this`コンテキストが失われ結果として「Illegal invocation」エラーが発生したと考えられます。

**解決策の考察**
```typescript
fetch: fetch.bind(globalThis)
```

`bind()`メソッドで`fetch`関数の`this`を`globalThis`に明示的に固定することで、Cloudflare Workers環境でも正しいコンテキストで`fetch`が実行され、ライブラリ内部での`this`参照エラーを回避できます。

## まとめ

Cloudflare Workers環境でのNotion APIクライアント使用時に発生した「Illegal invocation」エラーは、`fetch.bind(globalThis)`を使用することで解決できました。

**ポイント**
- Cloudflare Workersは独自の実行環境のため、標準的な環境とは異なる問題が発生する可能性がある
- エラーメッセージと公式ドキュメントを組み合わせることで、効率的に原因を特定できる
- 他のライブラリでの類似事例を調査することで、解決策のヒントを得られる

この経験により、Cloudflare Workers環境での外部ライブラリ使用時の注意点を深く理解できました。
同様の問題に遭遇した際は、まず`fetch.bind(globalThis)`を試してみることをお勧めします。

## 参考資料

https://developers.cloudflare.com/workers/observability/errors/
https://github.com/supabase/supabase/issues/4417