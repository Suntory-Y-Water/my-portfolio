# アーキテクチャパターンと設計思想

## 全体アーキテクチャ

### 採用アーキテクチャ
- **フレームワーク**: Next.js 16 App Router
- **レンダリング戦略**: Static Site Generation (SSG) + Server Components
- **状態管理**: React Server Components + Client Components(最小限)
- **スタイリング**: Tailwind CSS + CSS Modules(一部)

### 設計原則

#### YAGNI(You Aren't Gonna Need It)
将来的な拡張性の考慮は禁止。現時点で必要な機能のみを実装する。

#### KISS(Keep It Simple, Stupid)
シンプルで読みやすいコードを重視。過度な抽象化を避ける。

#### 関数型プログラミング
- クラスは使用しない
- 純粋関数を優先
- 副作用を最小化
- 関数合成の活用

---

## コンポーネント設計

### コンポーネント階層

```
app/                  (ページコンポーネント)
  ↓
feature/             (機能別コンポーネント)
  ↓
shared/              (共有コンポーネント)
  ↓
ui/                  (汎用UIコンポーネント)
```

#### 各層の責務

##### `ui/` - 汎用UIコンポーネント
- **責務**: 再利用可能な最小単位のUIコンポーネント
- **依存**: 他のコンポーネントに依存しない
- **例**: Button, Card, Dialog, Select

##### `shared/` - 共有コンポーネント
- **責務**: アプリケーション全体で使用される共有コンポーネント
- **依存**: `ui/`を使用
- **例**: Header, Footer, Pagination

##### `feature/` - 機能別コンポーネント
- **責務**: 特定の機能に特化したコンポーネント
- **依存**: `ui/`, `shared/`を使用
- **例**: BlogCard, MarkdownContent, SearchDialog

##### `app/` - ページコンポーネント
- **責務**: ルーティングとページ構成
- **依存**: すべてのコンポーネント層を使用
- **例**: Blog詳細ページ, トップページ

### Server Components vs Client Components

#### Server Componentsを優先
デフォルトではServer Componentsを使用し、以下の場合のみClient Componentsを使用する：

- イベントハンドラーが必要な場合(`onClick`, `onChange`など)
- React Hooksが必要な場合(`useState`, `useEffect`など)
- ブラウザAPIが必要な場合(`localStorage`, `window`など)

#### Client Componentsの最小化
Client Componentsは必要最小限の範囲に限定し、子コンポーネントはできるだけServer Componentsにする。

```tsx
// ✅ Good - Client Componentは最小限
'use client';

import { useState } from 'react';
import { ServerChildComponent } from './server-child'; // Server Component

export function MinimalClientComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ServerChildComponent /> {/* Server Component as child */}
    </div>
  );
}
```

---

## データフェッチング

### 静的生成(SSG)を優先
ブログ記事など、ビルド時に生成できるページは静的生成を使用する。

```tsx
// src/app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug({ slug: params.slug });
  return <article>{/* ... */}</article>;
}
```

### Server Actionsの活用
フォーム送信やデータ更新には、Server Actionsを使用する。

```tsx
// src/actions/fetch-og-metadata.ts
'use server';

export async function fetchOgMetadata({ url }: { url: string }) {
  // ...
}
```

---

## Markdownパイプライン

### unified/remark/rehypeパイプライン

Markdownの処理は、unified/remark/rehypeパイプラインを使用する。

```typescript
// src/lib/markdown.ts
unified()
  .use(remarkParse)                    // Markdown → mdast
  .use(remarkBreaks)                   // 改行処理
  .use(remarkGfm)                      // GitHub Flavored Markdown
  .use(remarkGithubBlockquoteAlert)    // GitHub Alert記法
  .use(remarkRehype, { allowDangerousHtml: true })  // mdast → hast
  .use(rehypeSlug)                     // 見出しにIDを付与
  .use(rehypePrettyCode)               // コードブロックのシンタックスハイライト
  .use(rehypeCodeCopyButton)           // コピーボタン追加(カスタムプラグイン)
  .use(rehypeLinkCard)                 // リンクカード生成(カスタムプラグイン)
  .use(rehypeMermaidCode)              // Mermaid図生成(カスタムプラグイン)
  .use(rehypeStringify)                // hast → HTML
```

### カスタムrehypeプラグイン

プロジェクト固有の処理は、カスタムrehypeプラグインとして実装する。

**既存カスタムプラグイン:**
- `rehype-code-copy-button.ts` - コードブロックにコピーボタンを追加
- `rehype-link-card.ts` - リンクをカード形式で表示
- `rehype-mermaid-code.ts` - Mermaid記法を図に変換

---

## セキュリティアーキテクチャ

### 多層防御(Defense in Depth)

