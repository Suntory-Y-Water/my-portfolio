import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/markdown';
import { cn, formatDate } from '@/lib/utils';

type BlogCardProps = {
  data: BlogPost;
  priority?: boolean;
  inlineSvg?: string;
};

/**
 * ブログ記事のカードを表示するコンポーネント
 *
 * このコンポーネントはブログ記事のメタデータを受け取り、カード形式で表示します。
 * アイコン(絵文字または画像)、タイトル、説明文、日付、タグを含むカードをレンダリングし、
 * クリックすると記事ページに遷移します。ホバー時にはカードが拡大し、視覚的なフィードバックを提供します。
 *
 * @param data - 表示するブログ記事データ。metadata(title、description、date、icon、tagsなど)とslugを含みます
 * @param inlineSvg - インラインSVGデータ(サーバーサイドで取得済み)
 * @returns ブログカードコンポーネント
 */
export function BlogCard({ data, priority, inlineSvg }: BlogCardProps) {
  const { metadata, slug } = data;
  const dateISO = new Date(metadata.date).toISOString();
  const formattedDate = formatDate(metadata.date).replace(/\//g, '.');

  // icon_urlを優先、なければiconのURLを使用
  const displayUrl =
    metadata.icon_url ||
    (metadata.icon?.startsWith('https://') ? metadata.icon : null);

  return (
    <a
      href={`/blog/${slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:border-primary/50 hover:shadow-md',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      )}
    >
      <div className='relative aspect-video w-full bg-muted overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-secondary to-background' />
        <div className='absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110'>
            {inlineSvg ? (
              <span
                className='h-16 w-16 [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain [&>svg]:drop-shadow-md'
                aria-hidden
                dangerouslySetInnerHTML={{ __html: inlineSvg }}
              />
            ) : displayUrl ? (
              <img
                src={displayUrl}
                alt={metadata.title}
                width={64}
                height={64}
                loading={priority ? 'eager' : 'lazy'}
                className='h-16 w-16 object-contain drop-shadow-md'
              />
            ) : (
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-background/80 text-3xl'>
                {metadata.icon || '📝'}
              </div>
            )}
        </div>
          <div className='absolute bottom-3 left-3 rounded bg-background/80 px-2 py-0.5 font-mono text-xs text-muted-foreground backdrop-blur'>
            <time dateTime={dateISO}>{formattedDate}</time>
          </div>
      </div>

      <div className='flex flex-1 flex-col p-4 md:p-5'>
        <div className='mb-3 flex flex-wrap gap-2'>
            <div className='flex flex-wrap gap-2'>
              {metadata.tags?.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant='secondary'
                  className='border border-border px-2 py-0.5 text-[10px] font-medium'
                >
                  {tag}
                </Badge>
              ))}
            </div>
        </div>

          <h3 className='mb-3 text-lg font-bold transition-colors group-hover:text-primary leading-[1.5]'>
            {metadata.title}
          </h3>

        {metadata.description && (
            <p className='mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-4'>
              {metadata.description}
            </p>
        )}

        <div className='mt-auto flex items-center justify-between border-t border-border pt-4'>
          <span className='text-xs font-bold text-muted-foreground transition-colors group-hover:text-foreground'>
            記事を読む
          </span>
          <div className='flex h-7 w-7 items-center justify-center rounded-full bg-secondary/50 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
            <Icons.chevronRight className='h-3.5 w-3.5' />
          </div>
        </div>
      </div>
    </a>
  );
}
