import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/feature/content/blog-card';
import { RememberBlogListPath } from '@/components/feature/content/remember-blog-list-path';
import { Icons } from '@/components/icons';
import { Pagination } from '@/components/shared/pagination';
import { BLOG_CONSTANTS } from '@/constants';
import { getAllBlogPosts } from '@/lib/markdown';
import { paginateItems } from '@/lib/pagination';

interface BlogListPageProps {
  params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
  const allPosts = await getAllBlogPosts();
  const totalPages = Math.ceil(allPosts.length / BLOG_CONSTANTS.POSTS_PER_PAGE);

  return await Promise.all(
    Array.from({ length: totalPages }, (_, i) => ({
      page: String(i + 1),
    })),
  );
}

export default async function BlogListPage({ params }: BlogListPageProps) {
  const { page } = await params;
  const pageNum = Number.parseInt(page, 10);

  if (Number.isNaN(pageNum)) {
    return notFound();
  }

  const allPosts = await getAllBlogPosts();
  const totalPosts = allPosts.length;
  const {
    items: paginatedPosts,
    currentPage,
    totalPages,
  } = paginateItems({
    items: allPosts,
    page: pageNum,
    pageSize: BLOG_CONSTANTS.POSTS_PER_PAGE,
  });

  if (currentPage > totalPages) {
    return notFound();
  }

  return (
    <section data-pagefind-ignore className='space-y-10'>
      <RememberBlogListPath />
      <div className='space-y-3 border-b border-border/60 pb-4'>
        <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Link href='/' className='transition-colors hover:text-primary'>
            Home
          </Link>
          <Icons.chevronRight className='size-4' />
          <span className='text-foreground'>Blog</span>
        </nav>

        <div className='flex flex-wrap items-end justify-between gap-3'>
          <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
            Blog
          </h1>
          <span className='text-sm font-mono text-muted-foreground'>
            Total {totalPosts} posts
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {paginatedPosts.map((blog) => (
          <BlogCard key={blog.slug} data={blog} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath='/blog/page'
      />
    </section>
  );
}
