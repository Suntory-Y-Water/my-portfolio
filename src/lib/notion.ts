import { NOTION_API_BASE } from '@/constants';
import { processEnv } from '@/lib/utils';
import type { NotionPosts } from '@/types';
import { NotionAPI } from 'notion-client';
import { getPageImageUrls } from 'notion-utils';
import { cache } from 'react';
import type { BlockMapType } from 'react-notion';
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

export const getDatabase = cache(async () => {
  try {
    if (!processEnv.NOTION_PAGE_ID) {
      throw new Error('NotionのページIDが設定されていません。');
    }
    const recordMap = await notion.getPage(processEnv.NOTION_PAGE_ID);

    getPageImageUrls(recordMap, {
      mapImageUrl: (url: string, block) => {
        if (url.startsWith('/images')) {
          return `https://www.notion.so${url}`;
        }

        if (url.startsWith('https://prod-files-secure')) {
          const encoded = encodeURIComponent(url);

          return `https://www.notion.so/image/${encoded}?table=block&id=${block.id}&cache=v2`;
        }

        return url;
      },
    });

    const block = Object.values(recordMap.block)[0]?.value;

    if (!block) {
      throw new Error('No block data found');
    }

    // アイコンの処理を修正
    let icon: string | undefined;
    if (block?.format?.page_icon) {
      // 絵文字の場合は直接その文字を使用
      if (block.format.page_icon.length === 1 || block.format.page_icon.length === 2) {
        icon = block.format.page_icon; // 絵文字をそのまま返す
      } else {
        // 画像URLの場合は変換処理
        icon = `https://www.notion.so/image/${encodeURIComponent(
          block.format.page_icon,
        )}?table=block&id=${block.id}&cache=v2`;
      }
    }

    // データベースのプロパティから追加情報を取得
    const properties = block?.properties || {};
    const author = properties.author?.[0]?.[0];
    const site = properties.site?.[0]?.[0];

    const result = {
      icon,
      cover: block?.format?.page_cover
        ? block.format.page_cover.startsWith('/images')
          ? `https://www.notion.so${block.format.page_cover}`
          : block.format.page_cover
        : undefined,
      title: block?.properties?.title?.[0]?.[0] || undefined,
      coverPosition: block?.format?.page_cover_position || 0.5,
      // 追加の情報
      author,
      site,
    };

    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error(JSON.stringify(error));
      throw new Error(`データベースの取得に失敗しました。エラー内容 : ${error.message}`);
    }
    throw error;
  }
});

export const getPostBySlug = cache(async (slug: string) => {
  try {
    // TODO: なぜAPI呼び出ししているか不明
    const posts = await getAllPosts();
    const post = posts.find((p) => p.slug === slug);

    if (!post || !post.title) return null;

    const page = await fetchPosts<BlockMapType>({
      apiUrl: `${NOTION_API_BASE}/page/${post.id}`,
    });

    if (
      !page ||
      typeof page !== 'object' ||
      Object.keys(page).length === 0 ||
      !Object.values(page).some(
        (block) =>
          block?.value?.type === 'page' && block.value.properties?.title?.[0]?.[0],
      )
    ) {
      console.error(`Invalid page content for slug ${slug}`);
      return null;
    }

    return {
      ...post,
      content: page,
    };
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
});
