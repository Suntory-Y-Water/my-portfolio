---
title: チンチロをするMCPサーバーを作ってみる
date: 2025-04-10
icon: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Game%20die/Flat/game_die_flat.svg
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Game%20die/Flat/game_die_flat.svg
slug: chinchillo-mcp-server
tags:
  - MCP
description: Model Context Protocol (MCP) を使うと、AIアシスタントに新しい機能を追加できます。この記事では、サイコロゲーム「チンチロ」を例に、TypeScriptでMCPサーバーを実装し、Claude Desktopで遊ぶ方法を紹介します。AIの進化が進む中、MCPの基本的な仕組みを実際に手を動かして学んでみましょう。
---


日進月歩で AI の進化が凄まじい日々を過ごしております。
ここ 2 週間くらいで MCP に関する記事がかなり増えた印象を持ちましたので、「話題になってるなら実際に触ってみよう！」という単純な動機で手を動かしてみました。
今回は MCP サーバーを作って、Claude Desktop で遊んでみた過程を記載します。

いつも参考にしているブログで、サイコロを使った記事を発見しました。そのまま真似るのも面白みにかけるので、チンチロというギャンブル要素満載のサイコロゲームができる MCP サーバーを作ってみることにしました。

https://azukiazusa.dev/blog/typescript-mcp-server/

MCP の説明は他の人が丁寧に書いているので省略します。
私は上記のブログとこのあたりの記事を読んでキャッチアップしていました。

https://zenn.dev/smartround_dev/articles/02af1058e9f80f

## ロジックの概要

- ユーザーが数値を入力する
- 入力した数値の数だけ振り直しができる
- チンチロする
- 結果を返却してメッセージを生成する

### チンチロの得点表

| **役名** | 得点 | 例(サイコロの出目)                                                                                                                 |
| -------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ピンゾロ | 5倍  | 1-1-1                                                                                                                              |
| アラシ   | 3倍  | 1-1-1以外のゾロ目(2-2-2, 6-6-6など)両者ともにアラシのとき、数値が大きい人が勝つ(例: 2-2-2や6-6-6なら6-6-6が勝利)                   |
| シゴロ   | 2倍  | 4-5-6, 5-4-6など出目が4-5-6のとき                                                                                                  |
| 通常役   | 1倍  | 1-1-2や6-6-1など同じで目が2個あるとき、両者ともに通常役のとき、重複していない数値が大きい人が勝つ(例: 1-1-2や6-6-1なら1-1-2が勝利) |
| 役なし   | -1倍 | 1-2-4などの上記に当てはまらない場合                                                                                                |
| ヒフミ   | -2倍 | 1-2-3や2-3-1など出目が1-2-3のとき                                                                                                  |

詳しいルールは Wikipedia などを参照して下さい。

## 実装

はじめに `src/server.ts` を作成し、MCP サーバーを初期化します。以下のように `McpServer` クラスをインポートし、`name` と `version` を指定してインスタンスを作成します。
その後、`server.tool()` メソッドを使用してツールを定義します。
`playChinchillo()` メソッドは実際にチンチロを行うビジネスロジックです。現時点では作成していません。
`server.tool()` メソッドの第一引数には MCP サーバーで使用できる名前、第二引数には MCP サーバーの説明を設定します。

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { playChinchillo } from './chinchillo.js';

const TOOL_NAME = 'playChinchillo';
const TOOL_DESCRIPTION =
  'You can do chinchillo. If you win, nothing happens. See the rules here: https://casinotop5.jp/chinchiro/';

export const server = new McpServer({
  name: 'Chinchillo',
  version: '1.0.0',
});

server.tool(
TOOL_NAME,
TOOL_DESCRIPTION,
  // ツールの引数を定義するスキーマ
  // 1~3までの数値を許容する
  {
    count: z
      .number()
      .min(1)
      .max(3)
      .describe(
        'Enter a number from 1~3 for the number of times to shake it back.'
      ),
  },
  // ツールが呼び出されたときに実行される関数
  async ({ count }) => {
    // チンチロを実行
    const result = playChinchillo(count);

    return {
      content: [
        {
          type: 'text',
          text: result.description,
        },
      ],
    };
  }
);

