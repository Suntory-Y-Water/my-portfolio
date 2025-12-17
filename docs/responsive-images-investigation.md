# レスポンシブ画像最適化の調査レポート

## 現在の課題

### 画像配信の非効率性

**問題点**:
- Markdown内の画像が通常の`<img>`タグとして出力される
- すべてのデバイスで同じサイズの画像を配信
- モバイルでも2000px幅の画像をダウンロード → データ転送量の無駄

**影響**:
- PageSpeed Insights: 「画像配信を改善する (411 KiB削減可能)」
- 具体例:
  - `8ac116c….png`: 表示662x224、実寸2502x846 (3.8倍)
  - `f99c28f….png`: 表示662x154、実寸2556x594 (3.9倍)

**現在の実装**:
```markdown
<!-- Markdownソース -->
![説明](https://suntory-n-water.com/images/example.png)

<!-- 出力されるHTML -->
<img src="https://suntory-n-water.com/images/example.png" alt="説明">
```

---

## やりたいこと

### レスポンシブ画像の自動最適化

**目標**: Markdown内の画像を、デバイスサイズに応じた最適なサイズで配信

**理想の出力**:
```html
<img
  src="/cdn-cgi/image/width=800,format=auto/https://suntory-n-water.com/images/example.png"
  srcset="
    /cdn-cgi/image/width=640,format=auto/https://suntory-n-water.com/images/example.png 640w,
    /cdn-cgi/image/width=750,format=auto/https://suntory-n-water.com/images/example.png 750w,
    /cdn-cgi/image/width=800,format=auto/https://suntory-n-water.com/images/example.png 800w,
    /cdn-cgi/image/width=828,format=auto/https://suntory-n-water.com/images/example.png 828w,
    /cdn-cgi/image/width=1080,format=auto/https://suntory-n-water.com/images/example.png 1080w,
    /cdn-cgi/image/width=1280,format=auto/https://suntory-n-water.com/images/example.png 1280w,
    /cdn-cgi/image/width=1600,format=auto/https://suntory-n-water.com/images/example.png 1600w
  "
  sizes="(min-width: 800px) 800px, 100vw"
  alt="説明"
>
```

**効果**:
- モバイル: 640px幅の画像を配信 (データ転送量削減)
- タブレット: 828px幅の画像を配信
- デスクトップ: 1280px幅の画像を配信
- Retina: 1600px幅の画像を配信
- 自動でAVIF/WebPフォーマットに変換 (`format=auto`)

---

## 公式のベストプラクティス

### Astro公式推奨: `layout="constrained"`

