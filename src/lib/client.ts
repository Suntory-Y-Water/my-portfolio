/**
 * 外部APIから投稿データを取得する
 *
 * Next.jsのfetch APIを使用して外部APIからデータを取得します。
 * ISR（Incremental Static Regeneration）により、60秒ごとに再検証されます。
 * エラーが発生した場合は、詳細なエラーメッセージをコンソールに出力します。
 *
 * @template T - レスポンスデータの型
 * @param p - APIリクエストのパラメータ
 * @param p.apiUrl - リクエスト先のAPI URL
 * @param p.headers - カスタムHTTPヘッダー（オプション）
 * @returns APIレスポンスデータ
 * @throws レスポンスがエラーステータスを返した場合、またはネットワークエラーが発生した場合
 *
 * @example
 * ```ts
 * type Post = { id: string; title: string; };
 * const posts = await fetchPosts<Post[]>({
 *   apiUrl: 'https://api.example.com/posts',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * ```
 */
export async function fetchPosts<T>(p: {
  apiUrl: string;
  headers?: Record<string, string>;
}) {
  try {
    const response = await fetch(p.apiUrl, {
      headers: {
        ...p.headers,
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 60,
      },
    });
    if (!response.ok) {
      console.error(
        `データの取得に失敗しました。ステータスコード : ${response.status}`,
      );
      console.error(`失敗したURL: ${p.apiUrl}`);
      throw new Error();
    }
    return await (response.json() as Promise<T>);
  } catch (error) {
    throw new Error(`データの取得に失敗しました。エラー内容 : ${error}`);
  }
}
