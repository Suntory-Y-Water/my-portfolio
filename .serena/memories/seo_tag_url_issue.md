# タグURL最適化 - Google Search Consoleインデックス問題の解決

## メモリの読む順序

### 1. まず読むべき: `seo_improvements`
- SEO改善点の**全体リスト**（13項目）
- 優先度別に整理
- 各項目の概要と影響範囲

### 2. 次に読むべき: `seo_tag_url_issue` (このファイル)
- タグURL最適化の**詳細実装ガイド**
- Search Consoleのインデックス問題の解決方法
- 具体的なコード例と実装手順

---

## 参考サイトについて

**参考にしたサイト: azukiazusa's blog**

- **URL**: https://azukiazusa.dev
- **技術スタック**: SvelteKit + Contentful CMS + Cloudflare Pages
- **参考にした理由**: SEO対策が充実しており、特にタグURL管理の実装が優れている

このメモリでは、上記サイトのタグURL実装方法を分析し、本プロジェクトへの適用方法を提案しています。

**注意**: 以前ローカルに配置していた参考サイトのコード(sapper-blog-app/)は削除済みです。このメモリに必要な情報は全て記録済みです。

今後サンプルコードとして提供されているものを見たい場合は`https://github.com/azukiazusa1/sapper-blog-app`を`gh`コマンドを使用して確認すること。

---

## 問題の概要

**現状**: Google Search Consoleで日本語タグや大文字・半角スペースを含むタグがインデックスされていない

**原因**: タグ名がそのままURLになっており、URLエンコード後の文字列が長く複雑になる、または正規化の問題が発生

**優先度**: 🔴 **クリティカル** - SEOとインデックスに直接影響

---

## 具体的な問題例

### 問題1: 日本語タグのURLエンコード

```
タグ名: "アクセシビリティ"
現在のURL: /tags/アクセシビリティ
エンコード後: /tags/%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B7%E3%83%93%E3%83%AA%E3%83%86%E3%82%A3
問題: URLが非常に長く、可読性が低い。Googleがクロールしにくい。
```

### 問題2: 大文字・半角スペース混在

```
タグ名: "Visual Studio Code"
現在のURL: /tags/Visual Studio Code
エンコード後: /tags/Visual%20Studio%20Code
問題: 
- 大文字小文字で重複URLが生成される可能性
- %20が含まれるURLはクリック率が低い
- URL正規化の問題
```

---

## 参考ブログサイトの実装方法

**sapper-blog-app では Contentful CMS を使用したタグ管理を実装**

### データ構造

```typescript
// app/src/generated/graphql.ts
export type Tag = {
  name: string;    // 表示名
  slug: string;    // URL用スラッグ
}
```

### 実装例

```graphql
# app/src/queries/Tags.ts
query Tags {
  tagCollection {
    items {
      name   # 例: "Visual Studio Code", "TypeScript", "アクセシビリティ"
      slug   # 例: "visual-studio-code", "typescript", "accessibility"
    }
  }
}
```

### URL生成

```svelte
<!-- app/src/components/Tag/Tag.svelte -->
<a href={`/tags/${slug}`}>
  #{name}
</a>

<!-- 結果例 -->
<!-- URL: /tags/visual-studio-code -->
<!-- 表示: #Visual Studio Code -->
```

### 実装の要点（参考サイトから学んだこと）

- Contentful CMSでタグをコンテンツタイプとして定義
- 各タグにnameフィールドとslugフィールドを持たせる
- GraphQLでタグデータを取得（`{ name, slug }`）
- Svelteコンポーネントで`slug`をURLに、`name`を表示に使用
- タグページでslugをパラメータとして受け取り、対応する記事を取得

---

## 本プロジェクトでの解決策

### オプションA: 自動slug化関数 【推奨度: 中】

**メリット**: 保守性が高い、新しいタグを追加しても自動対応
**デメリット**: 日本語タグはそのまま残る

