import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/feature/content/blog-card';
import { Pagination } from '@/components/shared/pagination';
import { postsPerPage } from '@/config/blog';
import { getAllBlogPosts } from '@/lib/markdown';
import { paginateItems } from '@/lib/pagination';

interface BlogListPageProps {
  params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
  const allPosts = await getAllBlogPosts();
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

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
  const {
    items: paginatedPosts,
    currentPage,
    totalPages,
  } = paginateItems({ items: allPosts, page: pageNum, pageSize: postsPerPage });

  if (currentPage > totalPages) {
    return notFound();
  }

  return (
    <section>
      <div className='space-y-6'>
        {paginatedPosts.map((blog, index) => (
          <BlogCard key={blog.slug} data={blog} isFirst={index === 0} />
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
