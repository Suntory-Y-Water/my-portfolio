import Link from 'next/link';
import { BlogCard } from '@/components/feature/content/blog-card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { BLOG_CONSTANTS } from '@/constants';
import { getAllBlogPosts } from '@/lib/markdown';
import { paginateItems } from '@/lib/pagination';

export default async function Home() {
  const allPosts = await getAllBlogPosts();
  const { items: paginatedPosts } = paginateItems({
    items: allPosts,
    page: 1,
    pageSize: BLOG_CONSTANTS.TOP_PAGE_POSTS_COUNT,
  });

  return (
    <section data-pagefind-ignore className='space-y-16 pt-16'>
      {/* Hero */}
      <div className='relative mx-auto max-w-3xl text-center animate-fade-in-bottom'>
        <div className='pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[110px] animate-float' />
        <div className='pointer-events-none absolute left-1/3 top-1/3 -z-20 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[90px] animate-float' />
        <h1 className='flex flex-wrap items-center justify-center gap-x-2 text-center text-4xl font-bold leading-tight tracking-tight md:flex-nowrap md:text-5xl font-mono'>
          <span className='shrink-0'>Welcome to the</span>
          <span className='shrink-0 whitespace-nowrap leading-[1.25] bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent'>
            sui Tech Blog!
          </span>
        </h1>
        <p className='mt-6 text-base font-semibold text-muted-foreground md:text-lg'>
          日々の開発で得た知見や、実験的な実装を記録する技術ブログです。
          <br />
          TypeScript に関する分野の記事が中心です。
        </p>
        <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6'>
          <Button asChild className='h-11 rounded-full px-8'>
            <Link
              href='/blog'
              className='group inline-flex items-center gap-2 text-sm font-bold'
            >
              ブログを読む
              <Icons.chevronRight className='size-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </Button>
          <Button variant='outline' asChild className='h-11 rounded-full px-8'>
            <Link href='/about' className='text-sm font-bold'>
              About me
            </Link>
          </Button>
        </div>
      </div>

      {/* Articles */}
      <div id='articles' className='space-y-8'>
        <div className='flex items-end justify-between pb-2'>
          <h2 className='border-b-4 border-primary pb-1 text-2xl font-bold'>
            最新記事
          </h2>
          <Link
            href='/blog'
            className='hidden items-center gap-1 text-sm font-bold text-primary transition-colors hover:underline md:flex'
          >
            すべての記事を見る
            <Icons.chevronRight className='size-4 transition-transform group-hover:translate-x-1' />
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {paginatedPosts.map((blog, index) => (
            <BlogCard key={blog.slug} data={blog} priority={index < 6} />
          ))}
        </div>

        <div className='text-center md:hidden'>
          <Link
            href='/blog'
            className='inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
          >
            すべての記事を見る
            <Icons.chevronRight className='size-4' />
          </Link>
        </div>
      </div>
    </section>
  );
}
