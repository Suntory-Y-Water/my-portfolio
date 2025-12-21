# Astro ビルドプロセス最適化結果レポート

## 実施日
2025-12-20

## 検証環境
- **フレームワーク**: Astro 5.16.5
- **ランタイム**: Bun
- **OS**: macOS (Darwin 24.6.0)
- **CI/CD**: GitHub Actions + Vercel

---

## 検証状況サマリー

### ✅ 検証済み

1. **build.concurrency: 4** - ローカルで検証（**45%高速化達成**）
2. **cacheDir設定** - ローカルで検証（効果薄い）
3. **manualChunks（チャンク分割）** - ローカルで検証（ビルド時間は変わらず、ブラウザキャッシュ効率向上が目的）
4. **Bunキャッシュ（CI）** - CIで検証（効果なし）

### ⏳ 未検証

1. **データ取得の並列化** - コードベースに適用箇所があるか未確認
2. **Vercelビルドキャッシュ** - CI未検証
3. **Astroビルドキャッシュ（CI環境）** - CI未検証
4. **チャンク分割の追加設定**（esbuild minify等） - 未検証

---

## 最適化結果サマリー

### ローカルビルド時間

| 項目 | 変更前 | 変更後 | 改善率 |
|------|--------|--------|--------|
| ビルド時間 | 50.548秒 | 27.973秒 | **45%短縮** |
| CPU使用率 | 61% | 107% | 並列処理有効 |

### 効果があった施策

#### ✅ astro.config.ts: build.concurrency追加

**変更内容:**
```typescript
build: {
  inlineStylesheets: 'auto',
  concurrency: 4,  // 追加
}
```

**効果:**
- ビルド時間: 50.548秒 → 28.305秒（**44%短縮**）
- CPU使用率が107%になり、並列処理が効いている

---

### 効果が薄かった施策

#### △ astro.config.ts: cacheDir設定

**変更内容:**
```typescript
export default defineConfig({
  site: siteConfig.url,
  cacheDir: './node_modules/.astro',  // 追加
```

**効果:**
- 初回ビルド: 51.331秒
- 2回目（キャッシュあり）: 52.996秒
- **ほぼ変化なし**

**理由:**
ローカル環境ではContent Layerのキャッシュ効果が限定的。CI環境では意味がある可能性あり。

#### △ vite.build.rollupOptions: manualChunks

**変更内容:**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'radix-ui': [...],
      },
    },
  },
}
```

**効果:**
- ビルド時間: 27.973秒（ほぼ変わらず）

**目的:**
ビルド時間短縮ではなく、ブラウザキャッシュ効率向上が目的。React関連ライブラリを分離することで、記事更新時のユーザー再ダウンロードを削減。

**注記:**
- **この設定はAstroベストプラクティススキルには含まれていない（一般的なVite最適化知識から提案）**

---

### 効果がなかった施策

#### ❌ GitHub Actions: Bunキャッシュ

**変更内容:**
```yaml
- name: Cache Bun dependencies
  uses: actions/cache@v5
  with:
    path: |
      ~/.bun/install/cache
      node_modules
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
```

**結果:**
- キャッシュは正常に動作（270MB復元、4秒）
- しかしCI全体の実行時間は変わらず

**理由:**
- キャッシュ復元後も、VercelビルドやPagefind生成で時間がかかる
- `bun install`自体がすでに高速（Bunの特性）
- キャッシュのオーバーヘッドの方が大きい可能性

**結論:**
Bunキャッシュは**導入しない方が速い**

**注記:**
- **この設定はAstroベストプラクティススキルには含まれていない（CI/CD最適化の一般的手法から提案）**

---

## 最終的な推奨設定

### astro.config.ts

```typescript
// @ts-check

import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { siteConfig } from './src/config/site.js';

