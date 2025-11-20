# ブログ記事検索機能 実装レポート

**日付**: 2025-11-19
**関連Issue**: #248
**実装方針**: Option 1 - Pagefind + shadcn/ui Command

---

## 📋 目次

1. [やったこと](#やったこと)
2. [現状の問題](#現状の問題)
3. [試したこと](#試したこと)
4. [技術的な詳細](#技術的な詳細)
5. [次のステップ](#次のステップ)

---

## やったこと

### 1. 依存関係のインストール

#### Pagefind (v1.4.0)
```bash
bun add -D pagefind
```
- 静的サイト専用の検索エンジン
- ビルド時に検索インデックスを自動生成

#### shadcn/ui コンポーネント
```bash
bunx shadcn@latest add command dialog
```
- `command` - コマンドパレットUI (cmdk)
- `dialog` - モーダルダイアログ

**インストールされたファイル**:
- `src/components/ui/command.tsx`
- `src/components/ui/dialog.tsx`

---

### 2. ビルド設定

#### package.json
```json
{
  "scripts": {
    "build": "bun run --bun next build",
    "postbuild": "pagefind --site .next && cp -r .next/pagefind public/"
  }
}
```

**処理フロー**:
1. `bun run build` → Next.jsビルド実行
2. `postbuild` → Pagefindがインデックス生成
3. `.next/pagefind` → `public/pagefind` にコピー

#### .gitignore
```
# pagefind search index
/public/pagefind
```

---

### 3. 型定義の作成

#### src/types/pagefind.d.ts
```typescript
export type PagefindSearchResult = {
  url: string;
  excerpt: string;
  meta: {
    title: string;
  };
};

export type PagefindSearchResultItem = {
  data: () => Promise<PagefindSearchResult>;
};

export type PagefindSearchResponse = {
  results: PagefindSearchResultItem[];
};

export type PagefindModule = {
  search: (query: string) => Promise<PagefindSearchResponse>;
};

declare module '/pagefind/pagefind.js' {
  const pagefind: PagefindModule;
  export = pagefind;
}
```

**理由**: Pagefindはビルド後に生成されるため、開発時の型定義が必要。

---

### 4. 定数の追加

#### src/constants/index.ts
```typescript
export const SEARCH_CONSTANTS = {
  /** 検索結果の最大表示数 */
  MAX_RESULTS: 50,
  /** キーボードショートカット */
  KEYBOARD_SHORTCUT: {
    key: 'k',
    metaKey: true, // Cmd(Mac) / Ctrl(Windows)
  },
} as const;
```

---

### 5. コンポーネントの実装

#### SearchDialog (`src/components/feature/search/search-dialog.tsx`)

**主な機能**:
- Pagefindを使った動的検索
- Cmd+K / Ctrl+K でダイアログを開く
- 検索結果のリアルタイム表示
- 検索結果クリックでページ遷移

**重要なコード**:
```typescript
const handleSearch = async (value: string) => {
  setQuery(value);

  if (!value) {
    setResults([]);
    return;
  }

  setIsSearching(true);

  try {
    // @ts-expect-error
    const pagefind: PagefindModule = await import('/pagefind/pagefind.js');
    const search = await pagefind.search(value);

    const data = await Promise.all(
      search.results
        .slice(0, SEARCH_CONSTANTS.MAX_RESULTS)
        .map((r: PagefindSearchResultItem) => r.data()),
    );

    setResults(data);
  } catch (error) {
    console.error('Search error:', error);
    setResults([]);
  } finally {
    setIsSearching(false);
  }
};
```

#### SearchTrigger (`src/components/feature/search/search-trigger.tsx`)

**主な機能**:
- ヘッダーに配置する検索ボタン
- レスポンシブ対応（デスクトップ/モバイル）
- キーボードショートカット（⌘K）を表示

---

### 6. Header への統合

#### src/components/shared/Header.tsx
```typescript
export default function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header>
      {/* ... 既存のナビゲーション ... */}

      <div className='flex items-center gap-2'>
        <SearchTrigger onClick={() => setSearchOpen(true)} />
        <ModeToggle />
        {/* ... */}
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
```

---

## 現状の問題

### 🔴 検索結果が0件

**症状**:
- 検索ダイアログは開く
- 検索クエリを入力できる
- しかし、検索結果が常に0件

**確認済み事項**:
- ✅ `public/pagefind/pagefind.js` は存在 (33.8KB)
- ✅ Pagefindインデックスは正常に生成 (220ページ、10,089単語)
- ✅ ビルドは成功
- ✅ 型チェックは合格
- ✅ Lintチェックは合格

**推測される原因**:
1. ❓ `/pagefind/pagefind.js` のimport文がブラウザで失敗している可能性
2. ❓ Pagefindモジュールの初期化に問題がある可能性
3. ❓ Next.jsの静的ファイル配信設定に問題がある可能性

---

## 試したこと

### ✅ 試したこと 1: postbuildスクリプトの修正

**Before**:
```json
"postbuild": "pagefind --site .next"
```

**After**:
```json
"postbuild": "pagefind --site .next && cp -r .next/pagefind public/"
```

**結果**: ファイルは `public/pagefind/` に正しくコピーされた

---

### ✅ 試したこと 2: .gitignore の設定

```
/public/pagefind
```

**結果**: ビルド生成物が Git に含まれないようになった

---

### ❌ 試していないこと

#### 1. 相対パスでのimport（提案されたが未実施）
```typescript
// 提案されたコード（未実施）
const pagefind = await import('../../../../.next/pagefind/pagefind.js');
```

**未実施の理由**:
- 本番環境で動作しない可能性が高い
- `.next` ディレクトリは本番デプロイ時に存在しない

#### 2. ブラウザコンソールでのエラー確認
- **TODO**: `bun run start` で起動してブラウザで動作確認
- **TODO**: DevToolsのコンソールでエラーメッセージを確認

#### 3. Pagefindの初期化確認
- **TODO**: `console.log` でPagefindモジュールが正しくロードされているか確認

---

## 技術的な詳細

### Pagefind のビルド出力

```
Running Pagefind v1.4.0 (Extended)
Running from: "/home/user/my-portfolio"
Source:       ".next"
Output:       ".next/pagefind"

[Building search indexes]
Total:
  Indexed 1 language
  Indexed 220 pages
  Indexed 10089 words
  Indexed 0 filters
  Indexed 0 sorts

Finished in 4.428 seconds
```

### 生成されたファイル

```bash
public/pagefind/
├── fragment/        # 検索フラグメント（12KB）
├── index/           # 検索インデックス（4KB）
├── pagefind.js      # メインJSファイル (33.8KB)
├── pagefind.ja_*.pf_meta
├── pagefind-ui.js   # UI用JS（使用していない）
├── pagefind-ui.css  # UI用CSS（使用していない）
└── wasm.unknown.pagefind  # WASM バイナリ (52.4KB)
```

### Next.js の静的ファイル配信

Next.jsでは、`public/` ディレクトリ内のファイルは `/` からアクセス可能：
- `public/pagefind/pagefind.js` → `/pagefind/pagefind.js`

**確認方法**:
```bash
# サーバー起動
bun run start

# ブラウザで確認
http://localhost:3000/pagefind/pagefind.js
```

---

## 次のステップ

### 🔍 デバッグ手順

#### Step 1: ローカルサーバーで動作確認
```bash
bun run build
bun run start
```

**確認事項**:
1. `http://localhost:3000/pagefind/pagefind.js` にアクセスできるか
2. ブラウザのDevToolsでエラーが出ていないか
3. 検索ダイアログを開いて、Networkタブで `pagefind.js` がロードされているか

#### Step 2: コンソールログの追加

`src/components/feature/search/search-dialog.tsx` の `handleSearch` 関数にログ追加:

```typescript
const handleSearch = async (value: string) => {
  setQuery(value);
  console.log('🔍 Search query:', value);

  if (!value) {
    setResults([]);
    return;
  }

  setIsSearching(true);

  try {
    console.log('📦 Importing pagefind...');
    const pagefind: PagefindModule = await import('/pagefind/pagefind.js');
    console.log('✅ Pagefind loaded:', pagefind);

    console.log('🔎 Searching...');
    const search = await pagefind.search(value);
    console.log('✅ Search results:', search);

    const data = await Promise.all(
      search.results
        .slice(0, SEARCH_CONSTANTS.MAX_RESULTS)
        .map((r: PagefindSearchResultItem) => r.data()),
    );

    console.log('📄 Parsed data:', data);
    setResults(data);
  } catch (error) {
    console.error('❌ Search error:', error);
    setResults([]);
  } finally {
    setIsSearching(false);
  }
};
```

#### Step 3: 参考記事の実装と比較

参考記事: https://azukiazusa.dev/blog/static-site-search-engine-and-ui-library-pagefind/

**相違点をチェック**:
- import文の書き方
- Pagefindの初期化方法
- 検索結果の処理方法

---

## 参考資料

### 公式ドキュメント
- [Pagefind 公式サイト](https://pagefind.app/)
- [Pagefind - GitHub](https://github.com/CloudCannon/pagefind)
- [shadcn/ui Command](https://ui.shadcn.com/docs/components/command)

### 参考実装
- [azukiazusa - Pagefindの実装例](https://azukiazusa.dev/blog/static-site-search-engine-and-ui-library-pagefind/)
- [sapper-blog-app](https://github.com/azukiazusa1/sapper-blog-app) - 実際の実装例

---

## コミット履歴

1. **fbdf4ed** - `feat: Pagefind + shadcn/ui Commandでブログ記事検索機能を実装`
   - Pagefindのインストール
   - SearchDialog、SearchTriggerの実装
   - Headerへの統合

2. **a776846** - `fix: pagefindインデックスをpublicディレクトリにコピーするよう修正`
   - postbuildスクリプトの修正
   - .gitignoreの更新

---

## まとめ

### 実装完了
- ✅ Pagefindのセットアップ
- ✅ shadcn/ui Commandの統合
- ✅ 検索UIの実装
- ✅ Headerへの統合
- ✅ 型定義の作成
- ✅ ビルド設定

### 未解決の問題
- ❌ 検索結果が0件（検索が動作していない）

### 必要なアクション
1. ローカル環境で動作確認
2. ブラウザのDevToolsでエラー確認
3. コンソールログでデバッグ
4. 参考記事と実装を比較
5. 問題を特定して修正

---

**更新日**: 2025-11-19
**作成者**: Claude Code
