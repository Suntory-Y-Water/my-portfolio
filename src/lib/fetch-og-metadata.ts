type OGData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

const OG_API_ENDPOINT = 'https://suntory-n-water.com/api/og';
const API_SECRET = process.env.API_SECRET || '';

// デバッグログ
console.log('[OG] NODE_ENV:', process.env.NODE_ENV);
console.log('[OG] API_SECRET exists:', !!API_SECRET);
console.log('[OG] API_SECRET length:', API_SECRET.length);

/**
 * Cloudflare Workers KVからOGデータを取得
 *
 * @param url - OGデータを取得するURL
 * @returns KVにキャッシュされたOGデータ、キャッシュがない場合はnull
 */
async function fetchFromCache(url: string): Promise<Partial<OGData> | null> {
  try {
    const response = await fetch(
      `${OG_API_ENDPOINT}?url=${encodeURIComponent(url)}`,
    );

    console.log(`[OG] fetchFromCache: ${url} -> ${response.status}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.log(`[OG] fetchFromCache failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`[OG] fetchFromCache success: ${url}`);
    return data;
  } catch (error) {
    console.log(`[OG] fetchFromCache error:`, error);
    return null;
  }
}

/**
 * Cloudflare Workers KVにOGデータを保存
 *
 * 本番ビルド時のみ保存する。開発環境ではスキップ。
 *
 * @param url - OGデータの元URL
 * @param data - 保存するOGデータ
 */
async function saveToCache({
  url,
  data,
}: {
  url: string;
  data: Partial<OGData>;
}): Promise<void> {
  console.log(`[OG] saveToCache called for: ${url}`);
  console.log(`[OG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[OG] API_SECRET exists: ${!!API_SECRET}`);

  // 本番ビルド時のみ保存
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OG] saveToCache skipped: not production`);
    return;
  }

  // API_SECRETがない場合はスキップ
  if (!API_SECRET) {
    console.log(`[OG] saveToCache skipped: no API_SECRET`);
    return;
  }

  try {
    console.log(`[OG] saveToCache: sending POST to ${OG_API_ENDPOINT}`);
    const response = await fetch(OG_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify({
        url,
        data: {
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          url: data.url || url,
        },
      }),
    });

    console.log(`[OG] saveToCache response: ${response.status}`);
    if (!response.ok) {
      console.error(`Failed to save OG cache: ${response.status} for ${url}`);
    } else {
      console.log(`[OG] saveToCache success for: ${url}`);
    }
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * 画像をR2にアップロードしてキーを取得
 *
 * @param imageUrl - アップロードする画像のURL
 * @returns R2にアップロードされた画像のキー（例: "abc123.png"）、失敗時はnull
 */
async function uploadImageToR2(imageUrl: string): Promise<string | null> {
  // 本番ビルド時のみアップロード
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // API_SECRETがない場合はスキップ
  if (!API_SECRET) {
    return null;
  }

  try {
    // 1. 画像を取得
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(
        `Failed to fetch image: ${imageResponse.status} for ${imageUrl}`,
      );
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get('Content-Type') || 'image/png';

    // 2. ファイル名を生成（URLのハッシュ）
    const encoder = new TextEncoder();
    const data = encoder.encode(imageUrl);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // 拡張子を取得（デフォルトは .png）
    const ext = imageUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'png';
    const filename = `${hashHex}.${ext}`;

    // 3. R2にアップロード
    const uploadResponse = await fetch(
      `https://suntory-n-water.com/images/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          Authorization: `Bearer ${API_SECRET}`,
        },
        body: imageBuffer,
      },
    );

    if (!uploadResponse.ok) {
      console.error(
        `Failed to upload to R2: ${uploadResponse.status} for ${imageUrl}`,
      );
      return null;
    }

    const result: { success: boolean; key: string } =
      await uploadResponse.json();
    return result.key;
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    return null;
  }
}

/**
 * 外部URLから直接OGデータを取得（従来のロジック）
 *
 * @param url - OGPデータを取得するURL
 * @returns OGPデータの部分的なオブジェクト(title、description、image、url)
 */
async function fetchOGDataDirect(url: string): Promise<Partial<OGData>> {
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

/**
 * URLからOGP(Open Graph Protocol)データを取得する
 *
 * 本番ビルド時はCloudflare Workers KVキャッシュを使用。
 * キャッシュミス時は外部URLから取得し、KVに保存する。
 *
 * @param url - OGPデータを取得するURL
 * @returns OGPデータの部分的なオブジェクト(title、description、image、url)
 */
export async function getOGData(url: string): Promise<Partial<OGData>> {
  // 本番ビルド時はキャッシュを使用
  if (process.env.NODE_ENV === 'production') {
    // 1. キャッシュ確認
    const cachedData = await fetchFromCache(url);
    if (cachedData) {
      return cachedData;
    }

    // 2. 外部URLから取得
    const freshData = await fetchOGDataDirect(url);

    // 3. 画像をR2にアップロード
    if (freshData.image) {
      const imageKey = await uploadImageToR2(freshData.image);
      if (imageKey) {
        // R2のURLに置き換え
        freshData.image = `https://suntory-n-water.com/images/${imageKey}`;
      }
    }

    // 4. キャッシュに保存
    await saveToCache({ url, data: freshData });

    return freshData;
  }

  // 開発環境では従来通り直接fetch
  return fetchOGDataDirect(url);
}

/**
 * OGP画像のURLを絶対URLに変換する
 *
 * 相対URLの場合は元ページのoriginを基準に絶対URLに変換します。
 * 既に絶対URLの場合はそのまま返します。
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

  const isAbsoluteUrl = /^https?:\/\//i.test(imageUrl);
  if (isAbsoluteUrl) {
    return imageUrl;
  }

  const base = new URL(baseUrl);
  const absoluteUrl = new URL(imageUrl, base.origin);
  return absoluteUrl.href;
}