```typescript
// src/lib/utils.ts
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()                    // 小文字化
    .normalize('NFKD')                // Unicode正規化
    .replace(/[\u0300-\u036f]/g, '')  // アクセント記号削除
    .replace(/[^\w\s-]/g, '')         // 特殊文字削除
    .trim()                            // 前後の空白削除
    .replace(/\s+/g, '-')             // スペースをハイフンに
    .replace(/-+/g, '-');             // 連続ハイフンを1つに
}

// 変換例:
// "Visual Studio Code" → "visual-studio-code"
// "TypeScript" → "typescript"
// "アクセシビリティ" → "アクセシビリティ" (日本語はそのまま - 問題解決せず)
```

---

### オプションB: マッピングテーブル 【推奨度: 高】

**メリット**: 完全制御、日本語→英語変換が確実
**デメリット**: 新しいタグを追加する際にマッピングも追加が必要

```typescript
// src/config/tag-slugs.ts
export const TAG_SLUG_MAP: Record<string, string> = {
  // プログラミング言語
  'TypeScript': 'typescript',
  'JavaScript': 'javascript',
  'Go': 'go',
  'Rust': 'rust',
  
  // フレームワーク・ツール
  'Next.js': 'nextjs',
  'React': 'react',
  'Vue.js': 'vuejs',
  'Svelte': 'svelte',
  'Visual Studio Code': 'visual-studio-code',
  
  // 日本語タグ
  'アクセシビリティ': 'accessibility',
  'フロントエンド': 'frontend',
  'バックエンド': 'backend',
  'パフォーマンス': 'performance',
  'セキュリティ': 'security',
  'テスト': 'testing',
  'デザイン': 'design',
  
  // その他
  'Web Components': 'web-components',
  'CSS': 'css',
  'HTML': 'html',
};

// src/lib/utils.ts
import { TAG_SLUG_MAP } from '@/config/tag-slugs';

export function getTagSlug(tagName: string): string {
  return TAG_SLUG_MAP[tagName] || slugifyTag(tagName);
}

export function getTagNameFromSlug(slug: string): string | undefined {
  return Object.entries(TAG_SLUG_MAP).find(([_, s]) => s === slug)?.[0];
}
```

---

### オプションC: MDXフロントマターにtagSlugsフィールド 【推奨度: 低】

**メリット**: 明示的、記事ごとに完全制御
**デメリット**: 既存の全MDXファイルを修正する必要がある、保守性が低い

```yaml
---
title: 記事タイトル
tags:
  - TypeScript
  - Visual Studio Code
  - アクセシビリティ
tagSlugs:
  - typescript
  - visual-studio-code
  - accessibility
---
```

---

## 推奨実装: オプションB (マッピングテーブル)

### 修正が必要なファイル

1. **`src/config/tag-slugs.ts`** (新規作成)
   - タグ名→slug、slug→タグ名のマッピング定義

2. **`src/lib/utils.ts`**
   - `getTagSlug(tagName)` - タグ名からslugを取得
   - `getTagNameFromSlug(slug)` - slugからタグ名を取得

3. **`src/lib/mdx.ts`**
   ```typescript
   // 修正前
   export async function getAllTags(): Promise<string[]> {
     const posts = await getAllBlogPosts();
     const tags = posts.flatMap((post) => post.metadata.tags ?? []);
     return [...new Set(tags)];
   }
   
   // 修正後
   export async function getAllTagSlugs(): Promise<string[]> {
     const posts = await getAllBlogPosts();
     const tagNames = posts.flatMap((post) => post.metadata.tags ?? []);
     const uniqueTagNames = [...new Set(tagNames)];
     return uniqueTagNames.map(getTagSlug);
   }
   
   export async function getBlogPostsByTagSlug(tagSlug: string): Promise<BlogPost[]> {
     const tagName = getTagNameFromSlug(tagSlug);
     if (!tagName) return [];
     
     const posts = await getAllBlogPosts();
     return posts.filter((post) => post.metadata.tags?.includes(tagName));
   }
   ```

