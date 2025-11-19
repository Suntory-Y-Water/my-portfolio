# ブログ記事検索機能 詳細調査レポート

## 📋 目次

1. [現状分析](#現状分析)
2. [既存の関連機能](#既存の関連機能)
3. [参考プロジェクトの実装](#参考プロジェクトの実装)
4. [技術的選択肢](#技術的選択肢)
5. [データ構造とメタデータ](#データ構造とメタデータ)
6. [実装推奨案](#実装推奨案)

---

## 1. 現状分析

### 1.1 検索機能の実装状況

**結論: テキスト検索機能は未実装**

現在のmy-portfolioでは、以下の機能は実装されていますが、テキストベースの検索機能は存在しません：

- ✅ タグフィルタリング（実装済み）
- ✅ ページネーション（実装済み）
- ❌ **テキスト検索（未実装）**

### 1.2 既存のADR確認結果

`docs/adr/index.json` を確認した結果、検索機能に関する既存の設計決定（ADR）は**存在しません**。

既存ADRは以下の2件のみ：
- ADR-0001: ブログ記事作成スクリプトでの自動ブランチ作成
- ADR-0002: 定数とURL設定の一元化

**→ 検索機能実装は新規の設計決定が必要**

---

## 2. 既存の関連機能

### 2.1 タグベースフィルタリング

#### ファイル構成
```
src/
├── app/
│   ├── tags/
│   │   ├── page.tsx          # タグ一覧ページ
│   │   └── [slug]/page.tsx   # タグ別記事一覧
│   └── blog/
│       ├── page.tsx          # ブログトップ（5件表示）
│       └── page/[page]/page.tsx  # ページネーション付き一覧
├── lib/
│   ├── markdown.ts           # 記事取得ロジック
│   └── pagination.ts         # ページネーション
└── config/
    └── tag-slugs.ts          # タグslugマッピング
```

#### 主要関数（`src/lib/markdown.ts`）

```typescript
// 全ブログ記事を日付降順で取得
export async function getAllBlogPosts(): Promise<BlogPost[]>

// タグslugで記事をフィルタリング
export async function getBlogPostsByTagSlug(tagSlug: string): Promise<BlogPost[]>

// 全タグ名を取得
export async function getAllTags(): Promise<string[]>

// 全タグslugを取得
export async function getAllTagSlugs(): Promise<string[]>

// slugで単一記事を取得
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>
```

**実装パターン:**
- サーバーサイドで記事データを取得
- `contents/blog/` ディレクトリからMarkdownファイルを読み込み
- `gray-matter` でフロントマターをパース
- 日付降順でソート
- タグフィルタリングは `Array.filter()` で実装

#### タグslugマッピング（`src/config/tag-slugs.ts`）

```typescript
export const TAG_SLUG_MAP: Record<string, string> = {
  'Next.js': 'nextjs',
  'TypeScript': 'typescript',
  'React': 'react',
  // ... 122個のタグマッピング
} as const;

// タグ名 → slug変換
export function getTagSlug(tagName: string): string

// slug → タグ名変換
export function getTagNameFromSlug(slug: string): string | undefined
```

### 2.2 ページネーション機能

#### 実装詳細（`src/lib/pagination.ts`）

```typescript
export type PaginationResult<T> = {
  items: T[];           // ページ内のアイテム
  currentPage: number;  // 現在のページ（1始まり）
  totalPages: number;   // 総ページ数
  totalItems: number;   // 全アイテム数
};

export function paginateItems<T>({
  items,
  page,
  pageSize,
}: {
  items: T[];
  page: number;
  pageSize: number;
}): PaginationResult<T>
```

**設定値（`src/constants/index.ts`）:**
```typescript
export const BLOG_CONSTANTS = {
  POSTS_PER_PAGE: 10,        // ページネーション
  TOP_PAGE_POSTS_COUNT: 5,   // トップページ表示数
} as const;
```

#### UIコンポーネント（`src/components/shared/pagination.tsx`）

- 前へ/次へボタン
- 現在ページ / 総ページ数の表示
- 無効状態のボタンスタイリング
- `lucide-react` のアイコン使用

### 2.3 ブログカードコンポーネント

#### コンポーネント構成（`src/components/feature/content/blog-card.tsx`）

表示要素：
- アイコン（絵文字 or FluentUI Emoji画像）
- タイトル（2行まで表示）
- 説明文（3行まで表示）
- 投稿日
- タグ（最大3件表示 + 残数表示）
- ホバーエフェクト

**スタイリング:**
- TailwindCSS使用
- `shadcn/ui` のBadge、Cardコンポーネント
- レスポンシブ対応

### 2.4 既存のshadcn/uiコンポーネント

**インストール済み:**
- ✅ `badge` - タグ表示に使用
- ✅ `button` - 各種ボタン
- ✅ `card` - ブログカード
- ✅ `dropdown-menu` - ドロップダウンメニュー
- ✅ `select` - セレクトボックス
- ✅ `separator` - セパレーター
- ✅ `skeleton` - ローディング表示
- ✅ `breadcrumb` - パンくずリスト

**未インストール（検索機能に必要）:**
- ❌ `command` - 検索UIコンポーネント（cmdk）
- ❌ `dialog` - モーダル表示

---

## 3. 参考プロジェクトの実装

### 3.1 sapper-blog-appの検索実装

#### 採用技術: **Pagefind**

**Pagefindとは:**
- 静的サイト専用の検索ライブラリ
- ビルド時に検索インデックスを生成
- クライアントサイドで高速検索
- バックエンド不要

#### 実装フロー

```bash
# package.json
{
  "scripts": {
    "postbuild": "pagefind --site .svelte-kit/cloudflare"
  },
  "dependencies": {
    "@pagefind/default-ui": "^1.2.0"
  }
}
```

**処理ステップ:**
1. ビルド完了後、Pagefindがサイトをスキャン
2. 検索可能なインデックスを自動生成
3. クライアントで`@pagefind/default-ui`を読み込み
4. ユーザーが検索を実行
5. インデックスから即座に結果を返す

#### UIコンポーネント

- **SearchDialog** - モーダル形式の検索UI
- **bits-ui** - アクセシビリティ対応のヘッドレスコンポーネント使用

---

## 4. 技術的選択肢

### 4.1 検索実装の4つのアプローチ

#### Option 1: shadcn/ui Command + クライアントサイドフィルタリング ⭐**推奨**

**メリット:**
- ✅ 既存のshadcn/uiデザインシステムと統一
- ✅ 実装がシンプル
- ✅ 追加ライブラリ最小限
- ✅ リアルタイムフィルタリング
- ✅ `Cmd+K` ショートカット標準対応
- ✅ アクセシビリティ対応済み
- ✅ カスタマイズ性が高い

**デメリット:**
- ⚠️ 記事数が数千になるとパフォーマンス低下の可能性
- ⚠️ 全記事データをクライアントに送信

**実装コスト:** ⭐⭐ (低)

**必要なコンポーネント:**
```bash
bunx shadcn@latest add command dialog
```

**実装例:**
```typescript
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])

  // Cmd+Kで開く
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="記事を検索..." />
      <CommandList>
        <CommandEmpty>記事が見つかりませんでした</CommandEmpty>
        <CommandGroup heading="検索結果">
          {posts.map((post) => (
            <CommandItem key={post.slug} onSelect={() => {
              router.push(`/blog/${post.slug}`)
              setOpen(false)
            }}>
              {post.metadata.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

#### Option 2: Pagefind（静的検索）

**メリット:**
- ✅ バックエンド不要
- ✅ 高速（インデックス検索）
- ✅ Next.js App Routerと相性良い
- ✅ 日本語対応
- ✅ ゼロ設定で動作
- ✅ 記事数が多くてもパフォーマンス良好

**デメリット:**
- ⚠️ ビルド時間が若干増加
- ⚠️ 検索インデックスのサイズ増加
- ⚠️ カスタムUIが必要（shadcn/uiと統合する場合）

**実装コスト:** ⭐⭐⭐ (中)

```bash
# インストール
bun add -D pagefind

# package.json
{
  "scripts": {
    "postbuild": "pagefind --site .next"
  }
}
```

#### Option 3: サーバーサイド検索（URL searchParams）

**メリット:**
- ✅ Next.js公式推奨パターン
- ✅ URLで検索状態を共有可能
- ✅ SEOフレンドリー
- ✅ ブックマーク可能

**デメリット:**
- ⚠️ ページ遷移が発生
- ⚠️ クライアントサイドより若干遅い
- ⚠️ `Cmd+K` のようなモーダル検索には不向き

**実装コスト:** ⭐⭐⭐ (中)

#### Option 4: ハイブリッド（shadcn/ui Command + Pagefind）

**メリット:**
- ✅ UIはshadcn/uiで統一
- ✅ 検索エンジンはPagefindで高速
- ✅ ベストオブボスワールド

**デメリット:**
- ⚠️ 統合の複雑性が増す
- ⚠️ 実装コストが高い

**実装コスト:** ⭐⭐⭐⭐ (高)

---

## 5. データ構造とメタデータ

### 5.1 ブログ記事のフロントマター

```yaml
---
title: メルカリShopsの再出品があまりにもだるすぎたので効率化してみた
slug: relisting-items-mercari-shops-so-tedious
date: 2023-05-02
modified_time: 2023-05-02
description: メルカリShopsの再出品作業を効率化するため、Pythonとseleniumを使った自動化アプリを開発。
icon: 🛍️
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20bags/Flat/shopping_bags_flat.svg
tags:
  - Python
  - Selenium
  - CSV
  - pandas
---
```

### 5.2 BlogPost型定義

```typescript
// src/lib/markdown.ts
export type BlogPost = MarkdownData<{
  thumbnail?: string;   // サムネイル画像URL
  tags?: string[];      // タグ配列
  icon?: string;        // アイコン絵文字
  icon_url?: string;    // FluentUI Emojiアイコン
}>;

// src/types/markdown.ts
export type MarkdownData<T> = {
  metadata: Frontmatter<T>;  // フロントマター
  slug: string;              // 記事slug
  rawContent: string;        // Markdown本文
  filePath: string;          // ファイルパス
};

export type Frontmatter<T = Record<string, never>> = {
  title: string;
  date: string;
  description?: string;
  modified_time?: string;
} & T;
```

### 5.3 検索対象フィールド

**検索可能なデータ:**
- ✅ `title` - タイトル（必須、高優先度）
- ✅ `description` - 説明文（中優先度）
- ✅ `tags` - タグ配列（タグ名での検索）
- ✅ `rawContent` - Markdown本文（全文検索の場合、低優先度）
- ❌ `slug` - 検索対象外推奨
- ❌ `date` - 検索対象外（ソートに使用）

**検索スコアリング（優先度）:**
1. タイトル完全一致: 最高
2. タイトル部分一致: 高
3. タグ一致: 中
4. 説明文一致: 中
5. 本文一致: 低

---

## 6. 実装推奨案

### 6.1 推奨アプローチ: **shadcn/ui Command + クライアントサイドフィルタリング**

**選定理由:**
1. **デザイン統一性** - 既存のshadcn/uiコンポーネントと一貫性
2. **実装コスト** - 最も低い（1-2日で実装可能）
3. **ユーザー体験** - `Cmd+K`ショートカット、モーダル検索
4. **パフォーマンス** - 現在の記事数（~100記事）では十分高速
5. **カスタマイズ性** - 細かいUI調整が容易
6. **メンテナンス性** - シンプルで理解しやすい

**将来的な拡張:**
- 記事数が1000件を超えた場合 → Pagefindへの移行を検討
- 現時点では過剰最適化を避け、シンプルな実装を優先

### 6.2 実装ロードマップ

#### Phase 1: 基本検索UI（shadcn/ui Command導入）

**タスク:**
1. shadcn/ui `command` と `dialog` コンポーネントのインストール
2. `SearchDialog` コンポーネントの作成
3. ヘッダーに検索トリガーボタンを追加
4. キーボードショートカット（`Cmd+K`）の実装

**実装ファイル:**
```
src/components/
└── feature/
    └── search/
        ├── search-dialog.tsx      # CommandDialog使用
        └── search-trigger.tsx     # トリガーボタン
```

**期待される成果物:**
- ヘッダーに「検索」ボタン
- `Cmd+K`でモーダル検索を開く
- リアルタイム検索結果表示
- 検索結果クリックで記事ページへ遷移

#### Phase 2: 検索ロジックの実装

**タスク:**
1. クライアントサイド検索関数の作成
2. タイトル、説明文、タグでのフィルタリング
3. 検索結果のソート（関連度順）
4. 検索結果のハイライト

**実装ファイル:**
```
src/lib/
└── search.ts    # 検索ロジック
```

**検索ロジック例:**
```typescript
// src/lib/search.ts
export function searchBlogPosts(
  posts: BlogPost[],
  query: string
): BlogPost[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return posts;

  return posts
    .filter((post) => {
      const titleMatch = post.metadata.title.toLowerCase().includes(lowerQuery);
      const descMatch = post.metadata.description?.toLowerCase().includes(lowerQuery);
      const tagMatch = post.metadata.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );
      return titleMatch || descMatch || tagMatch;
    })
    .sort((a, b) => {
      // タイトル一致を優先
      const aTitle = a.metadata.title.toLowerCase().includes(lowerQuery);
      const bTitle = b.metadata.title.toLowerCase().includes(lowerQuery);
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });
}
```

#### Phase 3: UX改善

**タスク:**
1. 検索結果のプレビュー表示（アイコン、日付）
2. "検索結果なし"時のメッセージ改善
3. 検索履歴の表示（LocalStorage使用）
4. タグフィルターとの連携

**オプション機能:**
- 最近検索したキーワード
- 人気の検索キーワード
- 検索結果の件数表示

### 6.3 必要なコンポーネント構成

```
src/
├── components/
│   ├── feature/
│   │   └── search/
│   │       ├── search-dialog.tsx          # メイン検索ダイアログ
│   │       ├── search-trigger.tsx         # ヘッダー検索ボタン
│   │       └── search-result-item.tsx     # 検索結果アイテム
│   └── ui/
│       ├── command.tsx                    # shadcn/ui (新規)
│       └── dialog.tsx                     # shadcn/ui (新規)
├── lib/
│   └── search.ts                          # 検索ロジック
└── hooks/
    └── use-search.ts                      # 検索Hook（オプション）
```

### 6.4 設定ファイル

```typescript
// src/constants/index.ts に追加
export const SEARCH_CONSTANTS = {
  /** 検索結果の最大表示数 */
  MAX_RESULTS: 50,
  /** 検索キーワードの最小文字数 */
  MIN_QUERY_LENGTH: 1,
  /** 検索履歴の保存件数 */
  MAX_HISTORY: 5,
  /** キーボードショートカット */
  KEYBOARD_SHORTCUT: {
    key: 'k',
    metaKey: true,  // Cmd(Mac) / Ctrl(Windows)
  },
} as const;
```

### 6.5 既存機能との統合

**シナリオ1: ヘッダーからの検索**
```typescript
// src/components/shared/Header.tsx に追加
import { SearchTrigger } from '@/components/feature/search/search-trigger';

<SearchTrigger />  // Cmd+K表示のボタン
```

**シナリオ2: タグフィルター併用**
- 検索ダイアログ内でタグによる絞り込みも可能
- CommandGroupでタグごとにグループ化

**シナリオ3: モバイル対応**
- モバイルでは全画面表示
- タッチジェスチャー対応

---

## 7. 補足情報

### 7.1 shadcn/ui Command の特徴

**cmdk（Command Menu）:**
- Vercel製の高品質コマンドパレット
- `Cmd+K` UIパターンのデファクトスタンダード
- アクセシビリティ完全対応（ARIA）
- キーボードナビゲーション対応
- フィルタリング機能内蔵

**使用例（有名サイト）:**
- Vercel Dashboard
- GitHub（リポジトリ検索）
- Linear（イシュー検索）
- Raycast（アプリランチャー）

### 7.2 パフォーマンス考慮

**現在の記事数による試算:**
```
記事数: 約100件（2022-2024年分）
平均メタデータサイズ: ~500 bytes/記事
総データサイズ: ~50KB

→ クライアント転送量: 問題なし
→ フィルタリング速度: 瞬時（<10ms）
```

**1000記事になった場合:**
```
総データサイズ: ~500KB
フィルタリング速度: ~50-100ms

→ この時点でPagefind移行を検討
```

### 7.3 SEO考慮事項

**クライアントサイド検索の場合:**
- 検索ダイアログはSEO対象外（問題なし）
- 元の記事ページは変更なしのためSEO影響なし
- 検索結果ページのインデックスは不要

**代替手段（検索結果をSEO対象にする場合）:**
- サーバーサイド検索ページ（`/search?q=...`）を別途用意
- こちらはsearchParamsベースで実装

### 7.4 アクセシビリティ要件

shadcn/ui Commandは以下を標準サポート：
- ✅ キーボード操作（`Cmd+K`、矢印キー、Enter、Esc）
- ✅ スクリーンリーダー対応（ARIA属性）
- ✅ フォーカス管理（自動フォーカストラップ）
- ✅ ダークモード対応

追加で実装が必要：
- 検索結果件数の読み上げ
- 検索中のローディング状態

### 7.5 今後の拡張可能性

**Phase 4以降:**
1. **全文検索** - 本文も検索対象に
2. **ファセット検索** - タグ、日付範囲での絞り込み
3. **検索アナリティクス** - よく検索されるキーワードの分析
4. **AI検索** - 意味検索（セマンティックサーチ）
5. **Pagefind移行** - 記事数増加時のパフォーマンス対策

---

## まとめ

### 現状
- タグフィルタリングとページネーションは実装済み
- テキスト検索機能は未実装
- 検索に関するADRは存在しない
- shadcn/uiのcommand、dialogコンポーネントは未インストール

### 推奨実装
- **shadcn/ui Command + クライアントサイドフィルタリング**
- 理由: シンプル、高速、既存デザインシステムと統一、実装コストが低い
- 将来的にPagefindへの移行パスも確保

### 必要な作業
1. `bunx shadcn@latest add command dialog` でコンポーネント追加
2. SearchDialogコンポーネントの実装
3. 検索ロジック（`src/lib/search.ts`）の実装
4. ヘッダーへの統合
5. ADRの作成（検索機能の設計決定を記録）

### 実装期間見積もり
- Phase 1（基本UI）: 0.5日
- Phase 2（検索ロジック）: 0.5日
- Phase 3（UX改善）: 1日
- **合計: 2日**

このレポートは、今後の開発における要件定義として使用できます。
