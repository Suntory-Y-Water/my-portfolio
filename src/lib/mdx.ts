import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Frontmatter, MDXData } from '@/types/mdx';

const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');

export type BlogPost = MDXData<{
  thumbnail?: string;
  tags?: string[];
  icon?: string;
}>;

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await getMDXData(blogDir);
  return posts.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
  );
}

export async function getBlogPostsByTagSlug(
  tagSlug: string,
): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((post) => post.metadata.tags?.includes(tagSlug));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  const tags = posts.flatMap((post) => post.metadata.tags ?? []);
  return [...new Set(tags)];
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

async function getMDXData<T>(dir: string): Promise<MDXData<T>[]> {
  const files = await getMDXFiles(dir);
  return Promise.all(files.map((file) => readMDXFile<T>(path.join(dir, file))));
}

async function getMDXFiles(dir: string): Promise<string[]> {
  return (await fs.readdir(dir)).filter(
    (file) => path.extname(file) === '.mdx',
  );
}

async function readMDXFile<T>(filePath: string): Promise<MDXData<T>> {
  const rawContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(rawContent);
  const relativePath = path.relative(process.cwd(), filePath);

  return {
    metadata: data as Frontmatter<T>,
    slug: path.basename(filePath, path.extname(filePath)),
    rawContent: content,
    filePath: relativePath,
  };
}
