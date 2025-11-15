import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getTagNameFromSlug, getTagSlug } from '@/config/tag-slugs';
import type { Frontmatter, MarkdownData } from '@/types/markdown';

const blogDir = path.join(process.cwd(), 'content', 'blog');

export type BlogPost = MarkdownData<{
  thumbnail?: string;
  tags?: string[];
  icon?: string;
}>;

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await getMarkdownData(blogDir);
  return posts.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
  );
}

export async function getBlogPostsByTagSlug(
  tagSlug: string,
): Promise<BlogPost[]> {
  const tagName = getTagNameFromSlug(tagSlug);

  if (!tagName) {
    return [];
  }

  const posts = await getAllBlogPosts();
  return posts.filter((post) => post.metadata.tags?.includes(tagName));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  const tags = posts.flatMap((post) => post.metadata.tags ?? []);
  return [...new Set(tags)];
}

/**
 * 全ブログ記事から使用されているタグのslugを取得
 */
export async function getAllTagSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  const tagNames = posts.flatMap((post) => post.metadata.tags ?? []);
  const uniqueTagNames = [...new Set(tagNames)];

  // タグ名をslugに変換（重複排除のため再度Set化）
  const slugs = uniqueTagNames.map(getTagSlug);
  return [...new Set(slugs)];
}

export async function getBlogPostBySlug(slug: string) {
  return getBlogPost((post) => post.slug === slug);
}

async function getBlogPost(
  predicate: (post: BlogPost) => boolean,
): Promise<BlogPost | undefined> {
  const posts = await getAllBlogPosts();
  return posts.find(predicate);
}

async function getMarkdownData<T>(dir: string): Promise<MarkdownData<T>[]> {
  const files = await getMarkdownFiles(dir);
  return Promise.all(
    files.map((file) => readMarkdownFile<T>(path.join(dir, file))),
  );
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  return (await fs.readdir(dir)).filter((file) => path.extname(file) === '.md');
}

async function readMarkdownFile<T>(filePath: string): Promise<MarkdownData<T>> {
  const rawContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(rawContent);
  const relativePath = path.relative(process.cwd(), filePath);

  // フロントマターにslugフィールドがあればそれを使用、なければファイル名から抽出
  const slug = (data as Record<string, unknown>).slug as string | undefined;
  const filenameSlug = path.basename(filePath, path.extname(filePath));

  return {
    metadata: data as Frontmatter<T>,
    slug: slug ?? filenameSlug,
    rawContent: content,
    filePath: relativePath,
  };
}