export async function main() {
  console.error('Starting server.');
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

今回はユーザーが入力した数値の数だけ振り直すことが出来るようにしてみましょう。
第三引数に Zod のスキーマを定義して、1~3 の数値だけ入力を可能にします。

次にチンチロのビジネスロジックを実装していきましょう。
最初に型を定義します。

```typescript
// チンチロの役と配当率を定義する型
type Role = {
  name: string;
  multiplier: number;
};

// ダイスの結果を表す型
type DiceResult = {
  dice: number[];
  role: Role;
  uniqueValue?: number; // 通常役の場合、一致していない目の値
};

// ダイスを振る過程を記録する型
type RollHistory = {
  attempt: number;
  dice: number[];
  role: Role;
};
```

- `Role`: チンチロの役と配当率を定義する型です。ピンゾロが 5 倍とか、そういう情報です
- `DiceResult`: サイコロを振った結果を表す型です。「何が出たか」と「何の役になったか」を記録します
- `RollHistory`: サイコロを振る過程を記録する型です。「1 回目はシゴロ、2 回目はアラシ…」みたいな履歴を保存します

次にサイコロを振る処理、役の定義をしていきましょう。役の判定では振ったサイコロを昇順に並べて判定をしやすくしています。

```typescript
// チンチロの役の定義
const ROLES = {
PINZORO: { name: 'ピンゾロ', multiplier: 5 },
ARASHI: { name: 'アラシ', multiplier: 3 },
SHIGORO: { name: 'シゴロ', multiplier: 2 },
NORMAL: { name: '通常役', multiplier: 1 },
NOTHING: { name: '役なし', multiplier: -1 },
HIFUMI: { name: 'ヒフミ', multiplier: -2 },
};

/**
 * 3つのダイスをランダムに降った結果を返す。
 * 返すときは昇順にソートして判定しやすくする
 * @returns 3つのダイスの出目の配列 (各要素は1-6の整数)
 */
export function rollDice(): number[] {
  return Array(3)
    .fill(0)
    .map(() => Math.floor(Math.random() * 6) + 1)
    .sort((a, b) => a - b);
}

/**
 * ダイスの出目から役を判定する
 * @param dice ダイスの出目の配列 (ソート済み)
 * @returns 判定された役と関連情報
 */
function judgeRole(dice: number[]): DiceResult {
  // ダイスはすでにソート済みとする

  // ピンゾロ (1-1-1)
  if (dice[0] === 1 && dice[1] === 1 && dice[2] === 1) {
    return { dice, role: ROLES.PINZORO };
  }

  // ゾロ目 (同じ数字が3つ、ただしピンゾロを除く)
  if (dice[0] === dice[1] && dice[1] === dice[2] && dice[0] !== 1) {
    return { dice, role: ROLES.ARASHI };
  }

  // シゴロ (4-5-6)
  if (dice[0] === 4 && dice[1] === 5 && dice[2] === 6) {
    return { dice, role: ROLES.SHIGORO };
  }

  // ヒフミ (1-2-3)
  if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3) {
    return { dice, role: ROLES.HIFUMI };
  }

  // 通常役 (同じ数字が2つ)
  if (dice[0] === dice[1] || dice[1] === dice[2]) {
    // 一致していない目の値を取得
    const uniqueValue = dice[0] === dice[1] ? dice[2] : dice[0];
    return { dice, role: ROLES.NORMAL, uniqueValue };
  }

  // 役なし
  return { dice, role: ROLES.NOTHING };
}
```

出した役の勝敗を決定する処理と、チンチロ特有のルール(役無しの場合は振り直すことが出来る)も実装します。
チンチロではアラシと通常目で同じ得点だった場合、出目の数値が高いほうが勝利になります。

```typescript
/**
 * 2つの役の勝敗を判定する
 * @param result1 プレイヤー1の結果
 * @param result2 プレイヤー2の結果
 * @returns 勝者: 1ならプレイヤー1の勝ち、2ならプレイヤー2の勝ち、0なら引き分け
 */
function judgeWinner(result1: DiceResult, result2: DiceResult): number {
  // 配当率が高い方が勝ち
  if (result1.role.multiplier > result2.role.multiplier) {
    return 1;
  }
  if (result1.role.multiplier < result2.role.multiplier) {
    return 2;
  }

  // 配当率が同じ場合
  // アラシ同士の場合は数値が大きい方が勝ち
  if (result1.role === ROLES.ARASHI && result2.role === ROLES.ARASHI) {
    // アラシは3つとも同じ目なので、ダイスの値はすべて同じ
    // 配列の中身を確認してから比較
    const dice1 = result1.dice;
    const dice2 = result2.dice;

    if (dice1 && dice1.length > 0 && dice2 && dice2.length > 0) {
      // 配列の要素が存在することを確認
      const value1 = dice1[0];
      const value2 = dice2[0];

      if (typeof value1 === 'number' && typeof value2 === 'number') {
        if (value1 > value2) {
          return 1;
        }
        if (value1 < value2) {
          return 2;
        }
      }
    }
    return 0; // 完全に同じ場合は引き分け
  }

  // 通常役同士の場合（両方とも通常役の場合のみ）一致していない目の大きい方が勝ち
  if (result1.role === ROLES.NORMAL && result2.role === ROLES.NORMAL) {
    if (result1.uniqueValue && result2.uniqueValue) {
      if (result1.uniqueValue > result2.uniqueValue) {
        return 1;
      }
      if (result1.uniqueValue < result2.uniqueValue) {
        return 2;
      }
    }
  }

  // それ以外は引き分け
  return 0;
}

/**
 * 指定された回数だけダイスを振り直して、最も良い結果を返す
 * チンチロのルールに従い、役なしの場合のみ上限回数まで振り直し可能
 * 役なし以外が出た時点で確定する
 * @param maxRolls 振り直し可能な最大回数
 * @returns 最適な結果と振る過程の履歴
 */
function rollWithRerolls(maxRolls: number): {
  bestResult: DiceResult;
  history: RollHistory[];
} {
  // 少なくとも1回はダイスを振る
  let dice = rollDice();
  let result = judgeRole(dice);

  // 履歴を記録
  const history: RollHistory[] = [
    {
      attempt: 1,
      dice: [...dice],
      role: result.role,
    },
  ];

  // 役なしの場合のみ振り直し、役なし以外が出た時点で確定
  let currentRoll = 1;
  while (currentRoll < maxRolls && result.role === ROLES.NOTHING) {
    currentRoll++;
    dice = rollDice();
    result = judgeRole(dice);

    history.push({
      attempt: currentRoll,
      dice: [...dice],
      role: result.role,
    });
  }

  // 最後の結果を返す
  return {
    bestResult: result,
    history,
  };
}
```

最後にこれらのメソッドを合わせた `playChinchillo()` を実装していきましょう。
毎回同じ順番だと見栄えが楽しくないので、先手後手をランダムに決定します。

```typescript
/**
 * チンチロゲームを実行する
 * @param userRolls ユーザーが振り直せる回数
 * @param computerRolls コンピュータが振り直せる回数 (デフォルト: 1)
 * @returns ゲーム結果の詳細
 */
export function playChinchillo(rollCount: number): {
  description: string;
} {
  // 先行後攻をランダムで決定
  const userFirst = Math.random() < 0.5;

  // ユーザーとコンピュータのダイスを振る
  const userRollResult = rollWithRerolls(rollCount);
  const computerRollResult = rollWithRerolls(rollCount);

  const userResult = userRollResult.bestResult;
  const computerResult = computerRollResult.bestResult;

  // 勝敗判定
  const winner = judgeWinner(userResult, computerResult);

  // 結果のナレーションを生成
  let description = '🎲 チンチロ勝負開始！ 🎲\n\n';

  // 先行の振り
  const firstPlayer = userFirst ? 'あなた' : 'コンピュータ';
  const firstHistory = userFirst
    ? userRollResult.history
    : computerRollResult.history;

  description += `==== ${firstPlayer}の番 ====\n`;
  firstHistory.forEach((roll, index) => {
    description += `${index + 1}回目: ${roll.dice.join('-')} ... ${roll.role.name}`;
    if (index < firstHistory.length - 1) {
      description += ' ... もう一度振ります！\n';
    } else {
      description += ' が確定！\n';
    }
  });

  description += '\n';

  // 後攻の振り
  const secondPlayer = userFirst ? 'コンピュータ' : 'あなた';
  const secondHistory = userFirst
    ? computerRollResult.history
    : userRollResult.history;

  description += `==== ${secondPlayer}の番 ====\n`;
  secondHistory.forEach((roll, index) => {
    description += `${index + 1}回目: ${roll.dice.join('-')} ... ${roll.role.name}`;
    if (index < secondHistory.length - 1) {
      description += ' ... もう一度振ります！\n';
    } else {
      description += ' が確定！\n';
    }
  });

  description += '\n==== 結果発表 ====\n';
  description += `あなたの役: ${userResult.role.name} (${userResult.dice.join('-')})`;
  if (userResult.role === ROLES.NORMAL && userResult.uniqueValue) {
    description += ` (目: ${userResult.uniqueValue})`;
  }
  description += '\n';

  description += `コンピュータの役: ${computerResult.role.name} (${computerResult.dice.join('-')})`;
  if (computerResult.role === ROLES.NORMAL && computerResult.uniqueValue) {
    description += ` (目: ${computerResult.uniqueValue})`;
  }
  description += '\n\n';

  // 勝敗結果
  if (winner === 1) {
    description += `🎉 あなたの勝ちです！ (${userResult.role.multiplier > 0 ? '+' : ''}${userResult.role.multiplier}倍)`;
  } else if (winner === 2) {
    description += `😢 コンピュータの勝ちです。 (${computerResult.role.multiplier > 0 ? '+' : ''}${computerResult.role.multiplier}倍)`;
  } else {
    description += '🤝 引き分けです。';
  }

  return {
    description,
  };
}
```

## ローカルでのテスト

一通りロジックを作成できたので、ローカル上でテストをします。
`InMemoryTransport` を使用することでメモリ上でクライアントとサーバーを接続できます。
`src/server.test.ts` に実装していきましょう。
テスト結果はランダムな数値を作成している都合複雑になるので、今回は値が返却できているかだけを見ていきます。

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, expect, it } from 'vitest';
import { server } from './server.js';

