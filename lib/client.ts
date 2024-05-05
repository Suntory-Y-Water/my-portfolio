/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line object-curly-newline
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
        cache: 'no-store',
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
        cache: 'no-store',
      },
      endpoint: 'contents',
      contentId,
      queries,
    })
    .catch(notFound);

  return detailData;
};
