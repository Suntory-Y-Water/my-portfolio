type OGData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

/**
 * OGP画像のURLを絶対URLに変換する
 *
 * 相対URLの場合は元ページのoriginを基準に絶対URLに変換します。
 * 既に絶対URLの場合はそのまま返します。
 *
 * @param imageUrl - OGP画像のURL(相対または絶対)
 * @param baseUrl - 基準となるページのURL
 * @returns 絶対URL形式の画像URL、変換できない場合は空文字列
 */
function resolveImageUrl({
  imageUrl,
  baseUrl,
}: {
  imageUrl: string | undefined;
  baseUrl: string;
}): string {
  if (!imageUrl) {
    return '';
  }

  // 絶対URLかどうかを判定
  const isAbsoluteUrl = /^https?:\/\//i.test(imageUrl);
  if (isAbsoluteUrl) {
    return imageUrl;
  }

  // 相対URLの場合は元のURLのoriginを基準に絶対URLに変換
  const base = new URL(baseUrl);
  const absoluteUrl = new URL(imageUrl, base.origin);
  return absoluteUrl.href;
}

/**
 * URLからOGP(Open Graph Protocol)データを取得する
 *
 * @param url - OGPデータを取得するURL
 * @returns OGPデータの部分的なオブジェクト(title、description、image、url)
 *
 */
export async function getOGData(url: string): Promise<Partial<OGData>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'bot',
      },
    });

    const html = await response.text();

    const getMetaContent = (property: string): string | undefined => {
      const regex1 = new RegExp(
        `<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]+)"`,
        'i',
      );
      const match1 = regex1.exec(html)?.[1];
      if (match1) {
        return match1;
      }

      // パターン2: content が先
      const regex2 = new RegExp(
        `<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="${property}"`,
        'i',
      );
      return regex2.exec(html)?.[1];
    };

    const titleMatch = /<title>(.*?)<\/title>/i.exec(html);

    return {
      title: getMetaContent('og:title') || titleMatch?.[1] || '',
      description:
        getMetaContent('og:description') || getMetaContent('description') || '',
      image: resolveImageUrl({
        imageUrl: getMetaContent('og:image'),
        baseUrl: url,
      }),
      url,
    };
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return { url };
  }
}
