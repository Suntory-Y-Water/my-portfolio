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
- 日本語対応、あいまい検索、ハイライト機能内蔵

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

### 4.1 検索実装の3つのアプローチ

#### Option 1: Pagefind + shadcn/ui Command ⭐**推奨**

**メリット:**
- ✅ **検索エンジン**: Pagefind（高機能、自作不要）
- ✅ **UI**: shadcn/ui（既存デザインと統一）
- ✅ 高速検索（インデックス検索）
- ✅ 日本語対応、あいまい検索、ハイライト
- ✅ `Cmd+K` ショートカット対応
- ✅ アクセシビリティ対応
- ✅ スケーラブル（記事数増加に強い）
- ✅ 実績あり（参考プロジェクト使用）

**デメリット:**
- ⚠️ ビルド時間が若干増加（5-10秒）
- ⚠️ 検索インデックスのサイズ増加（~50KB/100記事）
- ⚠️ 動的import必要（ビルド後に生成されるため）

**実装コスト:** ⭐⭐⭐ (中)

**必要なライブラリ:**
```bash
bun add -D pagefind
bunx shadcn@latest add command dialog
```

**実装例:**
```typescript
// src/components/feature/search/search-dialog.tsx
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])

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

  // Pagefindで検索（動的import）
  const handleSearch = async (value: string) => {
    setQuery(value)

    if (!value) {
      setResults([])
      return
    }

    // ビルド後に生成されるファイルを動的に読み込む
    const pagefind = await import('/pagefind/pagefind.js')
    const search = await pagefind.search(value)

    // 検索結果のデータを取得
    const data = await Promise.all(
      search.results.map((r: any) => r.data())
    )

    setResults(data)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="記事を検索..."
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        <CommandEmpty>記事が見つかりませんでした</CommandEmpty>
        <CommandGroup heading="検索結果">
          {results.map((result) => (
            <CommandItem
              key={result.url}
              onSelect={() => {
                router.push(result.url)
                setOpen(false)
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">{result.meta.title}</span>
                <span className="text-sm text-muted-foreground">
                  {result.excerpt}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

#### Option 2: Pagefind Default UI

**メリット:**
- ✅ 最も簡単（設定ほぼゼロ）
- ✅ 検索エンジン込みのUI提供
- ✅ 参考プロジェクトと同じ実装

**デメリット:**
- ❌ デザインのカスタマイズが困難
- ❌ shadcn/uiと統一できない
- ❌ `Cmd+K` のカスタマイズが制限される

**実装コスト:** ⭐ (最低)

```typescript
import "@pagefind/default-ui/css/ui.css"

useEffect(() => {
  new PagefindUI({
    element: "#search",
    showSubResults: true
  })
}, [])
```

#### Option 3: サーバーサイド検索（URL searchParams）

**メリット:**
- ✅ Next.js公式推奨パターン
- ✅ URLで検索状態を共有可能
- ✅ SEOフレンドリー

**デメリット:**
- ❌ **検索ロジックを自作する必要がある**
- ❌ 高度な検索機能（あいまい検索等）の実装が困難
- ❌ ページ遷移が発生
- ❌ `Cmd+K` のようなモーダル検索には不向き

**実装コスト:** ⭐⭐⭐⭐ (高) - 非推奨

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

### 5.3 Pagefindの検索対象

**Pagefindが自動的に検索対象にする要素:**
- ✅ `<h1>` - タイトル（最高優先度）
- ✅ `<meta name="description">` - 説明文
- ✅ 本文テキスト
- ✅ カスタムメタデータ（`data-pagefind-meta`属性）

**検索スコアリング（Pagefindが自動処理）:**
1. タイトル一致: 最高
2. メタデータ一致: 高
3. 本文一致: 中
4. あいまい一致: 低

**→ 検索ロジックの実装は不要！**

---

## 6. 実装推奨案

### 6.1 推奨アプローチ: **Pagefind + shadcn/ui Command**

**選定理由:**
1. **検索ロジック不要** - Pagefindが全て処理（自作不要）
2. **デザイン統一** - shadcn/uiで既存コンポーネントと一貫性
3. **高機能** - あいまい検索、ハイライト、日本語対応
4. **高速** - インデックス検索で即座に結果
5. **実績** - 参考プロジェクトで使用中
6. **スケーラブル** - 記事数が増えても問題なし
7. **ユーザー体験** - `Cmd+K`ショートカット、モーダル検索

### 6.2 実装ロードマップ

#### Phase 1: Pagefindのセットアップ

**タスク:**
1. Pagefindのインストール
2. `postbuild`スクリプトの設定
3. ビルドテスト

**実装:**
```bash
# インストール
bun add -D pagefind