複数の層でセキュリティ対策を実施する。

#### レイヤー1: 入力検証
- フロントマターの検証
- URLパラメータの検証

#### レイヤー2: サニタイゼーション
- DOMPurify + jsdomによるHTMLサニタイゼーション
- SVGファイルのスクリプト除去

#### レイヤー3: セキュリティヘッダー
- Content Security Policy(CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

#### レイヤー4: 自動チェック
- pre-commitフックでのSVGセキュリティチェック
- ビルド時の静的解析

### DOMPurifyの実装パターン

```typescript
// Server-side sanitization
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const sanitized = purify.sanitize(dirtyHtml, {
  ALLOWED_TAGS: ['p', 'a', 'strong', /* ... */],
  ALLOWED_ATTR: ['href', 'title', /* ... */],
  ALLOWED_URI_REGEXP: /^https?:\/\//,
});
```

---

## 定数・設定の一元管理

### 設定ファイルの階層

```
src/config/site.ts       (サイト全体の設定)
  ↓
src/constants/index.ts   (アプリケーション定数)
  ↓
各コンポーネント          (設定を参照)
```

### サイト設定パターン

```typescript
// src/config/site.ts
export const siteConfig = {
  name: 'sui Tech Blog',
  description: '...',
  url: 'https://example.com',
  ogImage: 'https://example.com/og.png',
  links: {
    twitter: 'https://twitter.com/...',
    github: 'https://github.com/...',
  },
} as const; // as const で型安全に
```

---

## 型安全性の確保

### 型定義の方針

#### typeを使用(interfaceは使用しない)
```typescript
// ✅ Good
type User = {
  id: string;
  name: string;
};

// ❌ Bad
interface User {
  id: string;
  name: string;
}
```

#### as constで不変性を保証
```typescript
export const ALLOWED_TAGS = ['p', 'a', 'strong'] as const;
type AllowedTag = typeof ALLOWED_TAGS[number]; // 'p' | 'a' | 'strong'
```

#### Pick/Omitで型を再利用
```typescript
type BlogPost = {
  slug: string;
  title: string;
  content: string;
  published: Date;
};

type BlogPostPreview = Pick<BlogPost, 'slug' | 'title' | 'published'>;
type BlogPostWithoutContent = Omit<BlogPost, 'content'>;
```

---

## パフォーマンス最適化

### ビルド時最適化

#### 静的生成(SSG)
ブログ記事など、変更頻度の低いページは静的生成する。

#### バンドルサイズ最適化
- 不要なライブラリの削除(depcheck)
- 動的インポート(`next/dynamic`)
- Tree Shaking(Biome + Next.js)

### ランタイム最適化

#### 画像最適化
- Next.js Image Componentの使用
- WebP形式への変換
- 遅延ロード

#### フォント最適化
- カスタムフォントのサブセット化
- `font-display: swap`

---

## テスト戦略(現状)

現在、このプロジェクトにはテストがありません。将来的に追加する場合は、以下のような戦略を検討してください：

### 推奨テスト戦略
- **単体テスト**: Vitest + React Testing Library
- **E2Eテスト**: Playwright
- **型チェック**: TypeScript(`bun run typecheck`)
- **Lint**: Biome(`bun run check`)

---

## デプロイ戦略

### Vercelへのデプロイ

#### ビルドコマンド
```bash
bun run build
```

#### ビルド後処理(postbuild)
```bash
pagefind --site .next --output-path public/pagefind
```

#### 環境変数
- `ANALYZE`: バンドル分析の有効化
- `ANALYZE_MODE`: 分析モード(static/json)
- `ANALYZE_STATS`: stats.jsonの生成

---

## ADR(Architecture Decision Records)

重要なアーキテクチャ決定は、ADRとして記録する。

### ADRの形式
- JSON形式で機械可読性を重視
- `docs/adr/decisions/*.json`に配置
- `docs/adr/index.json`でインデックス管理

### 既存ADR
1. **ADR-0001**: ブログ記事作成スクリプトでの自動ブランチ作成
2. **ADR-0002**: 定数とURL設定の一元化
3. **ADR-0003**: SVGとMarkdownにおけるXSS脆弱性の対策
4. **ADR-0004**: DOMPurify実装方法の変更とリンクカードサニタイズの追加

---

## まとめ

このプロジェクトのアーキテクチャは、以下の原則に基づいています：

1. **シンプルさ優先** - YAGNI、KISS原則
2. **型安全性** - TypeScriptの厳格な型チェック
3. **セキュリティ** - 多層防御、サニタイゼーション
4. **パフォーマンス** - 静的生成、最適化
5. **保守性** - 明確な階層構造、一元管理

新しい機能を追加する際は、これらの原則に従い、既存のパターンを踏襲してください。
