---
title: 手を動かして理解しようとするDI（依存性の注入）
slug: understanding-di-dependency-injection-through-hands-on
date: 2024-06-15
description:
icon: 💉
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Syringe/Flat/syringe_flat.svg
tags:
  - TypeScript
  - DI
  - オブジェクト指向プログラミング
  - Hono
---

# はじめに

依存性の注入という単語をよく見るが、読んでもよく分からなかったので手を動かしながら理解する

# やること

- DI とはなにかを手を動かして理解する
- 実装を通じてﾅﾝﾓﾜｶﾗﾝからﾁｮｯﾄﾜｶｯﾀｶﾓになる

# そもそもDIとはなに

振り返りとして簡単に概要を掲載します。

## 概要

依存性の注入（Dependency Injection, DI）とは、オ**ブジェクトの依存関係を外部から注入するデザインパターンのこと**です。
オブジェクト間の依存関係を明示的に管理しやすくなり、コードの保守性やテストのしやすさが向上します。

## メリット

- **モジュールの独立性向上**: オブジェクトが自身の依存関係を直接生成するのではなく、外部から提供されるため、モジュール同士の結合度が低くなります。
- **テストの容易さ**: 依存関係をモックに置き換えることで、ユニットテストが容易になります。
- **保守性の向上**: 依存関係が明示的に管理されるため、コードの変更が他の部分に与える影響を最小限に抑えられます。

正直私がここで解説するよりも、こちらの記事がかなり網羅性高く書かれており参考になりました。

https://zenn.dev/nuits_jp/articles/2024-05-22-why-dependency-injection

# 実装

今後 DI を Hono で実装してみたいので、Hono を使っていきます。
既に実装している人がいらっしゃったので、そちらを参考に作成していきます。

https://blog.70-10.net/posts/hono-dependency-injection/

## ベースクラスの作成
まずはベースとなる Post クラスを作成します
型は JSON Placeholder の posts を元に作成しました

```tsx:post.ts
// post.ts

export class Post {
  constructor(
    public userId: number,
    public id: number,
    public title: string,
    public body: string,
  ) {}
}

```

## インターフェースの実装
ポストを取得するための `IPostRepository` インターフェースを実装します。このインターフェースは、ポストデータの取得方法を抽象化し、具体的な実装を隠蔽します。

```tsx
// post-repository.ts
import { Post } from './post';

export interface IPostRepository {
  findPost(id: number): Post;
  findAllPosts(): Post[];
}

```

ここでは、特定の ID のポストを取得する `findPost` メソッドと、すべてのポストを取得する `findAllPosts` メソッドを定義しています。

## リポジトリクラスの実装
次に、`IPostRepository` インターフェースを実装する具体的なリポジトリクラスを作成します。

```tsx:post-repository.ts
export class PostRepository implements IPostRepository {
  findPost(id: number): Post {
    // 本来はAPIから取得しますが、ここでは例として固定のデータを返す
    return new Post(1, id, 'Example Title', 'Example Body');
  }

  findAllPosts(): Post[] {
    // 本来はAPIから取得しますが、ここでは例として固定のデータを返す
    return [
      new Post(1, 1, 'Example Title 1', 'Example Body 1'),
      new Post(1, 2, 'Example Title 2', 'Example Body 2'),
    ];
  }
}
```

`PostRepository` クラスは、`IPostRepository` インターフェースを実装し、具体的なポストデータの取得方法を提供します。

ここでは簡略化のため固定のデータを返していますが、実際には API からデータを取得するロジックを実装します。

次にサービス層を定義します。これは、`IPostRepository` を使用してデータを取得するサービスです。
サービス層の定義は、アプリケーションのビジネスロジックをカプセル化し、リポジトリからデータを取得して処理を行う重要な役割を担っています。

`IPostService` は、サービス層が提供する機能を抽象化し、他のクラスがサービス層の機能を利用する際に、`getPost(id: number): Post;` および `getAllPosts(): Post[];` メソッドを必ず実装するように強制します。

```tsx:post-service.ts
import { Post } from './post';
import { IPostRepository } from './post-repository';

export interface IPostService {
  getPost(id: number): Post;
  getAllPosts(): Post[];
}

export class PostService implements IPostService {
  private postRepository: IPostRepository;

  constructor(postRepository: IPostRepository) {
    this.postRepository = postRepository;
  }

  getPost(id: number): Post {
    return this.postRepository.findPost(id);
  }

  getAllPosts(): Post[] {
    return this.postRepository.findAllPosts();
  }
}

```

仮にどちらかを書き忘れてしまったとしても、以下のようにコンパイルエラーなります。

- `PostService` のロジック忘れ → 呼び出し元でプロパティがないためコンパイルエラー
- `IPostService` で定義忘れ → `PostService` 内でコンパイルエラー

## DIコンテナの実装
次に依存性注入コンテナ（DI コンテナ）を実装しています。
DI コンテナは、アプリケーション内のオブジェクトの生成と管理を一元化し、依存関係を注入する仕組みを提供します。

ジェネリクスを使用して任意の型の依存オブジェクトを管理しています。

