'use server';

import { cache } from 'react';

interface OGData {
  title: string;
  description: string;
  image: string;
  url: string;
}

/**
 * URLからOGP（Open Graph Protocol）データを取得する
 *
 * @param url - OGPデータを取得するURL
 * @returns OGPデータの部分的なオブジェクト（title、description、image、url）
 *
 * @example
 * ```ts
 * const ogData = await getOGData('https://example.com');
 * console.log(ogData.title); // => 'Example Domain'
 * ```
 */
async function getOGDataImpl(url: string): Promise<Partial<OGData>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'bot',
      },
    });

    const html = await response.text();

    const getMetaContent = (property: string): string | undefined => {
      const regex = new RegExp(
        `<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]+)"`,
        'i',
      );
      return regex.exec(html)?.[1];
    };

    const titleMatch = /<title>(.*?)<\/title>/i.exec(html);

    return {
      title: getMetaContent('og:title') || titleMatch?.[1] || '',
      description:
        getMetaContent('og:description') ||
        getMetaContent('description') ||
        '',
      image: getMetaContent('og:image') || '',
      url,
    };
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return { url };
  }
}

export const getOGData = cache(getOGDataImpl);
