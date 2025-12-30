// いいねAPI のレスポンス型定義

/**
 * GET /api/like/:slug のレスポンス
 */
export type GetLikeResponse = {
  slug: string;
  likes: number;
};

/**
 * POST /api/like/:slug のリクエストボディ
 */
export type IncrementLikeRequest = {
  increment: number; // 1-10
};

/**
 * POST /api/like/:slug のレスポンス
 */
export type IncrementLikeResponse = {
  slug: string;
  likes: number;
  incremented: number;
};

/**
 * エラーレスポンス
 */
export type ErrorResponse = {
  error: string;
  message?: string;
  slug?: string;
};
