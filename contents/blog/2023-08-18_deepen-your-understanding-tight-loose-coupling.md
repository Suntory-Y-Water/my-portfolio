---
title: 密結合と疎結合の理解を深める
slug: deepen-your-understanding-tight-loose-coupling
date: 2023-08-18
description: 密結合と疎結合の違いと、コードの品質への影響について。
icon: 🔗
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Link/Flat/link_flat.svg
tags:
  - TypeScript
---
## 目的

- 密結合のソースコードがどう悪影響を与えているのか確認したい
- 疎結合のソースコードが優れている理由を確認したい

## 密結合 疎結合とは

## 密結合

密結合は、あるコンポーネントが他のコンポーネントの具体的な実装や動作に強く依存している状態を指します。
このような状態では、一方のコンポーネントに変更が加えられると、他のコンポーネントも変更を要求される可能性が高まります。

**密結合の特徴**:

1. 一つの部分に変更が生じると、他の部分にも影響が出やすい。
2. システム全体の再利用性や拡張性が低い。
3. テストが困難になることがある。

## 疎結合

疎結合は、各コンポーネントが他のコンポーネントの具体的な実装や動作に依存しない状態を指します。
疎結合ではインターフェースや抽象クラスを使用して依存関係を管理します。
これにより、あるコンポーネントの実装が変更されても、他のコンポーネントに影響を与えることなく、独立して動作できます。

**疎結合の特徴**:

1. システムの部分を独立して変更やテストができる。
2. システム全体の再利用性や拡張性が高い。
3. 一部のコンポーネントを他の実装に容易に置き換えることができる。

## ソースコード

## 密結合

```tsx
class TightEngine {
  start() {
      console.log("Engine started");
  }
}

class TightCar {
  engine: TightEngine;

  constructor() {
      this.engine = new TightEngine();
  }

  start() {
      this.engine.start();
      console.log("Car started");
  }
}

let car = new TightCar();
car.start();
```

**解説**:

1. `TightEngine` クラス:
    - このクラスはエンジンの動作を模倣するものです。
    - `start` メソッドはエンジンが始動することを示すメッセージをコンソールに表示します。
2. `TightCar` クラス:
    - このクラスは車の動作を模倣するものです。
    - このクラスは `TightEngine` クラスに直接依存しており、コンストラクタ内でそのインスタンスを生成しています。
    - `start` メソッドは、まずエンジンの `start` メソッドを呼び出し、次に車が始動することを示すメッセージをコンソールに表示します。

この例では、`TightCar` クラスは `TightEngine` クラスの具体的な実装に直接依存しているため、密結合となっています。

## 疎結合

```tsx
interface LooseEngineInterface {
    start(): void;
}

class LooseEngineA implements LooseEngineInterface {
    start() {
        console.log("Engine A started");
    }
}

class LooseEngineB implements LooseEngineInterface {
    start() {
        console.log("Engine B started");
    }
}

class LooseCar {
    engine: LooseEngineInterface;

    constructor(engine: LooseEngineInterface) {
        this.engine = engine;
    }

    start() {
        this.engine.start();
        console.log("Car started");
    }
}

let engineA = new LooseEngineA();
let carWithEngineA = new LooseCar(engineA);
carWithEngineA.start();

let engineB = new LooseEngineB();
let carWithEngineB = new LooseCar(engineB);
carWithEngineB.start();
```

**解説**:

1. `LooseEngineInterface` インターフェース:
    - エンジンの動作を示すメソッド `start` を定義しています。
2. `LooseEngineA` と `LooseEngineB` クラス:
    - これらのクラスは `LooseEngineInterface` インターフェースを実装しており、異なるエンジンの動作を模倣するものです。
3. `LooseCar` クラス:
    - このクラスは車の動作を模倣するものですが、具体的なエンジンの実装ではなく、エンジンのインターフェース (`LooseEngineInterface`) にのみ依存しています。
    - コンストラクタはエンジンのインスタンスを受け取り、それを内部のプロパティに保存します。
    - `start` メソッドは、注入されたエンジンの `start` メソッドを呼び出し、次に車が始動することを示すメッセージをコンソールに表示します。

この例では、`LooseCar` クラスは具体的なエンジンの実装 (`LooseEngineA` や `LooseEngineB`) に依存しておらず、インターフェース (`LooseEngineInterface`) にのみ依存しているため、疎結合となっています。

## 疑問点

- 疎結合だとソースコードが冗長にならないか

実際に、疎結合の設計はインターフェースの定義や依存性の注入など、多くの追加の要素を導入することが多い。

ただし、その冗長性は長期的にはメリットになります。