**参考**: [Astro Images - Responsive Images](https://docs.astro.build/en/guides/images/)

**実装例**:
```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/my_image.png';
---
<Image
  src={myImage}
  alt="説明"
  layout='constrained'
  width={800}
  height={600}
/>
```

**自動生成される出力**:
```html
<img
  src="/_astro/my_image.hash3.webp"
  srcset="/_astro/my_image.hash1.webp 640w,
          /_astro/my_image.hash2.webp 750w,
          /_astro/my_image.hash3.webp 800w,
          /_astro/my_image.hash4.webp 828w,
          /_astro/my_image.hash5.webp 1080w,
          /_astro/my_image.hash6.webp 1280w,
          /_astro/my_image.hash7.webp 1600w"
  sizes="(min-width: 800px) 800px, 100vw"
  alt="説明"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
/>
```

**特徴**:
- **widthsを指定不要**: 自動で7サイズ生成 (640, 750, 800, 828, 1080, 1280, 1600)
- **sizesを指定不要**: 自動で `(min-width: 800px) 800px, 100vw` を設定
- **WebP変換**: 自動でWebP形式に変換
- **width/height自動取得**: ローカル画像なら自動で寸法を取得

**Web.dev推奨**:
- [Responsive Images](https://web.dev/learn/design/responsive-images/)
- `srcset`と`sizes`属性でレスポンシブ配信
- 1.5x〜2x間隔でサイズを生成 (例: 400, 600, 900, 1350...)
- 4-6サイズが目安

---

## 実装への壁

### 課題1: Astro ImageコンポーネントはMarkdown内で使えない

**問題**:
```markdown
<!-- ❌ これはできない -->
![説明](image.jpg)

<!-- Astro Imageコンポーネントに置き換える必要がある -->
<Image src={image} alt="説明" layout="constrained" />
```

**理由**:
- Markdownは静的に`<img>`タグに変換される
- Astro Imageコンポーネントはビルド時にしか動作しない

### 課題2: リモート画像の扱い

**問題**:
- ブログ画像はR2バケット（リモート）に保存
- Astro Imageはローカル画像に最適化されている
- リモート画像で`widths`を使うと、**ビルド時に全サイズをダウンロード・変換**
- ビルド時間が大幅に増加（90記事 × 2画像 × 7サイズ = 1260枚の画像処理）

**Astro公式の制約**:
```astro
<!-- ❌ リモート画像でwidthsを使うとビルド時に処理 -->
<Image
  src="https://r2.dev/image.jpg"
  widths={[640, 800, 1200]}
  alt="説明"
/>
<!-- ビルド時に3サイズをダウンロード・変換 → 遅い -->
```

### 課題3: Markdown画像ごとの設定ができない

**問題**:
```markdown
<!-- 画像の種類（ヒーロー、インライン、サムネイル）を区別できない -->
![ヒーロー画像](hero.jpg)
![インライン画像](inline.jpg)
![サムネイル](thumb.jpg)
```

**理想**:
- ヒーロー画像: `sizes="100vw"`（フル幅）
- インライン画像: `sizes="(max-width: 768px) 100vw, 720px"`
- サムネイル: `sizes="(max-width: 768px) 50vw, 200px"`

**現実**:
- Markdown構文では画像の種類を判別できない
- すべて同じ設定を適用するしかない

---

## 想定される修正案

### 案1: rehypeプラグイン + Cloudflare Images (推奨)

**概要**:
- rehypeプラグインで`<img>`タグを変換
- Cloudflare Images TransformationsでURL変換
- R2画像を動的にリサイズ

**Cloudflare Images URL形式**:
```
https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>
```

- `<ZONE>`: ドメイン名（省略可、相対パス`/cdn-cgi/image/`で開始可能）
- `<OPTIONS>`: カンマ区切りのオプション（例: `width=800,format=auto,fit=scale-down`）
- `<SOURCE-IMAGE>`: 元画像のURL（絶対URLまたは絶対パス）

**利用可能なオプション**:
- `width`: 最大幅（ピクセル）
- `format`: 出力形式（`auto`でAVIF/WebP自動選択、`webp`、`avif`、`jpeg`など）
- `fit`: リサイズモード
  - `scale-down`: 元画像より大きくしない（推奨）
  - `contain`: アスペクト比を保持して収める
  - `cover`: アスペクト比を保持して埋める
- `quality`: 画質（1-100、デフォルト85）

**実装**:
```typescript
// src/lib/rehype-cloudflare-images.ts
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypeCloudflareImages() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties?.src) {
        const src = node.properties.src as string;

        // ブログドメインの画像のみ対象
        if (!src.includes('suntory-n-water.com')) return;

        // Astro constrainedレイアウトを模倣
        const widths = [640, 750, 800, 828, 1080, 1280, 1600];
        const maxWidth = 800;

        // srcset生成
        node.properties.srcset = widths
          .map(w => `/cdn-cgi/image/width=${w},format=auto,fit=scale-down/${src} ${w}w`)
          .join(', ');

        // sizes（Astro constrainedと同じ）
        node.properties.sizes = `(min-width: ${maxWidth}px) ${maxWidth}px, 100vw`;

        // src（フォールバック + format=auto + fit=scale-down）
        node.properties.src = `/cdn-cgi/image/width=${maxWidth},format=auto,fit=scale-down/${src}`;
      }
    });
  };
}
```

**統合**:
```typescript
// src/components/feature/content/custom-markdown.tsx
export async function compileMarkdown({ source }: { source: string }) {
  const result = await remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkAlert)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeR2ImageUrl)
    .use(rehypeLinkCard)
    .use(rehypeCloudflareImages) // ← 追加
    .use(rehypeAddMermaidClass)
    // ...
}
```

**メリット**:
- ✅ ビルド時間への影響なし（URLベース変換のみ）
- ✅ Cloudflare無料枠で運用可能（月5,000変換 > ブログの900変換）
- ✅ Astro公式ベストプラクティスに準拠
- ✅ `format=auto`で自動的にAVIF/WebPに変換
- ✅ シンプルで保守しやすい

**デメリット**:
- ⚠️ すべての画像に同じ設定を適用（画像ごとのカスタマイズ不可）
- ⚠️ Cloudflare Imagesに依存

**コスト試算**:
```
90記事 × 2画像 × 7サイズ = 1,260ユニーク変換
月間新規記事10本: 10記事 × 2画像 × 7サイズ = 140変換/月

無料枠: 5,000変換/月
実際の使用: 140変換/月
コスト: $0.00/月
```

---

### 案2: Astro Imageコンポーネント化（高品質だが複雑）

**概要**:
- remarkプラグインでMarkdown画像をAstro Imageコンポーネントに置き換え
- ビルド時にローカルで画像を処理

**実装イメージ**:
```typescript
// remarkプラグインで変換
![説明](https://r2.dev/image.jpg)
↓
<Image src="https://r2.dev/image.jpg" alt="説明" layout="constrained" />
```

**メリット**:
- ✅ Astro公式機能を100%活用
- ✅ width/height自動取得（CLS改善）
- ✅ 最高品質の最適化

**デメリット**:
- ❌ ビルド時間が大幅増加（1,260枚の画像処理）
- ❌ リモート画像の扱いが複雑
- ❌ 実装が複雑（remarkプラグイン + Astro統合）

---

### 案3: width/height属性のみ追加（最小限）

**概要**:
- rehypeプラグインで`width`/`height`属性のみ追加
- レスポンシブ画像最適化はしない

**実装イメージ**:
```typescript
// リモート画像のサイズを取得してwidth/height追加
<img src="image.jpg" alt="説明" width="2000" height="1000">
```

**メリット**:
- ✅ CLS（Cumulative Layout Shift）改善
- ✅ 実装がシンプル

**デメリット**:
- ❌ データ転送量の削減にならない
- ❌ レスポンシブ配信されない
- ❌ ビルド時に画像サイズ取得が必要（遅い）

---

## 推奨アプローチ

### 結論: **案1 (rehypeプラグイン + Cloudflare Images)** を推奨

**理由**:
1. **無料で運用可能**: 月5,000変換 > 実際の使用140変換
2. **ビルド時間に影響なし**: URLベース変換のみ
3. **ベストプラクティスに準拠**: Astro `layout="constrained"` と同じサイズセット
4. **保守性が高い**: シンプルな実装で理解しやすい
5. **拡張性**: 将来的に画像ごとの設定も追加可能

**実装ステップ**:
1. `src/lib/rehype-cloudflare-images.ts` を作成
2. `custom-markdown.tsx` に統合
3. ビルドして動作確認
4. PageSpeed Insightsで効果測定

**期待される効果**:
- データ転送量: 411 KiB削減
- LCP (Largest Contentful Paint): 改善
- モバイルスコア: 向上

---

## 参考資料

**Astro公式**:
- [Images - Astro](https://docs.astro.build/en/guides/images/)
- [Image Component - Astro](https://docs.astro.build/en/reference/modules/astro-assets/)

**Cloudflare Images**:
- [Pricing - Cloudflare Images](https://developers.cloudflare.com/images/pricing/)
- [Transform via URL - Cloudflare Images](https://developers.cloudflare.com/images/transform-images/transform-via-url/)

**Web標準**:
- [Responsive Images - web.dev](https://web.dev/learn/design/responsive-images/)
- [srcset - MDN](https://developer.mozilla.org/ja/docs/Web/API/HTMLImageElement/srcset)
- [sizes - MDN](https://developer.mozilla.org/ja/docs/Web/API/HTMLImageElement/sizes)

**rehype/unified**:
- [rehype - GitHub](https://github.com/rehypejs/rehype)
- [unified - GitHub](https://github.com/unifiedjs/unified)
