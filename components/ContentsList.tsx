import { Contents } from '@/lib/client';
import React from 'react';
import ContentsListItem from './ContentsListItem';

type Props = {
  params: Contents[];
};

function ContentsList({ params }: Props) {
  if (!params) {
    return null;
  }

  if (params.length === 0) {
    return <p>準備中です</p>;
  }

  return (
    <ul className='mx-auto grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8'>
      {params.map((param) => (
        <ContentsListItem key={param.id} contents={param} />
      ))}
    </ul>
  );
}

export default ContentsList;
