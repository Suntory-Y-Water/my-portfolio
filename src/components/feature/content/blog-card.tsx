import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/markdown';
import { cn, formatDate } from '@/lib/utils';

type BlogCardProps = {
  data: BlogPost;
};

/**
 * ブログ記事のカードを表示するコンポーネント
 *
 * このコンポーネントはブログ記事のメタデータを受け取り、カード形式で表示します。
 * アイコン（絵文字または画像）、タイトル、説明文、日付、タグを含むカードをレンダリングし、
 * クリックすると記事ページに遷移します。ホバー時にはカードが拡大し、視覚的なフィードバックを提供します。
 *
 * @param data - 表示するブログ記事データ。metadata（title、description、date、icon、tagsなど）とslugを含みます
 * @returns ブログカードコンポーネント
 *
 * @example
 * ```tsx
 * import { BlogCard } from '@/components/feature/content/blog-card';
 * import type { BlogPost } from '@/lib/markdown';
 *
 * const blogPost: BlogPost = {
 *   slug: 'typescript-basics',
 *   metadata: {
 *     title: 'TypeScriptの基本',
 *     description: 'TypeScriptの型定義と基本的な使い方を解説します',
 *     date: '2025-01-15',
 *     icon: '📝',
 *     tags: ['TypeScript', 'プログラミング', '入門'],
 *   },
 *   content: '...',
 * };
 *
 * export default function BlogList() {
 *   return (
 *     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
 *       <BlogCard data={blogPost} />
 *     </div>
 *   );
 * }
 * ```
 */
export function BlogCard({ data }: BlogCardProps) {
  const { metadata, slug } = data;
  const dateISO = new Date(metadata.date).toISOString();
  const formattedDate = formatDate(metadata.date);

  // icon_urlを優先、なければiconのURLを使用
  const displayUrl =
    metadata.icon_url ||
    (metadata.icon?.startsWith('https://') ? metadata.icon : null);

  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        'group relative block overflow-hidden rounded-lg bg-card p-5 transition-all duration-300',
        'hover:bg-accent/30 hover:shadow-lg hover:ring-1 hover:ring-primary/50',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      )}
    >
      <div className='flex flex-row items-start gap-4'>
        {/* Icon Section */}
        <div className='shrink-0'>
          {displayUrl ? (
            <Image
              className='size-[60px] object-cover p-1'
              src={displayUrl}
              alt={metadata.title}
              width={60}
              height={60}
              priority={false}
            />
          ) : (
            <div className='flex size-[60px] items-center justify-center rounded-full border bg-secondary p-2 text-3xl'>
              {/* Default icon */}
              {metadata.icon || '📝'}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className='flex-1 space-y-2'>
          {/* Title */}
          <h2 className='line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary'>
            {metadata.title}
          </h2>

          {/* Description */}
          {metadata.description && (
            <p className='line-clamp-3 text-sm text-muted-foreground'>
              {metadata.description}
            </p>
          )}

          {/* Metadata (Date & Tags) */}
          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground'>
            {/* Date */}
            <div className='flex items-center gap-1'>
              <Icons.calendar className='size-3.5' />
              <time dateTime={dateISO}>{formattedDate}</time>
            </div>

            {/* Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className='flex items-center gap-1'>
                <Icons.tag className='size-3.5' />
                <div className='flex flex-wrap gap-1'>
                  {metadata.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant='secondary'
                      className='px-1.5 py-0.5 text-[11px] font-medium'
                    >
                      {tag}
                    </Badge>
                  ))}
                  {metadata.tags.length > 3 && (
                    <span className='text-[11px]'>
                      +{metadata.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