4. **`src/app/tags/[slug]/page.tsx`**
   ```typescript
   // generateMetadata
   export async function generateMetadata({ params }: TagPageProps) {
     const { slug } = await params;
     const tagName = getTagNameFromSlug(slug);
     
     return {
       title: `${tagName}の記事一覧`,
       description: `${tagName}に関する記事の一覧です。`,
     };
   }
   
   // ページコンポーネント
   export default async function TagPage({ params }: TagPageProps) {
     const { slug } = await params;
     const tagName = getTagNameFromSlug(slug);
     const posts = await getBlogPostsByTagSlug(slug);
     
     // tagNameを表示に使用
     // slugをURLに使用
   }
   ```

5. **`src/app/sitemap.ts`**
   ```typescript
   export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
     // ...
     const tagSlugs = await getAllTagSlugs();  // 変更
     
     const tagEntries = tagSlugs.map((slug) => ({
       url: `${baseUrl}/tags/${slug}`,
     }));
     
     return [...staticPages, ...blogEntries, ...tagEntries, ...paginationEntries];
   }
   ```

6. **`src/components/feature/content/blog-card.tsx`** (タグリンク生成)
   ```typescript
   {metadata.tags?.map((tagName) => (
     <Badge key={tagName} variant="secondary">
       <Link href={`/tags/${getTagSlug(tagName)}`}>
         {tagName}
       </Link>
     </Badge>
   ))}
   ```

---

## 実装後の効果

### Before (現状)
```
URL: /tags/Visual%20Studio%20Code
URL: /tags/%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B7%E3%83%93%E3%83%AA%E3%83%86%E3%82%A3
問題: インデックスされない、可読性低い
```

### After (修正後)
```
URL: /tags/visual-studio-code
URL: /tags/accessibility
改善: SEO-friendly、短く読みやすい、インデックス可能
```

---

## 実装時の注意点

### 1. リダイレクト設定

既存の旧URLからのアクセスを新URLへリダイレクト:

```typescript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // 既存の日本語タグURLを新slugへリダイレクト
      // 例: /tags/アクセシビリティ → /tags/accessibility
      // 動的に生成することを推奨
    ];
  },
};
```

### 2. マッピングテーブルの保守

新しいタグを追加する際は、`src/config/tag-slugs.ts`にマッピングを追加:

```typescript
// 新しいタグを追加時
export const TAG_SLUG_MAP: Record<string, string> = {
  // ...既存のマッピング
  
  // 新規追加
  'パフォーマンス最適化': 'performance-optimization',
};
```

### 3. Google Search Consoleでの確認

- 実装後、Google Search Consoleで新URLのインデックス状況を確認
- 旧URLの削除リクエストを送信
- sitemap.xmlの再送信

---

## 実装スケジュール提案

1. **Phase 1**: マッピングテーブル作成 (1時間)
   - 既存タグを全て洗い出し
   - slug化ルールを決定
   - `tag-slugs.ts`作成

2. **Phase 2**: ユーティリティ関数実装 (30分)
   - `getTagSlug()`, `getTagNameFromSlug()`実装

3. **Phase 3**: コア機能修正 (2時間)
   - `mdx.ts`修正
   - `tags/[slug]/page.tsx`修正
   - `sitemap.ts`修正

4. **Phase 4**: UI修正 (1時間)
   - タグリンク生成部分を全て修正
   - 表示確認

5. **Phase 5**: テストとデプロイ (1時間)
   - ローカルで動作確認
   - デプロイ
   - Google Search Consoleで確認

**合計所要時間**: 約5.5時間

---

## 参考資料

- 参考サイト: https://azukiazusa.dev (SvelteKit + Contentful CMS)
- Google Search Console: URLインスペクションツール
- Next.js Dynamic Routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- URL Slug Best Practices: https://moz.com/learn/seo/url
