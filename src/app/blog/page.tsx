import { BlogCard } from '@/components/feature/content/blog-card';
import { Pagination } from '@/components/shared/pagination';
import { BLOG_CONSTANTS } from '@/constants';
import { getAllBlogPosts } from '@/lib/markdown';
import { paginateItems } from '@/lib/pagination';

export default async function TopPage() {
  const allPosts = await getAllBlogPosts();
  const {
    items: paginatedPosts,
    currentPage,
    totalPages,
  } = paginateItems({
    items: allPosts,
    page: 1,
    pageSize: BLOG_CONSTANTS.POSTS_PER_PAGE,
  });

  return (
    <section data-pagefind-ignore>
      <div className='space-y-6'>
        {paginatedPosts.map((blog, index) => (
          <BlogCard key={blog.slug} data={blog} isFirst={index === 0} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='mt-10'>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath='/blog/page'
          />
        </div>
      )}
    </section>
  );
}
