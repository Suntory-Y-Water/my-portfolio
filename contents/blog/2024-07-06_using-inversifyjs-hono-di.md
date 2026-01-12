---
title: Hono + DIでInversifyJSを使用する
slug: using-inversifyjs-hono-di
date: 2024-07-06
modified_time: 2024-07-06
description: HonoとDIで実装したアプリケーションにInversifyJSを使用して改修します。依存性の注入をサポートする軽量のIoCコンテナであるInversifyJSの使い方を解説します。
icon: 🧨
icon_url: /icons/firecracker_flat.svg
tags:
  - InversifyJS
  - DI
  - Hono
---

## 概要

以前 Hono + DI で実装したアプリケーションに InversifyJS を使用して改修する

## InversifyJSとはなにか

InversifyJS は、TypeScript および JavaScript 用に依存性の注入(Dependency Injection)をサポートする軽量の IoC(Inversion of Control)コンテナです。

### InversifyJSの概要

1. **依存性の注入(DI)の概念**
    - InversifyJS は依存性の注入を実現するためのツールです。依存性の注入とは、クラスの依存関係を外部から注入することで、クラス自身が依存関係を管理しないようにする設計パターンです。これにより、クラスの再利用性やテストのしやすさが向上します。
2. **IoCコンテナ**
    - InversifyJS は IoC(Inversion of Control)コンテナとして機能します。IoC コンテナは、オブジェクトの生成とライフサイクルを管理し、依存関係を解決します。InversifyJS はこれを簡単に行うための API を提供しています。
3. **デコレーターによる注釈**
    - InversifyJS は TypeScript のデコレーターを活用して依存関係を宣言します。デコレーターは、クラスやメソッドにメタデータを付加し、依存関係を明示的に示します。
4. **インターフェースのサポート**
    - InversifyJS は TypeScript のインターフェースとクラスを利用して、依存関係の型安全性を確保します。これにより、DI コンテナに登録された依存関係が正しい型であることが保証されます。
5. **コンテナの管理**
    - 開発者は InversifyJS のコンテナを使用して、依存関係を登録、解決、管理します。コンテナに依存関係を登録し、必要な場所で解決することで、柔軟な依存関係管理が可能です。

## 現在実装されているソースコードの問題点

次に現在実装中のソースコードを ChatGPT に読み込んでもらい、問題点を洗い出します。
`no-InversifyJS` ブランチが本記事の実装をするまえのブランチです。

https://github.com/Suntory-N-Water/di-lesson-with-hono/tree/no-InversifyJS

### 現在の実装(`diConfig.ts`、`diContainer.ts`)の問題点

1. **手動での依存関係管理**
    - 現在の実装では、依存関係の登録と解決を手動で行っています。これにより、依存関係が増えるにつれて、コードが煩雑になり、管理が困難になります。
    - 例えば、以下のように手動で依存関係を登録しています。

```tsx
// diConfig.ts
diContainer.register('PostService', PostService, diContainer.get('PostRepository'));
```
    
2. **柔軟性の欠如**
    - 依存関係を手動で管理すると、コードの再利用性や柔軟性が低下します。例えば、`PostService` の依存関係を変更する場合、すべての関連部分で変更を行う必要があります。
3. **依存関係の解決が手動**
    - 依存関係を解決する際にも手動で行う必要があり、型安全性が保証されていません。また、依存関係が増えると、この手動管理はエラーの原因となる可能性があります。
    
```tsx
// diContainer.ts
get<K extends keyof DependencyTypes>(key: K): DependencyTypes[K] {
  const instance = this.registry.get(key);
  if (!instance) {
    throw new Error(`No instance found for key: ${String(key)}`);
  }
  return instance as DependencyTypes[K];
}

```
    
4. **インスタンス化の手動管理**
    - 現在の実装では、クラスのインスタンス化を手動で行っています。例えば、以下のようにインスタンスを作成しています。このアプローチでは、依存関係の解決が難しくなり、複雑な依存関係チェーンを管理するのが困難です。

```tsx
// diContainer.ts
register<Key extends keyof DependencyTypes, Args extends unknown[]>(
  key: Key,
  Constructor: new (...args: Args) => DependencyTypes[Key],
  ...args: Args
): void {
  const instance = new Constructor(...args);
  this.registry.set(key, instance);
}
```

