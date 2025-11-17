/**
 * アプリケーション全体で使用される定数を一元管理
 *
 * 各定数は名前空間で分類され、`as const`で型安全性を確保しています。
 * 変更が必要な場合は、このファイルのみを編集してください。
 *
 * @see {@link https://github.com/Suntory-Y-Water/my-portfolio/issues/219}
 */

const url = process.env.NEXT_PUBLIC_APP_URL || 'https://suntory-n-water.com';

/**
 * サイト基本情報
 */
export const SITE_CONSTANTS = {
  /** サイト名 */
  NAME: 'sui-portfolio',
  /** サイトの説明 */
  DESCRIPTION:
    'スイのポートフォリオです。簡単な自己紹介と今まで投稿してきた記事のリンクや、Web開発に関する学習記録をブログとしてまとめています。',
  /** ブログセクションの説明 */
  BLOG_DESCRIPTION: 'Web開発に関する学習記録をまとめたブログです。',
  /** サイトURL */
  URL: url,
  /** OGP画像URL */
  OG_IMAGE: `${url}/opengraph-image.png`,
  /** 著作権表記 */
  COPYRIGHT: 'Suntory-N-Water',
} as const;

/**
 * ソーシャルメディアリンク
 */
export const SOCIAL_CONSTANTS = {
  /** Twitter/X アカウントURL */
  TWITTER: 'https://x.com/Suntory_N_Water',
  /** GitHub アカウントURL */
  GITHUB: 'https://github.com/Suntory-Y-Water',
} as const;

/**
 * GitHubリポジトリ情報
 */
export const REPOSITORY_CONSTANTS = {
  /** リポジトリオーナー */
  OWNER: 'Suntory-Y-Water',
  /** リポジトリ名 */
  NAME: 'my-portfolio',
  /** デフォルトブランチ */
  BRANCH: 'main',
} as const;

/**
 * ブログ設定
 */
export const BLOG_CONSTANTS = {
  /** ブログページのページネーション: 1ページあたりの記事数 */
  POSTS_PER_PAGE: 10,
  /** トップページに表示する記事数 */
  TOP_PAGE_POSTS_COUNT: 5,
} as const;