1. **保守性**: システムが成長して変更の必要が生じたとき、疎結合であれば変更が容易です。密結合の設計では、一部の変更が他の部分に予期しない影響を及ぼすリスクが高まります。
2. **テスト性**: 各コンポーネントが独立して動作するため、ユニットテストを書くことが容易になります。
3. **拡張性**: 新しい機能やコンポーネントを追加することが容易です。新しい実装をインターフェースに準拠させるだけで、既存のシステムと統合することができます。
4. **再利用性**: 疎結合のコンポーネントは、他のプロジェクトやコンテキストで再利用することが容易です。

設計が複雑に見えるかもしれませんが、長期的には疎結合の設計が多くの問題やコストを回避してくれます。

## 実際に変更点があったときの差異

**変更点**：

1. エンジンは始動時に燃料の種類を表示する。
2. エンジンの`start`メソッドには始動音も追加。

### 密結合

```ts
class TightEngine {
    fuelType: string;

    constructor(fuelType: string) {
        this.fuelType = fuelType;
    }

    start() {
        console.log("Engine started with " + this.fuelType);
        console.log("Vroom Vroom!"); // 始動音
    }
}

class TightCar {
    engine: TightEngine;

    constructor() {
        this.engine = new TightEngine("Regular"); // 直接燃料の種類を指定
    }

    start() {
        this.engine.start();
        console.log("Car started");
    }
}

let car = new TightCar();
car.start();

/*
Engine started with Regular
Vroom Vroom!
Car started
*/
```

この密結合の例では、**`TightCar`** クラスが燃料の種類 **Regular** を直接指定しています。

これは、**`TightCar`** クラスが **`TightEngine`** クラスの内部実装に深く依存していることを示しています。

### 疎結合

```tsx
interface LooseEngineInterface {
  start(): void;
}

class LooseEngineA implements LooseEngineInterface {
  fuelType: string;

  constructor(fuelType: string) {
      this.fuelType = fuelType;
  }

  start() {
      console.log("Engine A started with " + this.fuelType);
      console.log("Vroom Vroom!"); // 始動音
  }
}

class LooseEngineB implements LooseEngineInterface {
  fuelType: string;

  constructor(fuelType: string) {
      this.fuelType = fuelType;
  }

  start() {
      console.log("Engine B started with " + this.fuelType);
      console.log("Brrrr Brrrr!"); // 別の始動音
  }
}

class LooseCar {
  engine: LooseEngineInterface;

  constructor(engine: LooseEngineInterface) {
      this.engine = engine;
  }

  start() {
      this.engine.start();
      console.log("Car started");
  }
}

let engineA = new LooseEngineA("Regular");
let carWithEngineA = new LooseCar(engineA);
carWithEngineA.start();

let engineB = new LooseEngineB("Diesel");
let carWithEngineB = new LooseCar(engineB);
carWithEngineB.start();

/*
Engine A started with Regular
Vroom Vroom!
Car started
Engine B started with Diesel
Brrrr Brrrr!
Car started
*/
```

疎結合の例では、燃料の種類を**`LooseCar`**クラスの外部から取得することができます。

また、**`LooseEngineA`** と **`LooseEngineB`** は異なる始動音を持っているので、それぞれのエンジンの実装を変更することなく、新しい始動音を追加することができます。

## まとめ

### 密結合 (Tight Coupling)

密結合は、あるコンポーネントが他のコンポーネントの具体的な実装や動作に強く依存している状態を指します。

**特徴**:

1. コンポーネント間の依存度が高い。
2. 一部の変更が他の部分に影響を与えるリスクが高い。
3. システム全体の再利用性や拡張性が低下する可能性がある。

**ソースコードの例**:
`TightCar` クラスは `TightEngine` クラスの具体的な実装に直接依存しています。したがって、エンジンの実装や仕様が変わると、`TightCar` クラスも変更する必要があります。

### 疎結合 (Loose Coupling)

疎結合は、各コンポーネントが他のコンポーネントの具体的な実装や動作に依存しない状態を指します。代わりに、インターフェースや抽象クラスなどの抽象的な定義に依存することが一般的です。

**特徴**:

1. コンポーネント間の依存度が低い。
2. システムの部分を独立して変更やテストができる。
3. システム全体の再利用性や拡張性が向上する。

**ソースコードの例**:
`LooseCar` クラスは具体的なエンジンの実装（`LooseEngineA` や `LooseEngineB`）に依存していません。代わりに、`LooseEngineInterface` というインターフェースにのみ依存しています。この設計により、エンジンの実装が変わっても、`LooseCar` クラスは影響を受けません。

