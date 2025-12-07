import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名を結合してマージする
 *
 * clsxとtailwind-mergeを組み合わせて、条件付きクラス名の結合と
 * 競合するTailwindクラスの自動マージを行います。
 *
 * @param inputs - 結合するクラス名(文字列、配列、オブジェクト形式)
 * @returns マージされたクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付を日本語形式(年/月/日)にフォーマットする
 *
 * 入力された日付を日本のタイムゾーン(Asia/Tokyo)で
 * YYYY/M/D形式の文字列に変換します。
 *
 * @param input - フォーマットする日付(文字列またはUnixタイムスタンプ)
 * @returns 日本語形式の日付文字列(例：2025/11/15)
 */
export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

/**
 * 相対パスを絶対URLに変換する
 *
 * アプリケーションのベースURLと相対パスを結合して、
 * 完全な絶対URLを生成します。環境変数NEXT_PUBLIC_APP_URLが
 * 設定されていない場合は、開発環境用のデフォルトURL(http://localhost:3000)を使用します。
 *
 * @param path - 変換する相対パス(例：/blog/post-1)
 * @returns 絶対URL(例：https://example.com/blog/post-1)
 */
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${path}`;
}
