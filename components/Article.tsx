import { Article } from '@/lib/client';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  params: Article;
};

export default function ArticleComponent({ params }: Props) {
  const linkProps = {
    className:
      'flex gap-1 items-center text-twitter hover:underline underline-offset-2 text-primary',
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  return (
    <main className='mx-auto flex max-w-xl flex-col'>
      <h2 className='pb-8 text-left md:text-center'>{params.title}</h2>
      {params.image && (
        <Image
          src={params.image?.url}
          alt='サムネイル画像'
          width={params.image?.width}
          height={params.image?.height}
          className='aspect-[1/0.7] rounded-xl object-cover border-2 border-muted'
          loading='eager'
        />
      )}

      <div className='flex flex-col gap-3 p-3'>
        <div className='w-full break-all text-left'>
          <div className='w-full break-all text-left'>
            <div
              dangerouslySetInnerHTML={{
                __html: `${params.content}`,
              }}
              className='w-full break-all text-left text-sm [&>h4]:font-semibold [&>h4]:pt-3 [&>h4]:pb-1'
            />
          </div>
          <ul className='flex flex-col gap-4 text-xs py-4'>
            <li className='flex items-center gap-4'>
              <span className='bg-muted min-w-[80px] rounded-md px-2 py-2.5 text-center font-medium'>
                Site
              </span>
              <Link href={params.url} {...linkProps}>
                {params.url}
              </Link>
            </li>

            <li className='flex items-center gap-4'>
              <span className='bg-muted min-w-[80px] rounded-md px-2 py-2.5 text-center font-medium'>
                Tags
              </span>

              <div className='flex flex-wrap items-start gap-1.5'>
                {params.tags.map((tag, index) => (
                  <span key={tag.tagId[index]}>{tag.tagId}</span>
                ))}
              </div>
            </li>

            <li className='flex items-center gap-4'>
              <span className='bg-muted min-w-[80px] rounded-md px-2 py-2.5 text-center font-medium'>
                Source
              </span>
              <Link href={params.source} {...linkProps}>
                {params.source}
              </Link>
            </li>
          </ul>

          <Link
            href='/contents'
            className='ml-auto mt-6 inline-flex w-fit items-center rounded-md bg-accent/50 px-4 py-2 text-sm transition-all duration-300 hover:bg-accent/60'
          >
            一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
