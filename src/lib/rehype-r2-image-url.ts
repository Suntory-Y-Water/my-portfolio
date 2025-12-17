import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * R2画像URLを独自ドメインに変換するrehypeプラグイン
 *
 * Markdown内の画像URLがR2バケット(pub-151065dba8464e6982571edb9ce95445.r2.dev)を
 * 指している場合、Cloudflare Workers経由の配信ドメイン(suntory-n-water.com/images/)に
 * 変換します。これによりキャッシュ制御が有効になり、パフォーマンスが向上します。
 */
export function rehypeR2ImageUrl() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties?.src) {
        const src = node.properties.src;

        // R2バケットURLを検出
        if (
          typeof src === 'string' &&
          src.includes('pub-151065dba8464e6982571edb9ce95445.r2.dev')
        ) {
          // R2 URLをWorkers配信URLに変換
          node.properties.src = src.replace(
            /^https:\/\/pub-151065dba8464e6982571edb9ce95445\.r2\.dev/,
            'https://suntory-n-water.com',
          );
        }
      }
    });
  };
}
