import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Markdown内の画像をCloudflare Images Transformationsでレスポンシブ配信に変換するrehypeプラグイン
 *
 * 上記は以下のようなsrcset/sizes付きの`<img>`タグに変換されます
 * - srcset: 640w, 750w, 800w, 828w, 1080w, 1280w, 1600w
 * - sizes: `(min-width: 800px) 800px, 100vw`
 * - Cloudflare Images Transformationsで`format=auto,fit=scale-down`を適用
 */
export function rehypeCloudflareImages() {
  return (tree: Root) => {
    // 本番環境でのみCloudflare Images Transformationsを適用
    const isProduction = process.env.NODE_ENV === 'production';

    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties?.src) {
        const src = node.properties.src as string;

        // ブログドメインの画像のみ対象
        if (!src.includes('suntory-n-water.com')) {
          return;
        }

        // ローカル環境では変換しない
        if (!isProduction) {
          return;
        }

        // Astro constrainedレイアウトを模倣
        const widths = [640, 750, 800, 828, 1080, 1280, 1600];
        const maxWidth = 800;

        // srcset生成
        node.properties.srcset = widths
          .map(
            (w) =>
              `/cdn-cgi/image/width=${w},format=auto,fit=scale-down/${src} ${w}w`,
          )
          .join(', ');

        // sizes(Astro constrainedと同じ)
        node.properties.sizes = `(min-width: ${maxWidth}px) ${maxWidth}px, 100vw`;

        // src(フォールバック + format=auto + fit=scale-down)
        node.properties.src = `/cdn-cgi/image/width=${maxWidth},format=auto,fit=scale-down/${src}`;
      }
    });
  };
}
