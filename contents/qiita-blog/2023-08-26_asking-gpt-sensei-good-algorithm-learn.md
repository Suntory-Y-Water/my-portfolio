---
title: ラーメン二郎のコールで学ぶ良いアルゴリズムとは何かをGPT先生に聞いてみる
slug: asking-gpt-sensei-good-algorithm-learn
date: 2023-08-26
description:
icon:
icon_url:
tags:
  - アルゴリズム
  - 初心者
  - TypeScript
  - if文
  - ChatGPT
---
# きっかけ

良い条件分岐とはなんだろう？と考えていたときにふとラーメン二郎のコールを思い出しました。
ラーメン二郎では店員さんが「ニンニク入れますか？」と聞いたあと、お客さんがトッピングの量を伝える形で提供されます。

トッピングは店によって様々ですが、基本的には以下の4つが多いです。

- ヤサイ
- ニンニク
- アブラ
- カラメ

それぞれのトッピングは少なめ、そのまま、多め（マシ）と量も伝えることができます。

:::note warn
麺の硬さは「ニンニク入れますか？」の前に聞かれるので対象外にします。
:::

# 良いアルゴリズムとはなにか

ChatGPT先生に聞いてみました。
---

良い条件分岐のアルゴリズムを考えるためのヒントは以下のとおりです。

1. **明確な条件**: 条件は明確にし、他の開発者が読んでも理解しやすいようにします。
2. **短い条件式**: 長すぎる条件式は読むのが難しくなるので、適切な変数や関数に分割します。
3. **早期リターン**: 不要なネストを避けるために、エラー条件などで早めに関数から抜け出すテクニックを用います。
4. **一貫性**: 同じ条件を複数の場所で判定する場合は、一貫性を保つようにします。
5. **冗長性の排除**: 似たような条件を複数回繰り返さないようにします。

例を示します。次のような関数があるとします。

<details><summary>ソースコードは長くなるので折りたたみます。</summary><div>
    
``` TypeScript
function getPrice(item: { type: string, discount: boolean }): number {
  let price: number;

  if (item.type === 'book') {
      price = 1000;
      if (item.discount) {
          price -= 200;
      }
  } else if (item.type === 'pen') {
      price = 200;
      if (item.discount) {
          price -= 50;
      }
  } else {
      price = 500;
      if (item.discount) {
          price -= 100;
      }
  }

  return price;
}

```

上記のコードは冗長です。以下のようにリファクタリングできます。

```tsx
function getPrice(item: { type: string, discount: boolean }): number {
    const basePrices: { [key: string]: number } = {
        book: 1000,
        pen: 200,
        default: 500
    };
    const discountAmounts: { [key: string]: number } = {
        book: 200,
        pen: 50,
        default: 100
    };

    const basePrice = basePrices[item.type] || basePrices.default;
    const discountAmount = item.discount ? (discountAmounts[item.type] || discountAmounts.default) : 0;

    return basePrice - discountAmount;
}

```

このリファクタリングにより、新しい商品タイプや割引額を追加するのも簡単になりました。
</div></details>
    

---

良いアルゴリズムには5つの特徴があるということで、それらを踏まえてラーメン二郎のコールを条件分岐に落とし込みます。

## 要件を伝える

GPT先生にはソースコードを提供する前に、認識に齟齬がないように質問をしてもらいます。

<details><summary>プロンプト</summary><div>
ラーメン二郎のニンニク入れますか？のあとに回答するコールを条件分岐で表現して下さい。
言語はTypeScriptでお願いします。
基本的なフローは以下の通りです。

- 店員さんが「ニンニク入れますか？」とお客さんに聞く
- お客さんは以下の要素から希望するトッピングを判断する
    - ヤサイ
    - ニンニク
    - アブラ
    - カラメ
- 上記の4要素には分量を設定することができ、少なめ、通常、マシを宣言できる
    - 通常の場合は要素をそのまま言う
        > ヤサイを通常、アブラを増やしたいときの返事は以下の通りです
        「ヤサイ、アブラマシ」
        >
- 上記の4要素を全て入れる場合は「全部」と返事をする
- 上記の4要素を全てマシで入れる場合は「全マシ」と返事をする

