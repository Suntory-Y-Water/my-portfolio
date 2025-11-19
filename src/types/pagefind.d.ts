/**
 * Pagefind型定義
 *
 * Pagefindはビルド時に生成される検索インデックスファイルです。
 * 開発時には存在しないため、型定義を手動で提供します。
 */

/**
 * Pagefind検索結果の型定義
 */
export type PagefindSearchResult = {
  url: string;
  excerpt: string;
  meta: {
    title: string;
  };
};

/**
 * Pagefind検索結果アイテムの型定義
 */
export type PagefindSearchResultItem = {
  data: () => Promise<PagefindSearchResult>;
};

/**
 * Pagefind検索レスポンスの型定義
 */
export type PagefindSearchResponse = {
  results: PagefindSearchResultItem[];
};

/**
 * Pagefindモジュールの型定義
 */
export type PagefindModule = {
  search: (query: string) => Promise<PagefindSearchResponse>;
};

/**
 * Pagefindの動的インポート用の型定義
 * ビルド後に生成されるファイルのため、開発時には存在しない
 */
declare module '/pagefind/pagefind.js' {
  const pagefind: PagefindModule;
  export = pagefind;
}
