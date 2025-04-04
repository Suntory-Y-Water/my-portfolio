import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/mdx';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface BlogCardProps {
  data: BlogPost;
}

export function BlogCard({ data }: BlogCardProps) {
  const { metadata, slug } = data;

  // 日付のフォーマット ハイドレーションエラーが出るためISO文字列に変換して標準化
  const dateISO = new Date(metadata.date).toISOString();

  const formattedDate = formatDate(metadata.date);

  return (
    <Link
      href={`/blog/${slug}`}
      className='group relative flex items-start gap-4 overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:bg-accent/5 hover:shadow-md'
    >
      {/* Icon */}
      {/* 画像がhttps://から始まる場合はImageを使用 */}
      {metadata.icon?.startsWith('https://') ? (
        <Image
          className='flex flex-col items-center justify-center rounded-3xl p-2'
          src={metadata.icon}
          alt={metadata.title}
          width={68}
          height={68}
          priority={true}
        />
      ) : (
        <div className='flex flex-col items-center justify-center rounded-3xl p-4 text-4xl'>
          {metadata.icon}
        </div>
      )}

      {/* Content */}
      <div className='flex flex-1 flex-col space-y-2'>
        {/* Title */}
        <h2 className='line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:underline'>
          {metadata.title}
        </h2>

        {/* Description */}
        {metadata.description && (
          <p className='line-clamp-2 text-sm text-muted-foreground'>
            {metadata.description}
          </p>
        )}

        {/* Metadata */}
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Icons.calendar className='size-4' />
            <time dateTime={dateISO}>{formattedDate}</time>
          </div>

          {metadata.tags && metadata.tags.length > 0 && (
            <div className='flex items-center gap-1'>
              <Icons.tag className='size-4' />
              <div className='flex gap-1'>
                {metadata.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    className='inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium'
                  >
                    {tag}
                  </Badge>
                ))}
                {metadata.tags.length > 2 && (
                  <span className='text-xs'>+{metadata.tags.length - 2}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
