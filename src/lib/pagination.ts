import type { BlogPost } from '@/lib/markdown';

/**
 * ページネーション結果の型定義
 *
 * @template T - ページネーション対象のアイテムの型
 */
export type PaginationResult<T> = {
  /** ページ内のアイテム配列 */
  items: T[];
  /** 現在のページ番号（1始まり） */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 全アイテムの総数 */
  totalItems: number;
};

/**
 * アイテムの配列をページネーションする汎用関数
 *
 * 与えられたアイテム配列を指定されたページサイズで分割し、
 * 指定されたページのアイテムとメタデータを返します。
 * ページ番号が範囲外の場合は、自動的に有効な範囲内に調整されます。
 *
 * @template T - ページネーション対象のアイテムの型
 * @param items - ページネーション対象のアイテム配列
 * @param page - 取得するページ番号（1始まり、デフォルト: 1）
 * @param pageSize - 1ページあたりのアイテム数（デフォルト: 10）
 * @returns ページネーション結果（アイテム、現在ページ、総ページ数、総アイテム数）
 *
 * @example
 * ```ts
 * const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
 * const result = paginateItems(items, 2, 5);
 * // => {
 * //   items: [6, 7, 8, 9, 10],
 * //   currentPage: 2,
 * //   totalPages: 3,
 * //   totalItems: 11
 * // }
 * ```
 */
export function paginateItems<T>(
  items: T[],
  page = 1,
  pageSize = 10,
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    items: items.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalItems,
  };
}

/**
 * ブログ記事の配列をページネーションする
 *
 * ブログ記事専用のページネーション関数。
 * 内部的には汎用的なpaginateItems関数を使用しています。
 *
 * @param allPosts - 全ブログ記事の配列
 * @param page - 取得するページ番号（1始まり、デフォルト: 1）
 * @param pageSize - 1ページあたりの記事数（デフォルト: 10）
 * @returns ページネーション結果（記事、現在ページ、総ページ数、総記事数）
 *
 * @example
 * ```ts
 * const allPosts = await getAllBlogPosts();
 * const result = getPaginatedBlogPosts(allPosts, 1, 10);
 * // => 1ページ目の10件の記事を取得
 * ```
 */
export function getPaginatedBlogPosts(
  allPosts: BlogPost[],
  page = 1,
  pageSize = 10,
): PaginationResult<BlogPost> {
  return paginateItems(allPosts, page, pageSize);
}