1. **自動解決の欠如**
    - 依存関係の自動解決機能がないため、依存関係の注入を手動で行う必要があります。これにより、コードの保守性が低下し、エラーが発生しやすくなります。

要約すると手動で管理していることから保守性が低く、型安全がキャストによって保証されていないことが分かります。

## InversifyJSの利点

1. **自動依存関係解決**
    - InversifyJS は依存関係を自動で解決するため、手動での依存関係の登録や解決が不要です。これにより、コードの可読性と保守性が向上します。
2. **デコレーターによる宣言的な依存関係管理**:
    - InversifyJS はデコレーターを使用して依存関係を宣言的に管理します。これにより、依存関係がクラスの宣言部分で明示され、コードの見通しが良くなります。

## InversifyJSの実装

公式リポジトリを参考にして実装を進めていきます。

パッケージマネージャーは pnpm を使用します。

## 必要なパッケージをインストール

```bash
pnpm add inversify reflect-metadata
pnpm add -D @types/inversify
```

## `tsconfig.json` の設定を更新

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}

```

依存関係を設定するためのファイルとして `types.ts` を作成し、依存関係を識別子としてシンボル化します。

識別子をシンボル化することで、PostService を PostServoce のような typo を防ぐことができます。

> [!NOTE]
> この型宣言は必ず別のファイルに配置してください。( #1445)

https://github.com/inversify/InversifyJS/issues/1455

```tsx
const TYPES = {
  PostService: Symbol.for('PostService'),
  PostRepository: Symbol.for('PostRepository'),
};

export { TYPES };
```

`diConfig.ts` を修正し、依存関係の設定ファイルを作成します。

```tsx
import 'reflect-metadata';
import { Container } from 'inversify';
import { IPostService, PostService } from './postService';
import { IPostRepository, PostRepository } from './postRepository';
import { TYPES } from './types';

const diContainer = new Container();

diContainer.bind<IPostService>(TYPES.PostService).to(PostService);
diContainer.bind<IPostRepository>(TYPES.PostRepository).to(PostRepository);

export { diContainer };
```

既存のサービスとリポジトリを InversifyJS に対応させていきます。

```diff
// postService.ts
+import 'reflect-metadata';
+import { injectable, inject } from 'inversify';
 import { Post, PostCreate } from './post';
 import { IPostRepository } from './postRepository';
+import { TYPES } from './types';
 
export interface IPostService {
  getPost(id: number): Promise<Post>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: PostCreate): Promise<Post>;
  search(keyword: string, posts: Post[]): Post[] | null;
}
 