# package.json に追加
{
  "scripts": {
    "postbuild": "pagefind --site .next"
  }
}

# ビルドテスト
bun run build
```

**確認事項:**
- `.next/pagefind/` ディレクトリが生成される
- `pagefind.js` が存在する

#### Phase 2: shadcn/ui Commandコンポーネントの追加

**タスク:**
1. `command`と`dialog`コンポーネントのインストール
2. `SearchDialog` コンポーネントの作成
3. `SearchTrigger` ボタンの作成

**実装:**
```bash
bunx shadcn@latest add command dialog
```

**実装ファイル:**
```
src/components/
└── feature/
    └── search/
        ├── search-dialog.tsx      # CommandDialog使用
        ├── search-trigger.tsx     # トリガーボタン
        └── search-result-item.tsx # 検索結果アイテム
```

#### Phase 3: Pagefindとshadcn/ui Commandの統合

**タスク:**
1. 動的importでPagefindを読み込み
2. 検索結果をCommandItemで表示
3. キーボードショートカット（`Cmd+K`）の実装
4. 検索結果クリックで記事ページへ遷移

**実装例:**
```typescript
// src/components/feature/search/search-dialog.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export function SearchDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  // Cmd+K ショートカット
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Pagefind検索
  const handleSearch = async (value: string) => {
    setQuery(value)

    if (!value) {
      setResults([])
      return
    }

    try {
      // 動的import（ビルド後に生成されるファイル）
      const pagefind = await import(
        /* @vite-ignore */
        '/pagefind/pagefind.js'
      )
      const search = await pagefind.search(value)

      // 検索結果のメタデータを取得
      const data = await Promise.all(
        search.results.map((r: any) => r.data())
      )

      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="記事を検索..."
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        <CommandEmpty>記事が見つかりませんでした</CommandEmpty>
        <CommandGroup heading={`検索結果 (${results.length}件)`}>
          {results.map((result) => (
            <CommandItem
              key={result.url}
              value={result.url}
              onSelect={() => {
                router.push(result.url)
                setOpen(false)
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{result.meta.title}</span>
                {result.excerpt && (
                  <span
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

```typescript
// src/components/feature/search/search-trigger.tsx
'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SearchTrigger() {
  return (
    <Button
      variant="outline"
      className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
    >
      <Search className="h-4 w-4 xl:mr-2" />
      <span className="hidden xl:inline-flex">記事を検索...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
```

#### Phase 4: ヘッダーへの統合

**タスク:**
1. `Header.tsx` に `SearchTrigger` を追加
2. レスポンシブ対応

**実装:**
```typescript
// src/components/shared/Header.tsx に追加
import { SearchTrigger } from '@/components/feature/search/search-trigger'
import { SearchDialog } from '@/components/feature/search/search-dialog'

export function Header() {
  return (
    <header>
      {/* 既存のヘッダー要素 */}

      <SearchTrigger />
      <SearchDialog />
    </header>
  )
}
```

#### Phase 5: UX改善（オプション）

**タスク:**
1. 検索結果のアイコン表示
2. タグ表示
3. 日付表示
4. 検索履歴（LocalStorage）

### 6.3 必要なコンポーネント構成

```
src/
├── components/
│   ├── feature/
│   │   └── search/
│   │       ├── search-dialog.tsx          # メイン検索ダイアログ
│   │       ├── search-trigger.tsx         # ヘッダー検索ボタン
│   │       └── search-result-item.tsx     # 検索結果アイテム（オプション）
│   └── ui/
│       ├── command.tsx                    # shadcn/ui (新規)
│       └── dialog.tsx                     # shadcn/ui (新規)
└── lib/
    └── search.ts                          # 検索関連ユーティリティ（オプション）
```

### 6.4 設定ファイル

```typescript
// src/constants/index.ts に追加
export const SEARCH_CONSTANTS = {
  /** 検索結果の最大表示数 */
  MAX_RESULTS: 50,
  /** キーボードショートカット */
  KEYBOARD_SHORTCUT: {
    key: 'k',
    metaKey: true,  // Cmd(Mac) / Ctrl(Windows)
  },
} as const;
```

```json
// package.json
{
  "scripts": {
    "dev": "bun run --bun next dev",
    "build": "bun run --bun next build",
    "postbuild": "pagefind --site .next",
    "start": "next start"
  }
}
```

### 6.5 Pagefindの設定（オプション）

```yaml
# pagefind.yml（プロジェクトルート）
source: .next
bundle_dir: pagefind
exclude_selectors:
  - "nav"
  - "footer"
  - "[data-pagefind-ignore]"
```

---

## 7. 補足情報

### 7.1 Pagefindの特徴

**なぜPagefindを使うべきか:**
1. **検索ロジックを自作する必要がない** - 全て組み込み
2. **高機能** - あいまい検索、ハイライト、ストップワード、日本語対応
3. **高速** - インデックス検索で瞬時に結果
4. **軽量** - 検索インデックスは圧縮済み
5. **スケーラブル** - 数千ページでも高速

**公式サイト:** https://pagefind.app/

### 7.2 動的importが必要な理由

```typescript
// ❌ 通常のimportはできない
import pagefind from '/pagefind/pagefind.js'  // エラー！

// ✅ 動的importが必要
const pagefind = await import('/pagefind/pagefind.js')
```

**理由:**
1. `pagefind.js` はビルド後に生成される（`postbuild`）
2. 開発時（`bun dev`）には存在しない
3. TypeScript型定義がない

### 7.3 shadcn/ui Command の特徴

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

### 7.4 パフォーマンス考慮

**現在の記事数による試算:**
```
記事数: 約100件（2022-2024年分）
検索インデックスサイズ: ~50KB（圧縮済み）
検索速度: <50ms

→ パフォーマンス問題なし
```

**1000記事になった場合:**
```
検索インデックスサイズ: ~500KB
検索速度: ~100ms

→ 依然として高速
```

### 7.5 SEO考慮事項

**Pagefind検索の場合:**
- 検索ダイアログはSEO対象外（問題なし）
- 元の記事ページは変更なしのためSEO影響なし
- 検索結果ページのインデックスは不要

### 7.6 アクセシビリティ要件

**shadcn/ui Command標準サポート:**
- ✅ キーボード操作（`Cmd+K`、矢印キー、Enter、Esc）
- ✅ スクリーンリーダー対応（ARIA属性）
- ✅ フォーカス管理（自動フォーカストラップ）
- ✅ ダークモード対応

**Pagefind標準サポート:**
- ✅ 検索結果のハイライト
- ✅ 抜粋（excerpt）の自動生成
- ✅ 複数言語対応

### 7.7 今後の拡張可能性

**Phase 6以降:**
1. **フィルター機能** - タグ、日付範囲での絞り込み
2. **ソート機能** - 関連度、日付、タイトル順
3. **検索アナリティクス** - よく検索されるキーワードの分析
4. **カスタムフィルター** - Pagefindのfilter機能使用

---

## まとめ

### 現状
- タグフィルタリングとページネーションは実装済み
- テキスト検索機能は未実装
- 検索に関するADRは存在しない
- shadcn/uiのcommand、dialogコンポーネントは未インストール

### 推奨実装
- **Pagefind（検索エンジン）+ shadcn/ui Command（UI）**
- 理由: 検索ロジック不要、高機能、高速、既存デザインシステムと統一

### Pagefindを選ぶ理由
- ✅ **検索ロジックを自作する必要がない** - これが最大の理由
- ✅ あいまい検索、ハイライト、日本語対応が標準装備
- ✅ 参考プロジェクトで実績あり
- ✅ スケーラブル（記事数増加に強い）

### 必要な作業
1. `bun add -D pagefind` でPagefindインストール
2. `bunx shadcn@latest add command dialog` でUIコンポーネント追加
3. `postbuild`スクリプトの設定
4. SearchDialogコンポーネントの実装（Pagefind動的import）
5. ヘッダーへの統合
6. ADRの作成（検索機能の設計決定を記録）

### 実装期間見積もり
- Phase 1（Pagefindセットアップ）: 0.5日
- Phase 2（shadcn/ui追加）: 0.5日
- Phase 3（統合）: 1日
- Phase 4（ヘッダー統合）: 0.5日
- **合計: 2.5日**

このレポートは、今後の開発における要件定義として使用できます。
