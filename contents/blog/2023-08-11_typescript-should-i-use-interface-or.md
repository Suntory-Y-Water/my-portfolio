---
title: TypeScript interfaceとtypeどっち使うんですか？
slug: typescript-should-i-use-interface-or
date: 2023-08-11
modified_time: 2023-08-11
description: TypeScriptでinterfaceとtypeのどちらを使うべきかについての解説。
icon: 📘
icon_url: /icons/blue_book_flat.svg
tags:
  - JavaScript
  - TypeScript
---
フロントエンド勉強中です。
ブルーベリー本とChatGPT、サバイバルTypeScriptとともに学んでいます。

## ざっくりとしたまとめ

## **interface：拡張可能**

`interface`を使用すると、同じ名前のインターフェイスを複数回定義することで、既存のインターフェイスを拡張することができる。

## **typeの特徴：複雑な型操作ができる**

`type`を使用すると、Intersection型など、より複雑な型の操作を表現することができる。

```ts
interface PersonInterface {
  name: string;
  age: number;
}

interface PersonInterface {
  email: string;
}

const personWithInterface: PersonInterface = {
  name: "田中",
  age: 25,
  email: "tanaka@example.com"
};

console.log(`${personWithInterface.name}さんのメールアドレスは${personWithInterface.email}です`);


type Name = {
  name: string;
};

type Age = {
  age: number;
};

type PersonType = Name & Age;

const personWithType: PersonType = {
  name: "山田",
  age: 30
};

console.log(`${personWithType.name}さんは${personWithType.age}歳です`);

// 田中さんのメールアドレスはtanaka@example.comです
// 山田さんは30歳です
```