以上が基本的なフローになります。

店舗によっては上記の4要素に加えて、辛たま（辛い玉ねぎ）などオリジナルの要素を加えることができるため、拡張性をもたせるように表現してください。

ソースコードを提供する前に不明点がある場合は、必ず質問をして下さい。

</div></details>

<details><summary>GPTからの質問</summary><div>

### 質問

要件を確認しました。拡張性を考慮に入れた条件分岐のソースコードをTypeScriptで書きますが、何点か質問させてください。
1. お客さんは一度に複数の要素とその分量（少なめ、通常、マシ）を選ぶことができるという理解でよろしいでしょうか？
2. 「全マシ」と回答した場合、オリジナルの要素（例えば、辛たま）も「マシ」にするということでしょうか？

この点が明確になれば、ソースコードの作成に取り掛かります。

### 回答
1. 認識合っています。AさんとBさんでこのように異なるトッピングを希望する場合がほとんどです。
    
    > Aさん：ヤサイとニンニクを入れて、アブラを多くしたいとき
    「ヤサイ、ニンニク、アブラマシ」
    Bさん：ニンニクを多く入れて、アブラを少なめで入れて、カラメを入れたいとき
    「ニンニクマシ、アブラ少なめ、カラメ」
    > 
2. 認識合っています。例えば要素が4つから6つになった場合、全マシにすると追加した要素も全マシになります。

</div></details>

## 提供されたソースコード

```tsx
type ToppingLevel = "少なめ" | "通常" | "マシ";
type Topping = "ヤサイ" | "ニンニク" | "アブラ" | "カラメ";
type ExtraTopping = string; // 例: "辛たま"

interface Order {
  [key: string]: ToppingLevel;
}

function generateToppingString(order: Order, extraToppings?: ExtraTopping[]): string {
  let response: string[] = [];
  const standardToppings: Topping[] = ["ヤサイ", "ニンニク", "アブラ", "カラメ"];

  for (const topping of standardToppings) {
    if (order[topping]) {
      if (order[topping] === "通常") {
        response.push(topping);
      } else {
        response.push(`${topping}${order[topping]}`);
      }
    }
  }

  if (extraToppings) {
    for (const extra of extraToppings) {
      if (order[extra]) {
        response.push(`${extra}${order[extra]}`);
      }
    }
  }

  if (response.length === standardToppings.length && !response.some(str => str.includes("少なめ"))) {
    return response.every(str => str.includes("マシ")) ? "全マシ" : "全部";
  }

  return response.join("、");
}

const orderA: Order = { "ヤサイ": "通常", "ニンニク": "通常", "アブラ": "マシ" };
console.log(generateToppingString(orderA));  // "ヤサイ、ニンニク、アブラマシ"

const orderB: Order = { "ニンニク": "マシ", "アブラ": "少なめ", "カラメ": "通常" };
console.log(generateToppingString(orderB));  // "ニンニクマシ、アブラ少なめ、カラメ"

const orderC: Order = { "ヤサイ": "マシ", "ニンニク": "マシ", "アブラ": "マシ", "カラメ": "マシ", "辛たま": "マシ" };
console.log(generateToppingString(orderC, ["辛たま"]));  // "全マシ"

```

## ソースコードを改善してみる

ソースコードを見る限りネストが深くなってしまっている箇所があるので、追加で修正をお願いします。

<details><summary>修正依頼</summary><div>

ありがとうございます。一部認識が異なっていた部分があるので、それらの修正をお願いします。

1. 全マシのときは各要素を一つ一つ出力するのではなく、そのまま「全マシ」と出力して下さい。
2. 別店舗では4要素以外にもトッピングを加えることができます（例：辛たま）。そういった別店舗でのコールも考慮して拡張性をもたせるように設計して下さい。
3. 全要素が通常のとき「全部」と出力して下さい。これは全マシと同じやり方で問題ないです。

また、先程提示いただいた良いアルゴリズムに沿ってソースコードをリファクタリングして下さい。

あなたが提示したよいアルゴリズムの定義を再度掲載します。

