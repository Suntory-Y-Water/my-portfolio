import type { ImageLoaderProps } from 'next/image';

/**
 * microCMS用の画像最適化ローダー
 *
 * @param props - ImageLoaderProps (src, width, quality)
 * @returns 最適化されたmicroCMS画像URL
 *
 * @example
 * ```ts
 * const url = microCMSLoader({ src: 'https://images.microcms-assets.io/...', width: 800, quality: 80 });
 * ```
 */
function microCMSLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  const params = url.searchParams;

  params.set('w', Math.min(width, 1024).toString());
  params.set('fit', params.get('fit') || 'max');
  params.set('q', (quality || 80).toString());

  if (!src.endsWith('.gif')) {
    params.set('fm', 'webp');
  }

  return url.href;
}

/**
 * ローカル画像用のローダー
 *
 * @param props - ImageLoaderProps (src, width)
 * @returns widthクエリパラメータが付与されたローカル画像URL
 *
 * @example
 * ```ts
 * const url = localLoader({ src: '/images/sample.png', width: 800 });
 * // => '/images/sample.png?w=800'
 * ```
 */
function localLoader({ src, width }: ImageLoaderProps): string {
  return `${src}?w=${width}`;
}

/**
 * カスタム画像ローダー（ローカル/microCMS/FluentUI Emojiの自動振り分け）
 *
 * @param props - ImageLoaderProps (src, width, quality)
 * @returns ローカル、microCMS、またはFluentUI Emoji用に最適化された画像URL
 *
 * @example
 * ```ts
 * // ローカル画像の場合
 * const url1 = customLoader({ src: '/images/sample.png', width: 800 });
 * // FluentUI Emoji画像の場合（最適化をスキップ）
 * const url3 = customLoader({ src: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/...', width: 80 });
 * ```
 */
function customLoader({ src, width, quality }: ImageLoaderProps): string {
  // FluentUI Emoji URLはそのまま返す（最適化をスキップ）
  if (src.includes('raw.githubusercontent.com/microsoft/fluentui-emoji')) {
    return src;
  }

  return src.startsWith('/')
    ? localLoader({ src, width, quality })
    : microCMSLoader({ src, width, quality });
}

export default customLoader;
