import { NOTION_API_BASE } from '@/constants';
import { processEnv } from '@/lib/utils';
import type { NotionPosts } from '@/types';
import { NotionAPI } from 'notion-client';
import { cache } from 'react';
import { fetchPosts } from './client';

const notion = new NotionAPI();

//notion-api-worker and react-notion
export const getAllPosts = cache(async () => {
  try {
    if (!processEnv.NOTION_PAGE_ID) {
      throw new Error('NotionのページIDが設定されていません。');
    }
    const posts = await fetchPosts<NotionPosts[]>({
      apiUrl: `${NOTION_API_BASE}/table/${processEnv.NOTION_PAGE_ID}`,
    });

    // 公開されている投稿のみをフィルターし、
    // 作成日時（published）の降順に並び替えて返却
    return posts
      .filter((post) => post.public)
      .sort((a, b) => {
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      });
  } catch (error) {
    if (error instanceof Error) {
      console.error(JSON.stringify(error));
      throw new Error(`データの取得に失敗しました。エラー内容 : ${error.message}`);
    }
    throw error;
  }
});
