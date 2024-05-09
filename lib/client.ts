import { MicroCMSContentId, MicroCMSDate, MicroCMSQueries, createClient } from 'microcms-js-sdk';
import { notFound } from 'next/navigation';

if (!process.env.MICROCMS_DOMAIN) {
  throw new Error('MICROCMS_DOMAIN is required');
}

if (!process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_API_KEY is required');
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_DOMAIN || '',
  apiKey: process.env.MICROCMS_API_KEY || '',
});

// キャッシュの再検証時間 1日で再検証する
const REVALIDATE_TIME = 60 * 60 * 24;

export interface Contents {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  url: string;
  description: string;
  content: string;
  image: Image;
  source: string;
  tags: TagsEntity[];
}
export interface Image {
  url: string;
  height: number;
  width: number;
}
export interface TagsEntity {
  fieldId: string;
  tagId: string[];
}

export type Article = Contents & MicroCMSContentId & MicroCMSDate;

// コンテンツ一覧を取得する
export const getContentsList = async (queries?: MicroCMSQueries) => {
  const listData = await client
    .getList<Contents>({
      customRequestInit: {
        next: { revalidate: REVALIDATE_TIME },
      },
      endpoint: 'contents',
      queries,
    })
    .catch(notFound);

  return listData;
};

// コンテンツの詳細を取得する
export const getContentsDetail = async (contentId: string, queries?: MicroCMSQueries) => {
  const detailData = await client
    .getListDetail<Contents>({
      customRequestInit: {
        next: { revalidate: REVALIDATE_TIME },
      },
      endpoint: 'contents',
      contentId,
      queries,
    })
    .catch(notFound);

  return detailData;
};
