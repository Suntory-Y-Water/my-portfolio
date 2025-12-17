# パフォーマンス最適化調査レポート

## 現在の課題

### 1. CSSレンダリングブロック (5,840ms)
- **ファイル**: `/_astro/about.Cslru164.css` (16.2 KiB)
- **対象**: `src/layouts/BaseLayout.astro:2-3`

### 2. 画像最適化の未実装 (411 KiB削減可能)
- **R2画像のサイズ最適化**:
  - `8ac116c….png`: 表示662x224、実寸2502x846 (3.8倍)
  - `f99c28f….png`: 表示662x154、実寸2556x594 (3.9倍)
- **width/height属性の欠落**: Markdown内の画像にwidth/height属性なし
- **対象**: `contents/blog/*.md` の画像要素

### 3. R2画像のキャッシュ未設定 (415 KiB)
- **問題**: R2バケット画像にCache-Control headerなし
- **対象**: `https://pub-151065dba8464e6982571edb9ce95445.r2.dev/` 配下

### 4. 未使用JavaScriptの多さ (100 KiB削減可能)
- **Google Tag Manager**: 53.0 KiB
  - **対象**: `src/layouts/BaseLayout.astro:106-117`
- **Astro Client**: 25.1 KiB
  - **対象**: `src/layouts/BaseLayout.astro:122` (`client:load`使用)
- **React Icons重複**: lucide-react + react-icons併用
  - **対象**: `src/components/shared/Header.tsx:1-4`

---

## 調査結果

### 調査先URL

**Astro公式ドキュメント**:
- https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/styling.mdx (CSSインライン化)
- https://github.com/withastro/docs/blob/main/src/content/docs/en/reference/modules/astro-assets.mdx (画像最適化)
- https://github.com/withastro/docs/blob/main/src/content/docs/en/reference/directives-reference.mdx (Client Directives)
- https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/integrations-guide/partytown.mdx (Partytown)

**rehype/unified**:
- https://github.com/rehypejs/rehype (rehypeプラグイン基礎)
- https://github.com/unifiedjs/unified (unified処理パイプライン)

---

## 改善案

### 🟢 公式ドキュメント推奨

#### 1. CSSインライン化設定

```typescript
// astro.config.ts
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 4096, // 4KB以下のCSSをインライン化
    }
  }
});
```

**ドキュメント**: https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/styling.mdx

---

#### 2. Client Directivesの最適化

```astro
<!-- src/layouts/BaseLayout.astro:122 -->
<!-- Before -->
<Header pathname={pathname} client:load />

<!-- After -->
<Header pathname={pathname} client:idle />
```

**ドキュメント**: https://github.com/withastro/docs/blob/main/src/content/docs/en/reference/directives-reference.mdx

**Client Directives一覧**:
- `client:load`: 最優先UI、ページロード時にハイドレーション
- `client:idle`: 低優先度UI、ブラウザアイドル時にハイドレーション
- `client:visible`: スクロール下部UI、表示時にハイドレーション
- `client:media="(max-width: 50em)"`: メディアクエリ一致時

---

#### 3. Astro Image Componentの`priority`属性

```astro
<!-- src/pages/blog/[slug].astro:125-131 -->
<!-- Before -->
<Image
  src={displayUrl}
  alt={`Icon for ${post.metadata.title}`}
  width={80}
  height={80}
  loading='eager'
/>

<!-- After -->
<Image
  src={displayUrl}
  alt={`Icon for ${post.metadata.title}`}
  width={80}
  height={80}
  priority
/>
```

**効果**: 自動で`loading="eager"`, `decoding="sync"`, `fetchpriority="high"`を設定

**ドキュメント**: https://github.com/withastro/docs/blob/main/src/content/docs/en/reference/modules/astro-assets.mdx

---

#### 4. Google AnalyticsのPartytown化

```bash
bun add @astrojs/partytown
```

```typescript
// astro.config.ts
import partytown from '@astrojs/partytown';

export default defineConfig({
  integrations: [
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
```

```astro
<!-- src/layouts/BaseLayout.astro:106-117 -->
<!-- Before -->
<script is:inline async src='https://www.googletagmanager.com/gtag/js?id=G-VJECTY2TM6'></script>

<!-- After -->
<script type="text/partytown" async src='https://www.googletagmanager.com/gtag/js?id=G-VJECTY2TM6'></script>
```

**効果**: サードパーティスクリプトをWeb Workerで実行、メインスレッド負荷軽減

**ドキュメント**: https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/integrations-guide/partytown.mdx

---

### 🔴 独自提案（公式推奨外）

#### 1. 画像width/height属性の自動付与 (rehypeプラグイン)

```typescript
// src/lib/rehype-image-size.ts
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import sizeOf from 'image-size';
import { promisify } from 'node:util';

const sizeOfAsync = promisify(sizeOf);

async function getRemoteImageSize(url: string): Promise<{ width: number; height: number } | null> {
  // リモート画像サイズ取得処理
}

export function rehypeImageSize() {
  return async (tree: Root) => {
    const transformations: Array<{ node: Element; url: string }> = [];

    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties?.src) {
        const src = node.properties.src as string;
        if (!node.properties.width || !node.properties.height) {
          transformations.push({ node, url: src });
        }
      }
    });

    await Promise.all(
      transformations.map(async ({ node, url }) => {
        if (url.startsWith('http')) {
          const size = await getRemoteImageSize(url);
          if (size) {
            node.properties = node.properties || {};
            node.properties.width = size.width;
            node.properties.height = size.height;
          }
        }
      })
    );
  };
}
```

**統合**:
```typescript
// src/components/feature/content/custom-markdown.ts
.use(rehypeLinkCard)
.use(rehypeMermaid)
.use(rehypeImageSize) // 追加
```

**参考**:
- https://github.com/rehypejs/rehype
- https://github.com/unifiedjs/unified

**注意**: Astro公式はMarkdown内画像に`<Image>`コンポーネント使用を推奨。rehypeプラグインによる属性付与は非公式手法。

---

#### 3. アイコンライブラリの統一

```tsx
// src/components/shared/Header.tsx:1-4
// Before
import { Search } from 'lucide-react';
import { IoMdPerson } from 'react-icons/io';
import { MdOutlineBook } from 'react-icons/md';

// After
import { Search, User, Book } from 'lucide-react';
```

**効果**: バンドルサイズ削減 (約5-10 KiB)

**注意**: 一般的なベストプラクティスだが、Astro公式の推奨事項ではない。