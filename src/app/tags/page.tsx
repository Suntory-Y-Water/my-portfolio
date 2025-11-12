import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { getAllTags } from '@/lib/mdx';
import { absoluteUrl, cn } from '@/lib/utils';

const PAGE_TITLE = 'すべてのタグ';
const PAGE_DESCRIPTION =
  'ブログ記事で使われているすべてのタグ一覧です。興味のあるタグをクリックして関連記事を探せます。';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl('/tags'),
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${PAGE_TITLE} 一覧`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [siteConfig.ogImage],
  },
};

export default async function TagsPage() {
  const tags = await getAllTags();

  const sortedTags = tags.sort((a, b) => a.localeCompare(b, 'ja'));

  return (
    <section className='container mx-auto px-4 py-8'>
      <PageHeader heading={PAGE_TITLE} text={PAGE_DESCRIPTION} />

      {sortedTags.length > 0 ? (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 pt-4'>
          {sortedTags.map((tag) => (
            <Link
              href={`/tags/${encodeURIComponent(tag)}`}
              key={tag}
              passHref
              className='no-underline'
            >
              <Card
                className={cn(
                  'flex h-full items-center justify-center p-4 text-center transition-all duration-200',
                  'hover:shadow-md hover:ring-1 hover:ring-primary/50',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                )}
              >
                <CardContent className='p-0'>
                  <span className='font-medium text-foreground group-hover:text-primary'>
                    # {tag}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className='pt-4 text-muted-foreground'>
          タグが見つかりませんでした。
        </p>
      )}
    </section>
  );
}