1. **明確な条件**: 条件は明確にし、他の開発者が読んでも理解しやすいようにします。
2. **短い条件式**: 長すぎる条件式は読むのが難しくなるので、適切な変数や関数に分割します。
3. **早期リターン**: 不要なネストを避けるために、エラー条件などで早めに関数から抜け出すテクニックを用います。
4. **一貫性**: 同じ条件を複数の場所で判定する場合は、一貫性を保つようにします。
5. **冗長性の排除**: 似たような条件を複数回繰り返さないようにします。

</div></details>

### 修正後のソースコード
```tsx
type ToppingLevel = "少なめ" | "通常" | "マシ";
type StandardTopping = "ヤサイ" | "ニンニク" | "アブラ" | "カラメ";

interface Order {
  [key: string]: ToppingLevel;
}

const isAllSameLevel = (order: Order, standardToppings: StandardTopping[], level: ToppingLevel): boolean => {
  return standardToppings.every(topping => order[topping] === level);
};

const generateResponse = (order: Order, topping: string): string => {
  return order[topping] === "通常" ? topping : `${topping}${order[topping]}`;
};

const generateToppingString: (order: Order, extraToppings?: string[]) => string = (order, extraToppings) => {
  const standardToppings: StandardTopping[] = ["ヤサイ", "ニンニク", "アブラ", "カラメ"];

  // 早期リターン：全マシのケース
  if (isAllSameLevel(order, standardToppings, "マシ")) return "全マシ";
  
  // 早期リターン：全部のケース
  if (isAllSameLevel(order, standardToppings, "通常")) return "全部";

  let response: string[] = [];

  standardToppings.forEach(topping => {
    if (order[topping]) {
      response.push(generateResponse(order, topping));
    }
  });

  extraToppings?.forEach(extra => {
    if (order[extra]) {
      response.push(generateResponse(order, extra));
    }
  });

  return response.join("、");
};

const orderA: Order = { "ヤサイ": "通常", "ニンニク": "通常", "アブラ": "マシ" };
console.log(generateToppingString(orderA));  // "ヤサイ、ニンニク、アブラマシ"

const orderB: Order = { "ニンニク": "マシ", "アブラ": "少なめ", "カラメ": "通常" };
console.log(generateToppingString(orderB));  // "ニンニクマシ、アブラ少なめ、カラメ"

const orderC: Order = { "ヤサイ": "通常", "ニンニク": "通常", "アブラ": "通常", "カラメ": "通常" };
console.log(generateToppingString(orderC));  // "全部"

const orderD: Order = { "ヤサイ": "マシ", "ニンニク": "マシ", "アブラ": "マシ", "カラメ": "マシ" };
console.log(generateToppingString(orderD));  // "全マシ"

const orderE: Order = { "ヤサイ": "通常", "ガリマヨ": "マシ" };
console.log(generateToppingString(orderE, ["ガリマヨ"]));  // "ヤサイ、ガリマヨマシ"
```

かなりスッキリした印象です。
最後にソースコードの解説をしてもらって終わりにしたいと思います。

---
以下は各関数や主要なコードブロックに関する解説です。

1. **`type ToppingLevel`, `type Topping`, `interface Order`:**
    これらの型定義で、トッピングの種類とレベルを明確にしています。
     **明確な条件**: トッピングとレベルに対する条件が明確です。


2. **`isAllMashi`と`isMashi`関数:**
    全てのトッピングが"マシ"または"通常"であるかを確認します。
     **早期リターン**: この関数が`true`を返す場合、主要な関数はすぐに結果を返します。
3. **`generateResponse`関数:**
    トッピングとそのレベルに基づいて、返答の一部を生成します。
     **短い条件式**: 条件はシンプルで読みやすいです。

4. **`generateToppingString`関数:**
    主要な関数で、オーダーに基づいて返答の文字列を生成します。
     **早期リターン**: `isAllMashi`や`isMashi`で早期リターンを行います。
     **一貫性**: 同じトッピングの判定が一貫しています。
     **冗長性の排除**: `generateResponse`を使って、冗長なコードを排除しています。
     **拡張性**: `extraToppings`引数により、新しいトッピングを柔軟に追加できます。

このように、良いアルゴリズムの各定義に沿って設計を行っています。

