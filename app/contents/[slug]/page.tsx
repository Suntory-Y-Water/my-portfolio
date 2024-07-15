import ArticleComponent from '@/app/feature/contents/Article';
import { getContentsDetail } from '@/lib/client';
import React from 'react';

type Props = {
  params: {
    slug: string;
  };
};

export default async function Page({ params }: Props) {
  const data = await getContentsDetail(params.slug);

  return (
    <div>
      <ArticleComponent params={data} />
    </div>
  );
}