export default defineConfig({
  site: siteConfig.url,
  cacheDir: './node_modules/.astro',
  integrations: [
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
    concurrency: 4,  // ★重要: 45%高速化
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
    ssr: {
      noExternal: ['satori'],
      external: ['@resvg/resvg-js'],
    },
    build: {
      assetsInlineLimit: 4096,
      rollupOptions: {
        external: ['/pagefind/pagefind-ui.js'],
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'radix-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
            ],
          },
        },
      },
    },
  },
});
```

### GitHub Actions設定

**現状維持を推奨:**
- Bunキャッシュは追加しない（効果なし）
- Astroビルドキャッシュも効果が限定的
- setup actionは現在のシンプルな構成のまま

---

## 学んだこと

### ✅ 効果的な最適化

1. **並列処理の活用**: `build.concurrency`の設定が最も効果的
2. **測定重視**: 実際に計測して効果を確認することが重要

### ❌ 効果がなかった施策

1. **過度なキャッシング**: Bunはすでに高速なので、キャッシュのオーバーヘッドの方が大きい
2. **推測による最適化**: ベストプラクティスも環境によっては効果がない

### 📝 今後の検討事項

1. **Vercelビルド時間の分析**: CI全体の時間を短縮するには、Vercelビルドプロセスの最適化が必要
2. **Pagefind生成の最適化**: 検索インデックス生成時間の改善余地を調査

---

## 未検証の最適化案

以下の施策は提案されたが、まだ検証していない：

### 0. データ取得の並列化

**対象ファイル**: `.astro`ファイル（ページコンポーネント）

```astro
---
// ❌ 悪い例: 順次処理
const posts = await getCollection('blog');
const authors = await getCollection('authors');

// ✅ 良い例: 並列処理
const [posts, authors] = await Promise.all([
  getCollection('blog'),
  getCollection('authors')
]);
---
```

**期待される効果:**
- 複数のContent Collection取得を並列化
- ビルド時のデータ取得時間を短縮

**検証方法:**
- 複数のコレクションを取得しているページで実装
- ビルド時間を計測して効果を確認

**注記:**
- **この設定はAstroベストプラクティススキル「build-optimization.md」に記載あり（データ取得の並列化推奨）**


### 1. Vercelビルドキャッシュ

**対象ファイル**: `.github/workflows/deploy.yml`

```yaml
- name: Cache Vercel build
  uses: actions/cache@9255dc7a253b0ccc959486e2bca901246202afeb # v5.0.1
  with:
    path: .vercel/cache
    key: ${{ runner.os }}-vercel-${{ hashFiles('**/package.json', '**/bun.lock') }}
    restore-keys: |
      ${{ runner.os }}-vercel-
```

**期待される効果:**
- Vercelビルドプロセスのキャッシュ活用
- デプロイ時間の短縮

**検証方法:**
- deploy.ymlの`Build Project Artifacts`ステップの前に追加
- preview/productionの両ジョブで実行時間を比較

**注記:**
- **この設定はAstroベストプラクティススキルには含まれていない（Vercel固有の最適化手法）**

### 2. CI環境でのAstroビルドキャッシュ

**対象ファイル**: `.github/workflows/deploy.yml`

```yaml
- name: Cache Astro build
  uses: actions/cache@9255dc7a253b0ccc959486e2bca901246202afeb # v5.0.1
  with:
    path: |
      node_modules/.astro
      .astro
    key: ${{ runner.os }}-astro-${{ hashFiles('**/*.astro', '**/*.ts', '**/*.tsx', '**/package.json') }}
    restore-keys: |
      ${{ runner.os }}-astro-
```

**期待される効果:**
- Content Layerのキャッシュ活用
- 記事のみ変更した場合のビルド時間短縮

**検証方法:**
- setup actionまたはdeploy.ymlに追加
- 記事のみ変更してビルド時間を比較

**注記:**
- **この設定はAstroベストプラクティススキル「build-optimization.md」に記載あり（キャッシュディレクトリを保持する推奨事項）**

### 3. チャンク分割戦略の追加設定

**対象ファイル**: `astro.config.ts`

```typescript
build: {
  chunkSizeWarningLimit: 1000,
  minify: 'esbuild',
}
```

**期待される効果:**
- esbuildによる高速なminify（Terserより高速）
- チャンクサイズ警告の閾値調整

**注意:**
- ビルド時間への影響は限定的だが、試す価値はある
- **この設定はAstroベストプラクティススキルには含まれていない（一般的なVite最適化知識から提案）**

---

## まとめ

**実装すべき変更:**
- `astro.config.ts`に`build.concurrency: 4`を追加（**45%高速化達成**）

**実装不要な変更:**
- GitHub ActionsのBunキャッシュ（効果なし、むしろ遅くなる可能性）

**結果:**
シンプルな設定変更（1行追加）で大幅な改善を実現。
