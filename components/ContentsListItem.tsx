import { Article } from '@/lib/client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  contents: Article;
};

function ContentsListItem({ contents }: Props) {
  return (
    <li className='group grid rounded-3xl border-none transition-[transform] duration-300 hover:scale-[1.02]'>
      <Link href={`/contents/${contents.id}`}>
        {contents.image ? (
          <Image
            src={`${contents.image?.url}?w=800&h=640&format=webp`}
            alt='コンテンツのプレビュー画像'
            width={contents.image.width}
            height={contents.image?.height}
            className='aspect-[4/3] w-full rounded-xl object-cover'
            sizes='(min-width: 640px) 296px, 100vw'
            loading='eager'
          />
        ) : (
          <Image src='' alt='No Image' width={800} height={800} />
        )}

        <dl className='mt-3 inline-flex flex-col gap-2 pl-1'>
          <dt className='line-clamp-2 overflow-ellipsis break-all text-base font-semibold'>
            {contents.title}
          </dt>
          <dd className='flex flex-wrap gap-2.5'>
            {contents.tags &&
              contents.tags.map((tag) => (
                <div key={tag.fieldId} className='rounded-sm bg-muted px-2.5 py-1.5 text-xs'>
                  {tag.tagId}
                </div>
              ))}
          </dd>
        </dl>
      </Link>
    </li>
  );
}

export default ContentsListItem;
