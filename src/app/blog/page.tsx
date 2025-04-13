import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/mdx';
import { getPaginatedBlogPosts } from '@/lib/pagination';
import { BlogCard } from '@/components/feature/content/blog-card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default async function TopPage() {
  const allPosts = await getAllBlogPosts();
  const { items: paginatedPosts } = getPaginatedBlogPosts(allPosts, 1, 5);

  return (
    <section>
      <div className='space-y-6'>
        {paginatedPosts.map((blog) => (
          <BlogCard key={blog.slug} data={blog} />
        ))}
      </div>

      <div className='mt-10 text-end'>
        <Button variant='ghost' asChild className='h-9 px-2'>
          <Link
            href='/blog/page/1'
            className='group inline-flex items-center gap-2'
          >
            <span>{'すべての投稿を見る'}</span>
            <Icons.chevronRight className='size-4 transition-transform group-hover:translate-x-1' />
          </Link>
        </Button>
      </div>
    </section>
  );
}