describe('playChinchillo', () => {
  it('チンチロを実行する', async () => {
    // テスト用クライアントの作成
    const client = new Client({
      name: 'test client',
      version: '1.0.0',
    });

    // インメモリ通信チャネルの作成
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    // クライアントとサーバーを接続
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    // let's play chinchillo
    const result = await client.callTool({
      name: 'playChinchillo',
      arguments: {
        count: 3,
      },
    });

    console.log(result);

    // チンチロの結果を確認
    // 返却されればOKとする
    expect(result).toBeDefined();
  });
});
```

```bash
sui@MyDesktopPC:~/dev/chinchillo-mcp-server$ pnpm run test

> chinchillo-mcp-server@1.0.0 test /home/sui/dev/chinchillo-mcp-server
> vitest


 DEV  v3.1.1 /home/sui/dev/chinchillo-mcp-server

stdout | src/server.test.ts > playChinchillo > チンチロを実行する
{
  content: [
    {
      type: 'text',
      text: '🎲 チンチロ勝負開始！ 🎲\n' +
        '\n' +
        '==== あなたの番 ====\n' +
        '1回目: 4-5-6 ... シゴロ が確定！\n' +
        '\n' +
        '==== コンピュータの番 ====\n' +
        '1回目: 4-6-6 ... 通常役 が確定！\n' +
        '\n' +
        '==== 結果発表 ====\n' +
        'あなたの役: シゴロ (4-5-6)\n' +
        'コンピュータの役: 通常役 (4-6-6) (目: 4)\n' +
        '\n' +
        '🎉 あなたの勝ちです！ (+2倍)'
    }
  ]
}

 ✓ src/server.test.ts (1 test) 5ms
   ✓ playChinchillo > チンチロを実行する 5ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  07:52:42
   Duration  216ms (transform 35ms, setup 0ms, collect 62ms, tests 5ms, environment 0ms, prepare 45ms)

 PASS  Waiting for file changes...
       press h to show help, press q to quit

