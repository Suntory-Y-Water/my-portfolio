import type { Metadata } from 'next';
import type React from 'react';
import { siteConfig } from '@/config/site';

type Props = {
  children: React.ReactNode;
};

const metaDescription =
  'QiitaやZennで技術記事を投稿しており、クリックするとQiitaまたはZennの記事ページへ移動します。最新の技術記事はブログページから確認することができます。';

export const metadata: Metadata = {
  title: 'Posts',
  description: metaDescription,
  openGraph: {
    title: 'Posts',
    description: metaDescription,
    images: [siteConfig.ogImage],
  },
  twitter: {
    title: 'Posts',
    description: metaDescription,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({ children }: Props) {
  return children;
}
