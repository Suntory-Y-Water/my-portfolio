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
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`データの取得に失敗しました。ステータスコード : ${response.status}`);
      console.error(`失敗したURL: ${p.apiUrl}`);
      throw new Error();
    }
    return await (response.json() as Promise<T>);
  } catch (error) {
    throw new Error(`データの取得に失敗しました。エラー内容 : ${error}`);
  }
}
