export async function fetchPosts<T>(apiUrl: string, headers?: Record<string, string>) {
  try {
    const response = await fetch(apiUrl, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`レスポンスが正常ではありません。ステータスコード : ${response.status}`);
    }
    return await (response.json() as Promise<T>);
  } catch (error) {
    throw new Error(`データの取得に失敗しました。エラー内容 : ${error}`);
  }
}