```

テストが成功しました。あとは最後の仕上げとして、`index.ts` を作って実行できるようにしましょう。

```typescript
#!/usr/bin/env node

import { main } from './server.js';

main().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
```

これで全てのロジックを作成しました。
実際に MCP サーバーを設定して、チンチロしていきましょう🎲

## CursorでMCPサーバーを設定する

手順は以下の通りです。

1. Claude Desktop を起動し、メニューバーの「Claude」→「Settings...」を選択
2. 左側のメニューから「Developer」を選択
3. 「Edit Config」ボタンをクリック
4. エクスプローラーが開くので **`claude_desktop_config.json`** ファイルをテキストエディタで開く

以下は Windows のローカル環境で開発したときの例です。

```bash
{
  "mcpServers": {
    "Chinchillo": {
      "command": "node",
      "args": [
        "C:\\Users\\xxxx\\Documents\\dev\\projects\\chinchillo-mcp-server\\dist\\src\\index.js"
      ]
    }
  }
}

```

Claude Desktop を開くと MCP サーバーが使用可能になっています。
早速チンチロをやっていきましょう。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-549a9b13-b0d1-4614-a169-26578d3d0a42.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-549a9b13-b0d1-4614-a169-26578d3d0a42.png)

実行したところチンチロができていることが確認できます。
コンピュータは 3 で私は 456 なので私の勝ちです🎲
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-20387efb-9979-4066-9712-8df0af141355.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-20387efb-9979-4066-9712-8df0af141355.png)
試しに 5 回振りなおそうと送ったら、ルール通り振ることはできませんでした。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-24988621-6eb2-48a8-9591-6f06c1602e2f.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-24988621-6eb2-48a8-9591-6f06c1602e2f.png)

## まとめ

この記事では Claude Desktop で簡単な MCP サーバーを作成しました。
バリデーションに書いてあることをしっかり守っているのが特徴的です。

いろいろなことが出来るけど、どう活かすかがまだ思いついていないので今後も動向を追っていきたいですね！

今回使用したコードは以下のリポジトリに格納しています。

https://github.com/Suntory-Y-Water/chinchillo-mcp-server
