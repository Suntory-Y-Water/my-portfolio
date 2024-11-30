import type { Metadata } from 'next';
import type React from 'react';

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: 'Posts',
  description:
    'QiitaやZennで技術記事を投稿しており、クリックするとQiitaまたはZennの記事ページへ移動します。',
};

export default function RootLayout({ children }: Props) {
  return children;
}