+@injectable()
 export class PostService implements IPostService {
-  private postRepository: IPostRepository;
-
-  constructor(postRepository: IPostRepository) {
-    this.postRepository = postRepository;
-  }
+  constructor(@inject(TYPES.PostRepository) private postRepository: IPostRepository) {}
 
   getPost(id: number): Promise<Post> {
     return this.postRepository.findPost(id);

  getAllPosts(): Promise<Post[]> {
    return this.postRepository.findAllPosts();
  }

  createPost(post: PostCreate): Promise<Post> {
    return this.postRepository.createPost(post);
  }

  search(keyword: string, posts: Post[]): Post[] | null {
    const searchResult = posts.filter((post) => {
      return post.title.includes(keyword) || post.body.includes(keyword);
    });
    if (searchResult.length === 0) {
      return null;
    }
    return searchResult;
  }
}
```

```diff
// postRepositoryts
+import 'reflect-metadata';
+import { injectable } from 'inversify';
 import { Post, PostCreate } from './post';
 
export interface IPostRepository {
  findPost(id: number): Promise<Post>;
  findAllPosts(): Promise<Post[]>;
  createPost(post: PostCreate): Promise<Post>;
}

+@injectable()
 export class PostRepository implements IPostRepository {
   private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  async findPost(id: number): Promise<Post> {
    const response = await fetch(`${this.apiUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post with id ${id}`);
    }
    const data = (await response.json()) as Post;
    return data;
  }

  async findAllPosts(): Promise<Post[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch post`);
    }
    const data = (await response.json()) as Post[];
    return data;
  }

  async createPost(post: Post): Promise<Post> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        ...post,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    const data = (await response.json()) as Post;
    return data;
  }
}
```

最後にエントリーポイントである `index.ts` を修正します。

今回は Post しか依存関係がないため、ミドルウェア上で依存関係を解決します。

```diff
import { Hono } from 'hono';
-import { DIContainer } from './di-container';
-import { DependencyTypes, diContainer } from './di-config';
+import { diContainer } from './diConfig';
 import { PostCreate } from './post';
+import { IPostService } from './postService';
+import { injectDependencies } from './middleware/injectDependencies';
 
 const app = new Hono<{
   Variables: {
-    diContainer: DIContainer<DependencyTypes>;
+    diContainer: typeof diContainer;
+    postService: IPostService;
   };
 }>();
 
-app.use('*', (c, next) => {
-  c.set('diContainer', diContainer);
-  return next();
-});
+app.use('*', injectDependencies);
 
 app.get('/posts/:id', async (c) => {
-  const di = c.get('diContainer');
   const id = parseInt(c.req.param('id'));
-
-  const postService = di.get('PostService');
+  const postService = c.get('postService');
   const post = await postService.getPost(id);
-
   return c.json(post);
 });
 
 app.get('/posts', async (c) => {
-  const di = c.get('diContainer');
-
-  const postService = di.get('PostService');
+  const postService = c.get('postService');
   const post = await postService.getAllPosts();
 
   return c.json(post);
 });
 
 app.post('/posts', async (c) => {
-  const di = c.get('diContainer');
   const request = await c.req.json<PostCreate>();
-  const postService = di.get('PostService');
+  const postService = c.get('postService');
   const post = await postService.createPost(request);
   return c.json(post);
 });
 
 app.get('/search', async (c) => {
-  const di = c.get('diContainer');
-
-  const postService = di.get('PostService');
+  const postService = c.get('postService');
   const post = await postService.getAllPosts();
   const query = c.req.query('keyword');
   if (!query) {
    console.error('No keyword query');
    return c.json(post);
  }
  const searchResult = postService.search(query, post);

  if (!searchResult) {
    return c.json({ message: 'No search result' });
  }
  return c.json(searchResult);
});

export default app;

```

```tsx
// src/middleware/injectDependencies.ts
import { MiddlewareHandler } from 'hono';
import { diContainer } from '../diConfig';
import { TYPES } from '../types';
import { IPostService } from '../postService';

export const injectDependencies: MiddlewareHandler = async (c, next) => {
  const postService = diContainer.get<IPostService>(TYPES.PostService);
  c.set('diContainer', diContainer);
  c.set('postService', postService);
  return next();
};
```

## 改善点

InversifyJS を使用することで使用前となにが変化したのかを説明します。

## 依存関係の自動解決

### 修正前

手動で依存関係を管理しているため、保守性に問題がありました。

```tsx
// src/diConfig.ts
diContainer.register('PostService', PostService, diContainer.get('PostRepository'));
```

### 修正後

InversifyJS のコンテナに依存関係を登録し、自動で解決するようになりました。

```tsx
// src/diConfig.ts
import 'reflect-metadata';
import { Container } from 'inversify';
import { IPostService, PostService } from './postService';
import { IPostRepository, PostRepository } from './postRepository';
import { TYPES } from './types';

const diContainer = new Container();

diContainer.bind<IPostService>(TYPES.PostService).to(PostService);
diContainer.bind<IPostRepository>(TYPES.PostRepository).to(PostRepository);

export { diContainer };

```

## デコレータの使用

### 修正前

手動で依存関係をコンストラクタに注入していました。

```tsx
// src/postService.ts
export class PostService {
  constructor(private postRepository: IPostRepository) {}
  // その他のメソッド
}
```

### 修正後

デコレータを使用して依存関係を注入しています。

これにより開発者が直感的に理解できます。

```tsx
// src/postService.ts
import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IPostRepository } from './postRepository';
import { TYPES } from './types';

@injectable()
export class PostService implements IPostService {
  constructor(@inject(TYPES.PostRepository) private postRepository: IPostRepository) {}
  // その他のメソッド
}

```

## 保守性の向上

### 修正前

依存関係の変更が発生すると、多くの箇所を修正する必要がありました。

修正前は依存関係の登録と解決が別のファイル(`diContainer.ts`)で行われており、`register()` や `get()` メソッドを手動で実装していました。

```tsx
// diContainer.ts
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

// src/diConfig.ts
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

export { diContainer };
```

### 修正後

InversifyJS のコンテナ内で依存関係を一元管理できるため、依存関係の変更が容易になりました。

依存関係の追加や変更があった場合でも、InversifyJS のコンテナ設定を変更するだけで済みます。

```tsx
// src/inversify.config.ts
import 'reflect-metadata';
import { Container } from 'inversify';
import { IPostService, PostService } from './postService';
import { IPostRepository, PostRepository } from './postRepository';
import { TYPES } from './types';

const diContainer = new Container();

diContainer.bind<IPostService>(TYPES.PostService).to(PostService);
diContainer.bind<IPostRepository>(TYPES.PostRepository).to(PostRepository);

export { diContainer };

```

## テストの容易さ

- InversifyJS のコンテナを使用することで、テスト時に依存関係を簡単にモックに置き換えられます。
- 依存関係の登録と解決が自動化されているため、モックの設定も簡単になります。

### Tips : mockを使用してテストを行う理由

今更ではありますが、mock を使用してテストを行う理由は大きくわけて 3 点あると思っています。

- 外部依存の排除
- テストの高速化
- 一貫した結果の確保

**外部依存の排除**

- テスト環境が外部 API に依存すると、外部サービスのダウンや遅延、データの変動などの影響を受けます。これにより、テストが安定しない場合があります。
- モックを使用することで、外部依存を排除し安定したテストを実行できます。

**テストの高速化**

- 外部 API へのリクエストは時間がかかるため、テスト全体の実行時間が長くなります。
- モックを使用することで、ローカルで高速に実行できるため、テストのフィードバックループが短くなります。

**一貫した結果の確保**

- 外部 API のデータが変動する場合、テスト結果が一貫しなくなります。
- モックを使用することで、一貫したテストデータを使用できるため、安定したテスト結果が得られます。

### Tips : モック化の対象は？

**外部通信(API呼び出しなど)**

- 外部 API へのリクエストは、テストの実行速度や安定性に影響を与えるため、モック化してテストを行います。

**データベースアクセス**

- データベースとのやり取りは、テスト環境の準備やデータの一貫性の確保が難しいため、モック化してテストします。

**モック化の必要が低い部分は単純なビジネスロジック**

- Service 層のビジネスロジックは、外部依存が少なく、独立してテスト可能な場合が多いため、直接テストを行います。

## テストの実施

テストライブラリには Vitest を使用します。

## モック用のContainerを作成

Repository 層のテストを実行してしまうと現時点の実装では外部 API を実行してしまうため、モック用の DIContainer を定義します。

```tsx
import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '../types';
import { IPostRepository } from '../postRepository';
import { MockPostRepository } from './mockPostRepository';

const mockDiContainer = new Container();

mockDiContainer.bind<IPostRepository>(TYPES.PostRepository).to(MockPostRepository);

export { mockDiContainer };
```

## モックレポジトリの作成

実際の postRepository.ts では[`https://jsonplaceholder.typicode.com/posts`](https://jsonplaceholder.typicode.com/posts)へ API を実行していますが、モック化していきます。

```tsx
// src/mocks/mockPostRepository.ts
import 'reflect-metadata';
import { injectable } from 'inversify';
import { IPostRepository } from '../../src/postRepository';
import { Post, PostCreate } from '../../src/post';

@injectable()
export class MockPostRepository implements IPostRepository {
  private posts: Post[] = [
    { id: 1, userId: 1, title: 'Post 1', body: 'Content of Post 1' },
    { id: 2, userId: 2, title: 'Post 2', body: 'Content of Post 2' },
  ];

  async findPost(id: number): Promise<Post> {
    const post = this.posts.find((p) => p.id === id);
    if (!post) throw new Error('Post not found');
    return post;
  }

  async findAllPosts(): Promise<Post[]> {
    return this.posts;
  }

  async createPost(post: PostCreate): Promise<Post> {
    const newPost = { ...post, id: this.posts.length + 1 };
    this.posts.push(newPost);
    return newPost;
  }
}
```

## テスト実施

作成したモックリポジトリをインポートして、Repository 層、Service 層のテストを行います。

```tsx
// postRepository.test.ts
import { mockDiContainer } from '../mocks/mockDiConfig';
import { IPostRepository } from '../postRepository';
import { TYPES } from '../types';

describe('PostRepository', () => {
  let postRepository: IPostRepository;

  beforeEach(() => {
    postRepository = mockDiContainer.get<IPostRepository>(TYPES.PostRepository);
  });

  test('should find a post by id', async () => {
    const post = await postRepository.findPost(1);
    expect(post).toEqual({
      id: 1,
      userId: 1,
      title: 'Post 1',
      body: 'Content of Post 1',
    });
  });

  test('should return all posts', async () => {
    const posts = await postRepository.findAllPosts();
    expect(posts).toHaveLength(2);
    expect(posts).toEqual([
      { id: 1, userId: 1, title: 'Post 1', body: 'Content of Post 1' },
      { id: 2, userId: 2, title: 'Post 2', body: 'Content of Post 2' },
    ]);
  });

  test('should create a new post', async () => {
    const newPost = { userId: 3, title: 'Post 3', body: 'Content of Post 3' };
    const createdPost = await postRepository.createPost(newPost);
    expect(createdPost).toEqual({
      id: 3,
      userId: 3,
      title: 'Post 3',
      body: 'Content of Post 3',
    });

    const posts = await postRepository.findAllPosts();
    expect(posts).toHaveLength(3);
  });

  test('should throw an error if post not found', async () => {
    await expect(postRepository.findPost(999)).rejects.toThrow('Post not found');
  });
});

```

```tsx
// postService.test.ts
import { IPostService, PostService } from '../postService';
import { PostCreate } from '../post';
import { IPostRepository } from '../postRepository';
import { TYPES } from '../types';
import { mockDiContainer } from '../mocks/mockDiConfig';

describe('PostService', () => {
  let postService: IPostService;
  let mockPostRepository: IPostRepository;

  beforeEach(() => {
    mockPostRepository = mockDiContainer.get<IPostRepository>(TYPES.PostRepository);
    postService = new PostService(mockPostRepository);
  });

  test('should get a post by id', async () => {
    const post = await postService.getPost(1);
    expect(post).toEqual({
      id: 1,
      userId: 1,
      title: 'Post 1',
      body: 'Content of Post 1',
    });
  });

  test('should return all posts', async () => {
    const posts = await postService.getAllPosts();
    expect(posts).toHaveLength(2);
    expect(posts).toEqual([
      { id: 1, userId: 1, title: 'Post 1', body: 'Content of Post 1' },
      { id: 2, userId: 2, title: 'Post 2', body: 'Content of Post 2' },
    ]);
  });

  test('should create a new post', async () => {
    const newPost: PostCreate = { userId: 3, title: 'Post 3', body: 'Content of Post 3' };
    const createdPost = await postService.createPost(newPost);
    expect(createdPost).toEqual({
      id: 3,
      userId: 3,
      title: 'Post 3',
      body: 'Content of Post 3',
    });

    const posts = await postService.getAllPosts();
    expect(posts).toHaveLength(3);
  });

  test('should search posts by keyword', async () => {
    const posts = await postService.getAllPosts();
    const searchResult = postService.search('Post 1', posts);
    expect(searchResult).toHaveLength(1);
    expect(searchResult![0]).toEqual({
      id: 1,
      userId: 1,
      title: 'Post 1',
      body: 'Content of Post 1',
    });
  });

  test('should return null if no posts match the keyword', async () => {
    const posts = await postService.getAllPosts();
    const searchResult = postService.search('Nonexistent', posts);
    expect(searchResult).toBeNull();
  });
});

```

## おわりに
最初 `InversifyJS` の読み方が分かりませんでした…初見で読める人あまり多くないのではないでしょうか。
InversifyJS がどのように依存性の注入を簡単かつ効率的に実現するかをご理解いただけたら幸いです。
まだほんの一部しか使えていませんが、私も DIチョットワカッタカモに近づくために頑張ります。