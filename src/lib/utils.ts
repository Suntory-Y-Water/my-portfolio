import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名を結合してマージする
 *
 * clsxとtailwind-mergeを組み合わせて、条件付きクラス名の結合と
 * 競合するTailwindクラスの自動マージを行います。
 *
 * @param inputs - 結合するクラス名（文字列、配列、オブジェクト形式）
 * @returns マージされたクラス名文字列
 *
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'（px-2はpx-4で上書き）
 * cn('text-red-500', false && 'text-blue-500') // => 'text-red-500'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付を日本語形式（年/月/日）にフォーマットする
 *
 * 入力された日付を日本のタイムゾーン（Asia/Tokyo）で
 * YYYY/M/D形式の文字列に変換します。
 *
 * @param input - フォーマットする日付（文字列またはUnixタイムスタンプ）
 * @returns 日本語形式の日付文字列（例：2025/11/15）
 *
 * @example
 * ```ts
 * formatDate('2025-11-15') // => '2025/11/15'
 * formatDate(1700000000000) // => '2023/11/15'
 * ```
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
 * 設定されていない場合は、開発環境用のデフォルトURL（http://localhost:3000）を使用します。
 *
 * @param path - 変換する相対パス（例：/blog/post-1）
 * @returns 絶対URL（例：https://example.com/blog/post-1）
 *
 * @example
 * ```ts
 * // NEXT_PUBLIC_APP_URL='https://example.com' の場合
 * absoluteUrl('/blog/post-1') // => 'https://example.com/blog/post-1'
 *
 * // 環境変数が未設定の場合
 * absoluteUrl('/about') // => 'http://localhost:3000/about'
 * ```
 */
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${path}`;
}

/**
 * テキストを指定された最大長で切り詰める
 *
 * 入力テキストが最大長を超える場合は、指定された長さで切り詰めて
 * 末尾に「...」を追加します。最大長以下の場合は元のテキストをそのまま返します。
 *
 * @param inputText - 切り詰める対象のテキスト
 * @param maxLength - 最大文字数（この長さを超えると切り詰められる）
 * @returns 切り詰められたテキスト（必要に応じて「...」付き）
 *
 * @example
 * ```ts
 * truncateText('これは長いテキストです', 5) // => 'これは長いテ...'
 * truncateText('短い', 10) // => '短い'
 * ```
 */
export function truncateText(inputText: string, maxLength: number): string {
  return inputText.length > maxLength
    ? `${inputText.slice(0, maxLength)}...`
    : inputText;
}