```tsx:di-container.ts
export class DIContainer<DependencyTypes> {
  private registry = new Map<keyof DependencyTypes, DependencyTypes[keyof DependencyTypes]>();

  register<Key extends keyof DependencyTypes, Args extends unknown[]>(
    key: Key,
    Constructor: new (...args: Args) => DependencyTypes[Key],
    ...args: Args
  ): void {
    const instance = new Constructor(...args);
    this.registry.set(key, instance);
  }

  get<K extends keyof DependencyTypes>(key: K): DependencyTypes[K] {
    const instance = this.registry.get(key);
    if (!instance) {
      throw new Error(`No instance found for key: ${String(key)}`);
    }
    return instance as DependencyTypes[K];
  }
}

```

## 依存関係の登録
最後に `di-config.ts` で DI コンテナを使ってリポジトリとサービスの依存関係を登録していきます。

```tsx:di-config.ts
import { IPostService, PostService } from './post-service';
import { DIContainer } from './di-container';
import { IPostRepository, PostRepository } from './post-repository';

export interface DependencyTypes {
  PostService: IPostService;
  PostRepository: IPostRepository;
}

const diContainer = new DIContainer<DependencyTypes>();

// Register repositories
diContainer.register('PostRepository', PostRepository);

// Register services
diContainer.register('PostService', PostService, diContainer.get('PostRepository'));
```

**リポジトリの登録**:

- `PostRepository` を DI コンテナに登録します。
- `register` メソッドは、リポジトリのキー（ここでは `PostRepository`）とクラスのコンストラクタを受け取ります。
- これにより、DI コンテナは `PostRepository` のインスタンスを管理できるようになります。

**サービスの登録**:

- `PostService` を DI コンテナに登録します。
- `register` メソッドは、サービスのキー（ここでは `PostService`）、クラスのコンストラクタ、およびコンストラクタ引数（ここでは `PostRepository` のインスタンス）を受け取ります。
- これにより、DI コンテナは `PostService` のインスタンスを管理し、必要な依存関係を注入できるようになります。

# Hono で使う

DIContainer を Hono で使えるようにします。
このあたりの説明は、以下の記事通りの内容になります。

https://blog.70-10.net/posts/hono-dependency-injection/

Context の set()/get() を通じて DIContainer へアクセスします。

https://hono.dev/api/context#set-get

## Variables に DIContainer を指定する

Hono の Variables の型に DIContainer を指定します。

```tsx
const app = new Hono<{
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
  };
}>();
```

## `context.set()` でどこからでもアクセスできるようにする

すべてのエンドポイントからアクセスできるように `context.set()` で DIContainer をセットします。

```tsx
app.use("*", (c,next)=> {  c.set("diContainer", diContainer);  return next();});
```

DIContainer を使うには `cotext.get()` から取得します。

```tsx
app.get('/posts/:id', (c) => {
  const di = c.get('diContainer');
  const id = parseInt(c.req.param('id'));

  const postService = di.get('PostService');
  const post = postService.getPost(id);

  return c.json(post);
});
```

## 固定値で返していた `posts` をJSON Placeholderから取得する

先ほどまで固定値を設定していた PostRepository を JSON Placeholder から取得するように書き換えます。

このとき返却値が `Promise<Post>` または `Promise<Post[]>` 型になるので注意しましょう。

```tsx
// post-repository.ts
import { Post } from './post';

export interface IPostRepository {
  findPost(id: number): Promise<Post>;
  findAllPosts(): Promise<Post[]>;
}

export class PostRepository implements IPostRepository {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  async findPost(id: number) {
    const response = await fetch(`${this.apiUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post with id ${id}`);
    }
    const data = (await response.json()) as Post;
    return data;
  }

  async findAllPosts() {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch post`);
    }
    const data = (await response.json()) as Post[];
    return data;
  }
}

```

## ロジックの追加

追加でロジックを作成するときも service と repository にロジックを追加すれば OK です。

post を作成するロジックも作成していきましょう。

post.ts に新しくクラスを定義します。

```tsx
export class PostCreate {
  constructor(public title: string, public body: string, public userId: number) {}
}
```

次に post-repository.ts に新しい post を作成する処理を書いていきます。

```diff tsx
export interface IPostRepository {
  findPost(id: number): Promise<Post>;
  findAllPosts(): Promise<Post[]>;
+ createPost(post: PostCreate): Promise<Post>;
}

+export class PostRepository implements IPostRepository {
+ async createPost(post: PostCreate) {
+   const response = await fetch(this.apiUrl, {
+    method: 'POST',
+     body: JSON.stringify({
+       post,
+     }),
+     headers: {
+       'Content-type': 'application/json; charset=UTF-8',
+     },
+   });
+   if (!response.ok) {
+     throw new Error('Failed to create post');
+   }
+   const data = (await response.json()) as Post;
+   return data;
+ }
+}

```

エンドポイントも追加していきましょう

```tsx
app.post('/', async (c) => {
  const di = c.get('diContainer');
  const request = await c.req.json<PostCreate>();
  const postService = di.get('PostService');
  const post = await postService.createPost(request);
  return c.json(post);
});
```

JSON Placeholder の公式ドキュメントを見たところ、id は勝手に設定されるそうので Postman から他要素を body に設定して API を叩いていきましょう。

叩いたところ、無事に登録されてレスポンスが返却されることが分かります。

![](https://storage.googleapis.com/zenn-user-upload/baf6a2494f81-20240615.png)


初めての DI ということでなんとなくイメージが掴めたところで、今回は終了しようと思います。

# ソースコード

https://github.com/Suntory-Y-Water/di-lesson-with-hono