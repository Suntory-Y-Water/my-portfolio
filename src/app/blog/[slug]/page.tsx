import '@/styles/mdx.css';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CustomMDX } from '@/components/content/custom-mdx';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/mdx';
import { absoluteUrl, formatDate } from '@/lib/utils';

export const revalidate = false;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: 'article',
      url: absoluteUrl(`/blog/${post.slug}`),
      images: [absoluteUrl(`/blog/ogp/${post.slug}`)],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metadata.title,
      description: post.metadata.description,
      images: [absoluteUrl(`/blog/ogp/${post.slug}`)],
    },
  };
}

export async function generateStaticParams() {
  const allPosts = await getAllBlogPosts();
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <article>
        {/* Metadata (Date & Tags) */}
        <div className='mb-6 flex flex-wrap items-center justify-between text-sm text-muted-foreground'>
          {post.metadata.date && (
            <div className='inline-flex items-center gap-1'>
              <Icons.calendar className='size-4' />
              <time dateTime={post.metadata.date}>{formatDate(post.metadata.date)}</time>
            </div>
          )}

          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className='inline-flex flex-wrap gap-2'>
              {post.metadata.tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${tag}`}>
                  <Badge className='px-2 py-0.5 text-xs'>{tag}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className='text-2xl font-bold leading-snug tracking-normal'>
          {post.metadata.title}
        </h1>

        {/* Description */}
        {post.metadata.description && (
          <p className='mt-4 text-foreground/80'>{post.metadata.description}</p>
        )}

        {/* Article Content */}
        <CustomMDX source={post.rawContent} />

        {/* Footer */}
        <footer className='mt-10 border-t pt-8'>
          <Button variant='ghost' asChild className='h-9 px-2'>
            <Link href='/blog' className='group inline-flex items-center'>
              <Icons.arrowLeft className='mr-2 size-4 transition-transform group-hover:-translate-x-1' />
              Back to blog page
            </Link>
          </Button>
        </footer>
      </article>
    </div>
  );
}
